import { useMemo, useState, type FormEvent } from "react";
import { Check, Clock, Globe, ImageIcon, LoaderCircle, Moon, Palette, Phone, Search, Store, TriangleAlert } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { ImageInput } from "../../components/ImageInput";
import { useToast } from "../../components/Toast";
import { Card, PageHeader } from "../../components/ui";
import { api, errorMessage } from "../../lib/api";
import { CURRENCIES, LANGUAGES } from "../../lib/i18n";
import { sanitizeSlugInput } from "../../lib/slug";
import { THEMES, themeVars } from "../../lib/themes";
import type { Restaurant } from "../../lib/types";
import { useUi } from "../../lib/ui-lang";

type Form = Pick<Restaurant, "name" | "slug" | "logoUrl" | "theme" | "currency" | "languages" | "defaultLanguage"> & {
  description: string;
  phone: string;
  openingHours: string;
};

function toForm(r: Restaurant): Form {
  return {
    name: r.name,
    slug: r.slug,
    description: r.description ?? "",
    phone: r.phone ?? "",
    openingHours: r.openingHours ?? "",
    logoUrl: r.logoUrl,
    theme: r.theme,
    currency: r.currency,
    languages: r.languages,
    defaultLanguage: r.defaultLanguage,
  };
}

const PREVIEW_CAT_IMAGES = ["/landing/serpme.jpg", "/landing/adana.jpg"];
const PREVIEW_ITEMS = [
  { name: "Adana Kebap", price: "₺620", img: "/landing/adana.jpg" },
  { name: "İskender", price: "₺680", img: "/landing/iskender.jpg" },
  { name: "Lahmacun", price: "₺160", img: "/landing/lahmacun.jpg" },
  { name: "Künefe", price: "₺290", img: "/landing/kunefe.jpg" },
];

/** Ayarlar sayfasındaki canlı menü önizlemesi (müşteri menüsüyle aynı sınıflar). */
function MenuPreview({ form }: { form: Form }) {
  const { t } = useUi();
  const langs = form.languages.slice(0, 3);
  return (
    <div className="preview-phone menu-page mode-light" style={themeVars(form.theme)}>
      {(form.openingHours || form.phone) && (
        <div className="m-topbar">
          <div className="m-topbar-inner">
            <span>{form.openingHours && <><Clock size={11} /> {form.openingHours}</>}</span>
            {form.phone && (
              <span>
                <Phone size={11} /> {form.phone}
              </span>
            )}
          </div>
        </div>
      )}
      <div className="m-header">
        <div className="m-brand">
          {form.logoUrl && <img className="m-logo" src={form.logoUrl} alt="" />}
          <div className="m-brand-text">
            <strong>{form.name || t.settings.name}</strong>
            {form.description && <small>{form.description}</small>}
          </div>
        </div>
        <div className="m-tools">
          {langs.length > 1 &&
            langs.map((l) => (
              <span key={l} className={`m-lang${l === form.defaultLanguage ? " active" : ""}`}>
                {l.toUpperCase()}
              </span>
            ))}
          {form.languages.length > 3 && (
            <span className="m-tool">
              <Globe size={15} />
            </span>
          )}
          <span className="m-tool">
            <Search size={15} />
          </span>
          <span className="m-tool">
            <Moon size={15} />
          </span>
        </div>
      </div>
      <div className="m-cats">
        <div className="m-cats-track">
          {t.settings.previewCategories.map((name, i) => (
            <span key={name} className="m-cat">
              <span className="m-cat-img">
                <img src={PREVIEW_CAT_IMAGES[i]} alt="" />
              </span>
              <span className="m-cat-name">{name}</span>
            </span>
          ))}
        </div>
      </div>
      <div className="m-content">
        <section className="m-section">
          <header className="m-section-head">
            <h2>{t.settings.previewSection}</h2>
          </header>
          <ul className="m-grid">
            {PREVIEW_ITEMS.map((p) => (
              <li key={p.name}>
                <span className="m-item">
                  <span className="m-item-img">
                    <img src={p.img} alt="" />
                  </span>
                  <span className="m-item-name">{p.name}</span>
                  <span className="m-item-price">{p.price}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

export function Settings() {
  const { me, setRestaurant } = useAuth();
  const toast = useToast();
  const { t } = useUi();
  const ts = t.settings;
  const r = me!.restaurant!;
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
      toast.success(ts.saved);
    } catch (err) {
      setError(errorMessage(err));
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="page settings-page" onSubmit={onSubmit}>
      <PageHeader title={ts.title} subtitle={ts.subtitle} />

      <div className="settings-layout">
        <div className="settings-main">
          <Card title={ts.infoTitle} description={ts.infoDesc} icon={Store}>
            <div className="form-row">
              <label className="field">
                <span className="field-label">{ts.name}</span>
                <input value={form.name} onChange={(e) => set("name", e.target.value)} required minLength={2} />
              </label>
              <label className="field">
                <span className="field-label">{ts.link}</span>
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
                {ts.slugWarn}
              </div>
            )}
            <label className="field">
              <span className="field-label">{ts.description}</span>
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={2}
                maxLength={500}
                placeholder={ts.descriptionPh}
              />
            </label>
            <div className="form-row">
              <label className="field" style={{ marginBottom: 0 }}>
                <span className="field-label">{ts.hours}</span>
                <div className="input-icon">
                  <Clock size={17} />
                  <input
                    value={form.openingHours}
                    onChange={(e) => set("openingHours", e.target.value)}
                    maxLength={60}
                    placeholder="09:00 – 24:00"
                  />
                </div>
              </label>
              <label className="field" style={{ marginBottom: 0 }}>
                <span className="field-label">{ts.phone}</span>
                <div className="input-icon">
                  <Phone size={17} />
                  <input
                    type="tel"
                    inputMode="tel"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value.replace(/[^\d\s+()-]/g, ""))}
                    maxLength={30}
                    placeholder="0212 123 45 67"
                  />
                </div>
              </label>
            </div>
            <small className="field-hint" style={{ display: "block", marginTop: 8 }}>
              {ts.contactHint}
            </small>
          </Card>

          <Card title={ts.logoTitle} description={ts.logoDesc} icon={ImageIcon}>
            <ImageInput
              value={form.logoUrl}
              onChange={(v) => set("logoUrl", v)}
              label={ts.logoTitle}
              shape="square"
              hint={ts.logoHint}
            />
          </Card>

          <Card title={ts.themeTitle} description={ts.themeDesc} icon={Palette}>
            <div className="theme-grid" role="radiogroup" aria-label={ts.themeTitle}>
              {Object.entries(THEMES).map(([id, theme]) => (
                <button
                  type="button"
                  key={id}
                  role="radio"
                  aria-checked={form.theme === id}
                  className={`theme-option${form.theme === id ? " selected" : ""}`}
                  onClick={() => set("theme", id)}
                >
                  <span className="theme-swatch" style={{ background: theme.hero }}>
                    <span className="theme-dots">
                      <i style={{ background: theme.primary }} />
                      <i style={{ background: theme.accent }} />
                      <i style={{ background: theme.primaryDark }} />
                    </span>
                    {form.theme === id && (
                      <span className="theme-check">
                        <Check size={14} strokeWidth={3} />
                      </span>
                    )}
                  </span>
                  <span className="theme-name">{ts.themeNames[id] ?? theme.name}</span>
                </button>
              ))}
            </div>
          </Card>

          <Card title={ts.langsTitle} description={ts.langsDesc} icon={Globe}>
            <div className="field">
              <span className="field-label">{ts.menuLanguages}</span>
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
              {form.languages.length === 0 && <p className="error-text">{ts.pickOneLang}</p>}
            </div>
            <div className="form-row">
              <label className="field">
                <span className="field-label">{ts.defaultLanguage}</span>
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
                <small className="field-hint">{ts.defaultLanguageHint}</small>
              </label>
              <label className="field">
                <span className="field-label">{ts.currency}</span>
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
            <span className="preview-label">{ts.preview}</span>
            <MenuPreview form={form} />
          </div>
        </aside>
      </div>

      <div className={`save-bar${dirty ? " visible" : ""}`} aria-hidden={!dirty}>
        <span>{ts.unsaved}</span>
        <div>
          <button type="button" className="btn btn-ghost" onClick={() => setForm(saved)} disabled={busy}>
            {ts.revert}
          </button>
          <button className="btn btn-primary" disabled={busy || form.languages.length === 0}>
            {busy && <LoaderCircle size={16} className="spin" />}
            {ts.saveChanges}
          </button>
        </div>
      </div>
    </form>
  );
}
