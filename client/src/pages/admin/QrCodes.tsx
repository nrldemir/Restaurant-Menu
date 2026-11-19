import { useState } from "react";
import { Copy, Download, ExternalLink, Link2, Minus, Plus, Printer, QrCode, Smartphone, TriangleAlert } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { useToast } from "../../components/Toast";
import { Card, PageHeader } from "../../components/ui";
import { themeVars } from "../../lib/themes";
import type { Restaurant } from "../../lib/types";
import { uiText } from "../../lib/i18n";
import { useUi } from "../../lib/ui-lang";

const MAX_TABLES = 100;

function qrSrc(slug: string, opts: { table?: string; format?: "png" | "svg"; download?: boolean } = {}) {
  const params = new URLSearchParams();
  if (opts.table) params.set("table", opts.table);
  if (opts.format) params.set("format", opts.format);
  if (opts.download) params.set("download", "1");
  const qs = params.toString();
  return `/api/public/restaurants/${encodeURIComponent(slug)}/qr${qs ? `?${qs}` : ""}`;
}

/** Masaya konacak, yazdırılabilir QR kartı. */
function TableCard({ restaurant, table }: { restaurant: Restaurant; table?: string }) {
  const { t } = useUi();
  // Kart müşteriler için yazdırılır: masa etiketi restoranın varsayılan menü dilinde
  const tableWord = uiText(restaurant.defaultLanguage).table;
  return (
    <figure className="table-card" style={themeVars(restaurant.theme)}>
      <div className="table-card-top">
        <div className="table-card-logo">
          {restaurant.logoUrl ? (
            <img src={restaurant.logoUrl} alt="" />
          ) : (
            <span className="display">{restaurant.name.charAt(0)}</span>
          )}
        </div>
        <strong className="display">{restaurant.name}</strong>
      </div>
      <div className="table-card-qr">
        <img src={qrSrc(restaurant.slug, { table, format: "svg" })} alt={t.qr.qrAlt(table ? `${tableWord} ${table}` : t.qr.menu)} loading="lazy" />
      </div>
      <figcaption>
        {table ? (
          <span className="table-card-no">
            {tableWord} <b>{table}</b>
          </span>
        ) : (
          <span className="table-card-no">{t.qr.generalCaption}</span>
        )}
        <span className="table-card-hint">
          <Smartphone size={13} /> Menü için okutun · Scan for menu
        </span>
      </figcaption>
      <div className="table-card-actions no-print">
        <a className="btn btn-sm" href={qrSrc(restaurant.slug, { table, download: true })} title={t.qr.downloadPng}>
          <Download size={14} /> PNG
        </a>
        <a className="btn btn-sm" href={qrSrc(restaurant.slug, { table, format: "svg", download: true })} title={t.qr.downloadSvg}>
          <Download size={14} /> SVG
        </a>
      </div>
    </figure>
  );
}

export function QrCodes() {
  const { me } = useAuth();
  const toast = useToast();
  const { t } = useUi();
  const tq = t.qr;
  const restaurant = me!.restaurant;
  const [count, setCount] = useState(8);
  const [printMode, setPrintMode] = useState<"tables" | "general">("tables");
  const safeCount = Math.min(Math.max(count, 1), MAX_TABLES);
  const tables = Array.from({ length: safeCount }, (_, i) => String(i + 1));

  async function copy() {
    try {
      await navigator.clipboard.writeText(restaurant.menuUrl);
      toast.success(tq.copied);
    } catch {
      toast.error(tq.copyFailed);
    }
  }

  function print(mode: "tables" | "general") {
    setPrintMode(mode);
    // Sınıf DOM'a yansıdıktan sonra yazdır
    requestAnimationFrame(() => requestAnimationFrame(() => window.print()));
  }

  return (
    <div className={`page qr-page print-${printMode}`}>
      <PageHeader
        title={tq.title}
        subtitle={tq.subtitle}
        actions={
          <button className="btn btn-primary" onClick={() => print("tables")}>
            <Printer size={17} /> {tq.printTables}
          </button>
        }
      />

      <Card title={tq.linkTitle} description={tq.linkDesc} icon={Link2} className="no-print">
        <div className="copy-row">
          <div className="copy-field">
            <Link2 size={16} />
            <input readOnly value={restaurant.menuUrl} onFocus={(e) => e.target.select()} aria-label={tq.linkLabel} />
          </div>
          <button className="btn" onClick={copy}>
            <Copy size={16} /> {tq.copy}
          </button>
          <a className="btn" href={`/menu/${restaurant.slug}`} target="_blank" rel="noreferrer">
            <ExternalLink size={16} /> {tq.open}
          </a>
        </div>
        {restaurant.menuUrl.includes("localhost") && (
          <div className="alert alert-warn" style={{ marginTop: 14 }}>
            <TriangleAlert size={17} />
            <span>{tq.localhostWarn()}</span>
          </div>
        )}
      </Card>

      <div className="qr-layout">
        <Card title={tq.generalTitle} description={tq.generalDesc} icon={QrCode} className="qr-general">
          <TableCard restaurant={restaurant} />
          <button className="btn btn-block no-print" onClick={() => print("general")} style={{ marginTop: 14 }}>
            <Printer size={16} /> {tq.print}
          </button>
        </Card>

        <Card
          title={tq.tablesTitle}
          description={tq.tablesDesc}
          className="qr-tables"
          actions={
            <div className="stepper no-print" role="group" aria-label={tq.tableCount}>
              <button onClick={() => setCount((c) => Math.max(1, c - 1))} aria-label={tq.decrease} disabled={safeCount <= 1}>
                <Minus size={16} />
              </button>
              <input
                type="number"
                min={1}
                max={MAX_TABLES}
                value={count}
                onChange={(e) => setCount(Number(e.target.value) || 1)}
                aria-label={tq.tableCount}
              />
              <button
                onClick={() => setCount((c) => Math.min(MAX_TABLES, c + 1))}
                aria-label={tq.increase}
                disabled={safeCount >= MAX_TABLES}
              >
                <Plus size={16} />
              </button>
              <span>{tq.tablesUnit}</span>
            </div>
          }
        >
          <div className="table-grid">
            {tables.map((t) => (
              <TableCard key={t} restaurant={restaurant} table={t} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
