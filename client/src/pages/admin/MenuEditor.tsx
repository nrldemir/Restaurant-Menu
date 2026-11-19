import { useCallback, useEffect, useState } from "react";
import {
  CircleCheck,
  CircleSlash,
  Eye,
  EyeOff,
  FolderOpen,
  Languages,
  Layers,
  Pencil,
  Plus,
  Soup,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { useConfirm } from "../../components/Confirm";
import { useToast } from "../../components/Toast";
import { DragHandle, SortableList } from "../../components/SortableList";
import { EmptyState, PageHeader, Switch } from "../../components/ui";
import { api, errorMessage } from "../../lib/api";
import { formatPrice, pick } from "../../lib/i18n";
import type { Category, Product } from "../../lib/types";
import { useUi } from "../../lib/ui-lang";
import { CategoryForm, ProductForm } from "./forms";

type Editing = { kind: "category"; item?: Category } | { kind: "product"; item?: Product } | null;

function Stat({ icon: Icon, label, value, tone }: { icon: typeof Layers; label: string; value: number; tone: string }) {
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

export function MenuEditor() {
  const { me } = useAuth();
  const restaurant = me!.restaurant!;
  const lang = restaurant.defaultLanguage;
  const toast = useToast();
  const confirm = useConfirm();
  const ui = useUi().t;
  const tx = ui.editor;

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Editing>(null);
  const [loading, setLoading] = useState(true);

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
      toast.error(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  /** Değişiklik ekrana hemen yansır; sunucu hata verirse veri yeniden yüklenir. */
  async function run(action: () => Promise<unknown>, success?: string) {
    try {
      await action();
      if (success) toast.success(success);
    } catch (err) {
      toast.error(errorMessage(err));
      load();
    }
  }

  const name = (c: { translations: Category["translations"] }) => pick(c.translations, lang, lang).name;
  const selected = categories.find((c) => c.id === selectedId) ?? null;
  const visibleProducts = products
    .filter((p) => p.categoryId === selectedId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const countIn = (id: string) => products.filter((p) => p.categoryId === id).length;
  /** Kategori görseli yoksa menüdeki gibi ilk ürün fotoğrafı */
  const catImage = (c: Category) =>
    c.imageUrl ?? products.find((p) => p.categoryId === c.id && p.imageUrl)?.imageUrl ?? null;
  const soldOut = products.filter((p) => !p.isAvailable).length;

  function reorderCategories(next: Category[]) {
    setCategories(next);
    run(() => api("/admin/categories/reorder", { method: "PUT", body: { ids: next.map((c) => c.id) } }));
  }

  function reorderProducts(next: Product[]) {
    const order = new Map(next.map((p, i) => [p.id, i]));
    setProducts((all) => all.map((p) => (order.has(p.id) ? { ...p, sortOrder: order.get(p.id)! } : p)));
    run(() => api("/admin/products/reorder", { method: "PUT", body: { ids: next.map((p) => p.id) } }));
  }

  function toggleCategory(c: Category) {
    const isActive = !c.isActive;
    setCategories((list) => list.map((x) => (x.id === c.id ? { ...x, isActive } : x)));
    run(
      () =>
        api(`/admin/categories/${c.id}`, {
          method: "PUT",
          body: { translations: c.translations, isActive, imageUrl: c.imageUrl },
        }),
      isActive ? tx.toastShown(name(c)) : tx.toastHidden(name(c)),
    );
  }

  function toggleProduct(p: Product) {
    const isAvailable = !p.isAvailable;
    setProducts((list) => list.map((x) => (x.id === p.id ? { ...x, isAvailable } : x)));
    run(
      () =>
        api(`/admin/products/${p.id}`, {
          method: "PUT",
          body: {
            translations: p.translations,
            price: p.price,
            categoryId: p.categoryId,
            imageUrl: p.imageUrl,
            isAvailable,
          },
        }),
      isAvailable ? tx.toastOnSale(name(p)) : tx.toastSoldOut(name(p)),
    );
  }

  async function deleteCategory(c: Category) {
    const count = countIn(c.id);
    const ok = await confirm({
      title: tx.deleteCategoryTitle,
      message: tx.deleteCategoryMsg(name(c), count),
      confirmText: ui.common.yesDelete,
      danger: true,
    });
    if (!ok) return;
    setCategories((list) => list.filter((x) => x.id !== c.id));
    setProducts((list) => list.filter((p) => p.categoryId !== c.id));
    if (selectedId === c.id) setSelectedId(categories.find((x) => x.id !== c.id)?.id ?? null);
    run(() => api(`/admin/categories/${c.id}`, { method: "DELETE" }), tx.toastCategoryDeleted);
  }

  async function deleteProduct(p: Product) {
    const ok = await confirm({
      title: tx.deleteItemTitle,
      message: tx.deleteItemMsg(name(p)),
      confirmText: ui.common.yesDelete,
      danger: true,
    });
    if (!ok) return;
    setProducts((list) => list.filter((x) => x.id !== p.id));
    run(() => api(`/admin/products/${p.id}`, { method: "DELETE" }), tx.toastItemDeleted);
  }

  function onCategorySaved(saved: Category) {
    const isNew = !categories.some((c) => c.id === saved.id);
    setCategories((list) => (isNew ? [...list, saved] : list.map((c) => (c.id === saved.id ? saved : c))));
    setSelectedId(saved.id);
    setEditing(null);
    toast.success(isNew ? tx.toastCategoryAdded : tx.toastCategoryUpdated);
  }

  function onProductSaved(saved: Product) {
    const isNew = !products.some((p) => p.id === saved.id);
    setProducts((list) => (isNew ? [...list, saved] : list.map((p) => (p.id === saved.id ? saved : p))));
    setEditing(null);
    toast.success(isNew ? tx.toastItemAdded : tx.toastItemUpdated);
  }

  if (loading) {
    return (
      <div className="editor-loading">
        <div className="skeleton" style={{ height: 56, width: 260 }} />
        <div className="stats">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: 76, borderRadius: 18 }} />
          ))}
        </div>
        <div className="skeleton" style={{ height: 360, borderRadius: 20 }} />
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader
        title={tx.title}
        subtitle={tx.subtitle}
        actions={
          <button className="btn btn-primary" onClick={() => setEditing({ kind: "category" })}>
            <Plus size={17} /> {tx.addCategory}
          </button>
        }
      />

      <div className="stats">
        <Stat icon={Layers} label={tx.statCategories} value={categories.length} tone="nar" />
        <Stat icon={UtensilsCrossed} label={tx.statItems} value={products.length} tone="safran" />
        <Stat icon={CircleCheck} label={tx.statAvailable} value={products.length - soldOut} tone="zeytin" />
        <Stat icon={CircleSlash} label={tx.statSoldOut} value={soldOut} tone="tas" />
      </div>

      {categories.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={FolderOpen}
            title={tx.emptyTitle}
            text={tx.emptyText}
            action={
              <button className="btn btn-primary" onClick={() => setEditing({ kind: "category" })}>
                <Plus size={17} /> {tx.addFirstCategory}
              </button>
            }
          />
        </div>
      ) : (
        <div className="editor">
          <section className="card editor-cats">
            <header className="card-header">
              <div className="card-title">
                <div>
                  <h2>{tx.categories}</h2>
                  <p>{tx.categoryCount(categories.length)}</p>
                </div>
              </div>
              <button className="icon-btn" onClick={() => setEditing({ kind: "category" })} aria-label={tx.addCategory}>
                <Plus size={18} />
              </button>
            </header>
            <SortableList
              items={categories}
              onReorder={reorderCategories}
              className="cat-list"
              renderItem={(c, handle) => (
                <div
                  className={`cat-item${c.id === selectedId ? " selected" : ""}${c.isActive ? "" : " hidden-cat"}`}
                >
                  <DragHandle handle={handle} />
                  <span className="cat-thumb">
                    {catImage(c) ? <img src={catImage(c)!} alt="" /> : <UtensilsCrossed size={15} />}
                  </span>
                  <button className="cat-main" onClick={() => setSelectedId(c.id)}>
                    <span className="cat-name">{name(c)}</span>
                    <span className="cat-meta">
                      {tx.itemCount(countIn(c.id))}
                      {!c.isActive && (
                        <span className="badge badge-warn">
                          <EyeOff size={11} /> {ui.common.hidden}
                        </span>
                      )}
                    </span>
                  </button>
                  <div className="cat-actions">
                    <button
                      className="icon-btn"
                      onClick={() => toggleCategory(c)}
                      aria-label={c.isActive ? tx.hideFromMenu : tx.showOnMenu}
                      title={c.isActive ? tx.hideFromMenu : tx.showOnMenu}
                    >
                      {c.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <button
                      className="icon-btn"
                      onClick={() => setEditing({ kind: "category", item: c })}
                      aria-label={ui.common.edit}
                      title={ui.common.edit}
                    >
                      <Pencil size={16} />
                    </button>
                    <button className="icon-btn danger" onClick={() => deleteCategory(c)} aria-label={ui.common.delete} title={ui.common.delete}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )}
            />
          </section>

          <section className="card editor-products">
            <header className="card-header">
              <div className="card-title">
                <div>
                  <h2 className="display products-title">{selected ? name(selected) : tx.items}</h2>
                  <p>
                    {tx.itemCount(visibleProducts.length)}
                    {selected && !selected.isActive && tx.categoryHidden}
                  </p>
                </div>
              </div>
              {selected && (
                <button className="btn btn-primary btn-sm" onClick={() => setEditing({ kind: "product" })}>
                  <Plus size={16} /> {tx.addItem}
                </button>
              )}
            </header>

            {visibleProducts.length === 0 ? (
              <EmptyState
                icon={Soup}
                title={tx.emptyCategoryTitle}
                text={tx.emptyCategoryText}
                action={
                  <button className="btn btn-soft" onClick={() => setEditing({ kind: "product" })}>
                    <Plus size={16} /> {tx.addItem}
                  </button>
                }
              />
            ) : (
              <SortableList
                items={visibleProducts}
                onReorder={reorderProducts}
                layout="grid"
                className="product-grid"
                renderItem={(p, handle) => {
                  const t = pick(p.translations, lang, lang);
                  const missing = restaurant.languages.filter((l) => !p.translations[l]?.name);
                  return (
                    <article className={`ptile${p.isAvailable ? "" : " sold"}`}>
                      <div className="ptile-img" onClick={() => setEditing({ kind: "product", item: p })}>
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt="" loading="lazy" />
                        ) : (
                          <span className="ptile-placeholder">
                            <UtensilsCrossed size={26} strokeWidth={1.5} />
                          </span>
                        )}
                        {!p.isAvailable && <span className="ptile-sold">{ui.common.soldOut}</span>}
                      </div>
                      <div className="ptile-handle">
                        <DragHandle handle={handle} />
                      </div>
                      <div className="ptile-body" onClick={() => setEditing({ kind: "product", item: p })}>
                        <h3>{t.name}</h3>
                        {t.description ? <p>{t.description}</p> : <p className="placeholder">{tx.noDescription}</p>}
                        <div className="ptile-meta">
                          <span className="ptile-price">{formatPrice(p.price, restaurant.currency, lang)}</span>
                          {missing.length > 0 && (
                            <span className="badge badge-warn" title={tx.missingTitle(missing.join(", ").toUpperCase())}>
                              <Languages size={11} /> {tx.missingCount(missing.length)}
                            </span>
                          )}
                        </div>
                      </div>
                      <footer className="ptile-foot">
                        <label className="ptile-switch">
                          <Switch
                            checked={p.isAvailable}
                            onChange={() => toggleProduct(p)}
                            label={p.isAvailable ? tx.markSoldOut : tx.putOnSale}
                            size="sm"
                          />
                          <span>{p.isAvailable ? ui.common.available : ui.common.soldOut}</span>
                        </label>
                        <div>
                          <button
                            className="icon-btn"
                            onClick={() => setEditing({ kind: "product", item: p })}
                            aria-label={ui.common.edit}
                            title={ui.common.edit}
                          >
                            <Pencil size={16} />
                          </button>
                          <button className="icon-btn danger" onClick={() => deleteProduct(p)} aria-label={ui.common.delete} title={ui.common.delete}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </footer>
                    </article>
                  );
                }}
              />
            )}
          </section>
        </div>
      )}

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
