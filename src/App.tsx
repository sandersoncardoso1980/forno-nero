import { useCallback, useState } from 'react';
import { CartDrawer } from './components/CartDrawer';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Manifesto } from './components/Manifesto';
import { Menu } from './components/Menu';
import { Process } from './components/Process';
import { CartProvider, useCart } from './lib/cart';
import { MotionProvider, useScrollTo, type MotionKit } from './lib/motion';

function Shell() {
  const [open, setOpen] = useState(false);
  const { count, subtotal, announcement } = useCart();
  const scrollTo = useScrollTo();
  const openCart = useCallback(() => setOpen(true), []);
  const explore = useCallback(() => scrollTo('cardapio'), [scrollTo]);

  return (
    <>
      <a href="#cardapio" className="skip-link">Pular para o cardápio</a>
      {/* inert: com o pedido aberto, o fundo não recebe foco nem leitor de tela. */}
      <div inert={open}>
        <Header onOpenCart={openCart} />
        <main>
          <Hero onOrder={openCart} />
          <Manifesto />
          <Process />
          <Menu />
        </main>
        <Footer onOrder={openCart} />
        {count > 0 && (
          <button type="button" className="cart-fab" onClick={openCart} aria-haspopup="dialog">
            <span>Ver pedido</span>
            <span className="cart-fab-count">{count}</span>
            <span className="cart-fab-total">{subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
          </button>
        )}
      </div>
      <CartDrawer open={open} onClose={() => setOpen(false)} onExplore={explore} />
      <div className="sr-only" role="status" aria-live="polite">{announcement}</div>
    </>
  );
}

export default function App({ kit }: { kit: MotionKit | null }) {
  return (
    <MotionProvider kit={kit}>
      <CartProvider>
        <Shell />
      </CartProvider>
    </MotionProvider>
  );
}
