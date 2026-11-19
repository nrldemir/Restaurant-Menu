import { useState, type FormEvent } from "react";
import { CircleAlert, LoaderCircle } from "lucide-react";
import { Modal } from "../../components/Modal";
import { TranslationFields } from "../../components/TranslationFields";
import { ImageInput } from "../../components/ImageInput";
import { Switch } from "../../components/ui";
import { api, errorMessage } from "../../lib/api";
import { pick } from "../../lib/i18n";
import type { Category, Product, Restaurant, TranslationMap } from "../../lib/types";
import { useUi } from "../../lib/ui-lang";

function FormError({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <div className="alert alert-error">
      <CircleAlert size={17} />
      {error}
    </div>
  );
}

function SaveButton({ busy, label }: { busy: boolean; label?: string }) {
  const { t } = useUi();
  return (
    <button className="btn btn-primary" disabled={busy}>
      {busy && <LoaderCircle size={16} className="spin" />}
      {busy ? t.common.saving : (label ?? t.common.save)}
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
  const { t } = useUi();

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
      title={initial ? t.forms.editCategory : t.forms.newCategory}
      subtitle={t.forms.categorySubtitle}
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
            namePlaceholder={t.forms.categoryNamePh}
            descriptionPlaceholder={t.forms.categoryDescPh}
          />
          <ImageInput
            value={imageUrl}
            onChange={setImageUrl}
            label={t.forms.categoryImage}
            hint={t.forms.categoryImageHint}
          />
          <div className="toggle-row">
            <div>
              <strong>{t.forms.showOnMenu}</strong>
              <small>{t.forms.showOnMenuHint}</small>
            </div>
            <Switch checked={isActive} onChange={setIsActive} label={t.forms.showOnMenu} />
          </div>
          <FormError error={error} />
        </div>
        <footer className="modal-footer">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            {t.common.cancel}
          </button>
          <SaveButton busy={busy} label={initial ? undefined : t.forms.addCategory} />
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
  const { t, lang } = useUi();
  const [translations, setTranslations] = useState<TranslationMap>(initial?.translations ?? {});
  const [price, setPrice] = useState(() => (initial ? (lang === "tr" ? String(initial.price).replace(".", ",") : String(initial.price)) : ""));
  const [catId, setCatId] = useState(initial?.categoryId ?? categoryId);
  const [imageUrl, setImageUrl] = useState<string | null>(initial?.imageUrl ?? null);
  const [isAvailable, setIsAvailable] = useState(initial?.isAvailable ?? true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = Number(price.replace(/\s/g, "").replace(",", "."));
    if (!price.trim() || !Number.isFinite(parsed) || parsed < 0) {
      setError(t.forms.invalidPrice);
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
    <Modal title={initial ? t.forms.editItem : t.forms.newItem} onClose={onClose} size="lg">
      <form onSubmit={onSubmit}>
        <div className="modal-body product-form">
          <div className="product-form-media">
            <ImageInput
              value={imageUrl}
              onChange={setImageUrl}
              label={t.forms.itemPhoto}
              hint={t.forms.itemPhotoHint}
            />
            <div className="toggle-row">
              <div>
                <strong>{isAvailable ? t.common.available : t.common.soldOut}</strong>
                <small>{t.forms.availableHint}</small>
              </div>
              <Switch checked={isAvailable} onChange={setIsAvailable} label={t.common.available} />
            </div>
          </div>
          <div className="product-form-fields">
            <TranslationFields
              languages={restaurant.languages}
              defaultLanguage={restaurant.defaultLanguage}
              value={translations}
              onChange={setTranslations}
              withDescription
              namePlaceholder={t.forms.itemNamePh}
              descriptionPlaceholder={t.forms.itemDescPh}
            />
            <div className="form-row">
              <label className="field">
                <span className="field-label">
                  {t.forms.price}<b className="req">*</b>
                </span>
                <div className="input-group">
                  <span className="addon">{symbol}</span>
                  <input
                    inputMode="decimal"
                    value={price}
                    onChange={(e) => setPrice(e.target.value.replace(/[^\d.,\s]/g, ""))}
                    required
                    placeholder={lang === "tr" ? "0,00" : "0.00"}
                  />
                </div>
              </label>
              <label className="field">
                <span className="field-label">{t.forms.category}</span>
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
            {t.common.cancel}
          </button>
          <SaveButton busy={busy} label={initial ? undefined : t.forms.addItem} />
        </footer>
      </form>
    </Modal>
  );
}
