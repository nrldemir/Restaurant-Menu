import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { errorMessage } from "../lib/api";
import { sanitizeSlugInput, slugify } from "../lib/slug";

export function Register() {
  const { me, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ restaurantName: "", slug: "", email: "", password: "" });
  const [slugEdited, setSlugEdited] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (me) return <Navigate to="/admin" replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await register(form);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={onSubmit}>
        <h1>Restoranınızı oluşturun</h1>
        <label className="field">
          <span>Restoran adı</span>
          <input
            value={form.restaurantName}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                restaurantName: e.target.value,
                slug: slugEdited ? f.slug : slugify(e.target.value),
              }))
            }
            required
            minLength={2}
          />
        </label>
        <label className="field">
          <span>Menü linki</span>
          <div className="input-prefix">
            <span>/menu/</span>
            <input
              value={form.slug}
              onChange={(e) => {
                setSlugEdited(true);
                setForm((f) => ({ ...f, slug: sanitizeSlugInput(e.target.value) }));
              }}
              required
              minLength={3}
            />
          </div>
        </label>
        <label className="field">
          <span>E-posta</span>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
            autoComplete="email"
          />
        </label>
        <label className="field">
          <span>Şifre (en az 8 karakter)</span>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="btn btn-primary btn-block" disabled={busy}>
          {busy ? "Oluşturuluyor…" : "Hesap oluştur"}
        </button>
        <p className="muted small">
          Zaten hesabınız var mı? <Link to="/login">Giriş yapın</Link>
        </p>
      </form>
    </main>
  );
}
