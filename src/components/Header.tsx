import { useEffect, useRef, useState } from 'react';
import { Logo } from './Logo';
import { useCart } from '../lib/cart';
import { useScrollTo } from '../lib/motion';

export function Header({ onOpenCart }: { onOpenCart: () => void }) {
  const { count, bump } = useCart();
  const scrollTo = useScrollTo();
  const [solid, setSolid] = useState(false);
  const badge = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 60);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // O contador reage à adição (animação em resposta à ação da pessoa).
  useEffect(() => {
    if (!bump || !badge.current) return;
    const el = badge.current;
    el.classList.remove('is-bump');
    void el.offsetWidth;
    el.classList.add('is-bump');
  }, [bump]);

  const nav = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    scrollTo(id);
  };

  return (
    <header className={`site-header ${solid ? 'is-solid' : ''}`}>
      <a href="#topo" className="shrink-0" aria-label="Forno Nero, início" onClick={nav('topo')}>
        <Logo />
      </a>
      <nav className="hidden items-center gap-9 md:flex" aria-label="Seções">
        <a className="nav-link" href="#manifesto" onClick={nav('manifesto')}>Nossa casa</a>
        <a className="nav-link" href="#processo" onClick={nav('processo')}>O processo</a>
        <a className="nav-link" href="#cardapio" onClick={nav('cardapio')}>Cardápio</a>
        <a className="nav-link" href="#visite" onClick={nav('visite')}>Visite</a>
      </nav>
      <button type="button" className="cart-pill" onClick={onOpenCart} aria-haspopup="dialog">
        <span>Meu pedido</span>
        <span ref={badge} className="cart-count" aria-label={`${count} ${count === 1 ? 'item' : 'itens'}`}>
          {count}
        </span>
      </button>
    </header>
  );
}
