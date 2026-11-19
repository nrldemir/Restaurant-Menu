import { useId } from "react";

/**
 * EasyDine amblemi: bordo zemin üzerinde üstten görülen bir tabak; tabağın şekli "e" harfini
 * oluşturur, iki yanında altın çatal ve bıçak. Aynı çizim public/favicon.svg ve
 * public/icons/icon-maskable.svg içinde de kullanılır.
 */
export function LogoMark({ size = 40, className }: { size?: number; className?: string }) {
  const id = useId().replace(/:/g, "");
  const bg = `bg${id}`;
  const gold = `gold${id}`;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={bg} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#A33B52" />
          <stop offset="0.55" stopColor="#7F2236" />
          <stop offset="1" stopColor="#4F1020" />
        </linearGradient>
        <linearGradient id={gold} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F6E3A1" />
          <stop offset="1" stopColor="#C9A04A" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="13" fill={`url(#${bg})`} />
      <circle cx="24" cy="24" r="14.2" fill="none" stroke="#fff" strokeOpacity="0.22" strokeWidth="1.2" />
      <path
        d="M15.6 24.4H32.4A8.4 8.4 0 1 0 29.8 30.5"
        fill="none"
        stroke="#fff"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.6 11.5v5.4a1.7 1.7 0 0 0 1.7 1.7h0a1.7 1.7 0 0 0 1.7-1.7v-5.4M8.3 11.5v5.6M8.3 18.6v17.4"
        fill="none"
        stroke={`url(#${gold})`}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M39.7 36V11.6c2.2 1.4 2.7 5.6 2.4 9.2-.1 1.2-.9 2-2.4 2.1"
        fill="none"
        stroke={`url(#${gold})`}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Altın çizgi – elmas – çizgi süsleme ayıracı */
export function Ornament({ className = "", width = 120 }: { className?: string; width?: number }) {
  return (
    <svg className={`ornament ${className}`} width={width} height="12" viewBox="0 0 120 12" aria-hidden="true">
      <path d="M0 6h46" stroke="currentColor" strokeWidth="0.8" opacity="0.7" />
      <path d="M74 6h46" stroke="currentColor" strokeWidth="0.8" opacity="0.7" />
      <path d="M50 6l3-3 3 3-3 3z M64 6l3-3 3 3-3 3z" fill="currentColor" opacity="0.8" />
      <path d="M60 0.5l4 5.5-4 5.5-4-5.5z" fill="currentColor" />
    </svg>
  );
}

export const BRAND = "EasyDine";

export function Logo({
  size = 40,
  tagline = true,
  taglineText = "dijital menü",
  variant = "default",
}: {
  size?: number;
  tagline?: boolean;
  taglineText?: string;
  /** light: koyu zemin üzerinde */
  variant?: "default" | "light";
}) {
  return (
    <span className={`logo logo-${variant}`} aria-label={BRAND}>
      <LogoMark size={size} />
      <span className="logo-text" aria-hidden="true">
        <span className="logo-word">
          <span className="logo-easy">Easy</span>
          <span className="logo-dine">Dine</span>
        </span>
        {tagline && <span className="logo-tag">{taglineText}</span>}
      </span>
    </span>
  );
}
