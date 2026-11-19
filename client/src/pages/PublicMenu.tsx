import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { api, ApiError } from "../lib/api";
import { formatPrice, LANGUAGES, pick, uiText } from "../lib/i18n";
import type { PublicMenu as Menu } from "../lib/types";

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

export function PublicMenu() {
  const { slug = "" } = useParams();
  const [params] = useSearchParams();
  const table = params.get("table");

  const [menu, setMenu] = useState<Menu | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "notfound" | "error">("loading");
  const [lang, setLang] = useState("tr");
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

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

  // Kaydırdıkça üstteki kategori çubuğunda aktif kategoriyi işaretle
  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>("[data-category]");
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) setActiveCat(visible.target.getAttribute("data-category"));
      },
      { rootMargin: "-120px 0px -60% 0px" },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [categories]);

  useEffect(() => {
    if (!activeCat || !navRef.current) return;
    const chip = navRef.current.querySelector<HTMLElement>(`[data-chip="${activeCat}"]`);
    chip?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeCat]);

  if (status === "loading") return <div className="center muted">…</div>;
  if (status === "notfound") return <div className="center muted">{t.notFound}</div>;
  if (status === "error" || !menu) return <div className="center muted">Bir hata oluştu. Lütfen sayfayı yenileyin.</div>;

  const { restaurant } = menu;

  return (
    <div className="menu-page" dir={rtl ? "rtl" : "ltr"}>
      <header className="menu-hero">
        <div className="menu-hero-inner">
          {restaurant.logoUrl && <img className="menu-logo" src={restaurant.logoUrl} alt="" />}
          <div className="menu-hero-text">
            <h1>{restaurant.name}</h1>
            {restaurant.description && <p>{restaurant.description}</p>}
          </div>
          {table && (
            <span className="table-badge">
              {t.table} {table}
            </span>
          )}
        </div>
        {restaurant.languages.length > 1 && (
          <div className="lang-switch" role="group" aria-label={t.language}>
            {restaurant.languages.map((l) => (
              <button key={l} className={l === lang ? "active" : ""} onClick={() => changeLang(l)} aria-pressed={l === lang}>
                {LANGUAGES[l]?.flag} {l.toUpperCase()}
              </button>
            ))}
          </div>
        )}
      </header>

      <div className="menu-sticky">
        <input
          className="menu-search"
          type="search"
          placeholder={t.search}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <nav className="cat-nav" ref={navRef}>
          {categories.map((c) => (
            <a
              key={c.id}
              href={`#cat-${c.id}`}
              data-chip={c.id}
              className={c.id === activeCat ? "active" : ""}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(`cat-${c.id}`)?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              {pick(c.translations, lang, fallback).name}
            </a>
          ))}
        </nav>
      </div>

      <main className="menu-content">
        {categories.length === 0 && <p className="center muted">{t.noResults}</p>}
        {categories.map((c) => {
          const ct = pick(c.translations, lang, fallback);
          return (
            <section key={c.id} id={`cat-${c.id}`} data-category={c.id} className="menu-section">
              <h2>{ct.name}</h2>
              {ct.description && <p className="muted">{ct.description}</p>}
              <ul className="product-list">
                {c.products.map((p) => {
                  const pt = pick(p.translations, lang, fallback);
                  return (
                    <li key={p.id} className={`product-card${p.isAvailable ? "" : " sold-out"}`}>
                      {p.imageUrl && <img src={p.imageUrl} alt="" loading="lazy" />}
                      <div className="product-body">
                        <div className="product-head">
                          <h3>{pt.name}</h3>
                          <span className="price">{formatPrice(p.price, restaurant.currency, lang)}</span>
                        </div>
                        {pt.description && <p className="muted">{pt.description}</p>}
                        {!p.isAvailable && <span className="badge">{t.soldOut}</span>}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </main>
    </div>
  );
}
