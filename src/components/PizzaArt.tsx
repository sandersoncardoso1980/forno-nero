import { memo, useId, useMemo, type ReactNode } from 'react';
import type { PizzaRecipe, ToppingKind } from '../data/menu';

/**
 * Pizza vista de cima, desenhada proceduralmente em SVG (original, sem imagens externas).
 * Serve de fallback visual coerente enquanto não houver fotografias reais.
 * Os grupos têm classes estáveis (pz-*) para o GSAP montar a pizza em camadas no scroll.
 *
 * Convenção: cada elemento animável é <g transform="translate rotate"> estático por fora
 * e <g class="pz-pop"> por dentro, para o GSAP poder escalar sem sobrescrever a posição.
 */

type Rand = () => number;

function mulberry32(seed: number): Rand {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f = (n: number) => n.toFixed(1);

/** Contorno orgânico fechado (Catmull-Rom -> Bézier) centrado em (0,0). */
function blob(r: number, jitter: number, n: number, rand: Rand, cx = 0, cy = 0): string {
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rr = r * (1 + (rand() - 0.5) * 2 * jitter);
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + 'Z';
}

interface Pt { x: number; y: number }

/** Espalha pontos no disco respeitando uma distância mínima (dart throwing). */
function scatter(count: number, rMax: number, minDist: number, rand: Rand, taken: Pt[]): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < count; i++) {
    let best: Pt | null = null;
    let bestD = -1;
    for (let t = 0; t < 28; t++) {
      const r = rMax * Math.sqrt(rand());
      const a = rand() * Math.PI * 2;
      const p = { x: 200 + Math.cos(a) * r, y: 200 + Math.sin(a) * r };
      const d = Math.min(...taken.concat(out).map((q) => Math.hypot(q.x - p.x, q.y - p.y)), 999);
      if (d > bestD) { best = p; bestD = d; }
      if (d >= minDist) break;
    }
    if (best) out.push(best);
  }
  return out;
}

const BASES: Record<PizzaRecipe['base'], { dough: [string, string]; bake: string; sauce: [string, string] }> = {
  rossa: { dough: ['#f1d29d', '#e0ad6b'], bake: '#a35f2a', sauce: ['#cf4524', '#912615'] },
  bianca: { dough: ['#f1d29d', '#e0ad6b'], bake: '#a35f2a', sauce: ['#efe1bb', '#dcc58f'] },
  nero: { dough: ['#5a514a', '#2c2622'], bake: '#0f0c0a', sauce: ['#7a2616', '#4f160c'] },
  cacau: { dough: ['#f1d29d', '#e0ad6b'], bake: '#a35f2a', sauce: ['#53301b', '#2d170c'] },
  doce: { dough: ['#f1d29d', '#e0ad6b'], bake: '#a35f2a', sauce: ['#d39a4a', '#a8681f'] },
};

function Topping({ kind, rand }: { kind: ToppingKind; rand: Rand }): ReactNode {
  switch (kind) {
    case 'basil':
    case 'arugula': {
      const narrow = kind === 'arugula';
      const w = narrow ? 8 : 13;
      return (
        <g>
          <path d={`M0 -17C${w} -12 ${w + 1} 8 0 19C${-w - 1} 8 ${-w} -12 0 -17Z`} fill={narrow ? '#4f8a3a' : '#3f7a2e'} />
          <path d={`M0 -15L0 17`} stroke={narrow ? '#9ccc6d' : '#8fc15f'} strokeWidth="1.1" opacity=".55" />
          <path d={`M0 -17C${w} -12 ${w + 1} 8 0 19`} fill="none" stroke="#1f4416" strokeWidth="1" opacity=".35" />
        </g>
      );
    }
    case 'pepperoni':
      return (
        <g>
          <circle r="17" fill="#a3281a" />
          <circle r="17" fill="none" stroke="#6e170d" strokeWidth="1.6" />
          <circle r="13" fill="none" stroke="#d2573a" strokeWidth="1.2" opacity=".45" />
          {[0, 1, 2, 3, 4].map((i) => (
            <circle key={i} cx={(rand() - 0.5) * 18} cy={(rand() - 0.5) * 18} r={1.6 + rand() * 1.6} fill="#d98064" opacity=".55" />
          ))}
        </g>
      );
    case 'olive':
      return (
        <g>
          <circle r="8.5" fill="#1d1816" />
          <circle r="3.4" fill="#5b2c1f" />
          <circle cx="-3" cy="-3.4" r="1.4" fill="#fff" opacity=".18" />
        </g>
      );
    case 'onion':
      return (
        <g fill="none" strokeLinecap="round">
          <path d="M-15 4A15 15 0 0 1 15 4" stroke="#8e3a5e" strokeWidth="4" />
          <path d="M-9 4A9 9 0 0 1 9 4" stroke="#c2698f" strokeWidth="3.4" />
        </g>
      );
    case 'tomato':
      return (
        <g>
          <path d={blob(11, 0.18, 9, rand)} fill="#cf2f19" />
          <path d={blob(5, 0.2, 7, rand, -2.5, -2.5)} fill="#ec6a4a" opacity=".6" />
        </g>
      );
    case 'mushroom':
      return (
        <g>
          <path d="M-5 3H5L4 13Q0 15 -4 13Z" fill="#eadbbd" />
          <path d="M-16 5C-16 -12 16 -12 16 5Z" fill="#c7a273" />
          <path d="M-13 3C-12 -8 12 -8 13 3" fill="none" stroke="#e6cfa4" strokeWidth="1.6" opacity=".7" />
        </g>
      );
    case 'burrata':
      return (
        <g>
          <path d={blob(40, 0.07, 14, rand)} fill="#fbf6e8" stroke="#e7d4a4" strokeWidth="1.6" />
          <path d={blob(22, 0.15, 10, rand, -9, -11)} fill="#fff" opacity=".7" />
          <path d={blob(7, 0.2, 8, rand, 12, 11)} fill="#e7d4a4" opacity=".6" />
        </g>
      );
    case 'pistachio':
      return <ellipse rx="3.4" ry="2.1" fill={rand() > 0.5 ? '#8fa64b' : '#6b8a34'} transform={`rotate(${f(rand() * 180)})`} />;
    case 'honey':
      return (
        <path
          d="M-120 0q22 26 44 0t44 0t44 0t44 0t44 0t44 0"
          fill="none" stroke="#e8a92c" strokeWidth="3.6" strokeLinecap="round" opacity=".92"
        />
      );
    case 'walnut':
      return (
        <g>
          <path d={blob(8, 0.28, 8, rand)} fill="#9c6b3f" />
          <path d="M-4 -1Q0 3 4 -2" fill="none" stroke="#5e3b1c" strokeWidth="1.3" />
        </g>
      );
    case 'pear':
      return (
        <g>
          <path d="M-17 4C-14 -17 14 -17 17 4C8 -2 -8 -2 -17 4Z" fill="#ecdfa8" stroke="#c9b26b" strokeWidth="1.2" />
          <path d="M-9 -1C-3 -7 4 -7 9 -1" fill="none" stroke="#fff" strokeWidth="1.2" opacity=".5" />
        </g>
      );
    case 'pepper':
      return (
        <g>
          <circle r="5" fill="#d4281a" />
          <circle cx="-1.6" cy="-1.8" r="1.3" fill="#f58a74" opacity=".7" />
          <path d="M1 -5Q4 -9 7 -8" fill="none" stroke="#3f7a2e" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      );
    case 'sausage':
      return (
        <g>
          <path d={blob(12, 0.1, 10, rand)} fill="#8a4a2b" />
          {[0, 1, 2, 3].map((i) => (
            <circle key={i} cx={(rand() - 0.5) * 14} cy={(rand() - 0.5) * 14} r={1.4 + rand()} fill="#c79468" opacity=".7" />
          ))}
        </g>
      );
    case 'hazelnut':
      return (
        <g>
          <circle r="6" fill="#9a6a3a" />
          <circle cx="-2" cy="-2.2" r="2" fill="#d6a874" opacity=".7" />
        </g>
      );
    case 'banana':
      return (
        <g>
          <circle r="14" fill="#f1de8f" stroke="#d6bb5a" strokeWidth="1.3" />
          <circle r="8" fill="none" stroke="#e0c76f" strokeWidth="1.2" />
          <path d="M-10 -2A11 11 0 0 1 8 -9" fill="none" stroke="#a9621a" strokeWidth="4" strokeLinecap="round" opacity=".55" />
        </g>
      );
    case 'zest':
      return <path d="M-8 0Q0 -7 8 0" fill="none" stroke="#e5d24a" strokeWidth="1.9" strokeLinecap="round" />;
    case 'mortadella':
      return (
        <g>
          <path d={blob(19, 0.16, 11, rand)} fill="#e7a09b" />
          {[0, 1, 2, 3, 4].map((i) => (
            <circle key={i} cx={(rand() - 0.5) * 24} cy={(rand() - 0.5) * 24} r={1.6 + rand() * 1.2} fill="#f8dcc9" opacity=".85" />
          ))}
        </g>
      );
    case 'choc':
      return (
        <path
          d="M-130 0C-90 -34 -70 34 -30 0S40 -30 70 0S110 30 130 0"
          fill="none" stroke="#2b140a" strokeWidth="3.2" strokeLinecap="round" opacity=".9"
        />
      );
  }
}

const LINE_KINDS: ToppingKind[] = ['honey', 'choc'];
const SPACING: Partial<Record<ToppingKind, number>> = {
  pepperoni: 36, sausage: 26, basil: 30, burrata: 0, pistachio: 8, hazelnut: 16, mortadella: 36, banana: 30,
  mushroom: 30, pear: 30, onion: 26, tomato: 20, zest: 10, arugula: 22, olive: 22, pepper: 14, walnut: 18,
};

interface Props {
  recipe: PizzaRecipe;
  className?: string;
  /** Texto alternativo. Sem ele, o SVG é decorativo. */
  label?: string;
  cut?: boolean;
}

function PizzaArtBase({ recipe, className, label, cut = true }: Props) {
  const uid = useId().replace(/:/g, '');
  const pal = BASES[recipe.base];

  const art = useMemo(() => {
    const rand = mulberry32(recipe.seed);

    // Cornicione: manchas de queima e brilhos de massa.
    const blisters = Array.from({ length: 38 }, () => {
      const a = rand() * Math.PI * 2;
      const r = 160 + rand() * 25;
      return { x: 200 + Math.cos(a) * r, y: 200 + Math.sin(a) * r, rx: 3 + rand() * 8, ry: 2 + rand() * 4.5, rot: (a * 180) / Math.PI + 90, o: 0.5 + rand() * 0.4 };
    });
    const puffs = Array.from({ length: 22 }, () => {
      const a = rand() * Math.PI * 2;
      const r = 164 + rand() * 20;
      return { x: 200 + Math.cos(a) * r, y: 200 + Math.sin(a) * r, rx: 5 + rand() * 9, ry: 3 + rand() * 4, rot: (a * 180) / Math.PI + 90 };
    });

    const crust = blob(190, 0.012, 40, rand, 200, 200);
    const sauce = blob(153, 0.018, 36, rand, 200, 200);

    // Molho: pontos de variação.
    const sauceSpecks = Array.from({ length: 26 }, () => {
      const r = 148 * Math.sqrt(rand());
      const a = rand() * Math.PI * 2;
      return { x: 200 + Math.cos(a) * r, y: 200 + Math.sin(a) * r, r: 1.5 + rand() * 4, light: rand() > 0.55 };
    });

    // Queijo
    const taken: Pt[] = [];
    let cheese: { x: number; y: number; r: number; d: string; hi: string; tint: string; spots: Pt[] }[] = [];
    const cheeseCount = { fior: 15, quattro: 18, ricotta: 12, none: 0 }[recipe.cheese];
    const cheesePts = scatter(cheeseCount, 128, recipe.cheese === 'ricotta' ? 30 : 36, rand, taken);
    cheese = cheesePts.map((p) => {
      const r = recipe.cheese === 'ricotta' ? 13 + rand() * 9 : 21 + rand() * 13;
      const tints = recipe.cheese === 'quattro' ? ['#f6ebcf', '#f6ebcf', '#f0d27a', '#e9e2d0'] : ['#f6ebcf'];
      return {
        x: p.x, y: p.y, r,
        d: blob(r, 0.14, 11, rand),
        hi: blob(r * 0.5, 0.2, 8, rand, -r * 0.22, -r * 0.25),
        tint: tints[Math.floor(rand() * tints.length)],
        spots: recipe.cheese === 'quattro' && rand() > 0.6 ? [{ x: (rand() - 0.5) * r, y: (rand() - 0.5) * r }, { x: (rand() - 0.5) * r, y: (rand() - 0.5) * r }] : [],
      };
    });

    // Coberturas
    const toppings: { kind: ToppingKind; x: number; y: number; rot: number; s: number; key: string; seed: number }[] = [];
    recipe.toppings.forEach((t, ti) => {
      if (LINE_KINDS.includes(t.kind)) {
        for (let i = 0; i < t.count; i++)
          toppings.push({ kind: t.kind, x: 200, y: 200 + (i - (t.count - 1) / 2) * 52, rot: (i % 2 ? 4 : -4), s: 1, key: `${ti}-${i}`, seed: Math.floor(rand() * 1e6) });
        return;
      }
      const pts = t.kind === 'burrata'
        ? [{ x: 200 + (rand() - 0.5) * 16, y: 200 + (rand() - 0.5) * 16 }]
        : scatter(t.count, t.kind === 'pistachio' || t.kind === 'zest' ? 136 : 132, SPACING[t.kind] ?? 20, rand, t.kind === 'pistachio' || t.kind === 'zest' || t.kind === 'hazelnut' ? [] : taken.slice());
      pts.forEach((p, i) => {
        if (!['pistachio', 'zest', 'hazelnut'].includes(t.kind)) taken.push(p);
        toppings.push({ kind: t.kind, x: p.x, y: p.y, rot: rand() * 360, s: 0.9 + rand() * 0.25, key: `${ti}-${i}`, seed: Math.floor(rand() * 1e6) });
      });
    });

    // Queima: manchas douradas e pretas sobre o queijo.
    const chars = Array.from({ length: 22 }, (_, i) => {
      const r = 132 * Math.sqrt(rand());
      const a = rand() * Math.PI * 2;
      return { x: 200 + Math.cos(a) * r, y: 200 + Math.sin(a) * r, rx: 3 + rand() * 7, ry: 2 + rand() * 4, rot: rand() * 180, dark: i % 4 === 0 };
    });

    return { blisters, puffs, crust, sauce, sauceSpecks, cheese, toppings, chars };
  }, [recipe]);

  const glossy = recipe.base === 'cacau' || recipe.base === 'doce';

  return (
    <svg
      className={className}
      viewBox="0 0 400 400"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      overflow="visible"
    >
      <defs>
        <radialGradient id={`${uid}sh`}>
          <stop offset=".86" stopColor="#000" stopOpacity=".6" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}dg`} cx=".5" cy=".5" r=".5">
          <stop offset=".6" stopColor={pal.dough[0]} />
          <stop offset="1" stopColor={pal.dough[1]} />
        </radialGradient>
        <radialGradient id={`${uid}bk`} cx=".5" cy=".5" r=".5">
          <stop offset=".7" stopColor={pal.bake} stopOpacity="0" />
          <stop offset=".9" stopColor={pal.bake} stopOpacity=".55" />
          <stop offset="1" stopColor={pal.bake} stopOpacity=".9" />
        </radialGradient>
        <radialGradient id={`${uid}sc`} cx=".42" cy=".4" r=".62">
          <stop offset="0" stopColor={pal.sauce[0]} />
          <stop offset="1" stopColor={pal.sauce[1]} />
        </radialGradient>
      </defs>

      <circle className="pz-shadow" cx="200" cy="206" r="218" fill={`url(#${uid}sh)`} />

      <g className="pz-dough">
        <path d={art.crust} fill={`url(#${uid}dg)`} />
        {art.puffs.map((p, i) => (
          <ellipse key={i} cx={p.x} cy={p.y} rx={p.rx} ry={p.ry} transform={`rotate(${f(p.rot)} ${f(p.x)} ${f(p.y)})`} fill="#fbe6bd" opacity=".35" />
        ))}
      </g>

      <g className="pz-sauce">
        <path d={art.sauce} fill={`url(#${uid}sc)`} />
        {art.sauceSpecks.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={s.light ? '#ffffff' : '#000000'} opacity={s.light ? 0.1 : 0.14} />
        ))}
        {glossy && <ellipse cx="160" cy="150" rx="62" ry="30" transform="rotate(-24 160 150)" fill="#fff" opacity=".12" />}
      </g>

      <g className="pz-cheese">
        {art.cheese.map((c, i) => (
          <g key={i} transform={`translate(${f(c.x)} ${f(c.y)})`}>
            <g className="pz-pop">
              <path d={c.d} fill={c.tint} stroke="#dcb867" strokeWidth="1.4" strokeOpacity=".55" />
              <path d={c.hi} fill="#fff" opacity=".5" />
              {c.spots.map((s, j) => (
                <circle key={j} cx={s.x} cy={s.y} r="2.2" fill="#5e7b6b" opacity=".8" />
              ))}
            </g>
          </g>
        ))}
      </g>

      <g className="pz-top">
        {art.toppings.map((t) => (
          <g key={t.key} transform={`translate(${f(t.x)} ${f(t.y)}) rotate(${f(t.rot)}) scale(${t.s.toFixed(2)})`}>
            <g className="pz-pop">
              <Topping kind={t.kind} rand={mulberry32(t.seed)} />
            </g>
          </g>
        ))}
      </g>

      <g className="pz-char">
        <circle className="pz-bake" cx="200" cy="200" r="190" fill={`url(#${uid}bk)`} />
        {art.chars.map((c, i) => (
          <ellipse key={i} cx={c.x} cy={c.y} rx={c.rx} ry={c.ry} transform={`rotate(${f(c.rot)} ${f(c.x)} ${f(c.y)})`} fill={c.dark ? '#2a1408' : '#9a5b1f'} opacity={c.dark ? 0.4 : 0.28} />
        ))}
        {art.blisters.map((b, i) => (
          <ellipse key={i} cx={b.x} cy={b.y} rx={b.rx} ry={b.ry} transform={`rotate(${f(b.rot)} ${f(b.x)} ${f(b.y)})`} fill={recipe.base === 'nero' ? '#000' : '#2b160b'} opacity={b.o} />
        ))}
      </g>

      {cut && (
        <g stroke="#140a05" strokeWidth="1.3" opacity=".28" strokeLinecap="round">
          {[0, 1, 2].map((i) => {
            const a = (i * 60 + 15) * (Math.PI / 180);
            return <line key={i} x1={200 - Math.cos(a) * 186} y1={200 - Math.sin(a) * 186} x2={200 + Math.cos(a) * 186} y2={200 + Math.sin(a) * 186} />;
          })}
        </g>
      )}
    </svg>
  );
}

export const PizzaArt = memo(PizzaArtBase);
