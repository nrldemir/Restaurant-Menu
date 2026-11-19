import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { CircleAlert, Eye, EyeOff, LoaderCircle, Lock, Mail, Sparkles } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { errorMessage } from "../lib/api";
import { useUi } from "../lib/ui-lang";
import { AuthLayout } from "./AuthLayout";

export function Login() {
  const { me, login } = useAuth();
  const { t } = useUi();
  const navigate = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from ?? "/admin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (me) return <Navigate to={from} replace />;

  async function submit(e?: FormEvent, creds = { email, password }) {
    e?.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(creds.email, creds.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      title={t.auth.loginTitle}
      subtitle={
        <>
          {t.auth.noAccount} <Link to="/register">{t.auth.signUp}</Link>
        </>
      }
    >
      <form onSubmit={submit} className="auth-form">
        <label className="field">
          <span className="field-label">{t.auth.email}</span>
          <div className="input-icon">
            <Mail size={17} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder={t.auth.emailPh}
            />
          </div>
        </label>
        <label className="field">
          <span className="field-label">{t.auth.password}</span>
          <div className="input-icon input-with-action">
            <Lock size={17} />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
            />
            <button
              type="button"
              className="input-action"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? t.auth.hidePw : t.auth.showPw}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </label>
        {error && (
          <div className="alert alert-error">
            <CircleAlert size={17} />
            {error}
          </div>
        )}
        <button className="btn btn-primary btn-lg btn-block" disabled={busy}>
          {busy ? <LoaderCircle size={18} className="spin" /> : null}
          {busy ? t.auth.loggingIn : t.auth.login}
        </button>
      </form>

      <div className="auth-divider">
        <span>{t.auth.or}</span>
      </div>
      <button
        type="button"
        className="btn btn-soft btn-block demo-btn"
        disabled={busy}
        onClick={() => submit(undefined, { email: "demo@example.com", password: "demo1234" })}
      >
        <Sparkles size={16} /> {t.auth.tryDemo}
      </button>
    </AuthLayout>
  );
}
