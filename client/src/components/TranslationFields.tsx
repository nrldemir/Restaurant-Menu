import { useState } from "react";
import { LANGUAGES } from "../lib/i18n";
import type { TranslationMap } from "../lib/types";

interface Props {
  languages: string[];
  defaultLanguage: string;
  value: TranslationMap;
  onChange(value: TranslationMap): void;
  withDescription?: boolean;
  namePlaceholder?: string;
  descriptionPlaceholder?: string;
}

/** Restoranın her dili için ayrı sekmede isim (ve açıklama) alanları. */
export function TranslationFields({
  languages,
  defaultLanguage,
  value,
  onChange,
  withDescription,
  namePlaceholder,
  descriptionPlaceholder,
}: Props) {
  const ordered = [defaultLanguage, ...languages.filter((l) => l !== defaultLanguage)];
  const [active, setActive] = useState(ordered[0]);
  const current = value[active] ?? { name: "", description: "" };
  const isDefault = active === defaultLanguage;

  const update = (field: "name" | "description", text: string) =>
    onChange({ ...value, [active]: { ...current, [field]: text } });

  return (
    <div className="translations">
      {ordered.length > 1 && (
        <div className="segmented" role="tablist" aria-label="Dil">
          {ordered.map((lang) => {
            const filled = Boolean(value[lang]?.name?.trim());
            return (
              <button
                key={lang}
                type="button"
                role="tab"
                aria-selected={lang === active}
                className={lang === active ? "active" : ""}
                onClick={() => setActive(lang)}
              >
                {LANGUAGES[lang]?.name ?? lang.toUpperCase()}
                <span className={`status-dot${filled ? " ok" : ""}`} aria-label={filled ? "Dolu" : "Boş"} />
              </button>
            );
          })}
        </div>
      )}
      <div dir={LANGUAGES[active]?.rtl ? "rtl" : "ltr"} className="translations-fields">
        <label className="field">
          <span className="field-label">
            İsim{ordered.length > 1 && <em> · {LANGUAGES[active]?.name ?? active}</em>}
            {isDefault && <b className="req">*</b>}
          </span>
          <input
            value={current.name}
            onChange={(e) => update("name", e.target.value)}
            required={isDefault}
            maxLength={150}
            placeholder={isDefault ? namePlaceholder : "Boş bırakılırsa varsayılan dil gösterilir"}
            autoFocus
          />
        </label>
        {withDescription && (
          <label className="field">
            <span className="field-label">Açıklama</span>
            <textarea
              value={current.description ?? ""}
              onChange={(e) => update("description", e.target.value)}
              rows={3}
              maxLength={1000}
              placeholder={descriptionPlaceholder}
            />
          </label>
        )}
      </div>
    </div>
  );
}
