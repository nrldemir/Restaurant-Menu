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

const FOOD_STRIP = [
  { src: "/landing/adana.jpg", name: "Adana Kebap" },
  { src: "/landing/menemen.jpg", name: "Menemen" },
  { src: "/landing/lahmacun.jpg", name: "Lahmacun" },
  { src: "/landing/kunefe.jpg", name: "Künefe" },
  { src: "/landing/iskender.jpg", name: "İskender" },
  { src: "/landing/pide.jpg", name: "Pide" },
  { src: "/landing/baklava.jpg", name: "Baklava" },
  { src: "/landing/serpme.jpg", name: "Serpme Kahvaltı" },
];

function PhoneMockup() {
  const items = [
    { name: "Adana Kebap", desc: "Acılı kuzu eti, közlenmiş domates ve lavaş", price: "₺620", img: "/landing/adana.jpg" },
    { name: "İskender", desc: "Pide üzerinde döner, tereyağı ve yoğurt", price: "₺680", img: "/landing/iskender.jpg" },
    { name: "Künefe", desc: "Antep fıstıklı, sıcak servis", price: "₺290", img: "/landing/kunefe.jpg" },
  ];
  return (
    <div className="phone">
      <div className="phone-notch" />
      <div className="phone-screen">
        <div className="pm-hero" style={{ backgroundImage: "linear-gradient(180deg, rgb(0 0 0 / 0.45), rgb(0 0 0 / 0.1) 50%, rgb(0 0 0 / 0.3)), url(/landing/cover.jpg)" }}>
          <span className="pm-table">Masa 7</span>
          <span className="pm-lang">TR</span>
        </div>
        <div className="pm-head">
          <div className="pm-logo">
            <LogoMark size={44} />
          </div>
          <strong className="display">Lokma Mutfak</strong>
          <small>Odun ateşinde Anadolu lezzetleri</small>
        </div>
        <div className="pm-search">
          <Search size={13} /> Menüde ara
        </div>
        <div className="pm-chips">
          <span className="on">Izgaralar</span>
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
              <img className="pm-img" src={i.img} alt="" />
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

      <div className="royal-top">
      <nav className="landing-nav">
        <Logo variant="light" />
        <div className="landing-nav-actions">
          {me ? (
            <Link className="btn btn-gold" to="/admin">
              Panele git <ArrowRight size={16} />
            </Link>
          ) : (
            <>
              <Link className="btn btn-ghost" to="/login">
                Giriş yap
              </Link>
              <Link className="btn btn-gold" to="/register">
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
          <Ornament className="hero-ornament" width={150} />
          <p className="hero-sub">
            EasyDine ile restoranınızın menüsünü dakikalar içinde dijitale taşıyın. Fiyatları anında güncelleyin, turistlere
            kendi dillerinde hizmet verin, kâğıt menü masrafından kurtulun.
          </p>
          <div className="hero-cta">
            <Link className="btn btn-gold btn-lg" to={me ? "/admin" : "/register"}>
              {me ? "Panele git" : "Hemen ücretsiz başlayın"} <ArrowRight size={18} />
            </Link>
            <Link className="btn btn-outline-light btn-lg" to="/menu/demo-restoran">
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
          <img className="plate plate-1" src="/landing/lahmacun.jpg" alt="" />
          <img className="plate plate-2" src="/landing/menemen.jpg" alt="" />
          <img className="plate plate-3" src="/landing/baklava.jpg" alt="" />
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
      </div>

      <section className="food-strip" aria-label="Örnek menü görselleri">
        <div className="food-track">
          {[...FOOD_STRIP, ...FOOD_STRIP].map((f, i) => (
            <figure key={i} aria-hidden={i >= FOOD_STRIP.length}>
              <img src={f.src} alt={i < FOOD_STRIP.length ? f.name : ""} loading="lazy" />
              <figcaption>{f.name}</figcaption>
            </figure>
          ))}
        </div>
      </section>

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
        <span>
          © {new Date().getFullYear()} EasyDine · Restoranlar için dijital menü ·{" "}
          <Link to="/kaynaklar">Görsel kaynakları</Link>
        </span>
      </footer>
    </div>
  );
}
