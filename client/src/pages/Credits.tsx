import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Logo } from "../components/Logo";

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
          <Logo />
        </Link>
        <Link className="btn btn-ghost" to="/">
          <ArrowLeft size={16} /> Ana sayfa
        </Link>
      </nav>
      <main className="credits-main">
        <h1 className="display">Görsel kaynakları</h1>
        <p className="muted">
          Demo menüdeki ve bu sitedeki yemek fotoğrafları Wikimedia Commons'tan alınmıştır ve aşağıdaki serbest lisanslarla
          kullanılmaktadır. Görseller yeniden boyutlandırılmıştır.
        </p>
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
