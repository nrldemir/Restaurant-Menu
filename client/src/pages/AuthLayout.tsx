import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Globe, QrCode, Zap } from "lucide-react";
import { Logo } from "../components/Logo";
import { LangToggle } from "../components/LangToggle";
import { useUi } from "../lib/ui-lang";

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: ReactNode; children: ReactNode }) {
  const { t, lang } = useUi();
  const [before, accent, after] = t.auth.headline;
  const tagline = lang === "tr" ? "dijital menü" : "digital menu";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = `${title} · EasyDine`;
  }, [title, lang]);

  return (
    <div className="auth">
      <aside className="auth-aside">
        <Link to="/" className="auth-aside-logo">
          <Logo variant="light" taglineText={tagline} />
        </Link>
        <div className="auth-aside-body">
          <h2 className="display">
            {before} <em>{accent}</em> {after}
          </h2>
          <ul>
            <li>
              <span>
                <QrCode size={18} />
              </span>
              {t.auth.featureQr}
            </li>
            <li>
              <span>
                <Globe size={18} />
              </span>
              {t.auth.featureLangs}
            </li>
            <li>
              <span>
                <Zap size={18} />
              </span>
              {t.auth.featurePrices}
            </li>
          </ul>
        </div>
        <blockquote>{t.auth.quote}</blockquote>
      </aside>

      <main className="auth-main">
        <div className="auth-topbar">
          <Link to="/" className="auth-mobile-logo">
            <Logo taglineText={tagline} />
          </Link>
          <LangToggle />
        </div>
        <div className="auth-form-wrap">
          <h1 className="display">{title}</h1>
          <p className="auth-subtitle">{subtitle}</p>
          {children}
        </div>
      </main>
    </div>
  );
}
