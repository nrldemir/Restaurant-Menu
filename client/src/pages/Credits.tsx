import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Logo } from "../components/Logo";
import { LangToggle } from "../components/LangToggle";
import { useUi } from "../lib/ui-lang";

interface Credit {
  file: string;
  title: string;
  page: string;
  artist: string;
  license: string;
  licenseUrl: string | null;
}

/** Demo görsellerinin yazar ve lisans bilgileri (CC lisansları atıf ister). */
export function Credits() {
  const [credits, setCredits] = useState<Credit[] | null>(null);
  const { t, lang } = useUi();

  useEffect(() => {
    fetch("/credits.json")
      .then((r) => r.json())
      .then(setCredits)
      .catch(() => setCredits([]));
  }, []);

  return (
    <div className="credits-page">
      <nav className="landing-nav">
        <Link to="/">
          <Logo taglineText={lang === "tr" ? "dijital menü" : "digital menu"} />
        </Link>
        <div className="landing-nav-actions">
          <LangToggle />
          <Link className="btn btn-ghost" to="/">
            <ArrowLeft size={16} /> {t.credits.home}
          </Link>
        </div>
      </nav>
      <main className="credits-main">
        <h1 className="display">{t.credits.title}</h1>
        <p className="muted">{t.credits.text}</p>
        <ul className="credit-list">
          {credits?.map((c) => (
            <li key={c.file}>
              <div>
                <a href={c.page} target="_blank" rel="noreferrer">
                  {c.title}
                </a>
                <small>
                  {c.artist} ·{" "}
                  {c.licenseUrl ? (
                    <a href={c.licenseUrl} target="_blank" rel="noreferrer">
                      {c.license}
                    </a>
                  ) : (
                    c.license
                  )}
                </small>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
