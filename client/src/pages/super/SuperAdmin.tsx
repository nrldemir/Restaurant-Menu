import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CircleCheck,
  ExternalLink,
  Eye,
  EyeOff,
  Layers,
  LogIn,
  LogOut,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  Trash2,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { useConfirm } from "../../components/Confirm";
import { useToast } from "../../components/Toast";
import { Logo } from "../../components/Logo";
import { LangToggle } from "../../components/LangToggle";
import { EmptyState, PageHeader } from "../../components/ui";
import { api, errorMessage } from "../../lib/api";
import { getTheme } from "../../lib/themes";
import { useUi } from "../../lib/ui-lang";
import type { SuperRestaurant, SuperStats } from "../../lib/types";

function Stat({ icon: Icon, label, value, tone }: { icon: typeof Store; label: string; value: number; tone: string }) {
  return (
    <div className={`stat stat-${tone}`}>
      <span className="stat-icon">
        <Icon size={18} />
      </span>
      <div>
        <strong>{value}</strong>
        <small>{label}</small>
      </div>
    </div>
  );
}

export function SuperAdmin() {
  const { me, logout, impersonate } = useAuth();
  const { t, lang } = useUi();
  const ts = t.super;
  const toast = useToast();
  const confirm = useConfirm();
  const navigate = useNavigate();

  const [stats, setStats] = useState<SuperStats | null>(null);
  const [restaurants, setRestaurants] = useState<SuperRestaurant[] | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = ts.pageTitle;
  }, [lang, ts]);

  const load = useCallback(async () => {
    try {
      const [s, list] = await Promise.all([
        api<SuperStats>("/super/stats"),
        api<SuperRestaurant[]>("/super/restaurants"),
      ]);
      setStats(s);
      setRestaurants(list);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!restaurants) return [];
    const q = query.trim().toLocaleLowerCase();
    if (!q) return restaurants;
    return restaurants.filter((r) =>
      [r.name, r.slug, ...r.owners].some((v) => v.toLocaleLowerCase().includes(q)),
    );
  }, [restaurants, query]);

  const dateFmt = useMemo(
    () => new Intl.DateTimeFormat(lang, { day: "numeric", month: "short", year: "numeric" }),
    [lang],
  );

  async function toggleActive(r: SuperRestaurant) {
    const next = !r.isActive;
    if (!next) {
      const ok = await confirm({
        title: ts.suspendTitle,
        message: ts.suspendMsg(r.name),
        confirmText: ts.suspend,
        danger: true,
      });
      if (!ok) return;
    }
    try {
      await api(`/super/restaurants/${r.id}`, { method: "PATCH", body: { isActive: next } });
      setRestaurants((list) => list?.map((x) => (x.id === r.id ? { ...x, isActive: next } : x)) ?? null);
      setStats((s) => (s ? { ...s, active: s.active + (next ? 1 : -1) } : s));
      toast.success(next ? ts.toastActivated(r.name) : ts.toastSuspended(r.name));
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  async function remove(r: SuperRestaurant) {
    const ok = await confirm({
      title: ts.deleteTitle,
      message: ts.deleteMsg(r.name, r.owners.join(", ")),
      confirmText: t.common.yesDelete,
      danger: true,
    });
    if (!ok) return;
    try {
      await api(`/super/restaurants/${r.id}`, { method: "DELETE" });
      toast.success(ts.toastDeleted(r.name));
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  async function manage(r: SuperRestaurant) {
    try {
      await impersonate(r.id);
      navigate("/admin");
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  return (
    <div className="super">
      <header className="super-topbar">
        <div className="super-brand">
          <Logo size={34} taglineText={lang === "tr" ? "dijital menü" : "digital menu"} />
          <span className="super-badge">
            <ShieldCheck size={14} /> {ts.badge}
          </span>
        </div>
        <div className="super-user">
          <span className="super-email" title={me?.user.email}>
            {me?.user.email}
          </span>
          <LangToggle className="btn btn-ghost btn-sm" />
          <button className="icon-btn" onClick={logout} aria-label={t.nav.logout} title={t.nav.logout}>
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="super-main page">
        <PageHeader title={ts.title} subtitle={ts.subtitle} />

        <div className="stats super-stats">
          {stats ? (
            <>
              <Stat icon={Store} label={ts.statRestaurants} value={stats.restaurants} tone="nar" />
              <Stat icon={CircleCheck} label={ts.statActive} value={stats.active} tone="zeytin" />
              <Stat icon={Sparkles} label={ts.statNew} value={stats.newThisWeek} tone="safran" />
              <Stat icon={Users} label={ts.statOwners} value={stats.owners} tone="tas" />
              <Stat icon={Layers} label={ts.statCategories} value={stats.categories} tone="tas" />
              <Stat icon={UtensilsCrossed} label={ts.statItems} value={stats.products} tone="tas" />
            </>
          ) : (
            [0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="skeleton" style={{ height: 76, borderRadius: 18 }} />)
          )}
        </div>

        <section className="card super-list">
          <div className="super-toolbar">
            <div className="input-icon super-search">
              <Search size={17} />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={ts.search}
                aria-label={ts.search}
              />
            </div>
          </div>

          {!restaurants ? (
            <div className="super-rows">
              {[0, 1, 2].map((i) => (
                <div key={i} className="skeleton" style={{ height: 72, borderRadius: 14 }} />
              ))}
            </div>
          ) : restaurants.length === 0 ? (
            <EmptyState icon={Store} title={ts.empty} text={ts.emptyText} />
          ) : filtered.length === 0 ? (
            <EmptyState icon={Search} title={ts.emptySearch} />
          ) : (
            <div className="super-rows" role="table" aria-label={ts.title}>
              <div className="super-row super-head" role="row">
                <span role="columnheader">{ts.colRestaurant}</span>
                <span role="columnheader">{ts.colOwner}</span>
                <span role="columnheader">{ts.colMenu}</span>
                <span role="columnheader">{ts.colLanguages}</span>
                <span role="columnheader">{ts.colCreated}</span>
                <span role="columnheader">{ts.colStatus}</span>
                <span role="columnheader" />
              </div>
              {filtered.map((r) => (
                <div key={r.id} className={`super-row${r.isActive ? "" : " is-off"}`} role="row">
                  <div className="super-cell-name" role="cell">
                    <span className="super-avatar" style={{ background: getTheme(r.theme).hero }}>
                      {r.logoUrl ? <img src={r.logoUrl} alt="" /> : r.name.charAt(0)}
                    </span>
                    <span>
                      <strong>{r.name}</strong>
                      <small>/menu/{r.slug}</small>
                    </span>
                  </div>
                  <div className="super-cell" role="cell" data-label={ts.colOwner}>
                    {r.owners.length ? r.owners.join(", ") : <em className="muted">{ts.noOwner}</em>}
                  </div>
                  <div className="super-cell" role="cell" data-label={ts.colMenu}>
                    {ts.counts(r.categoryCount, r.productCount)}
                  </div>
                  <div className="super-cell super-langs" role="cell" data-label={ts.colLanguages}>
                    {r.languages.map((l) => (
                      <span key={l} className="lang-code">
                        {l.toUpperCase()}
                      </span>
                    ))}
                  </div>
                  <div className="super-cell" role="cell" data-label={ts.colCreated}>
                    {dateFmt.format(new Date(r.createdAt))}
                  </div>
                  <div className="super-cell" role="cell" data-label={ts.colStatus}>
                    <span className={`badge ${r.isActive ? "badge-success" : "badge-warn"}`}>
                      {r.isActive ? ts.live : ts.suspended}
                    </span>
                  </div>
                  <div className="super-actions" role="cell">
                    <a
                      className="icon-btn"
                      href={`/menu/${r.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      title={ts.openMenu}
                      aria-label={ts.openMenu}
                    >
                      <ExternalLink size={16} />
                    </a>
                    <button className="btn btn-soft btn-sm" onClick={() => manage(r)} disabled={!r.owners.length}>
                      <LogIn size={15} /> {ts.manage}
                    </button>
                    <button
                      className="icon-btn"
                      onClick={() => toggleActive(r)}
                      title={r.isActive ? ts.suspend : ts.activate}
                      aria-label={r.isActive ? ts.suspend : ts.activate}
                    >
                      {r.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button
                      className="icon-btn danger"
                      onClick={() => remove(r)}
                      title={ts.remove}
                      aria-label={ts.remove}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
