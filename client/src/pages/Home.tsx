import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function Home() {
  const { me } = useAuth();
  return (
    <main className="landing">
      <div className="landing-card">
        <div className="landing-logo">🍽️</div>
        <h1>Dijital Menü</h1>
        <p className="muted">
          Restoranınızın menüsünü dakikalar içinde dijitale taşıyın. Çok dilli menü, ürün görselleri ve masalara özel QR
          kodlar.
        </p>
        <div className="landing-actions">
          {me ? (
            <Link className="btn btn-primary" to="/admin">
              Yönetim paneline git
            </Link>
          ) : (
            <>
              <Link className="btn btn-primary" to="/register">
                Ücretsiz başla
              </Link>
              <Link className="btn" to="/login">
                Giriş yap
              </Link>
            </>
          )}
        </div>
        <Link className="link" to="/menu/demo-restoran">
          Demo menüyü gör →
        </Link>
      </div>
    </main>
  );
}
