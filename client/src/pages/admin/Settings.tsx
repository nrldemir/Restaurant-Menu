import { useMemo, useState, type FormEvent } from "react";
import { Check, Globe, ImageIcon, LoaderCircle, Palette, Store, TriangleAlert } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { ImageInput } from "../../components/ImageInput";
import { Ornament } from "../../components/Logo";
import { useToast } from "../../components/Toast";
import { Card, PageHeader } from "../../components/ui";
import { api, errorMessage } from "../../lib/api";
import { CURRENCIES, LANGUAGES } from "../../lib/i18n";
import { sanitizeSlugInput } from "../../lib/slug";
import { THEMES, themeVars } from "../../lib/themes";
import type { Restaurant } from "../../lib/types";

type Form = Pick<
  Restaurant,
  "name" | "slug" | "logoUrl" | "coverUrl" | "theme" | "currency" | "languages" | "defaultLanguage"
> & { description: string };

function toForm(r: Restaurant): Form {
  return {
    name: r.name,
    slug: r.slug,
    description: r.description ?? "",
    logoUrl: r.logoUrl,
    coverUrl: r.coverUrl,
    theme: r.theme,
    currency: r.currency,
    languages: r.languages,
    defaultLanguage: r.defaultLanguage,
  };
}

/** Ayarlar sayfasındaki canlı menü önizlemesi. */
function MenuPreview({ form }: { form: Form }) {
  return (
    <div className="preview-phone menu-page" style={themeVars(form.theme)}>
      <div className={`preview-hero menu-hero${form.coverUrl ? " has-cover" : ""}`}>
        {form.coverUrl && <img className="menu-hero-img" src={form.coverUrl} alt="" />}
        <div className="menu-hero-bar">
          <span className="glass-pill">Masa 4</span>
          <span className="glass-pill">
            <Globe size={11} /> {form.defaultLanguage.toUpperCase()}
          </span>
        </div>
        <div className="menu-hero-content">
          <div className="menu-crest">
            {form.logoUrl ? (
              <img src={form.logoUrl} alt="" />
            ) : (
              <span className="display">{form.name.charAt(0) || "?"}</span>
            )}
          </div>
          <h1 className="menu-title display">{form.name || "Restoran adı"}</h1>
          <Ornament className="menu-ornament" width={100} />
          {form.description && <p className="menu-tagline display">{form.description}</p>}
        </div>
      </div>
      <div className="preview-chips cat-nav">
        <a className="active">Ana Yemekler</a>
        <a>Tatlılar</a>
        <a>İçecekler</a>
      </div>
      <div className="preview-items">
        {["Adana Kebap", "Künefe"].map((n, i) => (
          <div key={n} className="product-card">
            <div className="product-body">
              <h3>{n}</h3>
              <p>{i === 0 ? "Közlenmiş domates ve biber ile" : "Antep fıstıklı, sıcak servis"}</p>
              <div className="product-foot">
                <span className="price">{i === 0 ? "₺480" : "₺240"}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Settings() {
  const { me, setRestaurant } = useAuth();
  const toast = useToast();
  const r = me!.restaurant;
  const [saved, setSaved] = useState<Form>(() => toForm(r));
  const [form, setForm] = useState<Form>(saved);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(saved), [form, saved]);
  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => ({ ...f, [key]: value }));

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
    setError(null);
    try {
      const result = await api<Restaurant>("/admin/restaurant", {
        method: "PUT",
        body: { ...form, slug: form.slug.replace(/^-+|-+$/g, "") },
      });
      setRestaurant(result);
      const next = toForm(result);
      setSaved(next);
      setForm(next);
      toast.success("Ayarlar kaydedildi");
    } catch (err) {
      setError(errorMessage(err));
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="page settings-page" onSubmit={onSubmit}>
      <PageHeader title="Ayarlar" subtitle="Restoranınızın bilgilerini ve menünüzün görünümünü özelleştirin." />

      <div className="settings-layout">
        <div className="settings-main">
          <Card title="Restoran bilgileri" description="Menünüzün en üstünde görünür." icon={Store}>
            <div className="form-row">
              <label className="field">
                <span className="field-label">Restoran adı</span>
                <input value={form.name} onChange={(e) => set("name", e.target.value)} required minLength={2} />
              </label>
              <label className="field">
                <span className="field-label">Menü linki</span>
                <div className="input-group">
                  <span className="addon">/menu/</span>
                  <input
                    value={form.slug}
                    onChange={(e) => set("slug", sanitizeSlugInput(e.target.value))}
                    required
                    minLength={3}
                  />
                </div>
              </label>
            </div>
            {form.slug !== saved.slug && (
              <div className="alert alert-warn" style={{ marginBottom: 18 }}>
                <TriangleAlert size={17} />
                Link değişirse daha önce yazdırdığınız QR kodlar çalışmaz; yenilerini yazdırmanız gerekir.
              </div>
            )}
            <label className="field" style={{ marginBottom: 0 }}>
              <span className="field-label">Kısa açıklama</span>
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={2}
                maxLength={500}
                placeholder="Örn. 1985'ten beri odun ateşinde geleneksel lezzetler."
              />
            </label>
          </Card>

          <Card title="Görseller" description="Logo ve kapak, menünüze kimlik kazandırır." icon={ImageIcon}>
            <div className="media-row">
              <ImageInput
                value={form.logoUrl}
                onChange={(v) => set("logoUrl", v)}
                label="Logo"
                shape="square"
                hint="Kare, en az 256×256 px"
              />
              <div className="media-cover">
                <ImageInput
                  value={form.coverUrl}
                  onChange={(v) => set("coverUrl", v)}
                  label="Kapak görseli"
                  shape="wide"
                  hint="Yatay, en az 1200×400 px. Yoksa tema rengi kullanılır."
                />
              </div>
            </div>
          </Card>

          <Card title="Menü teması" description="Menünüzün renk paletini seçin." icon={Palette}>
            <div className="theme-grid" role="radiogroup" aria-label="Menü teması">
              {Object.entries(THEMES).map(([id, t]) => (
                <button
                  type="button"
                  key={id}
                  role="radio"
                  aria-checked={form.theme === id}
                  className={`theme-option${form.theme === id ? " selected" : ""}`}
                  onClick={() => set("theme", id)}
                >
                  <span className="theme-swatch" style={{ background: t.hero }}>
                    <span className="theme-dots">
                      <i style={{ background: t.primary }} />
                      <i style={{ background: t.accent }} />
                      <i style={{ background: t.primaryDark }} />
                    </span>
                    {form.theme === id && (
                      <span className="theme-check">
                        <Check size={14} strokeWidth={3} />
                      </span>
                    )}
                  </span>
                  <span className="theme-name">{t.name}</span>
                </button>
              ))}
            </div>
          </Card>

          <Card title="Diller ve para birimi" description="Menünüzün sunulacağı diller." icon={Globe}>
            <div className="field">
              <span className="field-label">Menü dilleri</span>
              <div className="lang-chips">
                {Object.entries(LANGUAGES).map(([code, info]) => {
                  const on = form.languages.includes(code);
                  return (
                    <button
                      type="button"
                      key={code}
                      className={`lang-chip${on ? " on" : ""}`}
                      onClick={() => toggleLanguage(code)}
                      aria-pressed={on}
                    >
                      <span className="lang-code">{code.toUpperCase()}</span>
                      {info.name}
                      {on && <Check size={14} strokeWidth={3} />}
                    </button>
                  );
                })}
              </div>
              {form.languages.length === 0 && <p className="error-text">En az bir dil seçin.</p>}
            </div>
            <div className="form-row">
              <label className="field">
                <span className="field-label">Varsayılan dil</span>
                <select
                  value={form.defaultLanguage}
                  onChange={(e) => set("defaultLanguage", e.target.value)}
                  disabled={form.languages.length === 0}
                >
                  {form.languages.map((l) => (
                    <option key={l} value={l}>
                      {LANGUAGES[l]?.name ?? l}
                    </option>
                  ))}
                </select>
                <small className="field-hint">Çevirisi olmayan içerik bu dilde gösterilir.</small>
              </label>
              <label className="field">
                <span className="field-label">Para birimi</span>
                <select value={form.currency} onChange={(e) => set("currency", e.target.value)}>
                  {CURRENCIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
            </div>
          </Card>

          {error && (
            <div className="alert alert-error">
              <TriangleAlert size={17} />
              {error}
            </div>
          )}
        </div>

        <aside className="settings-preview">
          <div className="settings-preview-sticky">
            <span className="preview-label">Canlı önizleme</span>
            <MenuPreview form={form} />
          </div>
        </aside>
      </div>

      <div className={`save-bar${dirty ? " visible" : ""}`} aria-hidden={!dirty}>
        <span>Kaydedilmemiş değişiklikleriniz var</span>
        <div>
          <button type="button" className="btn btn-ghost" onClick={() => setForm(saved)} disabled={busy}>
            Geri al
          </button>
          <button className="btn btn-primary" disabled={busy || form.languages.length === 0}>
            {busy && <LoaderCircle size={16} className="spin" />}
            Değişiklikleri kaydet
          </button>
        </div>
      </div>
    </form>
  );
}
