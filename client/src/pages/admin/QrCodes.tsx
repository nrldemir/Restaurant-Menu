import { useState } from "react";
import { useAuth } from "../../auth/AuthContext";

const MAX_TABLES = 100;

function qrSrc(slug: string, opts: { table?: string; format?: "png" | "svg"; download?: boolean } = {}) {
  const params = new URLSearchParams();
  if (opts.table) params.set("table", opts.table);
  if (opts.format) params.set("format", opts.format);
  if (opts.download) params.set("download", "1");
  const qs = params.toString();
  return `/api/public/restaurants/${encodeURIComponent(slug)}/qr${qs ? `?${qs}` : ""}`;
}

function QrCard({ slug, title, table }: { slug: string; title: string; table?: string }) {
  return (
    <figure className="qr-card">
      <img src={qrSrc(slug, { table })} alt={`${title} QR kodu`} loading="lazy" />
      <figcaption>{title}</figcaption>
      <div className="qr-actions no-print">
        <a className="btn btn-sm" href={qrSrc(slug, { table, download: true })}>
          PNG
        </a>
        <a className="btn btn-sm" href={qrSrc(slug, { table, format: "svg", download: true })}>
          SVG
        </a>
      </div>
    </figure>
  );
}

export function QrCodes() {
  const { me } = useAuth();
  const { slug, menuUrl, name } = me!.restaurant;
  const [count, setCount] = useState(10);
  const [copied, setCopied] = useState(false);
  const tables = Array.from({ length: Math.min(Math.max(count, 0), MAX_TABLES) }, (_, i) => String(i + 1));

  async function copy() {
    try {
      await navigator.clipboard.writeText(menuUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* pano erişimi yoksa kullanıcı linki elle kopyalar */
    }
  }

  return (
    <div className="qr-page">
      <section className="panel no-print">
        <header className="panel-header">
          <h2>Menü linki</h2>
        </header>
        <div className="copy-row">
          <input readOnly value={menuUrl} onFocus={(e) => e.target.select()} />
          <button className="btn" onClick={copy}>
            {copied ? "Kopyalandı ✓" : "Kopyala"}
          </button>
        </div>
        {menuUrl.includes("localhost") && (
          <p className="warn small">
            Link şu an "localhost" adresini gösteriyor; telefonlar bu adrese ulaşamaz. Canlıya alırken veya telefondan
            test ederken <code>server/.env</code> içindeki <code>CLIENT_URL</code> değerini güncelleyin.
          </p>
        )}
      </section>

      <section className="panel">
        <header className="panel-header no-print">
          <h2>Genel QR kod</h2>
        </header>
        <div className="qr-grid">
          <QrCard slug={slug} title={name} />
        </div>
      </section>

      <section className="panel">
        <header className="panel-header no-print">
          <h2>Masa QR kodları</h2>
          <div className="inline-controls">
            <label>
              Masa sayısı{" "}
              <input
                type="number"
                min={1}
                max={MAX_TABLES}
                value={count}
                onChange={(e) => setCount(Number(e.target.value) || 0)}
              />
            </label>
            <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
              Yazdır
            </button>
          </div>
        </header>
        <p className="muted small no-print">
          Masaya özel QR okutulduğunda menünün üstünde masa numarası görünür.
        </p>
        <div className="qr-grid">
          {tables.map((t) => (
            <QrCard key={t} slug={slug} table={t} title={`Masa ${t}`} />
          ))}
        </div>
      </section>
    </div>
  );
}
