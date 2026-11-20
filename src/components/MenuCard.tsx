import { useEffect, useRef, useState } from 'react';
import { SIZES, brl, type Drink, type Pizza, type SizeKey } from '../data/menu';
import { useCart } from '../lib/cart';
import { PizzaArt } from './PizzaArt';

function useJustAdded() {
  const [on, setOn] = useState(false);
  const t = useRef<number>(0);
  useEffect(() => () => window.clearTimeout(t.current), []);
  return [
    on,
    () => {
      setOn(true);
      window.clearTimeout(t.current);
      t.current = window.setTimeout(() => setOn(false), 1500);
    },
  ] as const;
}

function PizzaVisual({ pizza }: { pizza: Pizza }) {
  const [failed, setFailed] = useState(false);
  if (pizza.photo && !failed) {
    return <img className="menu-photo" src={pizza.photo} alt={`Pizza ${pizza.name}`} loading="lazy" onError={() => setFailed(true)} />;
  }
  return <PizzaArt recipe={pizza.recipe} label={`Pizza ${pizza.name}, vista de cima`} />;
}

export function PizzaCard({ pizza, featured }: { pizza: Pizza; featured: boolean }) {
  const { add } = useCart();
  const [size, setSize] = useState<SizeKey>('media');
  const [added, flash] = useJustAdded();
  const groupId = `size-${pizza.id}`;

  return (
    <article className={`menu-item pizza-card ${featured ? 'is-featured' : ''}`}>
      <div className="menu-art">
        <PizzaVisual pizza={pizza} />
      </div>
      <div className="pizza-body">
        {pizza.badge && <p className="menu-badge">{pizza.badge}</p>}
        <h3 className="pizza-name">{pizza.name}</h3>
        <p className="pizza-desc">{pizza.description}</p>

        <div className="pizza-buy">
          <div className="size-picker" role="radiogroup" aria-label={`Tamanho da pizza ${pizza.name}`}>
            {(Object.keys(SIZES) as SizeKey[]).map((k) => (
              <label key={k} className={`size-opt ${size === k ? 'is-on' : ''}`}>
                <input type="radio" name={groupId} value={k} checked={size === k} onChange={() => setSize(k)} className="sr-only" />
                <span className="size-label">{SIZES[k].label}</span>
                <span className="size-detail">{SIZES[k].detail}</span>
              </label>
            ))}
          </div>
          <div className="pizza-cta">
            <p className="price" aria-live="polite">{brl(pizza.prices[size])}</p>
            <button
              type="button"
              className={`btn btn-add ${added ? 'is-added' : ''}`}
              onClick={() => { add(pizza.id, size); flash(); }}
              aria-label={`Adicionar pizza ${pizza.name} ${SIZES[size].label} ao pedido`}
            >
              {added ? 'Adicionada' : 'Adicionar'}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export function DrinkRow({ drink }: { drink: Drink }) {
  const { add } = useCart();
  const [added, flash] = useJustAdded();
  return (
    <article className="menu-item drink-row">
      <div className="drink-info">
        <h3 className="drink-name">{drink.name}</h3>
        <p className="drink-desc">{drink.description}</p>
      </div>
      <p className="price">{brl(drink.price)}</p>
      <button
        type="button"
        className={`btn btn-add ${added ? 'is-added' : ''}`}
        onClick={() => { add(drink.id, null); flash(); }}
        aria-label={`Adicionar ${drink.name} ao pedido`}
      >
        {added ? 'Adicionada' : 'Adicionar'}
      </button>
    </article>
  );
}
