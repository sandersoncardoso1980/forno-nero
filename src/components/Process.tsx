import { useLayoutEffect, useRef } from 'react';
import { MENU, type Pizza } from '../data/menu';
import { useMotion } from '../lib/motion';
import { PizzaArt } from './PizzaArt';

const recipe = (MENU.find((m) => m.id === 'marguerita') as Pizza).recipe;

const STEPS = [
  {
    title: 'Fermento',
    metric: '72 horas',
    text: 'A massa descansa três dias em temperatura controlada. É um tempo que não dá para acelerar, e a mordida mostra: alveolada, leve, com gosto de pão de verdade.',
  },
  {
    title: 'Abertura',
    metric: 'Só com as mãos',
    text: 'Sem rolo e sem pressa. A bola de massa é aberta na ponta dos dedos para que o ar fique na borda e a pizza ganhe aquele cornicione alto.',
  },
  {
    title: 'Cobertura',
    metric: 'Poucos ingredientes',
    text: 'Tomate italiano amassado na hora, queijo fresco, manjericão colhido no dia. Cada ingrediente tem seu lugar e nenhum disputa com o outro.',
  },
  {
    title: 'Forno',
    metric: '450 °C por 90 segundos',
    text: 'Lenha de eucalipto e pedra refratária. A borda estufa, os pontos de queima aparecem e a pizza sai direto da pá para a sua mesa.',
  },
];

export function Process() {
  const root = useRef<HTMLElement>(null);
  const kit = useMotion();

  useLayoutEffect(() => {
    if (!kit || !root.current) return;
    const { gsap } = kit;
    const el = root.current;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // Desktop e tablet: seção presa, a pizza se monta em quatro etapas conforme o scroll.
      mm.add('(min-width: 900px)', () => {
        el.classList.add('is-pinned');

        const origin = { svgOrigin: '200 200' };
        gsap.set('.pz-dough', { ...origin, scale: 0.46 });
        gsap.set('.pz-sauce', { ...origin, scale: 0.5, opacity: 0 });
        gsap.set('.pz-pop', { scale: 0, opacity: 0 }); // origem = centro do próprio elemento (transform-box: fill-box no CSS)
        gsap.set('.pz-char', { opacity: 0 });
        gsap.set('.pz-shadow', { opacity: 0.2 });
        gsap.set('.process-step', { autoAlpha: 0, y: 46 });
        gsap.set('.process-step:first-child', { autoAlpha: 1, y: 0 });
        gsap.set('.process-fire', { opacity: 0, scale: 0.7 });
        gsap.set('.process-tick-fill', { scaleX: 0, transformOrigin: 'left' });

        const cheese = gsap.utils.toArray('.process-pizza .pz-cheese .pz-pop');
        const tops = gsap.utils.toArray('.process-pizza .pz-top .pz-pop');

        const tl = gsap.timeline({
          defaults: { ease: 'power2.inOut' },
          scrollTrigger: { trigger: el, start: 'top top', end: '+=420%', scrub: 0.7, pin: true, anticipatePin: 1 },
        });

        const swap = (from: number, to: number, at: number) => {
          tl.to(`.process-step:nth-child(${from})`, { autoAlpha: 0, y: -46, duration: 0.5 }, at)
            .to(`.process-step:nth-child(${to})`, { autoAlpha: 1, y: 0, duration: 0.6 }, at + 0.3);
        };

        // 1. Fermento: a bola de massa cresce.
        tl.to('.pz-dough', { scale: 0.62, duration: 1.2, ease: 'sine.inOut' }, 0)
          .to('.process-tick:nth-child(1) .process-tick-fill', { scaleX: 1, duration: 1.2, ease: 'none' }, 0);

        // 2. Abertura: a massa vira disco.
        swap(1, 2, 1.1);
        tl.to('.pz-dough', { scale: 1, rotate: 24, duration: 1.2, ease: 'power3.out' }, 1.25)
          .to('.pz-shadow', { opacity: 1, duration: 1.2 }, 1.25)
          .to('.process-tick:nth-child(2) .process-tick-fill', { scaleX: 1, duration: 1.2, ease: 'none' }, 1.25);

        // 3. Cobertura: molho, queijo e ingredientes entram em cascata.
        swap(2, 3, 2.5);
        tl.to('.pz-sauce', { scale: 1, opacity: 1, duration: 0.9, ease: 'power3.out' }, 2.6)
          .to(cheese, { scale: 1, opacity: 1, duration: 0.7, stagger: { each: 0.05, from: 'random' }, ease: 'back.out(1.6)' }, 3.0)
          .to(tops, { scale: 1, opacity: 1, duration: 0.6, stagger: { each: 0.025, from: 'random' }, ease: 'back.out(1.8)' }, 3.5)
          .to('.process-tick:nth-child(3) .process-tick-fill', { scaleX: 1, duration: 1.2, ease: 'none' }, 2.6);

        // 4. Forno: calor, queima e brilho.
        swap(3, 4, 3.8);
        tl.to('.process-fire', { opacity: 1, scale: 1, duration: 1.2, ease: 'power2.out' }, 3.9)
          .to('.pz-char', { opacity: 1, duration: 1.2 }, 4.1)
          .to('.process-pizza', { scale: 1.05, duration: 1.2, ease: 'sine.inOut' }, 4.1)
          .to('.process-tick:nth-child(4) .process-tick-fill', { scaleX: 1, duration: 1.2, ease: 'none' }, 3.9)
          .to({}, { duration: 0.5 }); // respiro final antes de soltar o pin

        return () => el.classList.remove('is-pinned');
      });

      // Mobile: etapas em lista, entrando uma a uma pela lateral.
      mm.add('(max-width: 899px)', () => {
        gsap.utils.toArray('.process-step').forEach((step: Element, i: number) => {
          gsap.from(step, {
            autoAlpha: 0, x: i % 2 ? 60 : -60, duration: 1, ease: 'power3.out',
            scrollTrigger: { trigger: step, start: 'top 88%' },
          });
        });
      });
    }, el);

    return () => ctx.revert();
  }, [kit]);

  return (
    <section id="processo" ref={root} className="process" aria-labelledby="processo-titulo">
      <div className="process-stage">
        <div className="process-visual" aria-hidden="true">
          <div className="process-fire" />
          <div className="process-arch" />
          <div className="process-pizza">
            <PizzaArt recipe={recipe} cut={false} />
          </div>
        </div>

        <div className="process-copy">
          <h2 id="processo-titulo" className="section-title">Do fermento à pedra</h2>
          <ol className="process-steps">
            {STEPS.map((s, i) => (
              <li key={s.title} className="process-step">
                <span className="process-index" aria-hidden="true">{i + 1}</span>
                <div>
                  <h3 className="process-step-title">{s.title}</h3>
                  <p className="process-metric">{s.metric}</p>
                  <p className="process-text">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="process-ticks" aria-hidden="true">
            {STEPS.map((s) => (
              <span key={s.title} className="process-tick"><span className="process-tick-fill" /></span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
