import { useLayoutEffect, useRef } from 'react';
import { BRAND } from '../config';
import { MENU, type Pizza } from '../data/menu';
import { useMotion } from '../lib/motion';
import { PizzaArt } from './PizzaArt';

const pick = (id: string) => (MENU.find((m) => m.id === id) as Pizza).recipe;
const archA = pick('quatro-queijos');
const archB = pick('nero');

export function Manifesto() {
  const root = useRef<HTMLElement>(null);
  const kit = useMotion();
  const words = BRAND.slogan.split(' ');

  useLayoutEffect(() => {
    if (!kit || !root.current) return;
    const { gsap } = kit;

    const ctx = gsap.context(() => {
      // O slogan acende palavra por palavra conforme o scroll avança.
      gsap.fromTo(
        '.mf-word',
        { opacity: 0.14 },
        {
          opacity: 1, ease: 'none', stagger: 0.12,
          scrollTrigger: { trigger: '.mf-statement', start: 'top 78%', end: 'bottom 42%', scrub: 0.5 },
        },
      );

      // Os dois arcos entram por lados opostos e a pizza dentro deles desliza em parallax.
      gsap.from('.mf-arch-a', { xPercent: -28, autoAlpha: 0, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: '.mf-arch-a', start: 'top 85%' } });
      gsap.from('.mf-arch-b', { xPercent: 28, autoAlpha: 0, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: '.mf-arch-b', start: 'top 90%' } });
      gsap.utils.toArray('.mf-arch svg').forEach((svg: Element, i: number) => {
        gsap.fromTo(svg, { yPercent: i ? -9 : 9, rotate: i ? 8 : -10 }, {
          yPercent: i ? 9 : -9, rotate: i ? -6 : 8, ease: 'none',
          scrollTrigger: { trigger: svg.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
        });
      });

      gsap.from('.mf-copy > *', {
        autoAlpha: 0, y: 30, duration: 1.1, stagger: 0.14, ease: 'power3.out',
        scrollTrigger: { trigger: '.mf-copy', start: 'top 82%' },
      });
    }, root);

    return () => ctx.revert();
  }, [kit]);

  return (
    <section id="manifesto" ref={root} className="manifesto">
      <div className="mf-grid">
        <div className="mf-arch mf-arch-a" aria-hidden="true">
          <PizzaArt recipe={archA} cut={false} />
        </div>

        <div className="mf-text">
          <p className="mf-statement" aria-label={BRAND.slogan}>
            {words.map((w, i) => (
              <span key={i} className="mf-word" aria-hidden="true">{w}{' '}</span>
            ))}
          </p>
          <div className="mf-copy">
            <p>
              Na Forno Nero a pizza começa três dias antes de chegar à mesa. A massa fermenta devagar, é aberta à mão e vai ao forno de tijolo quando ele está na temperatura certa, nunca antes.
            </p>
            <p>
              O resto é escolher bem: tomate de verdade, queijo fresco, poucos ingredientes por pizza e fogo de lenha de eucalipto.
            </p>
          </div>
        </div>

        <div className="mf-arch mf-arch-b" aria-hidden="true">
          <PizzaArt recipe={archB} cut={false} />
        </div>
      </div>
    </section>
  );
}
