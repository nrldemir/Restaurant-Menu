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
import { Logo, LogoMark } from "../components/Logo";

const FEATURES = [
  { icon: Timer, title: "Dakikalar içinde hazır", text: "Kategorileri ve ürünleri ekleyin, menünüz anında yayında. Teknik bilgi gerekmez." },
  { icon: Globe, title: "8 dilde menü", text: "Turistler menüyü kendi dilinde okusun. Tarayıcı dili otomatik algılanır." },
  { icon: QrCode, title: "Masaya özel QR", text: "Her masa için ayrı QR kod üretin, şık kartlar halinde yazdırın." },
  { icon: Zap, title: "Anında güncelleme", text: "Fiyat değiştiğinde menüyü yeniden bastırmayın. Değişiklik saniyesinde yayında." },
  { icon: ImageIcon, title: "İştah açan görseller", text: "Ürün fotoğrafları, logo ve kapak görseliyle menünüz markanızı yansıtsın." },
  { icon: Palette, title: "Size özel tema", text: "Nar, Safran, Zeytin, Ege… Restoranınıza yakışan renk paletini seçin." },
];

const STEPS = [
  { n: "1", title: "Hesap oluşturun", text: "Restoran adınızı yazın, menü linkiniz hazır." },
  { n: "2", title: "Menünüzü ekleyin", text: "Kategoriler, ürünler, fiyatlar ve fotoğraflar." },
  { n: "3", title: "QR'ı masalara koyun", text: "Müşterileriniz okutsun, menü telefonlarında." },
];

function PhoneMockup() {
  const items = [
    { name: "Adana Kebap", desc: "Közlenmiş domates, biber ve lavaş", price: "₺480", hue: "#e2643a" },
    { name: "Izgara Köfte", desc: "Pilav ve mevsim salata ile", price: "₺420", hue: "#c98a3a" },
    { name: "Künefe", desc: "Antep fıstıklı, sıcak servis", price: "₺240", hue: "#e0a43a" },
  ];
  return (
    <div className="phone">
      <div className="phone-notch" />
      <div className="phone-screen">
        <div className="pm-hero">
          <span className="pm-table">Masa 7</span>
          <span className="pm-lang">TR</span>
        </div>
        <div className="pm-head">
          <div className="pm-logo">
            <LogoMark size={44} />
          </div>
          <strong className="display">Demo Restoran</strong>
          <small>Geleneksel lezzetler, modern sunum</small>
        </div>
        <div className="pm-search">
          <Search size={13} /> Menüde ara
        </div>
        <div className="pm-chips">
          <span className="on">Ana Yemekler</span>
          <span>Tatlılar</span>
          <span>İçecekler</span>
        </div>
        <div className="pm-list">
          {items.map((i) => (
            <div key={i.name} className="pm-item">
              <div>
                <b>{i.name}</b>
                <small>{i.desc}</small>
                <em>{i.price}</em>
              </div>
              <span className="pm-img" style={{ background: `radial-gradient(circle at 35% 35%, #fff6 0, transparent 40%), ${i.hue}` }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Home() {
  const { me } = useAuth();
  return (
    <div className="landing">
      <div className="landing-glow" aria-hidden="true" />

      <nav className="landing-nav">
        <Logo />
        <div className="landing-nav-actions">
          {me ? (
            <Link className="btn btn-primary" to="/admin">
              Panele git <ArrowRight size={16} />
            </Link>
          ) : (
            <>
              <Link className="btn btn-ghost" to="/login">
                Giriş yap
              </Link>
              <Link className="btn btn-primary" to="/register">
                Ücretsiz başla
              </Link>
            </>
          )}
        </div>
      </nav>

      <header className="hero">
        <div className="hero-text">
          <span className="eyebrow">
            <Sparkles size={14} /> QR menü · Çok dilli · Ücretsiz
          </span>
          <h1 className="display">
            Menünüz, masada <span className="hero-accent">bir okutma</span> uzağında.
          </h1>
          <p className="hero-sub">
            Lokma ile restoranınızın menüsünü dakikalar içinde dijitale taşıyın. Fiyatları anında güncelleyin, turistlere
            kendi dillerinde hizmet verin, kâğıt menü masrafından kurtulun.
          </p>
          <div className="hero-cta">
            <Link className="btn btn-primary btn-lg" to={me ? "/admin" : "/register"}>
              {me ? "Panele git" : "Hemen ücretsiz başlayın"} <ArrowRight size={18} />
            </Link>
            <Link className="btn btn-lg" to="/menu/demo-restoran">
              Demo menüyü gör
            </Link>
          </div>
          <ul className="hero-checks">
            <li>
              <Check size={16} /> Kredi kartı gerekmez
            </li>
            <li>
              <Check size={16} /> Sınırsız ürün
            </li>
            <li>
              <Check size={16} /> Uygulama indirmeden
            </li>
          </ul>
        </div>

        <div className="hero-visual">
          <PhoneMockup />
          <div className="float-card float-qr">
            <QrCode size={28} />
            <div>
              <strong>Masa 7</strong>
              <small>Okut, menüyü gör</small>
            </div>
          </div>
          <div className="float-card float-toast">
            <span className="float-dot">
              <BellRing size={14} />
            </span>
            <div>
              <strong>Fiyat güncellendi</strong>
              <small>Tüm masalarda anında yayında</small>
            </div>
          </div>
        </div>
      </header>

      <section className="features">
        <div className="section-head">
          <span className="eyebrow">Özellikler</span>
          <h2 className="display">Restoranınız için ihtiyacınız olan her şey</h2>
        </div>
        <div className="feature-grid">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <article key={title} className="feature">
              <span className="feature-icon">
                <Icon size={22} />
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="steps">
        <div className="section-head">
          <span className="eyebrow">Nasıl çalışır?</span>
          <h2 className="display">Üç adımda dijital menü</h2>
        </div>
        <ol className="step-list">
          {STEPS.map((s) => (
            <li key={s.n}>
              <span className="step-n display">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="cta-band">
        <div>
          <h2 className="display">Menünüzü bugün dijitale taşıyın</h2>
          <p>Kurulum 5 dakika sürer. İlk QR kodunuzu hemen yazdırın.</p>
        </div>
        <Link className="btn btn-lg cta-btn" to={me ? "/admin" : "/register"}>
          {me ? "Panele git" : "Ücretsiz hesap oluştur"} <ArrowRight size={18} />
        </Link>
      </section>

      <footer className="landing-footer">
        <Logo size={28} tagline={false} />
        <span>© {new Date().getFullYear()} Lokma · Restoranlar için dijital menü</span>
      </footer>
    </div>
  );
}
