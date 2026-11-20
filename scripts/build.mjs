// Build sem Vite: esbuild (TSX -> JS) + API programática do Tailwind v4 (CSS).
// Uso: node scripts/build.mjs [--watch] [--serve]
import { build, transform } from 'esbuild';
import { compile } from 'tailwindcss';
import fs from 'node:fs/promises';
import { watch as fsWatch } from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const src = path.join(root, 'src');
const dist = path.join(root, 'dist');
const args = new Set(process.argv.slice(2));
const dev = args.has('--watch');

async function walk(dir) {
  const out = [];
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}

async function loadStylesheet(id, base) {
  let file;
  if (id === 'tailwindcss') file = path.join(root, 'node_modules/tailwindcss/index.css');
  else if (id.startsWith('tailwindcss/'))
    file = path.join(root, 'node_modules', id.endsWith('.css') ? id : `${id}.css`);
  else file = path.resolve(base, id);
  return { path: file, base: path.dirname(file), content: await fs.readFile(file, 'utf8') };
}

async function buildCss() {
  const entry = path.join(src, 'styles.css');
  const compiler = await compile(await fs.readFile(entry, 'utf8'), {
    base: path.dirname(entry),
    loadStylesheet,
  });
  const files = [...(await walk(src)).filter((f) => /\.(tsx?|css)$/.test(f)), path.join(root, 'index.html')];
  const candidates = new Set();
  for (const f of files) {
    const text = await fs.readFile(f, 'utf8');
    for (const m of text.matchAll(/[^\s"'`<>={}()]+/g)) candidates.add(m[0]);
  }
  const css = compiler.build([...candidates]);
  const out = await transform(css, { loader: 'css', minify: !dev });
  await fs.writeFile(path.join(dist, 'assets/app.css'), out.code);
}

async function buildJs() {
  await build({
    entryPoints: [path.join(src, 'main.tsx')],
    bundle: true,
    format: 'iife', // funciona abrindo dist/index.html direto (file://)
    target: 'es2020',
    jsx: 'automatic',
    minify: !dev,
    sourcemap: dev,
    define: { 'process.env.NODE_ENV': JSON.stringify(dev ? 'development' : 'production') },
    outfile: path.join(dist, 'assets/app.js'),
    logLevel: 'warning',
  });
}

async function copyStatic() {
  await fs.copyFile(path.join(root, 'index.html'), path.join(dist, 'index.html'));
  await fs.cp(path.join(root, 'public'), dist, { recursive: true });
}

async function run() {
  const t = Date.now();
  await fs.mkdir(path.join(dist, 'assets'), { recursive: true });
  await Promise.all([buildJs(), buildCss()]);
  await copyStatic();
  console.log(`build ok em ${Date.now() - t}ms -> dist/`);
}

await run();

if (args.has('--watch')) {
  let timer;
  fsWatch(root, { recursive: true }, (_e, f) => {
    if (!f || f.startsWith('dist') || f.startsWith('node_modules')) return;
    clearTimeout(timer);
    timer = setTimeout(() => run().catch((e) => console.error(e.message)), 120);
  });
}

if (args.has('--serve')) {
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.mp4': 'video/mp4', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml' };
  http
    .createServer(async (req, res) => {
      const url = new URL(req.url, 'http://x');
      let file = path.join(dist, decodeURIComponent(url.pathname));
      if (!file.startsWith(dist)) return res.writeHead(403).end();
      try {
        if ((await fs.stat(file)).isDirectory()) file = path.join(file, 'index.html');
        res.writeHead(200, { 'content-type': types[path.extname(file)] ?? 'application/octet-stream' });
        res.end(await fs.readFile(file));
      } catch {
        res.writeHead(404).end('not found');
      }
    })
    .listen(5173, () => console.log('http://localhost:5173'));
}
