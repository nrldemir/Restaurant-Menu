import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { api, errorMessage } from "../../lib/api";
import { formatPrice, pick } from "../../lib/i18n";
import type { Category, Product } from "../../lib/types";
import { CategoryForm, ProductForm } from "./forms";

type Editing =
  | { kind: "category"; item?: Category }
  | { kind: "product"; item?: Product }
  | null;

function move<T>(list: T[], index: number, delta: number) {
  const target = index + delta;
  if (target < 0 || target >= list.length) return list;
  const copy = [...list];
  [copy[index], copy[target]] = [copy[target], copy[index]];
  return copy;
}

export function MenuEditor() {
  const { me } = useAuth();
  const restaurant = me!.restaurant;
  const lang = restaurant.defaultLanguage;

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Editing>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [cats, prods] = await Promise.all([
        api<Category[]>("/admin/categories"),
        api<Product[]>("/admin/products"),
      ]);
      setCategories(cats);
      setProducts(prods);
      setSelectedId((id) => (id && cats.some((c) => c.id === id) ? id : (cats[0]?.id ?? null)));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /** Önce ekranda uygular, sunucu hata verirse yeniden yükler. */
  async function run(action: () => Promise<unknown>) {
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(errorMessage(err));
      load();
    }
  }

  const selected = categories.find((c) => c.id === selectedId) ?? null;
  const visibleProducts = products
    .filter((p) => p.categoryId === selectedId)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  function reorderCategories(index: number, delta: number) {
    const next = move(categories, index, delta);
    if (next === categories) return;
    setCategories(next);
    run(() => api("/admin/categories/reorder", { method: "PUT", body: { ids: next.map((c) => c.id) } }));
  }

  function reorderProducts(index: number, delta: number) {
    const next = move(visibleProducts, index, delta);
    if (next === visibleProducts) return;
    const order = new Map(next.map((p, i) => [p.id, i]));
    setProducts((all) => all.map((p) => (order.has(p.id) ? { ...p, sortOrder: order.get(p.id)! } : p)));
    run(() => api("/admin/products/reorder", { method: "PUT", body: { ids: next.map((p) => p.id) } }));
  }

  function toggleCategory(c: Category) {
    const updated = { ...c, isActive: !c.isActive };
    setCategories((list) => list.map((x) => (x.id === c.id ? updated : x)));
    run(() =>
      api(`/admin/categories/${c.id}`, {
        method: "PUT",
        body: { translations: c.translations, isActive: updated.isActive },
      }),
    );
  }

  function toggleProduct(p: Product) {
    const updated = { ...p, isAvailable: !p.isAvailable };
    setProducts((list) => list.map((x) => (x.id === p.id ? updated : x)));
    run(() =>
      api(`/admin/products/${p.id}`, {
        method: "PUT",
        body: {
          translations: p.translations,
          price: p.price,
          categoryId: p.categoryId,
          imageUrl: p.imageUrl,
          isAvailable: updated.isAvailable,
        },
      }),
    );
  }

  function deleteCategory(c: Category) {
    const count = products.filter((p) => p.categoryId === c.id).length;
    const name = pick(c.translations, lang, lang).name;
    const msg = count
      ? `"${name}" kategorisi ve içindeki ${count} ürün silinecek. Emin misiniz?`
      : `"${name}" kategorisi silinecek. Emin misiniz?`;
    if (!confirm(msg)) return;
    setCategories((list) => list.filter((x) => x.id !== c.id));
    setProducts((list) => list.filter((p) => p.categoryId !== c.id));
    if (selectedId === c.id) setSelectedId(categories.find((x) => x.id !== c.id)?.id ?? null);
    run(() => api(`/admin/categories/${c.id}`, { method: "DELETE" }));
  }

  function deleteProduct(p: Product) {
    if (!confirm(`"${pick(p.translations, lang, lang).name}" silinecek. Emin misiniz?`)) return;
    setProducts((list) => list.filter((x) => x.id !== p.id));
    run(() => api(`/admin/products/${p.id}`, { method: "DELETE" }));
  }

  function onCategorySaved(saved: Category) {
    setCategories((list) =>
      list.some((c) => c.id === saved.id) ? list.map((c) => (c.id === saved.id ? saved : c)) : [...list, saved],
    );
    setSelectedId(saved.id);
    setEditing(null);
  }

  function onProductSaved(saved: Product) {
    setProducts((list) =>
      list.some((p) => p.id === saved.id) ? list.map((p) => (p.id === saved.id ? saved : p)) : [...list, saved],
    );
    setEditing(null);
  }

  if (loading) return <p className="muted">Yükleniyor…</p>;

  return (
    <div className="editor">
      {error && (
        <p className="error banner" role="alert">
          {error}
        </p>
      )}

      <section className="panel">
        <header className="panel-header">
          <h2>Kategoriler</h2>
          <button className="btn btn-primary btn-sm" onClick={() => setEditing({ kind: "category" })}>
            + Ekle
          </button>
        </header>
        {categories.length === 0 ? (
          <p className="empty">Henüz kategori yok. "Kahvaltı", "Ana Yemekler" gibi bir kategori ekleyerek başlayın.</p>
        ) : (
          <ul className="list">
            {categories.map((c, i) => (
              <li
                key={c.id}
                className={`list-item${c.id === selectedId ? " selected" : ""}${c.isActive ? "" : " inactive"}`}
              >
                <button className="list-main" onClick={() => setSelectedId(c.id)}>
                  <span>{pick(c.translations, lang, lang).name}</span>
                  <small className="muted">
                    {products.filter((p) => p.categoryId === c.id).length} ürün
                    {!c.isActive && " · gizli"}
                  </small>
                </button>
                <div className="list-actions">
                  <button className="icon-btn" onClick={() => reorderCategories(i, -1)} disabled={i === 0} title="Yukarı">
                    ↑
                  </button>
                  <button
                    className="icon-btn"
                    onClick={() => reorderCategories(i, 1)}
                    disabled={i === categories.length - 1}
                    title="Aşağı"
                  >
                    ↓
                  </button>
                  <button className="icon-btn" onClick={() => toggleCategory(c)} title={c.isActive ? "Gizle" : "Göster"}>
                    {c.isActive ? "👁" : "🚫"}
                  </button>
                  <button className="icon-btn" onClick={() => setEditing({ kind: "category", item: c })} title="Düzenle">
                    ✎
                  </button>
                  <button className="icon-btn danger" onClick={() => deleteCategory(c)} title="Sil">
                    🗑
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel">
        <header className="panel-header">
          <h2>{selected ? pick(selected.translations, lang, lang).name : "Ürünler"}</h2>
          {selected && (
            <button className="btn btn-primary btn-sm" onClick={() => setEditing({ kind: "product" })}>
              + Ürün ekle
            </button>
          )}
        </header>
        {!selected ? (
          <p className="empty">Ürün eklemek için önce bir kategori oluşturun.</p>
        ) : visibleProducts.length === 0 ? (
          <p className="empty">Bu kategoride ürün yok.</p>
        ) : (
          <ul className="list">
            {visibleProducts.map((p, i) => {
              const t = pick(p.translations, lang, lang);
              const missing = restaurant.languages.filter((l) => !p.translations[l]?.name);
              return (
                <li key={p.id} className={`list-item product-row${p.isAvailable ? "" : " inactive"}`}>
                  <div className="thumb">{p.imageUrl ? <img src={p.imageUrl} alt="" /> : "🍽️"}</div>
                  <div className="list-main static">
                    <span>{t.name}</span>
                    <small className="muted">
                      {formatPrice(p.price, restaurant.currency, lang)}
                      {!p.isAvailable && " · tükendi"}
                      {missing.length > 0 && ` · çeviri eksik: ${missing.join(", ").toUpperCase()}`}
                    </small>
                  </div>
                  <div className="list-actions">
                    <button className="icon-btn" onClick={() => reorderProducts(i, -1)} disabled={i === 0} title="Yukarı">
                      ↑
                    </button>
                    <button
                      className="icon-btn"
                      onClick={() => reorderProducts(i, 1)}
                      disabled={i === visibleProducts.length - 1}
                      title="Aşağı"
                    >
                      ↓
                    </button>
                    <button
                      className={`toggle${p.isAvailable ? " on" : ""}`}
                      onClick={() => toggleProduct(p)}
                      title={p.isAvailable ? "Tükendi olarak işaretle" : "Satışa aç"}
                      aria-pressed={p.isAvailable}
                    >
                      <span />
                    </button>
                    <button className="icon-btn" onClick={() => setEditing({ kind: "product", item: p })} title="Düzenle">
                      ✎
                    </button>
                    <button className="icon-btn danger" onClick={() => deleteProduct(p)} title="Sil">
                      🗑
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {editing?.kind === "category" && (
        <CategoryForm
          restaurant={restaurant}
          initial={editing.item}
          onSaved={onCategorySaved}
          onClose={() => setEditing(null)}
        />
      )}
      {editing?.kind === "product" && selected && (
        <ProductForm
          restaurant={restaurant}
          categories={categories}
          categoryId={selected.id}
          initial={editing.item}
          onSaved={onProductSaved}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
