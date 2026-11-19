import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Globe, QrCode, Zap } from "lucide-react";
import { Logo } from "../components/Logo";

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: ReactNode; children: ReactNode }) {
  useEffect(() => {
    document.documentElement.lang = "tr";
    document.title = `${title} · EasyDine`;
  }, [title]);
  return (
    <div className="auth">
      <aside className="auth-aside">
        <Link to="/" className="auth-aside-logo">
          <Logo variant="light" />
        </Link>
        <div className="auth-aside-body">
          <h2 className="display">
            Lezzetiniz kadar <em>güzel</em> bir menü.
          </h2>
          <ul>
            <li>
              <span>
                <QrCode size={18} />
              </span>
              Masaya özel QR kodlar
            </li>
            <li>
              <span>
                <Globe size={18} />
              </span>
              8 dilde otomatik menü
            </li>
            <li>
              <span>
                <Zap size={18} />
              </span>
              Fiyatlar saniyesinde güncel
            </li>
          </ul>
        </div>
        <blockquote>
          Kâğıt menüleri yeniden bastırmaya son. Fiyat değiştiğinde iki dokunuşla güncelleyin; tüm masalarda anında
          yayında.
        </blockquote>
      </aside>

      <main className="auth-main">
        <Link to="/" className="auth-mobile-logo">
          <Logo />
        </Link>
        <div className="auth-form-wrap">
          <h1 className="display">{title}</h1>
          <p className="auth-subtitle">{subtitle}</p>
          {children}
        </div>
      </main>
    </div>
  );
}
