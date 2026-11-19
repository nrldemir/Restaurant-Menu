import { useState, type FormEvent } from "react";
import { CircleAlert, LoaderCircle } from "lucide-react";
import { Modal } from "../../components/Modal";
import { TranslationFields } from "../../components/TranslationFields";
import { ImageInput } from "../../components/ImageInput";
import { Switch } from "../../components/ui";
import { api, errorMessage } from "../../lib/api";
import { pick } from "../../lib/i18n";
import type { Category, Product, Restaurant, TranslationMap } from "../../lib/types";

function FormError({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <div className="alert alert-error">
      <CircleAlert size={17} />
      {error}
    </div>
  );
}

function SaveButton({ busy, label = "Kaydet" }: { busy: boolean; label?: string }) {
  return (
    <button className="btn btn-primary" disabled={busy}>
      {busy && <LoaderCircle size={16} className="spin" />}
      {busy ? "Kaydediliyor…" : label}
    </button>
  );
}

interface CategoryFormProps {
  restaurant: Restaurant;
  initial?: Category;
  onSaved(category: Category): void;
  onClose(): void;
}

export function CategoryForm({ restaurant, initial, onSaved, onClose }: CategoryFormProps) {
  const [translations, setTranslations] = useState<TranslationMap>(initial?.translations ?? {});
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [imageUrl, setImageUrl] = useState<string | null>(initial?.imageUrl ?? null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const body = { translations, isActive, imageUrl };
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
    <Modal
      title={initial ? "Kategoriyi düzenle" : "Yeni kategori"}
      subtitle="Kategoriler menünüzdeki bölümlerdir: Kahvaltı, Ana Yemekler, Tatlılar…"
      onClose={onClose}
    >
      <form onSubmit={onSubmit}>
        <div className="modal-body">
          <TranslationFields
            languages={restaurant.languages}
            defaultLanguage={restaurant.defaultLanguage}
            value={translations}
            onChange={setTranslations}
            withDescription
            namePlaceholder="Örn. Ana Yemekler"
            descriptionPlaceholder="İsteğe bağlı: Tüm yemeklerimiz odun ateşinde pişer."
          />
          <ImageInput
            value={imageUrl}
            onChange={setImageUrl}
            label="Kategori görseli"
            hint="Menünün üstündeki kategori şeridinde görünür. Boş bırakılırsa ilk ürünün fotoğrafı kullanılır."
          />
          <div className="toggle-row">
            <div>
              <strong>Menüde göster</strong>
              <small>Kapalıysa bu kategori müşterilere görünmez.</small>
            </div>
            <Switch checked={isActive} onChange={setIsActive} label="Menüde göster" />
          </div>
          <FormError error={error} />
        </div>
        <footer className="modal-footer">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Vazgeç
          </button>
          <SaveButton busy={busy} label={initial ? "Kaydet" : "Kategori ekle"} />
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
  const [price, setPrice] = useState(initial ? String(initial.price).replace(".", ",") : "");
  const [catId, setCatId] = useState(initial?.categoryId ?? categoryId);
  const [imageUrl, setImageUrl] = useState<string | null>(initial?.imageUrl ?? null);
  const [isAvailable, setIsAvailable] = useState(initial?.isAvailable ?? true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = Number(price.replace(/\s/g, "").replace(",", "."));
    if (!price.trim() || !Number.isFinite(parsed) || parsed < 0) {
      setError("Lütfen geçerli bir fiyat girin (örn. 250 veya 249,90)");
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

  const symbol =
    new Intl.NumberFormat("tr", { style: "currency", currency: restaurant.currency })
      .formatToParts(0)
      .find((p) => p.type === "currency")?.value ?? restaurant.currency;

  return (
    <Modal title={initial ? "Ürünü düzenle" : "Yeni ürün"} onClose={onClose} size="lg">
      <form onSubmit={onSubmit}>
        <div className="modal-body product-form">
          <div className="product-form-media">
            <ImageInput
              value={imageUrl}
              onChange={setImageUrl}
              label="Ürün fotoğrafı"
              hint="Kare veya yatay, aydınlık bir fotoğraf en iyi sonucu verir."
            />
            <div className="toggle-row">
              <div>
                <strong>{isAvailable ? "Satışta" : "Tükendi"}</strong>
                <small>Kapalıysa menüde "Tükendi" olarak görünür.</small>
              </div>
              <Switch checked={isAvailable} onChange={setIsAvailable} label="Satışta" />
            </div>
          </div>
          <div className="product-form-fields">
            <TranslationFields
              languages={restaurant.languages}
              defaultLanguage={restaurant.defaultLanguage}
              value={translations}
              onChange={setTranslations}
              withDescription
              namePlaceholder="Örn. Adana Kebap"
              descriptionPlaceholder="Malzemeler, porsiyon, servis şekli…"
            />
            <div className="form-row">
              <label className="field">
                <span className="field-label">
                  Fiyat<b className="req">*</b>
                </span>
                <div className="input-group">
                  <span className="addon">{symbol}</span>
                  <input
                    inputMode="decimal"
                    value={price}
                    onChange={(e) => setPrice(e.target.value.replace(/[^\d.,\s]/g, ""))}
                    required
                    placeholder="0,00"
                  />
                </div>
              </label>
              <label className="field">
                <span className="field-label">Kategori</span>
                <select value={catId} onChange={(e) => setCatId(e.target.value)}>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {pick(c.translations, restaurant.defaultLanguage, restaurant.defaultLanguage).name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <FormError error={error} />
          </div>
        </div>
        <footer className="modal-footer">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Vazgeç
          </button>
          <SaveButton busy={busy} label={initial ? "Kaydet" : "Ürünü ekle"} />
        </footer>
      </form>
    </Modal>
  );
}
