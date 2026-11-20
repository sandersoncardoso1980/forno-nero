import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from 'react';
import { byId, priceOf, type SizeKey } from '../data/menu';

export interface CartLine {
  key: string; // `${id}:${size}`
  id: string;
  size: SizeKey | null;
  qty: number;
  note: string;
}

type Action =
  | { type: 'add'; id: string; size: SizeKey | null }
  | { type: 'qty'; key: string; qty: number }
  | { type: 'note'; key: string; note: string }
  | { type: 'remove'; key: string }
  | { type: 'clear' };

const STORAGE_KEY = 'forno-nero:cart:v1';
const MAX_QTY = 20;

const lineKey = (id: string, size: SizeKey | null) => `${id}:${size ?? 'un'}`;

function reducer(state: CartLine[], a: Action): CartLine[] {
  switch (a.type) {
    case 'add': {
      const key = lineKey(a.id, a.size);
      const found = state.find((l) => l.key === key);
      if (found) return state.map((l) => (l.key === key ? { ...l, qty: Math.min(MAX_QTY, l.qty + 1) } : l));
      return [...state, { key, id: a.id, size: a.size, qty: 1, note: '' }];
    }
    case 'qty':
      return a.qty <= 0
        ? state.filter((l) => l.key !== a.key)
        : state.map((l) => (l.key === a.key ? { ...l, qty: Math.min(MAX_QTY, a.qty) } : l));
    case 'note':
      return state.map((l) => (l.key === a.key ? { ...l, note: a.note.slice(0, 140) } : l));
    case 'remove':
      return state.filter((l) => l.key !== a.key);
    case 'clear':
      return [];
  }
}

function load(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartLine[];
    // Descarta itens que saíram do cardápio.
    return Array.isArray(parsed) ? parsed.filter((l) => byId(l.id) && l.qty > 0) : [];
  } catch {
    return [];
  }
}

interface CartApi {
  lines: CartLine[];
  count: number;
  subtotal: number;
  add: (id: string, size?: SizeKey | null) => void;
  setQty: (key: string, qty: number) => void;
  setNote: (key: string, note: string) => void;
  remove: (key: string) => void;
  clear: () => void;
  /** Texto para a região aria-live. */
  announcement: string;
  /** Incrementa a cada adição, para animar o contador do carrinho. */
  bump: number;
}

const Ctx = createContext<CartApi | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, dispatch] = useReducer(reducer, undefined, load);
  const [announcement, setAnnouncement] = useState('');
  const [bump, setBump] = useState(0);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* armazenamento indisponível: o carrinho continua só em memória */
    }
  }, [lines]);

  const add = useCallback((id: string, size: SizeKey | null = null) => {
    dispatch({ type: 'add', id, size });
    const item = byId(id);
    setBump((b) => b + 1);
    if (item) setAnnouncement(`${item.name} adicionada ao pedido`);
  }, []);

  const api = useMemo<CartApi>(() => {
    const count = lines.reduce((n, l) => n + l.qty, 0);
    const subtotal = lines.reduce((s, l) => {
      const item = byId(l.id);
      return item ? s + priceOf(item, l.size) * l.qty : s;
    }, 0);
    return {
      lines,
      count,
      subtotal,
      add,
      setQty: (key, qty) => dispatch({ type: 'qty', key, qty }),
      setNote: (key, note) => dispatch({ type: 'note', key, note }),
      remove: (key) => dispatch({ type: 'remove', key }),
      clear: () => dispatch({ type: 'clear' }),
      announcement,
      bump,
    };
  }, [lines, add, announcement, bump]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useCart() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useCart fora do CartProvider');
  return v;
}
