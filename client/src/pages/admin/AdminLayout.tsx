import { useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { ExternalLink, LogOut, QrCode, Settings, UtensilsCrossed } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { Logo, LogoMark } from "../../components/Logo";
import { LangToggle } from "../../components/LangToggle";
import { useUi } from "../../lib/ui-lang";

export function AdminLayout() {
  const { me, logout } = useAuth();
  const { t, lang } = useUi();

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = t.nav.adminTitle;
  }, [lang, t]);

  if (!me) return null;
  const { restaurant } = me;
  const menuPath = `/menu/${restaurant.slug}`;
  const nav = [
    { to: "/admin", end: true, icon: UtensilsCrossed, label: t.nav.menu },
    { to: "/admin/settings", icon: Settings, label: t.nav.settings },
    { to: "/admin/qr", icon: QrCode, label: t.nav.qr },
  ];

  return (
    <div className="admin">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Logo size={34} taglineText={lang === "tr" ? "dijital menü" : "digital menu"} />
        </div>

        <div className="sidebar-restaurant">
          <div className="sidebar-avatar">
            {restaurant.logoUrl ? (
              <img src={restaurant.logoUrl} alt="" />
            ) : (
              <span className="display">{restaurant.name.charAt(0)}</span>
            )}
          </div>
          <div className="sidebar-restaurant-text">
            <strong>{restaurant.name}</strong>
            <small>/menu/{restaurant.slug}</small>
          </div>
        </div>

        <nav className="sidebar-nav">
          {nav.map(({ to, end, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={end}>
              <Icon size={19} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <a className="sidebar-preview" href={menuPath} target="_blank" rel="noreferrer">
            <span>
              <strong>{t.nav.viewMenu}</strong>
              <small>{t.nav.viewMenuHint}</small>
            </span>
            <ExternalLink size={16} />
          </a>
          <div className="sidebar-user">
            <span title={me.user.email}>{me.user.email}</span>
            <LangToggle className="btn btn-ghost btn-sm" />
            <button className="icon-btn" onClick={logout} aria-label={t.nav.logout} title={t.nav.logout}>
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>

      <header className="mobile-topbar">
        <LogoMark size={32} />
        <strong>{restaurant.name}</strong>
        <LangToggle className="btn btn-ghost btn-sm" />
        <a className="icon-btn" href={menuPath} target="_blank" rel="noreferrer" aria-label={t.nav.viewMenu}>
          <ExternalLink size={18} />
        </a>
        <button className="icon-btn" onClick={logout} aria-label={t.nav.logout}>
          <LogOut size={18} />
        </button>
      </header>

      <main className="admin-main">
        <Outlet />
      </main>

      <nav className="tabbar">
        {nav.map(({ to, end, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={end}>
            <Icon size={21} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
