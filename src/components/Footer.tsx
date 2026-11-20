import { useLayoutEffect, useRef } from 'react';
import { BRAND, STORE } from '../config';
import { useMotion, useScrollTo } from '../lib/motion';
import { FlameMark } from './Logo';

export function Footer({ onOrder }: { onOrder: () => void }) {
  const root = useRef<HTMLElement>(null);
  const kit = useMotion();
  const scrollTo = useScrollTo();

  useLayoutEffect(() => {
    if (!kit || !root.current) return;
    const { gsap } = kit;
    const ctx = gsap.context(() => {
      gsap.from('.foot-word > span', {
        yPercent: 100, duration: 1.5, ease: 'expo.out', stagger: 0.1,
        scrollTrigger: { trigger: '.foot-word', start: 'top 92%' },
      });
      gsap.from('.foot-col', {
        autoAlpha: 0, y: 40, duration: 1, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: '.foot-cols', start: 'top 88%' },
      });
    }, root);
    return () => ctx.revert();
  }, [kit]);

  return (
    <footer id="visite" ref={root} className="foot">
      <div className="foot-cols">
        <div className="foot-col foot-lead">
          <FlameMark className="foot-mark" />
          <p className="foot-slogan">{BRAND.slogan}</p>
          <button type="button" className="btn btn-primary" onClick={onOrder}>PEDIR AGORA</button>
        </div>
        <div className="foot-col">
          <h2 className="foot-h">Onde estamos</h2>
          <p>{STORE.address}</p>
          <p className="foot-dim">{STORE.deliveryNote}</p>
        </div>
        <div className="foot-col">
          <h2 className="foot-h">Horários</h2>
          <dl className="foot-hours">
            {STORE.hours.map((h) => (
              <div key={h.days}><dt>{h.days}</dt><dd>{h.time}</dd></div>
            ))}
          </dl>
        </div>
        <div className="foot-col">
          <h2 className="foot-h">Siga a brasa</h2>
          <p>{BRAND.instagram}</p>
          <button type="button" className="link-btn foot-top" onClick={() => scrollTo('topo')}>Voltar ao topo</button>
        </div>
      </div>

      <p className="foot-word" aria-hidden="true">
        <span>FORNO</span> <span>NERO</span>
      </p>
      <p className="foot-legal">
        Forno Nero é uma marca fictícia criada para este projeto. Bebidas alcoólicas apenas para maiores de 18 anos.
      </p>
    </footer>
  );
}
