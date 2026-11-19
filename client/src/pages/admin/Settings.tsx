import { useState, type FormEvent } from "react";
import { useAuth } from "../../auth/AuthContext";
import { ImageInput } from "../../components/ImageInput";
import { api, errorMessage } from "../../lib/api";
import { CURRENCIES, LANGUAGES } from "../../lib/i18n";
import { sanitizeSlugInput } from "../../lib/slug";
import type { Restaurant } from "../../lib/types";

export function Settings() {
  const { me, setRestaurant } = useAuth();
  const r = me!.restaurant;
  const [form, setForm] = useState({
    name: r.name,
    slug: r.slug,
    description: r.description ?? "",
    logoUrl: r.logoUrl,
    currency: r.currency,
    languages: r.languages,
    defaultLanguage: r.defaultLanguage,
  });
  const [status, setStatus] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  function toggleLanguage(lang: string) {
    setForm((f) => {
      const languages = f.languages.includes(lang) ? f.languages.filter((l) => l !== lang) : [...f.languages, lang];
      const defaultLanguage = languages.includes(f.defaultLanguage) ? f.defaultLanguage : (languages[0] ?? "");
      return { ...f, languages, defaultLanguage };
    });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    try {
      const saved = await api<Restaurant>("/admin/restaurant", { method: "PUT", body: form });
      setRestaurant(saved);
      setStatus({ type: "ok", text: "Kaydedildi" });
    } catch (err) {
      setStatus({ type: "error", text: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  }

  const slugChanged = form.slug !== r.slug;

  return (
    <form className="panel settings" onSubmit={onSubmit}>
      <header className="panel-header">
        <h2>Restoran ayarları</h2>
      </header>

      <div className="row">
        <label className="field">
          <span>Restoran adı</span>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required minLength={2} />
        </label>
        <label className="field">
          <span>Menü linki</span>
          <div className="input-prefix">
            <span>/menu/</span>
            <input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: sanitizeSlugInput(e.target.value) })}
              required
              minLength={3}
            />
          </div>
          {slugChanged && <small className="warn">Dikkat: link değişirse daha önce basılan QR kodlar çalışmaz.</small>}
        </label>
      </div>

      <label className="field">
        <span>Kısa açıklama (menünün üstünde görünür)</span>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={2}
          maxLength={500}
        />
      </label>

      <ImageInput value={form.logoUrl} onChange={(logoUrl) => setForm({ ...form, logoUrl })} label="Logo" />

      <fieldset className="field">
        <span>Menü dilleri</span>
        <div className="chips">
          {Object.entries(LANGUAGES).map(([code, info]) => (
            <label key={code} className={`chip${form.languages.includes(code) ? " on" : ""}`}>
              <input type="checkbox" checked={form.languages.includes(code)} onChange={() => toggleLanguage(code)} />
              {info.flag} {info.name}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="row">
        <label className="field">
          <span>Varsayılan dil</span>
          <select
            value={form.defaultLanguage}
            onChange={(e) => setForm({ ...form, defaultLanguage: e.target.value })}
            disabled={form.languages.length === 0}
          >
            {form.languages.map((l) => (
              <option key={l} value={l}>
                {LANGUAGES[l]?.name ?? l}
              </option>
            ))}
          </select>
          <small className="muted">Çevirisi olmayan ürünlerde bu dil gösterilir.</small>
        </label>
        <label className="field">
          <span>Para birimi</span>
          <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
            {CURRENCIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
      </div>

      {status && <p className={status.type === "ok" ? "success" : "error"}>{status.text}</p>}
      <div>
        <button className="btn btn-primary" disabled={busy || form.languages.length === 0}>
          {busy ? "Kaydediliyor…" : "Kaydet"}
        </button>
      </div>
    </form>
  );
}
