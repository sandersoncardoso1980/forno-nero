import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { loadMotion } from './lib/motion';
import './styles.css';

// GSAP/ScrollTrigger/Lenis são carregados antes de montar, para o estado inicial das animações
// ser aplicado antes da primeira pintura. Se falharem, o site monta normalmente sem animação.
loadMotion()
  .catch(() => null)
  .then((kit) => {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App kit={kit} />
      </StrictMode>,
    );
    requestAnimationFrame(() => document.getElementById('boot')?.classList.add('is-done'));
    window.setTimeout(() => document.getElementById('boot')?.remove(), 1000);
  });