import { useEffect, useRef, useState } from 'react';
import { STORE } from '../config';
import { MENU, QUICK_PICKS, SIZES, brl, byId, priceOf } from '../data/menu';
import { useCart } from '../lib/cart';
import { useMotion } from '../lib/motion';
import {
  EMPTY_CUSTOMER, buildMessage, deliveryFeeFor, isPlaceholderNumber, validate, whatsappUrl,
  type Customer, type CustomerErrors, type Payment,
} from '../lib/whatsapp';

const CUSTOMER_KEY = 'forno-nero:customer:v1';

function loadCustomer(): Customer {
  try {
    const raw = localStorage.getItem(CUSTOMER_KEY);
    return raw ? { ...EMPTY_CUSTOMER, ...JSON.parse(raw), notes: '', change: '' } : EMPTY_CUSTOMER;
  } catch {
    return EMPTY_CUSTOMER;
  }
}

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

interface Props {
  open: boolean;
  onClose: () => void;
  onExplore: () => void;
}

export function CartDrawer({ open, onClose, onExplore }: Props) {
  const { lines, subtotal, setQty, setNote, remove, clear, add } = useCart();
  const kit = useMotion();
  const panel = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const [customer, setCustomer] = useState<Customer>(loadCustomer);
  const [errors, setErrors] = useState<CustomerErrors>({});
  const [sent, setSent] = useState(false);

  const fee = deliveryFeeFor(customer.fulfillment);
  const total = subtotal + (lines.length ? fee : 0);
  const set = <K extends keyof Customer>(k: K, v: Customer[K]) => setCustomer((c) => ({ ...c, [k]: v }));

  useEffect(() => {
    try {
      const { notes: _n, change: _c, ...keep } = customer;
      localStorage.setItem(CUSTOMER_KEY, JSON.stringify(keep));
    } catch { /* sem armazenamento: segue só em memória */ }
  }, [customer]);

  // Abrir: trava o scroll da página, move o foco para o painel e devolve ao fechar.
  useEffect(() => {
    if (!open) return;
    opener.current = document.activeElement as HTMLElement;
    kit?.lenis?.stop();
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    setSent(false);
    const t = window.setTimeout(() => panel.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus(), 60);

    if (kit) {
      kit.gsap.fromTo(panel.current, { xPercent: 100 }, { xPercent: 0, duration: 0.7, ease: 'expo.out' });
      kit.gsap.fromTo('.drawer-veil', { opacity: 0 }, { opacity: 1, duration: 0.5 });
    }

    return () => {
      window.clearTimeout(t);
      document.documentElement.style.overflow = prevOverflow;
      kit?.lenis?.start();
      opener.current?.focus?.();
    };
  }, [open, kit]);

  // Esc fecha mesmo quando o foco se perde (ex.: o botão focado desmonta após o envio).
  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [open, onClose]);

  // Ao trocar entre formulário e tela de confirmação, o foco volta para dentro do painel.
  useEffect(() => {
    if (open && sent) panel.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus();
  }, [open, sent]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !panel.current) return;
    const els = [...panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null);
    if (!els.length) return;
    const first = els[0], last = els[els.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(customer);
    setErrors(errs);
    if (Object.keys(errs).length || !lines.length) {
      const first = Object.keys(errs)[0];
      if (first) panel.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    if (isPlaceholderNumber()) {
      console.warn('[Forno Nero] WHATSAPP_NUMBER ainda é o marcador. Troque em src/config.ts.');
    }
    window.open(whatsappUrl(buildMessage(lines, customer)), '_blank', 'noopener,noreferrer');
    setSent(true);
  };

  if (!open) return null;

  const err = (k: keyof Customer) => (errors[k] ? { 'aria-invalid': true as const, 'aria-describedby': `err-${k}` } : {});
  const Err = ({ k }: { k: keyof Customer }) =>
    errors[k] ? <p id={`err-${k}`} className="field-error" role="alert">{errors[k]}</p> : null;

  return (
    <div className="drawer" onKeyDown={onKeyDown}>
      <div className="drawer-veil" onClick={onClose} aria-hidden="true" />
      <div ref={panel} className="drawer-panel" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
        <div className="drawer-head">
          <h2 id="drawer-title" className="drawer-title">Meu pedido</h2>
          <button type="button" className="drawer-close" onClick={onClose} aria-label="Fechar pedido" data-autofocus={lines.length ? true : undefined}>
            Fechar
          </button>
        </div>

        <div className="drawer-scroll" data-lenis-prevent>
          {sent ? (
            <div className="drawer-empty">
              <p className="drawer-empty-title">Pedido aberto no WhatsApp.</p>
              <p className="drawer-empty-text">Falta só tocar em enviar por lá. Assim que recebermos, confirmamos o tempo de preparo.</p>
              <button type="button" className="btn btn-primary" data-autofocus onClick={() => { clear(); setSent(false); onClose(); }}>
                Começar novo pedido
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setSent(false)}>Voltar ao pedido</button>
            </div>
          ) : !lines.length ? (
            <div className="drawer-empty">
              <p className="drawer-empty-title">Seu pedido está vazio.</p>
              <p className="drawer-empty-text">Comece pelas mais pedidas ou explore o cardápio completo.</p>
              <ul className="quick-list">
                {QUICK_PICKS.map((id) => {
                  const item = MENU.find((m) => m.id === id)!;
                  return (
                    <li key={id} className="quick-item">
                      <div>
                        <p className="quick-name">{item.name}</p>
                        <p className="quick-price">{brl(priceOf(item, 'media'))} na média</p>
                      </div>
                      <button type="button" className="btn btn-add" onClick={() => add(id, item.kind === 'pizza' ? 'media' : null)} aria-label={`Adicionar ${item.name} média ao pedido`}>
                        Adicionar
                      </button>
                    </li>
                  );
                })}
              </ul>
              <button type="button" className="btn btn-ghost" data-autofocus onClick={() => { onClose(); onExplore(); }}>
                EXPLORAR CARDÁPIO
              </button>
            </div>
          ) : (
            <form id="order-form" onSubmit={send} noValidate>
              <ul className="cart-lines">
                {lines.map((l) => {
                  const item = byId(l.id);
                  if (!item) return null;
                  return (
                    <li key={l.key} className="cart-line">
                      <div className="cart-line-top">
                        <div>
                          <p className="cart-line-name">{item.name}</p>
                          {l.size && <p className="cart-line-meta">{SIZES[l.size].label}, {SIZES[l.size].detail.split(',')[0]}</p>}
                        </div>
                        <p className="cart-line-price">{brl(priceOf(item, l.size) * l.qty)}</p>
                      </div>
                      <div className="cart-line-bottom">
                        <div className="stepper" role="group" aria-label={`Quantidade de ${item.name}`}>
                          <button type="button" onClick={() => setQty(l.key, l.qty - 1)} aria-label="Diminuir quantidade">−</button>
                          <output aria-live="polite">{l.qty}</output>
                          <button type="button" onClick={() => setQty(l.key, l.qty + 1)} aria-label="Aumentar quantidade">+</button>
                        </div>
                        <input
                          className="field field-sm" type="text" value={l.note} maxLength={140}
                          onChange={(e) => setNote(l.key, e.target.value)}
                          placeholder="Observação" aria-label={`Observação para ${item.name}`}
                        />
                        <button type="button" className="link-btn" onClick={() => remove(l.key)} aria-label={`Remover ${item.name}`}>Remover</button>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <fieldset className="fieldset">
                <legend className="legend">Como você quer receber?</legend>
                <div className="seg">
                  {(['entrega', 'retirada'] as const).map((f) => (
                    <label key={f} className={`seg-opt ${customer.fulfillment === f ? 'is-on' : ''}`}>
                      <input type="radio" name="fulfillment" className="sr-only" checked={customer.fulfillment === f} onChange={() => set('fulfillment', f)} />
                      {f === 'entrega' ? `Entrega (${brl(STORE.deliveryFee)})` : 'Retirada no balcão'}
                    </label>
                  ))}
                </div>
                {customer.fulfillment === 'entrega' && <p className="hint">{STORE.deliveryNote}</p>}
              </fieldset>

              <div className="fields">
                <label className="label">Seu nome
                  <input className="field" name="name" type="text" autoComplete="name" value={customer.name} onChange={(e) => set('name', e.target.value)} {...err('name')} />
                  <Err k="name" />
                </label>

                {customer.fulfillment === 'entrega' && (
                  <>
                    <label className="label">Rua e número
                      <input className="field" name="street" type="text" autoComplete="street-address" value={customer.street} onChange={(e) => set('street', e.target.value)} {...err('street')} />
                      <Err k="street" />
                    </label>
                    <div className="field-row">
                      <label className="label">Bairro
                        <input className="field" name="district" type="text" value={customer.district} onChange={(e) => set('district', e.target.value)} {...err('district')} />
                        <Err k="district" />
                      </label>
                      <label className="label">Complemento
                        <input className="field" name="complement" type="text" value={customer.complement} onChange={(e) => set('complement', e.target.value)} />
                      </label>
                    </div>
                  </>
                )}
              </div>

              <fieldset className="fieldset">
                <legend className="legend">Pagamento</legend>
                <div className="seg seg-3">
                  {STORE.paymentMethods.map((p) => (
                    <label key={p} className={`seg-opt ${customer.payment === p ? 'is-on' : ''}`}>
                      <input type="radio" name="payment" className="sr-only" checked={customer.payment === p} onChange={() => set('payment', p as Payment)} />
                      {p}
                    </label>
                  ))}
                </div>
                <Err k="payment" />
                {customer.payment === 'Dinheiro' && (
                  <label className="label mt-3">Troco para quanto? (opcional)
                    <input className="field" name="change" type="text" inputMode="decimal" placeholder="R$ 100" value={customer.change} onChange={(e) => set('change', e.target.value)} />
                  </label>
                )}
              </fieldset>

              <label className="label">Observações do pedido (opcional)
                <textarea className="field" name="notes" rows={2} maxLength={240} value={customer.notes} onChange={(e) => set('notes', e.target.value)} />
              </label>
            </form>
          )}
        </div>

        {!sent && lines.length > 0 && (
          <div className="drawer-foot">
            <dl className="totals">
              <div><dt>Subtotal</dt><dd>{brl(subtotal)}</dd></div>
              {customer.fulfillment === 'entrega' && <div><dt>Taxa de entrega</dt><dd>{brl(fee)}</dd></div>}
              <div className="totals-grand"><dt>Total</dt><dd>{brl(total)}</dd></div>
            </dl>
            <button type="submit" form="order-form" className="btn btn-primary btn-wide">Enviar pedido pelo WhatsApp</button>
            <p className="hint">O pedido abre no WhatsApp já escrito. Você confere e toca em enviar.</p>
          </div>
        )}
      </div>
    </div>
  );
}
