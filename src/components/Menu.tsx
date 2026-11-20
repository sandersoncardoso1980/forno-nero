import { useLayoutEffect, useRef, useState } from 'react';
import { CATEGORIES, itemsOf, type CategoryId } from '../data/menu';
import { useMotion } from '../lib/motion';
import { DrinkRow, PizzaCard } from './MenuCard';

export function Menu() {
  const root = useRef<HTMLElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const kit = useMotion();
  const [cat, setCat] = useState<CategoryId>('classicas');
  const busy = useRef(false);
  const firstRender = useRef(true);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const active = CATEGORIES.find((c) => c.id === cat)!;
  const items = itemsOf(cat);

  // Entrada da seção: título entra pela lateral e os primeiros itens em cascata.
  useLayoutEffect(() => {
    if (!kit || !root.current) return;
    const { gsap } = kit;
    const ctx = gsap.context(() => {
      gsap.from('.menu-title-line > span', {
        xPercent: -105, duration: 1.4, ease: 'expo.out', stagger: 0.12,
        scrollTrigger: { trigger: '.menu-title', start: 'top 85%' },
      });
      gsap.from('.menu-intro', { autoAlpha: 0, x: 60, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: '.menu-intro', start: 'top 88%' } });
      gsap.from('.menu-grid .menu-item', {
        autoAlpha: 0, y: 70, duration: 1, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: '.menu-grid', start: 'top 82%', once: true },
      });
    }, root);
    return () => ctx.revert();
  }, [kit]);

  // Transição entre categorias: o conjunto atual sai para a esquerda e o novo entra pela direita.
  useLayoutEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    busy.current = false;
    if (!kit || !grid.current) return;
    kit.gsap.fromTo(
      grid.current.querySelectorAll('.menu-item'),
      { autoAlpha: 0, x: 80, scale: 0.97 },
      { autoAlpha: 1, x: 0, scale: 1, duration: 0.8, stagger: 0.07, ease: 'power3.out', clearProps: 'transform,opacity,visibility' },
    );
    kit.ScrollTrigger.refresh();
  }, [cat, kit]);

  const choose = (next: CategoryId) => {
    if (next === cat || busy.current) return;
    if (!kit || !grid.current) { setCat(next); return; }
    busy.current = true;
    let swapped = false;
    const swap = () => { if (!swapped) { swapped = true; setCat(next); } };
    kit.gsap.to(grid.current.querySelectorAll('.menu-item'), {
      autoAlpha: 0, x: -60, duration: 0.28, stagger: 0.025, ease: 'power2.in',
      onComplete: swap,
    });
    // Segurança: se o tween não completar (aba em segundo plano, erro), a troca acontece mesmo assim.
    window.setTimeout(swap, 900);
  };

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!dir && e.key !== 'Home' && e.key !== 'End') return;
    e.preventDefault();
    const n = e.key === 'Home' ? 0 : e.key === 'End' ? CATEGORIES.length - 1 : (i + dir + CATEGORIES.length) % CATEGORIES.length;
    tabs.current[n]?.focus();
    choose(CATEGORIES[n].id);
  };

  return (
    <section id="cardapio" ref={root} className="menu" aria-labelledby="cardapio-titulo">
      <div className="menu-head">
        <h2 id="cardapio-titulo" className="menu-title">
          <span className="menu-title-line"><span>O cardápio</span></span>
        </h2>
        <p className="menu-intro">
          Escolha o tamanho, adicione ao pedido e finalize pelo WhatsApp. Toda pizza sai do forno na hora.
        </p>
      </div>

      <div className="menu-tabs-wrap">
        <div className="menu-tabs" role="tablist" aria-label="Categorias do cardápio">
          {CATEGORIES.map((c, i) => (
            <button
              key={c.id}
              ref={(el) => { tabs.current[i] = el; }}
              role="tab"
              id={`tab-${c.id}`}
              aria-selected={cat === c.id}
              aria-controls="menu-panel"
              tabIndex={cat === c.id ? 0 : -1}
              className={`menu-tab ${cat === c.id ? 'is-on' : ''}`}
              onClick={() => choose(c.id)}
              onKeyDown={(e) => onKey(e, i)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div id="menu-panel" role="tabpanel" aria-labelledby={`tab-${cat}`} className="menu-panel">
        <p className="menu-tagline">{active.tagline}</p>
        <div ref={grid} className={`menu-grid ${cat === 'bebidas' ? 'is-drinks' : ''}`}>
          {items.map((m, i) =>
            m.kind === 'pizza' ? (
              <PizzaCard key={m.id} pizza={m} featured={i === 0 && items.length % 2 === 1} />
            ) : (
              <DrinkRow key={m.id} drink={m} />
            ),
          )}
        </div>
      </div>
    </section>
  );
}
