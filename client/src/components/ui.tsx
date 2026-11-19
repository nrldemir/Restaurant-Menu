import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export function Switch({
  checked,
  onChange,
  label,
  size = "md",
}: {
  checked: boolean;
  onChange(value: boolean): void;
  label: string;
  size?: "sm" | "md";
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      title={label}
      className={`switch switch-${size}${checked ? " on" : ""}`}
      onClick={() => onChange(!checked)}
    >
      <span />
    </button>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  text,
  action,
}: {
  icon: LucideIcon;
  title: string;
  text?: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Icon size={26} strokeWidth={1.75} />
      </div>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </header>
  );
}

export function Card({
  title,
  description,
  icon: Icon,
  actions,
  children,
  className = "",
}: {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`card ${className}`}>
      {(title || actions) && (
        <header className="card-header">
          <div className="card-title">
            {Icon && (
              <span className="card-icon">
                <Icon size={18} />
              </span>
            )}
            <div>
              {title && <h2>{title}</h2>}
              {description && <p>{description}</p>}
            </div>
          </div>
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}
