import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { CircleAlert, Eye, EyeOff, LoaderCircle, Lock, Mail, Store } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { errorMessage } from "../lib/api";
import { sanitizeSlugInput, slugify } from "../lib/slug";
import { AuthLayout } from "./AuthLayout";

function passwordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-ZÇĞİÖŞÜ]/.test(pw) && /[a-zçğıöşü]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^\w\s]/.test(pw)) score++;
  return score;
}
const STRENGTH = ["Çok zayıf", "Zayıf", "Orta", "İyi", "Güçlü"];

export function Register() {
  const { me, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ restaurantName: "", slug: "", email: "", password: "" });
  const [slugEdited, setSlugEdited] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (me) return <Navigate to="/admin" replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await register({ ...form, slug: form.slug.replace(/^-+|-+$/g, "") });
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  const strength = passwordStrength(form.password);

  return (
    <AuthLayout
      title="Restoranınızı oluşturun"
      subtitle={
        <>
          Zaten hesabınız var mı? <Link to="/login">Giriş yapın</Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="auth-form">
        <label className="field">
          <span className="field-label">Restoran adı</span>
          <div className="input-icon">
            <Store size={17} />
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
              placeholder="Örn. Kebapçı Ali"
              autoFocus
            />
          </div>
        </label>
        <label className="field">
          <span className="field-label">Menü linkiniz</span>
          <div className="input-group">
            <span className="addon">{window.location.host}/menu/</span>
            <input
              value={form.slug}
              onChange={(e) => {
                setSlugEdited(true);
                setForm((f) => ({ ...f, slug: sanitizeSlugInput(e.target.value) }));
              }}
              required
              minLength={3}
              placeholder="kebapci-ali"
            />
          </div>
          <small className="field-hint">QR kodlarınız bu linke yönlenir. Sonradan değiştirebilirsiniz.</small>
        </label>
        <label className="field">
          <span className="field-label">E-posta</span>
          <div className="input-icon">
            <Mail size={17} />
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
              autoComplete="email"
              placeholder="ornek@restoran.com"
            />
          </div>
        </label>
        <label className="field">
          <span className="field-label">Şifre</span>
          <div className="input-icon input-with-action">
            <Lock size={17} />
            <input
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="En az 8 karakter"
            />
            <button
              type="button"
              className="input-action"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          {form.password && (
            <div className={`strength strength-${strength}`}>
              <div className="strength-bar">
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className={i < strength ? "on" : ""} />
                ))}
              </div>
              <small>{STRENGTH[strength]}</small>
            </div>
          )}
        </label>
        {error && (
          <div className="alert alert-error">
            <CircleAlert size={17} />
            {error}
          </div>
        )}
        <button className="btn btn-primary btn-lg btn-block" disabled={busy}>
          {busy ? <LoaderCircle size={18} className="spin" /> : null}
          {busy ? "Oluşturuluyor…" : "Hesabımı oluştur"}
        </button>
      </form>
    </AuthLayout>
  );
}
