import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useParams, useSearchParams } from "react-router-dom";
import { Check, ChevronDown, Globe, Search, UtensilsCrossed, X } from "lucide-react";
import { api, ApiError } from "../lib/api";
import { formatPrice, LANGUAGES, pick, uiText } from "../lib/i18n";
import { themeVars } from "../lib/themes";
import type { Product, PublicMenu as Menu } from "../lib/types";
import { LogoMark } from "../components/Logo";

function langKey(slug: string) {
  return `rm_lang_${slug}`;
}

function initialLanguage(menu: Menu, slug: string, queryLang: string | null) {
  const { languages, defaultLanguage } = menu.restaurant;
  let saved: string | null = null;
  try {
    saved = localStorage.getItem(langKey(slug));
  } catch {
    /* yok say */
  }
  const browser = navigator.language?.slice(0, 2);
  return [queryLang, saved, browser].find((l) => l && languages.includes(l)) ?? defaultLanguage;
}

/** Alttan açılan panel (ürün detayı, dil seçimi). */
function Sheet({ onClose, children, label }: { onClose(): void; children: ReactNode; label: string }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return createPortal(
    <div className="sheet-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={label}>
        <span className="sheet-grabber" />
        <button className="sheet-close" onClick={onClose} aria-label="Kapat">
          <X size={18} />
        </button>
        {children}
      </div>
    </div>,
    document.querySelector(".menu-page") ?? document.body,
  );
}

function MenuSkeleton() {
  return (
    <div className="menu-page" style={themeVars("nar")}>
      <div className="menu-hero skeleton-hero" />
      <div className="menu-shell">
        <div className="menu-identity">
          <div className="skeleton" style={{ width: 84, height: 84, borderRadius: 24, margin: "-62px auto 12px" }} />
          <div className="skeleton" style={{ width: "55%", height: 26, margin: "0 auto 10px" }} />
          <div className="skeleton" style={{ width: "75%", height: 14, margin: "0 auto" }} />
        </div>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton" style={{ height: 104, borderRadius: 18, marginTop: 12 }} />
        ))}
      </div>
    </div>
  );
}

export function PublicMenu() {
  const { slug = "" } = useParams();
  const [params] = useSearchParams();
  const table = params.get("table");

  const [menu, setMenu] = useState<Menu | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "notfound" | "error">("loading");
  const [lang, setLang] = useState("tr");
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [detail, setDetail] = useState<Product | null>(null);
  const [langOpen, setLangOpen] = useState(false);
  const [stuck, setStuck] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    api<Menu>(`/public/restaurants/${encodeURIComponent(slug)}/menu`)
      .then((data) => {
        if (cancelled) return;
        setMenu(data);
        setLang(initialLanguage(data, slug, params.get("lang")));
        setStatus("ok");
      })
      .catch((err) => !cancelled && setStatus(err instanceof ApiError && err.status === 404 ? "notfound" : "error"));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const t = uiText(lang);
  const fallback = menu?.restaurant.defaultLanguage ?? "tr";
  const rtl = Boolean(LANGUAGES[lang]?.rtl);

  useEffect(() => {
    if (menu) document.title = menu.restaurant.name;
    document.documentElement.lang = lang;
  }, [menu, lang]);

  function changeLang(next: string) {
    setLang(next);
    setLangOpen(false);
    try {
      localStorage.setItem(langKey(slug), next);
    } catch {
      /* yok say */
    }
  }

  const categories = useMemo(() => {
    if (!menu) return [];
    const q = query.trim().toLocaleLowerCase(lang);
    if (!q) return menu.categories;
    return menu.categories
      .map((c) => ({
        ...c,
        products: c.products.filter((p) => {
          const tr = pick(p.translations, lang, fallback);
          return `${tr.name} ${tr.description ?? ""}`.toLocaleLowerCase(lang).includes(q);
        }),
      }))
      .filter((c) => c.products.length > 0);
  }, [menu, query, lang, fallback]);

  // Kategori çubuğu yapıştığında gölge ver
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setStuck(!e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [status]);

  // Kaydırdıkça aktif kategoriyi işaretle
  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>("[data-category]");
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) setActiveCat(visible.target.getAttribute("data-category"));
      },
      { rootMargin: "-140px 0px -60% 0px" },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [categories]);

  useEffect(() => {
    if (!activeCat || !navRef.current) return;
    const chip = navRef.current.querySelector<HTMLElement>(`[data-chip="${activeCat}"]`);
    if (!chip) return;
    const nav = navRef.current;
    nav.scrollTo({ left: chip.offsetLeft - nav.clientWidth / 2 + chip.clientWidth / 2, behavior: "smooth" });
  }, [activeCat]);

  if (status === "loading") return <MenuSkeleton />;
  if (status !== "ok" || !menu) {
    return (
      <div className="menu-page menu-missing" style={themeVars("nar")}>
        <div className="menu-missing-icon">
          <UtensilsCrossed size={30} />
        </div>
        <h1 className="display">{status === "notfound" ? t.notFound : "Bir hata oluştu"}</h1>
        <p>{status === "notfound" ? "Linki kontrol edip tekrar deneyin." : "Lütfen sayfayı yenileyin."}</p>
      </div>
    );
  }

  const { restaurant } = menu;
  const totalProducts = menu.categories.reduce((n, c) => n + c.products.length, 0);
  const detailT = detail ? pick(detail.translations, lang, fallback) : null;

  return (
    <div className="menu-page" dir={rtl ? "rtl" : "ltr"} style={themeVars(restaurant.theme)}>
      <header
        className={`menu-hero${restaurant.coverUrl ? " has-cover" : ""}`}
        style={restaurant.coverUrl ? { backgroundImage: `url(${restaurant.coverUrl})` } : undefined}
      >
        <div className="menu-hero-bar">
          {table ? (
            <span className="glass-pill">
              {t.table} {table}
            </span>
          ) : (
            <span />
          )}
          {restaurant.languages.length > 1 && (
            <button className="glass-pill lang-btn" onClick={() => setLangOpen(true)} aria-label={t.language}>
              <Globe size={14} />
              {lang.toUpperCase()}
              <ChevronDown size={14} />
            </button>
          )}
        </div>
      </header>

      <div className="menu-shell">
        <section className="menu-identity">
          <div className="menu-logo">
            {restaurant.logoUrl ? (
              <img src={restaurant.logoUrl} alt="" />
            ) : (
              <span className="menu-logo-fallback display">{restaurant.name.charAt(0)}</span>
            )}
          </div>
          <h1 className="display">{restaurant.name}</h1>
          {restaurant.description && <p>{restaurant.description}</p>}
        </section>

        <div ref={sentinelRef} className="sticky-sentinel" />
        <div className={`menu-sticky${stuck ? " stuck" : ""}`}>
          {totalProducts > 6 && (
            <label className="menu-search">
              <Search size={17} />
              <input
                type="search"
                placeholder={t.search}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label={t.search}
              />
              {query && (
                <button onClick={() => setQuery("")} aria-label="Temizle">
                  <X size={15} />
                </button>
              )}
            </label>
          )}
          {categories.length > 1 && (
            <nav className="cat-nav" ref={navRef}>
              {categories.map((c) => (
                <a
                  key={c.id}
                  href={`#cat-${c.id}`}
                  data-chip={c.id}
                  className={c.id === (activeCat ?? categories[0]?.id) ? "active" : ""}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(`cat-${c.id}`)?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  {pick(c.translations, lang, fallback).name}
                </a>
              ))}
            </nav>
          )}
        </div>

        <main className="menu-content">
          {categories.length === 0 && (
            <div className="menu-noresults">
              <Search size={26} />
              <p>{t.noResults}</p>
            </div>
          )}
          {categories.map((c) => {
            const ct = pick(c.translations, lang, fallback);
            return (
              <section key={c.id} id={`cat-${c.id}`} data-category={c.id} className="menu-section">
                <div className="menu-section-head">
                  <h2 className="display">{ct.name}</h2>
                  <span>{c.products.length}</span>
                </div>
                {ct.description && <p className="menu-section-desc">{ct.description}</p>}
                <ul className="product-list">
                  {c.products.map((p) => {
                    const pt = pick(p.translations, lang, fallback);
                    return (
                      <li key={p.id}>
                        <button
                          className={`product-card${p.isAvailable ? "" : " sold-out"}${p.imageUrl ? " with-image" : ""}`}
                          onClick={() => setDetail(p)}
                        >
                          <div className="product-body">
                            <h3>{pt.name}</h3>
                            {pt.description && <p>{pt.description}</p>}
                            <div className="product-foot">
                              <span className="price">{formatPrice(p.price, restaurant.currency, lang)}</span>
                              {!p.isAvailable && <span className="sold-badge">{t.soldOut}</span>}
                            </div>
                          </div>
                          {p.imageUrl && (
                            <div className="product-img">
                              <img src={p.imageUrl} alt="" loading="lazy" />
                            </div>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </main>

        <footer className="menu-footer">
          <a href="/" target="_blank" rel="noreferrer">
            <LogoMark size={18} /> Lokma ile hazırlandı
          </a>
        </footer>
      </div>

      {detail && detailT && (
        <Sheet onClose={() => setDetail(null)} label={detailT.name}>
          {detail.imageUrl && (
            <div className="sheet-image">
              <img src={detail.imageUrl} alt="" />
            </div>
          )}
          <div className="sheet-body">
            <h2 className="display">{detailT.name}</h2>
            {detailT.description && <p>{detailT.description}</p>}
            <div className="sheet-price">
              <span className="price">{formatPrice(detail.price, restaurant.currency, lang)}</span>
              {!detail.isAvailable && <span className="sold-badge">{t.soldOut}</span>}
            </div>
          </div>
        </Sheet>
      )}

      {langOpen && (
        <Sheet onClose={() => setLangOpen(false)} label={t.language}>
          <div className="sheet-body">
            <h2 className="display sheet-title">{t.language}</h2>
            <ul className="lang-list">
              {restaurant.languages.map((l) => (
                <li key={l}>
                  <button className={l === lang ? "active" : ""} onClick={() => changeLang(l)}>
                    <span className="lang-code">{l}</span>
                    <span>{LANGUAGES[l]?.name ?? l}</span>
                    {l === lang && <Check size={18} />}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </Sheet>
      )}
    </div>
  );
}
