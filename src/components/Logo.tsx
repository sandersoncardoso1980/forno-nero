/** Marca: arco de boca de forno com uma chama dentro. O arco é o motivo recorrente da identidade. */
export function FlameMark({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" aria-hidden="true" focusable="false">
      <path d="M6 37V20a14 14 0 0 1 28 0v17Z" stroke="currentColor" strokeWidth="2" />
      <path
        d="M20 33c-4.4 0-6.8-2.8-6.8-6 0-3.4 3.4-5.2 4-9.8 3.4 2 4.6 4 5 6 .9-.9 1.1-2 1-3.4 2.7 2.2 3.5 4.5 3.5 7.2 0 3.6-2.5 6-6.7 6Z"
        fill="var(--color-tomato)"
      />
    </svg>
  );
}

export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`logo ${className}`}>
      <FlameMark className="logo-mark" />
      <span className="logo-word">
        FORNO<span className="logo-gap" /> NERO
      </span>
    </span>
  );
}
