import { useState, type FormEvent } from "react";
import { Modal } from "../../components/Modal";
import { TranslationFields } from "../../components/TranslationFields";
import { ImageInput } from "../../components/ImageInput";
import { api, errorMessage } from "../../lib/api";
import { pick } from "../../lib/i18n";
import type { Category, Product, Restaurant, TranslationMap } from "../../lib/types";

interface CategoryFormProps {
  restaurant: Restaurant;
  initial?: Category;
  onSaved(category: Category): void;
  onClose(): void;
}

export function CategoryForm({ restaurant, initial, onSaved, onClose }: CategoryFormProps) {
  const [translations, setTranslations] = useState<TranslationMap>(initial?.translations ?? {});
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const body = { translations, isActive };
      const saved = initial
        ? await api<Category>(`/admin/categories/${initial.id}`, { method: "PUT", body })
        : await api<Category>("/admin/categories", { method: "POST", body });
      onSaved(saved);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <Modal title={initial ? "Kategoriyi düzenle" : "Yeni kategori"} onClose={onClose}>
      <form onSubmit={onSubmit} className="modal-body">
        <TranslationFields
          languages={restaurant.languages}
          defaultLanguage={restaurant.defaultLanguage}
          value={translations}
          onChange={setTranslations}
        />
        <label className="checkbox">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          Menüde göster
        </label>
        {error && <p className="error">{error}</p>}
        <footer className="modal-footer">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Vazgeç
          </button>
          <button className="btn btn-primary" disabled={busy}>
            {busy ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </footer>
      </form>
    </Modal>
  );
}

interface ProductFormProps {
  restaurant: Restaurant;
  categories: Category[];
  categoryId: string;
  initial?: Product;
  onSaved(product: Product): void;
  onClose(): void;
}

export function ProductForm({ restaurant, categories, categoryId, initial, onSaved, onClose }: ProductFormProps) {
  const [translations, setTranslations] = useState<TranslationMap>(initial?.translations ?? {});
  const [price, setPrice] = useState(initial ? String(initial.price) : "");
  const [catId, setCatId] = useState(initial?.categoryId ?? categoryId);
  const [imageUrl, setImageUrl] = useState<string | null>(initial?.imageUrl ?? null);
  const [isAvailable, setIsAvailable] = useState(initial?.isAvailable ?? true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = Number(price.replace(",", "."));
    if (!Number.isFinite(parsed) || parsed < 0) {
      setError("Geçerli bir fiyat girin");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const body = { translations, price: parsed, categoryId: catId, imageUrl, isAvailable };
      const saved = initial
        ? await api<Product>(`/admin/products/${initial.id}`, { method: "PUT", body })
        : await api<Product>("/admin/products", { method: "POST", body });
      onSaved(saved);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <Modal title={initial ? "Ürünü düzenle" : "Yeni ürün"} onClose={onClose}>
      <form onSubmit={onSubmit} className="modal-body">
        <TranslationFields
          languages={restaurant.languages}
          defaultLanguage={restaurant.defaultLanguage}
          value={translations}
          onChange={setTranslations}
          withDescription
        />
        <div className="row">
          <label className="field">
            <span>Fiyat ({restaurant.currency}) *</span>
            <input inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} required placeholder="0" />
          </label>
          <label className="field">
            <span>Kategori</span>
            <select value={catId} onChange={(e) => setCatId(e.target.value)}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {pick(c.translations, restaurant.defaultLanguage, restaurant.defaultLanguage).name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <ImageInput value={imageUrl} onChange={setImageUrl} label="Ürün görseli" />
        <label className="checkbox">
          <input type="checkbox" checked={isAvailable} onChange={(e) => setIsAvailable(e.target.checked)} />
          Satışta (işaretli değilse menüde "Tükendi" olarak görünür)
        </label>
        {error && <p className="error">{error}</p>}
        <footer className="modal-footer">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Vazgeç
          </button>
          <button className="btn btn-primary" disabled={busy}>
            {busy ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </footer>
      </form>
    </Modal>
  );
}
