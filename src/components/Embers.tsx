import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../lib/motion';

interface Ember { x: number; y: number; r: number; vy: number; vx: number; life: number; max: number; hue: number }

/** Brasas subindo: fundo animado do hero quando não há vídeo (ou enquanto ele carrega). */
export function Embers() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let w = 0, h = 0, raf = 0, visible = true;
    const reduced = prefersReducedMotion();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let embers: Ember[] = [];

    const spawn = (initial: boolean): Ember => ({
      x: Math.random() * w,
      y: initial ? Math.random() * h : h + 10,
      r: 0.6 + Math.random() * 2.2,
      vy: 0.25 + Math.random() * 0.9,
      vx: (Math.random() - 0.5) * 0.35,
      life: initial ? Math.random() * 400 : 0,
      max: 260 + Math.random() * 360,
      hue: 18 + Math.random() * 26,
    });

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(130, Math.max(36, (w * h) / 14000)));
      embers = Array.from({ length: n }, () => spawn(true));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      for (const e of embers) {
        const t = e.life / e.max;
        const a = Math.sin(Math.min(1, t) * Math.PI) * 0.9;
        const g = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.r * 5);
        g.addColorStop(0, `hsla(${e.hue},100%,62%,${a})`);
        g.addColorStop(0.35, `hsla(${e.hue - 6},95%,48%,${a * 0.35})`);
        g.addColorStop(1, 'hsla(10,90%,30%,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r * 5, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const step = () => {
      if (visible) {
        for (let i = 0; i < embers.length; i++) {
          const e = embers[i];
          e.life += 1;
          e.y -= e.vy;
          e.x += e.vx + Math.sin((e.life + i * 13) * 0.02) * 0.25;
          if (e.life > e.max || e.y < -20) embers[i] = spawn(false);
        }
        draw();
      }
      raf = requestAnimationFrame(step);
    };

    resize();
    if (reduced) {
      draw();
    } else {
      raf = requestAnimationFrame(step);
    }

    const io = new IntersectionObserver(([en]) => (visible = en.isIntersecting));
    io.observe(canvas);
    const ro = new ResizeObserver(() => { resize(); if (reduced) draw(); });
    ro.observe(canvas);
    return () => { cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); };
  }, []);

  return <canvas ref={ref} className="embers" aria-hidden="true" />;
}
