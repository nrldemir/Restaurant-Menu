import { useId } from "react";

/** Lokma logosu: servis kubbesi (cloche) + safran parıltı. */
export function LogoMark({ size = 36, className }: { size?: number; className?: string }) {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F7713F" />
          <stop offset="1" stopColor="#B5300F" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="14" fill={`url(#${id})`} />
      <path d="M11.5 30.5a12.5 12.5 0 0 1 25 0z" fill="#fff" />
      <circle cx="24" cy="15.6" r="2.4" fill="#fff" />
      <rect x="9" y="32.2" width="30" height="3.2" rx="1.6" fill="#fff" />
      <path d="M35.5 8.5l1.1 2.7 2.7 1.1-2.7 1.1-1.1 2.7-1.1-2.7-2.7-1.1 2.7-1.1z" fill="#FFD37A" />
    </svg>
  );
}

export function Logo({ size = 36, tagline = true }: { size?: number; tagline?: boolean }) {
  return (
    <span className="logo">
      <LogoMark size={size} />
      <span className="logo-text">
        <span className="logo-word">Lokma</span>
        {tagline && <span className="logo-tag">dijital menü</span>}
      </span>
    </span>
  );
}
