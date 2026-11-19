import { Globe } from "lucide-react";
import { useUi } from "../lib/ui-lang";

/** EN ⇄ TR arayüz dili düğmesi (tanıtım, giriş ve yönetim paneli). */
export function LangToggle({ className = "btn btn-ghost" }: { className?: string }) {
  const { t, toggle } = useUi();
  return (
    <button
      type="button"
      className={`lang-toggle ${className}`}
      onClick={toggle}
      title={t.common.switchTo}
      aria-label={t.common.switchTo}
    >
      <Globe size={16} /> {t.common.switchCode}
    </button>
  );
}
