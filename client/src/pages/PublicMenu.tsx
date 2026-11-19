import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useParams, useSearchParams } from "react-router-dom";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe,
  Moon,
  Phone,
  Search,
  Sun,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { api, ApiError } from "../lib/api";
import { formatPrice, LANGUAGES, pick, uiText } from "../lib/i18n";
import { getTheme, themeVars } from "../lib/themes";
import type { Product, PublicMenu as Menu } from "../lib/types";
import { LogoMark } from "../components/Logo";

type Mode = "light" | "dark";
const MODE_KEY = "rm_menu_mode";

function storage(key: string, value?: string) {
  try {
    if (value === undefined) return localStorage.getItem(key);
    localStorage.setItem(key, value);
  } catch {
    /* gizli sekme vb. */
  }
  return null;
}

function initialLanguage(menu: Menu, slug: string, queryLang: string | null) {
  const { languages, defaultLanguage } = menu.restaurant;
  const saved = storage(`rm_lang_${slug}`);
  const browser = navigator.language?.slice(0, 2);
  return [queryLang, saved, browser].find((l) => l && languages.includes(l)) ?? defaultLanguage;
}

function useSystemDark() {
  const query = "(prefers-color-scheme: dark)";
  const [dark, setDark] = useState(() => window.matchMedia?.(query).matches ?? false);
  useEffect(() => {
    const mq = window.matchMedia?.(query);
    if (!mq) return;
    const onChange = (e: MediaQueryListEvent) => setDark(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return dark;
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

/** Fotoğraflı, yana kaydırılabilen kategori şeridi. */
function CategoryCarousel({
  items,
  onSelect,
}: {
  items: { id: string; name: string; image: string | null }[];
  onSelect(id: string): void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const update = () => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const pos = Math.abs(el.scrollLeft);
    setEdges({ start: pos < 4, end: pos > max - 4 });
  };
  useEffect(update, [items]);

  const scroll = (dir: number) => {
    const el = ref.current;
    if (!el) return;
    const rtl = getComputedStyle(el).direction === "rtl" ? -1 : 1;
    el.scrollBy({ left: dir * rtl * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <section className="m-cats">
      <div className="m-cats-track" ref={ref} onScroll={update}>
        {items.map((c) => (
          <button key={c.id} className="m-cat" onClick={() => onSelect(c.id)}>
            <span className="m-cat-img">
              {c.image ? <img src={c.image} alt="" loading="lazy" /> : <UtensilsCrossed size={28} strokeWidth={1.5} />}
            </span>
            <span className="m-cat-name">{c.name}</span>
          </button>
        ))}
      </div>
      {items.length > 2 && (
        <>
          <button className="m-arrow m-arrow-prev" onClick={() => scroll(-1)} disabled={edges.start} aria-label="Önceki">
            <ChevronLeft size={20} />
          </button>
          <button className="m-arrow m-arrow-next" onClick={() => scroll(1)} disabled={edges.end} aria-label="Sonraki">
            <ChevronRight size={20} />
          </button>
        </>
      )}
    </section>
  );
}

function MenuSkeleton() {
  return (
    <div className="menu-page mode-light" style={themeVars("bordo")}>
      <div className="m-header">
        <div className="skeleton" style={{ width: 160, height: 28 }} />
      </div>
      <div className="m-cats-track" style={{ padding: "0 16px" }}>
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton" style={{ flex: "0 0 44%", aspectRatio: "4 / 3", borderRadius: 14 }} />
        ))}
      </div>
      <div className="m-content">
        <div className="m-grid" style={{ padding: 16 }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ aspectRatio: "1", borderRadius: 14 }} />
          ))}
        </div>
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [detail, setDetail] = useState<Product | null>(null);
  const [langOpen, setLangOpen] = useState(false);
  const [stuck, setStuck] = useState(false);
  const [mode, setMode] = useState<Mode | null>(() => {
    const saved = storage(MODE_KEY);
    return saved === "light" || saved === "dark" ? saved : null;
  });
  const systemDark = useSystemDark();
  const isDark = mode ? mode === "dark" : systemDark;
  const chipsRef = useRef<HTMLDivElement>(null);
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

  // "Ana ekrana ekle": restoranın adı, rengi ve menü linkiyle açılsın
  useEffect(() => {
    if (!menu) return;
    const { restaurant } = menu;
    const set = (selector: string, attr: string, value: string) => {
      const el = document.querySelector<HTMLElement>(selector);
      if (!el) return () => undefined;
      const prev = el.getAttribute(attr) ?? "";
      el.setAttribute(attr, value);
      return () => el.setAttribute(attr, prev);
    };
    const restore = [
      set('link[rel="manifest"]', "href", `/api/public/restaurants/${encodeURIComponent(slug)}/manifest.webmanifest`),
      set('meta[name="theme-color"]', "content", isDark ? "#0c1118" : getTheme(restaurant.theme).primary),
      set('meta[name="apple-mobile-web-app-title"]', "content", restaurant.name),
      ...(restaurant.logoUrl ? [set('link[rel="apple-touch-icon"]', "href", restaurant.logoUrl)] : []),
    ];
    return () => restore.forEach((fn) => fn());
  }, [menu, slug, isDark]);

  function changeLang(next: string) {
    setLang(next);
    setLangOpen(false);
    storage(`rm_lang_${slug}`, next);
  }

  function toggleMode() {
    const next: Mode = isDark ? "light" : "dark";
    setMode(next);
    storage(MODE_KEY, next);
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

  // Kategori şeridi ekrandan çıkınca üstte küçük kategori çubuğu belirsin
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      setStuck(!e.isIntersecting && e.boundingClientRect.top < 0);
      if (e.isIntersecting) setActiveCat(null);
    });
    io.observe(el);
    return () => io.disconnect();
  }, [status, query]);

  // Kaydırdıkça aktif kategoriyi işaretle
  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>("[data-category]");
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) setActiveCat(visible.target.getAttribute("data-category"));
      },
      { rootMargin: "-90px 0px -65% 0px" },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [categories]);

  useEffect(() => {
    const nav = chipsRef.current;
    if (!nav) return;
    const chip = activeCat ? nav.querySelector<HTMLElement>(`[data-chip="${activeCat}"]`) : null;
    nav.scrollTo({ left: chip ? chip.offsetLeft - nav.clientWidth / 2 + chip.clientWidth / 2 : 0, behavior: "smooth" });
  }, [activeCat]);

  const goTo = (id: string) => document.getElementById(`cat-${id}`)?.scrollIntoView({ behavior: "smooth" });

  if (status === "loading") return <MenuSkeleton />;
  if (status !== "ok" || !menu) {
    return (
      <div className={`menu-page menu-missing ${isDark ? "mode-dark" : "mode-light"}`} style={themeVars("bordo")}>
        <div className="menu-missing-icon">
          <UtensilsCrossed size={30} />
        </div>
        <h1>{status === "notfound" ? t.notFound : "Bir hata oluştu"}</h1>
        <p>{status === "notfound" ? "Linki kontrol edip tekrar deneyin." : "Lütfen sayfayı yenileyin."}</p>
      </div>
    );
  }

  const { restaurant } = menu;
  const totalProducts = menu.categories.reduce((n, c) => n + c.products.length, 0);
  const detailT = detail ? pick(detail.translations, lang, fallback) : null;
  const inlineLangs = restaurant.languages.length > 1 && restaurant.languages.length <= 3;
  const carouselItems = menu.categories.map((c) => ({
    id: c.id,
    name: pick(c.translations, lang, fallback).name,
    image: c.imageUrl ?? c.products.find((p) => p.imageUrl)?.imageUrl ?? null,
  }));
  const hasTopbar = Boolean(restaurant.openingHours || restaurant.phone || table);

  return (
    <div
      className={`menu-page ${isDark ? "mode-dark" : "mode-light"}`}
      dir={rtl ? "rtl" : "ltr"}
      style={themeVars(restaurant.theme)}
    >
      {hasTopbar && (
        <div className="m-topbar">
          <div className="m-wrap m-topbar-inner">
            {restaurant.openingHours ? (
              <span>
                <Clock size={14} /> {restaurant.openingHours}
              </span>
            ) : (
              <span />
            )}
            {table && (
              <span className="m-table">
                {t.table} {table}
              </span>
            )}
            {restaurant.phone && (
              <a href={`tel:${restaurant.phone.replace(/[^\d+]/g, "")}`}>
                <Phone size={14} /> {restaurant.phone}
              </a>
            )}
          </div>
        </div>
      )}

      <header className="m-header m-wrap">
        <div className="m-brand">
          {restaurant.logoUrl && <img className="m-logo" src={restaurant.logoUrl} alt="" />}
          <div className="m-brand-text">
            <strong>{restaurant.name}</strong>
            {restaurant.description && <small>{restaurant.description}</small>}
          </div>
        </div>
        <div className="m-tools">
          {inlineLangs &&
            restaurant.languages.map((l) => (
              <button
                key={l}
                className={`m-lang${l === lang ? " active" : ""}`}
                onClick={() => changeLang(l)}
                aria-pressed={l === lang}
                aria-label={LANGUAGES[l]?.name ?? l}
              >
                {l.toUpperCase()}
              </button>
            ))}
          {restaurant.languages.length > 3 && (
            <button className="m-tool" onClick={() => setLangOpen(true)} aria-label={t.language}>
              <Globe size={19} />
            </button>
          )}
          {totalProducts > 4 && (
            <button
              className={`m-tool${searchOpen ? " active" : ""}`}
              onClick={() => {
                setSearchOpen((o) => !o);
                if (searchOpen) setQuery("");
              }}
              aria-label={t.search}
              aria-expanded={searchOpen}
            >
              <Search size={19} />
            </button>
          )}
          <button className="m-tool" onClick={toggleMode} aria-label={isDark ? t.light : t.dark} title={isDark ? t.light : t.dark}>
            {isDark ? <Sun size={19} /> : <Moon size={19} />}
          </button>
        </div>
      </header>

      {searchOpen && (
        <div className="m-wrap m-search-wrap">
          <label className="m-search">
            <Search size={17} />
            <input
              type="search"
              placeholder={t.search}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label={t.search}
              autoFocus
            />
            {query && (
              <button onClick={() => setQuery("")} aria-label="Temizle">
                <X size={15} />
              </button>
            )}
          </label>
        </div>
      )}

      {!query && carouselItems.length > 1 && (
        <div className="m-wrap">
          <CategoryCarousel items={carouselItems} onSelect={goTo} />
        </div>
      )}
      <div ref={sentinelRef} className="m-sentinel" />

      {categories.length > 1 && (
        <nav className={`m-chips${stuck ? " show" : ""}`} aria-label={t.categories} aria-hidden={!stuck}>
          <div className="m-wrap m-chips-track" ref={chipsRef}>
            {categories.map((c) => (
              <button
                key={c.id}
                data-chip={c.id}
                tabIndex={stuck ? 0 : -1}
                className={c.id === (activeCat ?? categories[0]?.id) ? "active" : ""}
                onClick={() => goTo(c.id)}
              >
                {pick(c.translations, lang, fallback).name}
              </button>
            ))}
          </div>
        </nav>
      )}

      <main className="m-content m-wrap">
        {categories.length === 0 && (
          <div className="m-empty">
            <Search size={26} />
            <p>{t.noResults}</p>
          </div>
        )}
        {categories.map((c) => {
          const ct = pick(c.translations, lang, fallback);
          return (
            <section key={c.id} id={`cat-${c.id}`} data-category={c.id} className="m-section">
              <header className="m-section-head">
                <h2>{ct.name}</h2>
                {ct.description && <p>{ct.description}</p>}
              </header>
              <ul className="m-grid">
                {c.products.map((p) => {
                  const pt = pick(p.translations, lang, fallback);
                  return (
                    <li key={p.id}>
                      <button className={`m-item${p.isAvailable ? "" : " sold-out"}`} onClick={() => setDetail(p)}>
                        <span className="m-item-img">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt="" loading="lazy" />
                          ) : (
                            <UtensilsCrossed size={30} strokeWidth={1.4} />
                          )}
                          {!p.isAvailable && <span className="m-sold">{t.soldOut}</span>}
                        </span>
                        <span className="m-item-name">{pt.name}</span>
                        <span className="m-item-price">{formatPrice(p.price, restaurant.currency, lang)}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </main>

      <footer className="m-footer m-wrap">
        {(restaurant.openingHours || restaurant.phone) && (
          <div className="m-footer-info">
            {restaurant.openingHours && (
              <span>
                <Clock size={14} /> {restaurant.openingHours}
              </span>
            )}
            {restaurant.phone && (
              <a href={`tel:${restaurant.phone.replace(/[^\d+]/g, "")}`}>
                <Phone size={14} /> {restaurant.phone}
              </a>
            )}
          </div>
        )}
        <div className="m-footer-links">
          <a href="/" target="_blank" rel="noreferrer">
            <LogoMark size={18} /> EasyDine ile hazırlandı
          </a>
          {slug === "demo-restoran" && (
            <a href="/kaynaklar" target="_blank" rel="noreferrer">
              Görsel kaynakları
            </a>
          )}
        </div>
      </footer>

      {detail && detailT && (
        <Sheet onClose={() => setDetail(null)} label={detailT.name}>
          {detail.imageUrl && (
            <div className="sheet-image">
              <img src={detail.imageUrl} alt="" />
            </div>
          )}
          <div className="sheet-body">
            <h2>{detailT.name}</h2>
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
            <h2 className="sheet-title">{t.language}</h2>
            <ul className="lang-list">
              {restaurant.languages.map((l) => (
                <li key={l}>
                  <button className={l === lang ? "active" : ""} onClick={() => changeLang(l)}>
                    <span className="lang-code">{l.toUpperCase()}</span>
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
