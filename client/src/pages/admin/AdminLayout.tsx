import { NavLink, Outlet } from "react-router-dom";
import { ExternalLink, LogOut, QrCode, Settings, UtensilsCrossed } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { Logo, LogoMark } from "../../components/Logo";

const NAV = [
  { to: "/admin", end: true, icon: UtensilsCrossed, label: "Menü" },
  { to: "/admin/settings", icon: Settings, label: "Ayarlar" },
  { to: "/admin/qr", icon: QrCode, label: "QR Kodlar" },
];

export function AdminLayout() {
  const { me, logout } = useAuth();
  if (!me) return null;
  const { restaurant } = me;
  const menuPath = `/menu/${restaurant.slug}`;

  return (
    <div className="admin">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Logo size={34} />
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
          {NAV.map(({ to, end, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={end}>
              <Icon size={19} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <a className="sidebar-preview" href={menuPath} target="_blank" rel="noreferrer">
            <span>
              <strong>Menüyü görüntüle</strong>
              <small>Müşterilerinizin gördüğü sayfa</small>
            </span>
            <ExternalLink size={16} />
          </a>
          <div className="sidebar-user">
            <span title={me.user.email}>{me.user.email}</span>
            <button className="icon-btn" onClick={logout} aria-label="Çıkış yap" title="Çıkış yap">
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>

      <header className="mobile-topbar">
        <LogoMark size={32} />
        <strong>{restaurant.name}</strong>
        <a className="icon-btn" href={menuPath} target="_blank" rel="noreferrer" aria-label="Menüyü görüntüle">
          <ExternalLink size={18} />
        </a>
        <button className="icon-btn" onClick={logout} aria-label="Çıkış yap">
          <LogOut size={18} />
        </button>
      </header>

      <main className="admin-main">
        <Outlet />
      </main>

      <nav className="tabbar">
        {NAV.map(({ to, end, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={end}>
            <Icon size={21} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
