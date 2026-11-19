# Lokma · Dijital Menü

Restoranlar için çok dilli, QR kodlu dijital menü platformu. Her restoran kendi hesabıyla menüsünü yönetir ve menüsü `/menu/<link-adı>` adresinde yayınlanır.

- **Frontend:** React 19 + Vite + TypeScript (`client/`)
- **Backend:** Node.js + Express 5 + TypeScript + Prisma + SQLite (`server/`)

## Kurulum

```bash
npm install
cp server/.env.example server/.env   # JWT_SECRET değerini değiştirin
npm run db:setup                     # veritabanını oluşturur + demo veri yükler
npm run dev                          # API :4000, arayüz :5173
```

Ardından:

| Adres | Açıklama |
| --- | --- |
| http://localhost:5173 | Ana sayfa |
| http://localhost:5173/menu/demo-restoran | Demo menü (müşteri görünümü) |
| http://localhost:5173/admin | Yönetim paneli (`demo@example.com` / `demo1234`) |

## Özellikler

- **Çoklu restoran:** kayıt olan her kullanıcı kendi restoranını oluşturur; veriler restoranlar arasında izoledir.
- **Yönetim paneli:** kategori/ürün ekleme, düzenleme, silme, sıralama; kategori gizleme; ürünü "tükendi" işaretleme.
- **Çoklu dil:** restoran 8 dile kadar seçebilir (TR, EN, DE, FR, ES, IT, RU, AR — Arapça sağdan sola). Çevirisi olmayan içerikte varsayılan dil gösterilir. Müşteri menüde dili değiştirebilir; tarayıcı dili otomatik algılanır.
- **Görseller:** ürün fotoğrafı ve restoran logosu yükleme (JPG/PNG/WEBP/GIF, en fazla 5 MB) — `server/uploads/` klasörüne kaydedilir.
- **QR kod:** genel menü QR'ı ve masaya özel, restoranın temasıyla tasarlanmış yazdırılabilir masa kartları (PNG/SVG indirme). Masa QR'ı okutulunca menüde masa numarası görünür.
- **Menü temaları:** 6 hazır renk paleti (Nar, Safran, Zeytin, Ege, Mürdüm, Antrasit), kapak görseli ve logo; ayarlar sayfasında canlı önizleme.
- **Kullanım kolaylığı:** sürükle-bırak sıralama, görsel sürükle-bırak yükleme, bildirimler, açık/koyu mod, mobilde alt sekme çubuğu.

## Tasarım sistemi

Renkler, yazı tipleri ve gölgeler [client/src/styles/tokens.css](client/src/styles/tokens.css) içinde tanımlıdır:

- **Nar** (`--nar-50 … --nar-900`) ana marka rengi, **Safran** vurgu, **Taş** sıcak nötr tonlar.
- Başlıklar **Fraunces**, metinler **Plus Jakarta Sans** (paket olarak gömülü, harici istek yok).
- Menü temaları [client/src/lib/themes.ts](client/src/lib/themes.ts) içinde; yeni tema eklerken `server/src/lib/languages.ts` içindeki `THEMES` listesine de ekleyin.

## Telefonla test

QR kodlar `server/.env` içindeki `CLIENT_URL` adresine yönlenir. Varsayılan `localhost` telefondan açılmaz; aynı Wi‑Fi'deki bir telefonla denemek için bilgisayarınızın yerel IP'sini yazın (Vite başlarken "Network" satırında görünür), örn.:

```
CLIENT_URL="http://192.168.1.20:5173"
```

## Komutlar

| Komut | Ne yapar |
| --- | --- |
| `npm run dev` | API ve arayüzü birlikte geliştirme modunda başlatır |
| `npm run build` | Her iki tarafı production için derler |
| `npm run typecheck` | TypeScript tip kontrolü |
| `npm run db:setup` | Şemayı veritabanına uygular ve demo veriyi yükler |
| `npm run db:studio -w server` | Prisma Studio ile veritabanını tarayıcıda açar |

## API özeti

| Metot | Yol | Yetki |
| --- | --- | --- |
| POST | `/api/auth/register`, `/api/auth/login` | — |
| GET | `/api/auth/me` | Token |
| GET | `/api/public/restaurants/:slug/menu` | — |
| GET | `/api/public/restaurants/:slug/qr?table=&format=png\|svg&download=1` | — |
| GET/PUT | `/api/admin/restaurant` | Token |
| GET/POST, PUT/DELETE `:id`, PUT `reorder` | `/api/admin/categories` | Token |
| GET/POST, PUT/DELETE `:id`, PUT `reorder` | `/api/admin/products` | Token |
| POST | `/api/admin/uploads` (multipart, alan: `image`) | Token |

## Canlıya alırken

- `JWT_SECRET` için uzun rastgele bir değer kullanın, `CLIENT_URL`'i gerçek alan adınız yapın.
- SQLite tek sunucu için yeterlidir; büyürseniz `schema.prisma` içinde `provider = "postgresql"` yaparak PostgreSQL'e geçebilirsiniz.
- `server/uploads/` klasörünü kalıcı bir diske bağlayın (veya ileride S3 gibi bir depolamaya taşıyın).
