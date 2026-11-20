export type ToppingKind =
  | 'basil' | 'pepperoni' | 'olive' | 'onion' | 'tomato' | 'mushroom' | 'burrata'
  | 'pistachio' | 'honey' | 'walnut' | 'pear' | 'pepper' | 'sausage' | 'hazelnut'
  | 'banana' | 'zest' | 'mortadella' | 'choc' | 'arugula';

export interface PizzaRecipe {
  base: 'rossa' | 'bianca' | 'nero' | 'cacau' | 'doce';
  cheese: 'fior' | 'quattro' | 'ricotta' | 'none';
  toppings: { kind: ToppingKind; count: number }[];
  seed: number;
}

export type SizeKey = 'media' | 'grande';
export const SIZES: Record<SizeKey, { label: string; detail: string }> = {
  media: { label: 'Média', detail: '30 cm, 6 fatias' },
  grande: { label: 'Grande', detail: '35 cm, 8 fatias' },
};

export type CategoryId = 'classicas' | 'autorais' | 'brancas' | 'doces' | 'bebidas';

export interface Category {
  id: CategoryId;
  label: string;
  tagline: string;
}

export interface Pizza {
  kind: 'pizza';
  id: string;
  category: CategoryId;
  name: string;
  description: string;
  prices: Record<SizeKey, number>;
  badge?: string;
  recipe: PizzaRecipe;
  /** Caminho opcional de uma foto real (ex.: '/media/pizzas/marguerita.jpg'). Sem foto, usa a ilustração. */
  photo?: string;
}

export interface Drink {
  kind: 'drink';
  id: string;
  category: 'bebidas';
  name: string;
  description: string;
  price: number;
}

export type MenuItem = Pizza | Drink;

export const CATEGORIES: Category[] = [
  { id: 'classicas', label: 'Clássicas', tagline: 'A receita que a gente não mexe: poucos ingredientes, feitos com muito cuidado.' },
  { id: 'autorais', label: 'Autorais', tagline: 'Combinações da casa, pensadas para o fogo da lenha.' },
  { id: 'brancas', label: 'Brancas', tagline: 'Sem molho de tomate. Cremosas, aromáticas e leves.' },
  { id: 'doces', label: 'Doces', tagline: 'Para fechar a mesa com a mesma massa, em outra direção.' },
  { id: 'bebidas', label: 'Bebidas', tagline: 'Para acompanhar. Bebidas alcoólicas apenas para maiores de 18 anos.' },
];

export const MENU: MenuItem[] = [
  // Clássicas
  {
    kind: 'pizza', id: 'marguerita', category: 'classicas', name: 'Marguerita',
    description: 'Tomate italiano amassado na hora, fior di latte, manjericão fresco e um fio de azeite.',
    prices: { media: 52, grande: 64 }, badge: 'Mais pedida',
    recipe: { base: 'rossa', cheese: 'fior', toppings: [{ kind: 'basil', count: 7 }], seed: 11 },
  },
  {
    kind: 'pizza', id: 'calabresa-nera', category: 'classicas', name: 'Calabresa Nera',
    description: 'Calabresa artesanal defumada na casa, cebola roxa, azeitona preta e muçarela.',
    prices: { media: 56, grande: 68 },
    recipe: { base: 'rossa', cheese: 'fior', toppings: [{ kind: 'sausage', count: 14 }, { kind: 'onion', count: 12 }, { kind: 'olive', count: 10 }], seed: 23 },
  },
  {
    kind: 'pizza', id: 'pepperoni', category: 'classicas', name: 'Pepperoni',
    description: 'Pepperoni curado em fatias finas que encrespam no forno, muçarela e orégano.',
    prices: { media: 58, grande: 70 },
    recipe: { base: 'rossa', cheese: 'fior', toppings: [{ kind: 'pepperoni', count: 17 }], seed: 31 },
  },
  {
    kind: 'pizza', id: 'quatro-queijos', category: 'classicas', name: 'Quatro Queijos',
    description: 'Muçarela, provolone, gorgonzola e parmesão sobre molho de tomate fresco.',
    prices: { media: 58, grande: 72 },
    recipe: { base: 'rossa', cheese: 'quattro', toppings: [{ kind: 'basil', count: 3 }], seed: 41 },
  },
  // Autorais
  {
    kind: 'pizza', id: 'nero', category: 'autorais', name: 'Nero',
    description: 'Massa preta com carvão vegetal, burrata inteira, tomate confitado e pistache.',
    prices: { media: 78, grande: 94 }, badge: 'Assinatura',
    recipe: { base: 'nero', cheese: 'none', toppings: [{ kind: 'tomato', count: 12 }, { kind: 'burrata', count: 1 }, { kind: 'pistachio', count: 34 }, { kind: 'basil', count: 4 }], seed: 53 },
  },
  {
    kind: 'pizza', id: 'brasa', category: 'autorais', name: 'Brasa',
    description: 'Linguiça de pernil na brasa, cebola caramelizada, muçarela e pimenta biquinho.',
    prices: { media: 68, grande: 82 },
    recipe: { base: 'rossa', cheese: 'fior', toppings: [{ kind: 'sausage', count: 12 }, { kind: 'onion', count: 10 }, { kind: 'pepper', count: 14 }], seed: 61 },
  },
  {
    kind: 'pizza', id: 'fogo-e-mel', category: 'autorais', name: 'Fogo e Mel',
    description: 'Gorgonzola, pera, nozes tostadas e mel quente por cima, saindo do forno.',
    prices: { media: 66, grande: 80 },
    recipe: { base: 'bianca', cheese: 'quattro', toppings: [{ kind: 'pear', count: 12 }, { kind: 'walnut', count: 14 }, { kind: 'honey', count: 3 }], seed: 71 },
  },
  // Brancas
  {
    kind: 'pizza', id: 'funghi-bianca', category: 'brancas', name: 'Funghi Bianca',
    description: 'Mix de cogumelos salteados na manteiga, muçarela, parmesão e tomilho.',
    prices: { media: 70, grande: 84 },
    recipe: { base: 'bianca', cheese: 'fior', toppings: [{ kind: 'mushroom', count: 13 }, { kind: 'basil', count: 3 }], seed: 83 },
  },
  {
    kind: 'pizza', id: 'pistache-mortadela', category: 'brancas', name: 'Pistache e Mortadela',
    description: 'Mortadela italiana, creme de pistache, burrata fresca e raspas de limão siciliano.',
    prices: { media: 74, grande: 88 },
    recipe: { base: 'bianca', cheese: 'ricotta', toppings: [{ kind: 'mortadella', count: 8 }, { kind: 'pistachio', count: 40 }, { kind: 'zest', count: 12 }], seed: 97 },
  },
  {
    kind: 'pizza', id: 'ricota-limao', category: 'brancas', name: 'Ricota e Limão Siciliano',
    description: 'Ricota fresca, rúcula, raspas de limão e azeite. Chega à mesa ainda crocante.',
    prices: { media: 62, grande: 76 },
    recipe: { base: 'bianca', cheese: 'ricotta', toppings: [{ kind: 'arugula', count: 14 }, { kind: 'zest', count: 14 }], seed: 101 },
  },
  // Doces
  {
    kind: 'pizza', id: 'chocolate-nero', category: 'doces', name: 'Chocolate Nero',
    description: 'Ganache de chocolate 70%, avelãs tostadas e flor de sal.',
    prices: { media: 54, grande: 66 },
    recipe: { base: 'cacau', cheese: 'none', toppings: [{ kind: 'hazelnut', count: 22 }, { kind: 'choc', count: 3 }], seed: 113 },
  },
  {
    kind: 'pizza', id: 'banana-brulee', category: 'doces', name: 'Banana Brûlée',
    description: 'Banana, doce de leite, canela e açúcar queimado na hora com maçarico.',
    prices: { media: 52, grande: 64 },
    recipe: { base: 'doce', cheese: 'none', toppings: [{ kind: 'banana', count: 15 }, { kind: 'choc', count: 2 }], seed: 127 },
  },
  // Bebidas
  { kind: 'drink', id: 'limonada-italiana', category: 'bebidas', name: 'Limonada italiana', description: 'Limão siciliano, hortelã e água com gás. Jarra individual.', price: 14 },
  { kind: 'drink', id: 'suco-natural', category: 'bebidas', name: 'Suco natural', description: 'Laranja, maracujá ou abacaxi com hortelã. 400 ml.', price: 12 },
  { kind: 'drink', id: 'refrigerante', category: 'bebidas', name: 'Refrigerante lata', description: 'Cola, guaraná ou limão. 350 ml.', price: 7 },
  { kind: 'drink', id: 'agua', category: 'bebidas', name: 'Água mineral', description: 'Com ou sem gás. 500 ml.', price: 5 },
  { kind: 'drink', id: 'cerveja-artesanal', category: 'bebidas', name: 'Cerveja artesanal', description: 'Pilsen ou IPA, long neck 355 ml. Gelada.', price: 22 },
  { kind: 'drink', id: 'vinho-taca', category: 'bebidas', name: 'Vinho tinto, taça', description: 'Seleção da casa, harmoniza com as pizzas de molho vermelho.', price: 28 },
];

export const byId = (id: string) => MENU.find((m) => m.id === id);
export const itemsOf = (cat: CategoryId) => MENU.filter((m) => m.category === cat);

export const priceOf = (item: MenuItem, size: SizeKey | null): number =>
  item.kind === 'drink' ? item.price : item.prices[size ?? 'media'];

export const brl = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/** Os três itens mostrados no pedido rápido (carrinho vazio). */
export const QUICK_PICKS = ['marguerita', 'pepperoni', 'nero'];
