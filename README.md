# Forno Nero · cardápio digital

React 19 + TypeScript + Tailwind CSS v4. GSAP, ScrollTrigger e Lenis entram por CDN como melhoria progressiva:
se falharem ou se o usuário preferir menos movimento, o site funciona inteiro sem animação.

## Rodar
```bash
npm install
npm run build      # gera dist/ (abre direto em dist/index.html)
npm run dev        # build em watch + servidor em http://localhost:5173
```
O build usa `scripts/build.mjs` (esbuild + API do Tailwind v4), sem Vite.

## O que trocar antes de publicar
| O quê | Onde |
|---|---|
| Número do WhatsApp (só dígitos, com DDI e DDD) | `src/config.ts` → `WHATSAPP_NUMBER` |
| Endereço, horários, taxa e pagamentos | `src/config.ts` → `STORE` |
| Pratos e preços | `src/data/menu.ts` |
| Vídeo do hero | `src/config.ts` → `MEDIA` (arquivos em `public/media/`) |
| Fotos reais das pizzas | `photo` em cada pizza de `src/data/menu.ts` |
| GSAP/Lenis locais (sem CDN) | baixe para `public/vendor/` e aponte `CDN` em `src/config.ts` |

## Estrutura
- `src/components/`: Hero, Manifesto, Process (seção pinned), Menu, MenuCard, CartDrawer, Footer, PizzaArt (pizzas em SVG procedural).
- `src/lib/`: `motion.tsx` (carregamento e fallback do GSAP/Lenis), `cart.tsx` (estado do pedido), `whatsapp.ts` (validação e mensagem).
