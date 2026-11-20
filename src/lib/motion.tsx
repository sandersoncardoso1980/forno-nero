import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  type ReactNode,
} from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

/**
 * Kit compartilhado pelos componentes que possuem animações.
 * GSAP, ScrollTrigger e Lenis são importados pelo npm.
 */
export interface MotionKit {
  gsap: typeof gsap;
  ScrollTrigger: typeof ScrollTrigger;
  lenis: Lenis | null;
  reducedMotion: boolean;
}

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

gsap.registerPlugin(ScrollTrigger);

let motionKit: MotionKit | null = null;
let lenisTicker: ((time: number) => void) | null = null;

/**
 * Inicializa GSAP, ScrollTrigger e Lenis uma única vez.
 * A preferência de movimento reduzido é registrada, mas não bloqueia o kit.
 */
export async function loadMotion(): Promise<MotionKit> {
  if (motionKit) return motionKit;

  const reducedMotion = prefersReducedMotion();
  let lenis: Lenis | null = null;

  try {
    lenis = new Lenis({
      duration: 1.15,
      easing: (value: number) =>
        Math.min(1, 1.001 - Math.pow(2, -10 * value)),
      smoothWheel: true,
    });

    lenis.on('scroll', () => {
      ScrollTrigger.update();
    });

    // GSAP fornece segundos; Lenis espera milissegundos.
    lenisTicker = (time: number) => {
      lenis?.raf(time * 1000);
    };

    gsap.ticker.add(lenisTicker);
    gsap.ticker.lagSmoothing(0);
  } catch (error) {
    console.warn('[motion] Não foi possível inicializar o Lenis:', error);
    lenis = null;
    lenisTicker = null;
  }

  motionKit = {
    gsap,
    ScrollTrigger,
    lenis,
    reducedMotion,
  };

  if (typeof window !== 'undefined') {
    window.requestAnimationFrame(() => ScrollTrigger.refresh());
  }

  return motionKit;
}

/** Remove o ticker e o Lenis em hot reload ou testes.
 * Não é chamado automaticamente pelo provider porque o kit é compartilhado.
 */
export function disposeMotion(): void {
  if (lenisTicker) {
    gsap.ticker.remove(lenisTicker);
    lenisTicker = null;
  }

  motionKit?.lenis?.destroy();
  motionKit = null;
}

const MotionContext = createContext<MotionKit | null>(null);

export function MotionProvider({
  kit,
  children,
}: {
  kit: MotionKit | null;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!kit) return undefined;

    const refresh = () => kit.ScrollTrigger.refresh();

    window.addEventListener('load', refresh);

    const fontsReady = document.fonts?.ready;
    fontsReady?.then(refresh).catch(() => undefined);

    const refreshTimer = window.setTimeout(refresh, 800);

    return () => {
      window.removeEventListener('load', refresh);
      window.clearTimeout(refreshTimer);
    };
  }, [kit]);

  return (
    <MotionContext.Provider value={kit}>
      {children}
    </MotionContext.Provider>
  );
}

export function useMotion(): MotionKit | null {
  return useContext(MotionContext);
}

export function useScrollTo() {
  const kit = useMotion();

  return useCallback(
    (id: string) => {
      const element = document.getElementById(id);
      if (!element) return;

      const offset = id === 'cardapio' ? -64 : 0;

      if (kit?.lenis) {
        kit.lenis.scrollTo(element, {
          offset,
          duration: 1.8,
        });
        return;
      }

      const top =
        element.getBoundingClientRect().top + window.scrollY + offset;

      window.scrollTo({
        top,
        behavior: kit?.reducedMotion ? 'auto' : 'smooth',
      });
    },
    [kit],
  );
}
