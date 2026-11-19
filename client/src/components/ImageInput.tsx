import { useRef, useState, type DragEvent } from "react";
import { ImagePlus, LoaderCircle, RefreshCw, Trash2 } from "lucide-react";
import { errorMessage, uploadImage } from "../lib/api";

interface Props {
  value: string | null;
  onChange(url: string | null): void;
  label?: string;
  hint?: string;
  /** square: logo, wide: kapak, photo: ürün */
  shape?: "square" | "wide" | "photo";
}

export function ImageInput({ value, onChange, label = "Görsel", hint, shape = "photo" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Lütfen bir görsel dosyası seçin");
      return;
    }
    setError(null);
    setUploading(true);
    try {
      onChange(await uploadImage(file));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  }

  const open = () => inputRef.current?.click();

  return (
    <div className="field">
      <span className="field-label">{label}</span>
      <div
        className={`dropzone dropzone-${shape}${dragOver ? " over" : ""}${value ? " has-image" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        {value ? (
          <>
            <img src={value} alt="" />
            <div className="dropzone-actions">
              <button type="button" className="chip-btn" onClick={open} disabled={uploading}>
                <RefreshCw size={14} /> Değiştir
              </button>
              <button type="button" className="chip-btn" onClick={() => onChange(null)} disabled={uploading}>
                <Trash2 size={14} /> Kaldır
              </button>
            </div>
          </>
        ) : (
          <button type="button" className="dropzone-empty" onClick={open} disabled={uploading}>
            {uploading ? <LoaderCircle size={24} className="spin" /> : <ImagePlus size={24} strokeWidth={1.75} />}
            <strong>{uploading ? "Yükleniyor…" : "Görsel yükle"}</strong>
            {!uploading && <small>Sürükleyip bırakın veya tıklayın</small>}
          </button>
        )}
        {uploading && value && (
          <div className="dropzone-loading">
            <LoaderCircle size={24} className="spin" />
          </div>
        )}
      </div>
      <small className="field-hint">{hint ?? "JPG, PNG veya WEBP · en fazla 5 MB"}</small>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        hidden
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
