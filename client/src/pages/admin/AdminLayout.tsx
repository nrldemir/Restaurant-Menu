import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

export function AdminLayout() {
  const { me, logout } = useAuth();
  if (!me) return null;
  const { restaurant } = me;

  return (
    <div className="admin">
      <header className="admin-topbar">
        <div className="admin-brand">
          {restaurant.logoUrl ? <img src={restaurant.logoUrl} alt="" /> : <span>🍽️</span>}
          <strong>{restaurant.name}</strong>
        </div>
        <nav className="admin-nav">
          <NavLink to="/admin" end>
            Menü
          </NavLink>
          <NavLink to="/admin/settings">Ayarlar</NavLink>
          <NavLink to="/admin/qr">QR Kodlar</NavLink>
        </nav>
        <div className="admin-user">
          <a className="btn btn-ghost" href={`/menu/${restaurant.slug}`} target="_blank" rel="noreferrer">
            Menüyü görüntüle ↗
          </a>
          <button className="btn btn-ghost" onClick={logout} title={me.user.email}>
            Çıkış
          </button>
        </div>
      </header>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
