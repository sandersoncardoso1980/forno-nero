/**
 * Configuração da marca e do negócio.
 * Tudo que o dono da pizzaria precisa trocar está neste arquivo.
 */

export const BRAND = {
  name: 'Forno Nero',
  wordmark: 'FORNO NERO',
  slogan: 'Uma experiência que começa antes da primeira fatia.',
  instagram: '@fornonero.pizza',
} as const;

/**
 * Número que recebe os pedidos: só dígitos, com DDI e DDD (ex.: 5511999998888).
 * TROCAR antes de publicar: este valor é um marcador.
 */
export const WHATSAPP_NUMBER = '5500000000000';

export const STORE = {
  address: 'Rua do Forno, 118, Centro',
  hours: [
    { days: 'Terça a quinta', time: '18h às 23h' },
    { days: 'Sexta e sábado', time: '18h à 00h30' },
    { days: 'Domingo', time: '17h às 23h' },
  ],
  deliveryFee: 8,
  deliveryNote: 'Entrega em até 45 minutos num raio de 6 km.',
  paymentMethods: ['Pix', 'Cartão na entrega', 'Dinheiro'],
} as const;

/**
 * Mídia do hero alinhada com os arquivos em /public/media:
 * hero.mp4, hero1.mp4, hero.png e pizza-real.jpg.
 */
export const MEDIA: {
  heroVideo: string | null;
  heroFallbackVideo: string | null;
  heroPizza: string;
  heroPoster: string;
} = {
  heroVideo: '/media/hero1.mp4',
  heroFallbackVideo: '/media/hero.mp4',
  heroPizza: '/media/hero.png',
  heroPoster: '/media/pizza-real.jpg',
};

export const CDN = {
  gsap: 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js',
  scrollTrigger: 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js',
  lenis: 'https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js',
};