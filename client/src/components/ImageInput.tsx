import { useRef, useState } from "react";
import { errorMessage, uploadImage } from "../lib/api";

interface Props {
  value: string | null;
  onChange(url: string | null): void;
  label?: string;
}

export function ImageInput({ value, onChange, label = "Görsel" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
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

  return (
    <div className="field">
      <span>{label}</span>
      <div className="image-input">
        <div className="image-preview">{value ? <img src={value} alt="" /> : <span className="muted">Yok</span>}</div>
        <div className="image-actions">
          <button type="button" className="btn" onClick={() => inputRef.current?.click()} disabled={uploading}>
            {uploading ? "Yükleniyor…" : value ? "Değiştir" : "Görsel seç"}
          </button>
          {value && (
            <button type="button" className="btn btn-ghost" onClick={() => onChange(null)}>
              Kaldır
            </button>
          )}
          <small className="muted">JPG, PNG, WEBP · en fazla 5 MB</small>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        hidden
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {error && <p className="error">{error}</p>}
    </div>
  );
}
