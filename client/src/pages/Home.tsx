import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BellRing,
  Check,
  Globe,
  ImageIcon,
  Palette,
  QrCode,
  Search,
  Sparkles,
  Timer,
  Zap,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { Logo, LogoMark, Ornament } from "../components/Logo";

type SiteLang = "en" | "tr";
const LANG_KEY = "ed_site_lang";

/** Tanıtım sayfası metinleri. Varsayılan dil İngilizce. */
const COPY = {
  en: {
    tagline: "digital menu",
    login: "Log in",
    start: "Start free",
    toPanel: "Go to dashboard",
    eyebrow: "QR menu · Multilingual · Free",
    titleA: "Your menu,",
    titleAccent: "one scan",
    titleB: "away.",
    sub: "With EasyDine, take your restaurant's menu digital in minutes. Update prices instantly, serve tourists in their own language and stop paying for printed menus.",
    ctaPrimary: "Get started for free",
    ctaDemo: "View demo menu",
    checks: ["No credit card required", "Unlimited items", "No app to download"],
    qrTitle: "Table 7",
    qrText: "Scan to see the menu",
    toastTitle: "Price updated",
    toastText: "Live on every table instantly",
    stripLabel: "Sample menu photos",
    featuresEyebrow: "Features",
    featuresTitle: "Everything your restaurant needs",
    features: [
      ["Ready in minutes", "Add your categories and items and your menu is live. No technical skills needed."],
      ["Menu in 8 languages", "Let tourists read your menu in their own language. The browser language is detected automatically."],
      ["QR code per table", "Generate a separate QR code for every table and print them as elegant cards."],
      ["Instant updates", "Prices changed? No reprinting. Changes go live within seconds."],
      ["Mouth-watering photos", "Item photos and your logo make the menu reflect your brand."],
      ["Your own theme", "Bordeaux, Navy, Olive, Aegean… pick the color palette that suits your restaurant."],
    ],
    stepsEyebrow: "How it works",
    stepsTitle: "A digital menu in three steps",
    steps: [
      ["Create an account", "Enter your restaurant's name and your menu link is ready."],
      ["Add your menu", "Categories, items, prices and photos."],
      ["Put the QR on tables", "Guests scan it and the menu opens on their phone."],
    ],
    ctaTitle: "Take your menu digital today",
    ctaText: "Setup takes 5 minutes. Print your first QR code right away.",
    ctaButton: "Create a free account",
    footer: "Digital menus for restaurants",
    credits: "Image credits",
    mock: {
      table: "Table 7",
      name: "Lokma Mutfak",
      desc: "Wood-fired Anatolian flavors",
      search: "Search the menu",
      chips: ["Grills", "Desserts", "Drinks"],
      items: [
        ["Adana Kebab", "Spicy lamb, charred tomatoes and lavash", "₺620", "/landing/adana.jpg"],
        ["Iskender", "Döner on pide with butter and yogurt", "₺680", "/landing/iskender.jpg"],
        ["Künefe", "With pistachios, served hot", "₺290", "/landing/kunefe.jpg"],
      ],
    },
    strip: ["Adana Kebab", "Menemen", "Lahmacun", "Künefe", "Iskender", "Pide", "Baklava", "Turkish Breakfast"],
  },
  tr: {
    tagline: "dijital menü",
    login: "Giriş yap",
    start: "Ücretsiz başla",
    toPanel: "Panele git",
    eyebrow: "QR menü · Çok dilli · Ücretsiz",
    titleA: "Menünüz, masada",
    titleAccent: "bir okutma",
    titleB: "uzağında.",
    sub: "EasyDine ile restoranınızın menüsünü dakikalar içinde dijitale taşıyın. Fiyatları anında güncelleyin, turistlere kendi dillerinde hizmet verin, kâğıt menü masrafından kurtulun.",
    ctaPrimary: "Hemen ücretsiz başlayın",
    ctaDemo: "Demo menüyü gör",
    checks: ["Kredi kartı gerekmez", "Sınırsız ürün", "Uygulama indirmeden"],
    qrTitle: "Masa 7",
    qrText: "Okut, menüyü gör",
    toastTitle: "Fiyat güncellendi",
    toastText: "Tüm masalarda anında yayında",
    stripLabel: "Örnek menü görselleri",
    featuresEyebrow: "Özellikler",
    featuresTitle: "Restoranınız için ihtiyacınız olan her şey",
    features: [
      ["Dakikalar içinde hazır", "Kategorileri ve ürünleri ekleyin, menünüz anında yayında. Teknik bilgi gerekmez."],
      ["8 dilde menü", "Turistler menüyü kendi dilinde okusun. Tarayıcı dili otomatik algılanır."],
      ["Masaya özel QR", "Her masa için ayrı QR kod üretin, şık kartlar halinde yazdırın."],
      ["Anında güncelleme", "Fiyat değiştiğinde menüyü yeniden bastırmayın. Değişiklik saniyesinde yayında."],
      ["İştah açan görseller", "Ürün fotoğrafları ve logonuzla menünüz markanızı yansıtsın."],
      ["Size özel tema", "Bordo, Lacivert, Zeytin, Ege… Restoranınıza yakışan renk paletini seçin."],
    ],
    stepsEyebrow: "Nasıl çalışır?",
    stepsTitle: "Üç adımda dijital menü",
    steps: [
      ["Hesap oluşturun", "Restoran adınızı yazın, menü linkiniz hazır."],
      ["Menünüzü ekleyin", "Kategoriler, ürünler, fiyatlar ve fotoğraflar."],
      ["QR'ı masalara koyun", "Müşterileriniz okutsun, menü telefonlarında."],
    ],
    ctaTitle: "Menünüzü bugün dijitale taşıyın",
    ctaText: "Kurulum 5 dakika sürer. İlk QR kodunuzu hemen yazdırın.",
    ctaButton: "Ücretsiz hesap oluştur",
    footer: "Restoranlar için dijital menü",
    credits: "Görsel kaynakları",
    mock: {
      table: "Masa 7",
      name: "Lokma Mutfak",
      desc: "Odun ateşinde Anadolu lezzetleri",
      search: "Menüde ara",
      chips: ["Izgaralar", "Tatlılar", "İçecekler"],
      items: [
        ["Adana Kebap", "Acılı kuzu eti, közlenmiş domates ve lavaş", "₺620", "/landing/adana.jpg"],
        ["İskender", "Pide üzerinde döner, tereyağı ve yoğurt", "₺680", "/landing/iskender.jpg"],
        ["Künefe", "Antep fıstıklı, sıcak servis", "₺290", "/landing/kunefe.jpg"],
      ],
    },
    strip: ["Adana Kebap", "Menemen", "Lahmacun", "Künefe", "İskender", "Pide", "Baklava", "Serpme Kahvaltı"],
  },
} as const;

const FEATURE_ICONS = [Timer, Globe, QrCode, Zap, ImageIcon, Palette];
const STRIP_IMAGES = ["adana", "menemen", "lahmacun", "kunefe", "iskender", "pide", "baklava", "serpme"];

function readLang(): SiteLang {
  try {
    return localStorage.getItem(LANG_KEY) === "tr" ? "tr" : "en";
  } catch {
    return "en";
  }
}

function PhoneMockup({ m, lang }: { m: (typeof COPY)[SiteLang]["mock"]; lang: SiteLang }) {
  return (
    <div className="phone">
      <div className="phone-notch" />
      <div className="phone-screen">
        <div
          className="pm-hero"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgb(0 0 0 / 0.45), rgb(0 0 0 / 0.1) 50%, rgb(0 0 0 / 0.3)), url(/landing/cover.jpg)",
          }}
        >
          <span className="pm-table">{m.table}</span>
          <span className="pm-lang">{lang.toUpperCase()}</span>
        </div>
        <div className="pm-head">
          <div className="pm-logo">
            <LogoMark size={44} />
          </div>
          <strong className="display">{m.name}</strong>
          <small>{m.desc}</small>
        </div>
        <div className="pm-search">
          <Search size={13} /> {m.search}
        </div>
        <div className="pm-chips">
          {m.chips.map((c, i) => (
            <span key={c} className={i === 0 ? "on" : undefined}>
              {c}
            </span>
          ))}
        </div>
        <div className="pm-list">
          {m.items.map(([name, desc, price, img]) => (
            <div key={name} className="pm-item">
              <div>
                <b>{name}</b>
                <small>{desc}</small>
                <em>{price}</em>
              </div>
              <img className="pm-img" src={img} alt="" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Home() {
  const { me } = useAuth();
  const [lang, setLang] = useState<SiteLang>(readLang);
  const t = COPY[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = lang === "tr" ? "EasyDine · Dijital Menü" : "EasyDine · Digital Menu";
  }, [lang]);

  function switchLang() {
    const next: SiteLang = lang === "en" ? "tr" : "en";
    setLang(next);
    try {
      localStorage.setItem(LANG_KEY, next);
    } catch {
      /* yok say */
    }
  }

  const strip = STRIP_IMAGES.map((img, i) => ({ src: `/landing/${img}.jpg`, name: t.strip[i] }));

  return (
    <div className="landing">
      <div className="royal-top">
        <nav className="landing-nav">
          <Logo variant="light" taglineText={t.tagline} />
          <div className="landing-nav-actions">
            <button
              type="button"
              className="btn btn-ghost site-lang"
              onClick={switchLang}
              aria-label={lang === "en" ? "Türkçe'ye geç" : "Switch to English"}
              title={lang === "en" ? "Türkçe" : "English"}
            >
              <Globe size={16} /> {lang === "en" ? "TR" : "EN"}
            </button>
            {me ? (
              <Link className="btn btn-gold" to="/admin">
                {t.toPanel} <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link className="btn btn-ghost nav-login" to="/login">
                  {t.login}
                </Link>
                <Link className="btn btn-gold" to="/register">
                  {t.start}
                </Link>
              </>
            )}
          </div>
        </nav>

        <header className="hero">
          <div className="hero-text">
            <span className="eyebrow">
              <Sparkles size={14} /> {t.eyebrow}
            </span>
            <h1 className="display">
              {t.titleA} <span className="hero-accent">{t.titleAccent}</span> {t.titleB}
            </h1>
            <Ornament className="hero-ornament" width={150} />
            <p className="hero-sub">{t.sub}</p>
            <div className="hero-cta">
              <Link className="btn btn-gold btn-lg" to={me ? "/admin" : "/register"}>
                {me ? t.toPanel : t.ctaPrimary} <ArrowRight size={18} />
              </Link>
              <Link className="btn btn-outline-light btn-lg" to={`/menu/demo-restoran?lang=${lang}`}>
                {t.ctaDemo}
              </Link>
            </div>
            <ul className="hero-checks">
              {t.checks.map((c) => (
                <li key={c}>
                  <Check size={16} /> {c}
                </li>
              ))}
            </ul>
          </div>

          <div className="hero-visual">
            <img className="plate plate-1" src="/landing/lahmacun.jpg" alt="" />
            <img className="plate plate-2" src="/landing/menemen.jpg" alt="" />
            <img className="plate plate-3" src="/landing/baklava.jpg" alt="" />
            <PhoneMockup m={t.mock} lang={lang} />
            <div className="float-card float-qr">
              <QrCode size={28} />
              <div>
                <strong>{t.qrTitle}</strong>
                <small>{t.qrText}</small>
              </div>
            </div>
            <div className="float-card float-toast">
              <span className="float-dot">
                <BellRing size={14} />
              </span>
              <div>
                <strong>{t.toastTitle}</strong>
                <small>{t.toastText}</small>
              </div>
            </div>
          </div>
        </header>
      </div>

      <section className="food-strip" aria-label={t.stripLabel}>
        <div className="food-track">
          {[...strip, ...strip].map((f, i) => (
            <figure key={i} aria-hidden={i >= strip.length}>
              <img src={f.src} alt={i < strip.length ? f.name : ""} loading="lazy" />
              <figcaption>{f.name}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="features">
        <div className="section-head">
          <span className="eyebrow">{t.featuresEyebrow}</span>
          <h2 className="display">{t.featuresTitle}</h2>
        </div>
        <div className="feature-grid">
          {t.features.map(([title, text], i) => {
            const Icon = FEATURE_ICONS[i];
            return (
              <article key={title} className="feature">
                <span className="feature-icon">
                  <Icon size={22} />
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="steps">
        <div className="section-head">
          <span className="eyebrow">{t.stepsEyebrow}</span>
          <h2 className="display">{t.stepsTitle}</h2>
        </div>
        <ol className="step-list">
          {t.steps.map(([title, text], i) => (
            <li key={title}>
              <span className="step-n display">{i + 1}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="cta-band">
        <div>
          <h2 className="display">{t.ctaTitle}</h2>
          <p>{t.ctaText}</p>
        </div>
        <Link className="btn btn-lg cta-btn" to={me ? "/admin" : "/register"}>
          {me ? t.toPanel : t.ctaButton} <ArrowRight size={18} />
        </Link>
      </section>

      <footer className="landing-footer">
        <Logo size={28} tagline={false} />
        <span>
          © {new Date().getFullYear()} EasyDine · {t.footer} · <Link to="/kaynaklar">{t.credits}</Link>
        </span>
      </footer>
    </div>
  );
}
