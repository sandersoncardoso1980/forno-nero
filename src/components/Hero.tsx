import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { MEDIA } from '../config';
import { useMotion, useScrollTo } from '../lib/motion';
import { Embers } from './Embers';
import { FlameMark } from './Logo';

const VIDEO_CANDIDATES = [
  MEDIA.heroVideo,
  MEDIA.heroFallbackVideo,
  '/media/hero.mp4',
  '/media/hero1.mp4',
].filter((src, index, arr): src is string => Boolean(src) && arr.indexOf(src) === index);

export function Hero({ onOrder }: { onOrder: () => void }) {
  const root = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const kit = useMotion();
  console.log('[Hero] MotionKit:', kit);
console.log(
  '[Hero] Movimento reduzido:',
  window.matchMedia('(prefers-reduced-motion: reduce)').matches,
);
  const scrollTo = useScrollTo();

  const [videoIndex, setVideoIndex] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [allVideosFailed, setAllVideosFailed] = useState(false);
  const [emberLit, setEmberLit] = useState(false);

  const posterSrc = MEDIA.heroPoster || '/media/pizza-real.jpg';
  const pizzaSrc = MEDIA.heroPizza || '/media/hero.png';
  const currentVideoSrc = !allVideosFailed ? VIDEO_CANDIDATES[videoIndex] : undefined;

  // Garante que o texto em brasa acenda mesmo se o GSAP não carregar
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setEmberLit(true);
      root.current?.querySelectorAll('.hero-line > span').forEach((line) => {
        line.classList.add('is-ember-lit');
      });
    }, 1800);
    return () => window.clearTimeout(timer);
  }, []);

  // Animações GSAP + ScrollTrigger + Mouse
  useLayoutEffect(() => {
    const el = root.current;
    if (!kit || !el) return;

    const { gsap, ScrollTrigger } = kit;
    if (ScrollTrigger && gsap.registerPlugin) {
      gsap.registerPlugin(ScrollTrigger);
    }

    const ctx = gsap.context(() => {
      gsap.set('.hero-line > span', { yPercent: 115 });
      gsap.set('.hero-pizza', { scale: 0.62, rotate: -48, autoAlpha: 0 });
      gsap.set('.hero-badge', { scale: 0.4, autoAlpha: 0, rotate: -90 });
      gsap.set('.hero-rise', { autoAlpha: 0, y: 26 });

      const tl = gsap.timeline({
        defaults: { ease: 'expo.out' },
        delay: 0.2,
      });

      tl.fromTo(
        '.hero-bg',
        { scale: 1.14 },
        { scale: 1, duration: 2.4, ease: 'power3.out' },
        0,
      )
        .to(
          '.hero-pizza',
          {
            scale: 1,
            rotate: 0,
            autoAlpha: 1,
            duration: 2.0,
            ease: 'power4.out',
          },
          0.1,
        )
        .to(
          '.hero-line > span',
          {
            yPercent: 0,
            duration: 1.35,
            stagger: 0.14,
          },
          0.3,
        )
        .call(
          () => {
            setEmberLit(true);
            el.querySelectorAll('.hero-line > span').forEach((line) => {
              line.classList.add('is-ember-lit');
            });
          },
          [],
          1.75,
        )
        .to(
          '.hero-badge',
          {
            scale: 1,
            autoAlpha: 1,
            rotate: 0,
            duration: 1.3,
            ease: 'back.out(1.5)',
          },
          0.95,
        )
        .to(
          '.hero-rise',
          {
            autoAlpha: 1,
            y: 0,
            duration: 1.0,
            stagger: 0.12,
          },
          1.0,
        )
        .fromTo(
          '.hero-scroll-line',
          { scaleY: 0, transformOrigin: 'top' },
          { scaleY: 1, duration: 1.1 },
          1.4,
        );

      gsap.to('.hero-pizza-spin', {
        rotate: 360,
        duration: 140,
        repeat: -1,
        ease: 'none',
      });

      if (ScrollTrigger) {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: el,
              start: 'top top',
              end: '+=100%',
              scrub: 0.6,
              pin: true,
              pinSpacing: false,
            },
          })
          .to('.hero-content', { yPercent: -10, autoAlpha: 0, ease: 'none' }, 0)
          .to('.hero-pizza-wrap', { scale: 1.22, yPercent: -9, ease: 'none' }, 0)
          .to('.hero-badge', { yPercent: -60, autoAlpha: 0, ease: 'none' }, 0)
          .to('.hero-bg', { scale: 1.12, ease: 'none' }, 0)
          .to('.hero-dim', { opacity: 1, ease: 'none' }, 0);
      }

      const mm = gsap.matchMedia();

      mm.add('(hover: hover) and (pointer: fine)', () => {
        const pizzaX = gsap.quickTo('.hero-pizza-wrap', 'x', { duration: 0.8, ease: 'power3.out' });
        const pizzaY = gsap.quickTo('.hero-pizza-wrap', 'y', { duration: 0.8, ease: 'power3.out' });
        const tiltX = gsap.quickTo('.hero-pizza', 'rotationX', { duration: 0.75, ease: 'power3.out' });
        const tiltY = gsap.quickTo('.hero-pizza', 'rotationY', { duration: 0.75, ease: 'power3.out' });
        const badgeX = gsap.quickTo('.hero-badge', 'x', { duration: 1, ease: 'power3.out' });
        const badgeY = gsap.quickTo('.hero-badge', 'y', { duration: 1, ease: 'power3.out' });
        const contentX = gsap.quickTo('.hero-content', 'x', { duration: 1.15, ease: 'power3.out' });
        const contentY = gsap.quickTo('.hero-content', 'y', { duration: 1.15, ease: 'power3.out' });
        const bgX = gsap.quickTo('.hero-bg', 'x', { duration: 1.8, ease: 'power2.out' });
        const bgY = gsap.quickTo('.hero-bg', 'y', { duration: 1.8, ease: 'power2.out' });
        const lightX = gsap.quickTo('.hero-light', 'x', { duration: 0.7, ease: 'power2.out' });
        const lightY = gsap.quickTo('.hero-light', 'y', { duration: 0.7, ease: 'power2.out' });

        const move = (e: MouseEvent) => {
          const rect = el.getBoundingClientRect();
          const nx = (e.clientX - rect.left) / rect.width - 0.5;
          const ny = (e.clientY - rect.top) / rect.height - 0.5;

          pizzaX(nx * -70);
          pizzaY(ny * -48);
          tiltX(ny * -12);
          tiltY(nx * 15);

          badgeX(nx * 46);
          badgeY(ny * 34);

          contentX(nx * -12);
          contentY(ny * -8);

          bgX(nx * -18);
          bgY(ny * -12);

          lightX(nx * 160);
          lightY(ny * 120);
        };

        const reset = () => {
          pizzaX(0);
          pizzaY(0);
          tiltX(0);
          tiltY(0);
          badgeX(0);
          badgeY(0);
          contentX(0);
          contentY(0);
          bgX(0);
          bgY(0);
          lightX(0);
          lightY(0);
        };

        el.addEventListener('mousemove', move);
        el.addEventListener('mouseleave', reset);

        return () => {
          el.removeEventListener('mousemove', move);
          el.removeEventListener('mouseleave', reset);
          reset();
        };
      });
    }, el);

    return () => ctx.revert();
  }, [kit]);

  // Reprodução segura do vídeo sem conflito com load()
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentVideoSrc) return;

    setVideoReady(false);
    video.muted = true;

    const tryPlay = () => {
      const promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch((err: unknown) => {
          if (err instanceof DOMException && err.name === 'AbortError') return;
          // Autoplay bloqueado antes de interação do usuário é esperado em alguns navegadores
        });
      }
    };

    if (video.readyState >= 2) {
      tryPlay();
    } else {
      video.addEventListener('canplay', tryPlay, { once: true });
      return () => video.removeEventListener('canplay', tryPlay);
    }
  }, [currentVideoSrc]);

  const handleVideoReady = () => {
    setVideoReady(true);
    setAllVideosFailed(false);
  };

  const handleVideoError = () => {
    setVideoReady(false);
    if (videoIndex + 1 < VIDEO_CANDIDATES.length) {
      setVideoIndex((prev) => prev + 1);
    } else {
      setAllVideosFailed(true);
    }
  };

  return (
    <section
      id="topo"
      ref={root}
      className="hero"
      aria-label="Forno Nero"
    >
      <div className="hero-bg" aria-hidden="true">
        <img
          className="hero-poster"
          src={posterSrc}
          alt=""
        />

        <div className="hero-glow" />

        <Embers />

        {currentVideoSrc && (
          <video
            key={currentVideoSrc}
            ref={videoRef}
            className={`hero-video ${videoReady ? 'is-ready' : ''}`}
            src={currentVideoSrc}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={posterSrc}
            onCanPlay={handleVideoReady}
            onLoadedData={handleVideoReady}
            onError={handleVideoError}
          />
        )}
      </div>

      <div className="hero-scrim" aria-hidden="true" />
      <div className="hero-light" aria-hidden="true" />
      <div className="hero-dim" aria-hidden="true" />

      <div className="hero-pizza-wrap" aria-hidden="true">
        <div className="hero-pizza">
          <div className="hero-pizza-spin">
            <img
              src={pizzaSrc}
              alt=""
              className="hero-pizza-image"
            />
          </div>
        </div>
      </div>

      <div className="hero-badge" aria-hidden="true">
        <svg
          viewBox="0 0 160 160"
          className="hero-badge-ring"
        >
          <defs>
            <path
              id="badge-circle"
              d="M80 80m-62 0a62 62 0 1 1 124 0a62 62 0 1 1 -124 0"
            />
          </defs>

          <text>
            <textPath
              href="#badge-circle"
              startOffset="0"
            >
              Forno a lenha ◆ Massa de 72 horas ◆ Fermentação natural ◆
            </textPath>
          </text>
        </svg>

        <FlameMark className="hero-badge-flame" />
      </div>

      <div className="hero-content">
        <h1 className="hero-title">
          <span className="hero-line">
            <span className={emberLit ? 'is-ember-lit' : undefined}>A brasa</span>
          </span>

          <span className="hero-line hero-line-2">
            <span className={emberLit ? 'is-ember-lit' : undefined}>já está</span>
          </span>

          <span className="hero-line hero-line-3">
            <span className={emberLit ? 'is-ember-lit' : undefined}>acesa.</span>
          </span>
        </h1>

        <div className="hero-foot">
          <p className="hero-lede hero-rise">
            Pizza napolitana contemporânea, de massa lenta e forno a lenha.
            Escolha no cardápio e peça pelo WhatsApp: entregamos em casa
            ou você retira no balcão.
          </p>

          <div className="hero-ctas hero-rise">
            <button
              type="button"
              className="btn btn-primary"
              onClick={onOrder}
            >
              PEDIR AGORA
            </button>

            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => scrollTo('cardapio')}
            >
              EXPLORAR CARDÁPIO
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="hero-scroll hero-rise"
        onClick={() => scrollTo('manifesto')}
        aria-label="Rolar para a próxima seção"
      >
        <span className="hero-scroll-text">
          Role
        </span>

        <span
          className="hero-scroll-track"
          aria-hidden="true"
        >
          <span className="hero-scroll-line" />
        </span>
      </button>
    </section>
  );
}