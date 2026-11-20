import { BRAND, STORE, WHATSAPP_NUMBER } from '../config';
import { SIZES, brl, byId, priceOf } from '../data/menu';
import type { CartLine } from './cart';

export type Fulfillment = 'entrega' | 'retirada';
export type Payment = 'Pix' | 'Cartão na entrega' | 'Dinheiro';

export interface Customer {
  name: string;
  fulfillment: Fulfillment;
  street: string;
  district: string;
  complement: string;
  payment: Payment | '';
  change: string; // troco para (só dinheiro)
  notes: string;
}

export const EMPTY_CUSTOMER: Customer = {
  name: '',
  fulfillment: 'entrega',
  street: '',
  district: '',
  complement: '',
  payment: '',
  change: '',
  notes: '',
};

export type CustomerErrors = Partial<Record<keyof Customer, string>>;

export function validate(c: Customer): CustomerErrors {
  const e: CustomerErrors = {};
  if (c.name.trim().length < 2) e.name = 'Informe seu nome.';
  if (c.fulfillment === 'entrega') {
    if (c.street.trim().length < 3) e.street = 'Informe rua e número.';
    if (c.district.trim().length < 2) e.district = 'Informe o bairro.';
  }
  if (!c.payment) e.payment = 'Escolha a forma de pagamento.';
  return e;
}

export const deliveryFeeFor = (f: Fulfillment) => (f === 'entrega' ? STORE.deliveryFee : 0);

export function buildMessage(lines: CartLine[], c: Customer): string {
  const subtotal = lines.reduce((s, l) => {
    const item = byId(l.id);
    return item ? s + priceOf(item, l.size) * l.qty : s;
  }, 0);
  const fee = deliveryFeeFor(c.fulfillment);

  const items = lines
    .map((l) => {
      const item = byId(l.id);
      if (!item) return '';
      const size = l.size ? ` (${SIZES[l.size].label}, ${SIZES[l.size].detail.split(',')[0]})` : '';
      const total = brl(priceOf(item, l.size) * l.qty);
      const note = l.note.trim() ? `\n   Obs.: ${l.note.trim()}` : '';
      return `${l.qty}x ${item.name}${size}: ${total}${note}`;
    })
    .filter(Boolean)
    .join('\n');

  const where =
    c.fulfillment === 'entrega'
      ? `Entrega\n*Endereço:* ${c.street.trim()}, ${c.district.trim()}${c.complement.trim() ? `, ${c.complement.trim()}` : ''}`
      : 'Retirada no balcão';

  const pay =
    c.payment === 'Dinheiro' && c.change.trim() ? `Dinheiro (troco para ${c.change.trim()})` : c.payment;

  return [
    `*Pedido ${BRAND.name}*`,
    '',
    items,
    '',
    `*Subtotal:* ${brl(subtotal)}`,
    c.fulfillment === 'entrega' ? `*Taxa de entrega:* ${brl(fee)}` : null,
    `*Total:* ${brl(subtotal + fee)}`,
    '',
    `*Nome:* ${c.name.trim()}`,
    `*Tipo:* ${where}`,
    `*Pagamento:* ${pay}`,
    c.notes.trim() ? `*Observações:* ${c.notes.trim()}` : null,
  ]
    .filter((l) => l !== null)
    .join('\n');
}

export const isPlaceholderNumber = () => /^0+$/.test(WHATSAPP_NUMBER.replace(/^55/, ''));

export function whatsappUrl(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
