import { useState } from "react";
import { LANGUAGES } from "../lib/i18n";
import type { TranslationMap } from "../lib/types";

interface Props {
  languages: string[];
  defaultLanguage: string;
  value: TranslationMap;
  onChange(value: TranslationMap): void;
  withDescription?: boolean;
}

/** Restoranın her dili için ayrı sekmede isim (ve açıklama) alanları. */
export function TranslationFields({ languages, defaultLanguage, value, onChange, withDescription }: Props) {
  const ordered = [defaultLanguage, ...languages.filter((l) => l !== defaultLanguage)];
  const [active, setActive] = useState(ordered[0]);
  const current = value[active] ?? { name: "", description: "" };

  const update = (field: "name" | "description", text: string) =>
    onChange({ ...value, [active]: { ...current, [field]: text } });

  return (
    <div className="translations">
      {ordered.length > 1 && (
        <div className="lang-tabs" role="tablist">
          {ordered.map((lang) => (
            <button
              key={lang}
              type="button"
              role="tab"
              aria-selected={lang === active}
              className={lang === active ? "active" : ""}
              onClick={() => setActive(lang)}
            >
              {LANGUAGES[lang]?.flag} {lang.toUpperCase()}
              {!value[lang]?.name?.trim() && <span className="dot" title="Boş" />}
            </button>
          ))}
        </div>
      )}
      <div dir={LANGUAGES[active]?.rtl ? "rtl" : "ltr"}>
        <label className="field">
          <span>
            İsim ({LANGUAGES[active]?.name ?? active})
            {active === defaultLanguage ? " *" : " — boş bırakılırsa varsayılan dil gösterilir"}
          </span>
          <input
            value={current.name}
            onChange={(e) => update("name", e.target.value)}
            required={active === defaultLanguage}
            maxLength={150}
          />
        </label>
        {withDescription && (
          <label className="field">
            <span>Açıklama</span>
            <textarea
              value={current.description ?? ""}
              onChange={(e) => update("description", e.target.value)}
              rows={3}
              maxLength={1000}
            />
          </label>
        )}
      </div>
    </div>
  );
}
