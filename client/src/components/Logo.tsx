import { useId } from "react";

/**
 * Lokma amblemi: bordo zemin, çift altın halka, taçlı servis kubbesi (cloche).
 * Aynı çizim public/favicon.svg ve public/icons/*.svg içinde de kullanılır.
 */
export function LogoMark({ size = 40, className }: { size?: number; className?: string }) {
  const id = useId().replace(/:/g, "");
  const bg = `bg${id}`;
  const gold = `gold${id}`;
  const shine = `shine${id}`;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true">
      <defs>
        <radialGradient id={bg} cx="0.35" cy="0.3" r="0.85">
          <stop offset="0" stopColor="#8E2A40" />
          <stop offset="0.55" stopColor="#5E1426" />
          <stop offset="1" stopColor="#2E0812" />
        </radialGradient>
        <linearGradient id={gold} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F8E7AE" />
          <stop offset="0.45" stopColor="#D8B562" />
          <stop offset="1" stopColor="#A57E2E" />
        </linearGradient>
        <linearGradient id={shine} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="24" fill={`url(#${bg})`} />
      <circle cx="24" cy="24" r="21.6" fill="none" stroke={`url(#${gold})`} strokeWidth="1.1" />
      <circle cx="24" cy="24" r="19.9" fill="none" stroke={`url(#${gold})`} strokeWidth="0.45" opacity="0.75" />
      {/* taç */}
      <path
        d="M19.6 14.2 L20.4 10.3 L22.2 12.3 L24 9.4 L25.8 12.3 L27.6 10.3 L28.4 14.2 Z"
        fill={`url(#${gold})`}
      />
      <rect x="19.6" y="14.5" width="8.8" height="1.1" rx="0.5" fill={`url(#${gold})`} />
      {/* kubbe */}
      <circle cx="24" cy="18" r="1.5" fill={`url(#${gold})`} />
      <path d="M13 30.2a11 11 0 0 1 22 0z" fill={`url(#${gold})`} />
      <path d="M16.3 28.6a8.2 8.2 0 0 1 4.6-6.4" fill="none" stroke={`url(#${shine})`} strokeWidth="1" strokeLinecap="round" />
      <rect x="10.8" y="31.2" width="26.4" height="2.2" rx="1.1" fill={`url(#${gold})`} />
      {/* yan süsler */}
      <path d="M4.6 24l1.1-1.1 1.1 1.1-1.1 1.1z M41.2 24l1.1-1.1 1.1 1.1-1.1 1.1z" fill="#D8B562" />
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

export function Logo({
  size = 40,
  tagline = true,
  variant = "default",
}: {
  size?: number;
  tagline?: boolean;
  /** light: koyu zemin üzerinde (altın yazı) */
  variant?: "default" | "light";
}) {
  return (
    <span className={`logo logo-${variant}`}>
      <LogoMark size={size} />
      <span className="logo-text">
        <span className="logo-word">LOKMA</span>
        {tagline && (
          <span className="logo-tag">
            <i />
            dijital menü
            <i />
          </span>
        )}
      </span>
    </span>
  );
}
