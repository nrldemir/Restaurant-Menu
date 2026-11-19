# EasyDine · Dijital Menü

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
- **Menü temaları:** 8 hazır renk paleti (Bordo & Altın, Lacivert & Altın, Nar, Safran, Zeytin, Ege, Mürdüm, Antrasit), kapak görseli ve logo; ayarlar sayfasında canlı önizleme.
- **Kullanım kolaylığı:** sürükle-bırak sıralama, görsel sürükle-bırak yükleme, bildirimler, açık/koyu mod, mobilde alt sekme çubuğu.

## Tasarım sistemi

Renkler, yazı tipleri ve gölgeler [client/src/styles/tokens.css](client/src/styles/tokens.css) içinde tanımlıdır:

- **Bordo** (`--bordo-50 … --bordo-950`) ana marka rengi, **Altın** (`--altin-*`, `--gold-gradient`) vurgu ve süslemeler, **Taş** fildişi/sıcak nötr tonlar. Koyu modda ana renk altındır.
- Başlıklar **Cormorant Garamond**, metinler **Plus Jakarta Sans** (paket olarak gömülü, harici istek yok).
- Logo: bordo zemin üzerinde üstten görülen tabak — tabağın şekli "e" harfini oluşturur — ve iki yanında altın çatal-bıçak; yazı "Easy" + kalın "Dine" — [Logo.tsx](client/src/components/Logo.tsx), [favicon.svg](client/public/favicon.svg). Altın süsleme ayıracı için `<Ornament />`.
- Menü temaları [client/src/lib/themes.ts](client/src/lib/themes.ts) içinde; yeni tema eklerken `server/src/lib/languages.ts` içindeki `THEMES` listesine de ekleyin.

## Telefondan test (iOS ve Android)

`server/.env` içinde `CLIENT_URL="auto"` iken sunucu bilgisayarın yerel ağ IP'sini kendisi bulur; menü linkleri ve QR kodlar bu adrese yönlenir. `npm run dev` çıktısında adres görünür:

```
[server] Telefondan test (aynı Wi-Fi): http://192.168.x.x:5173  ·  panel: http://192.168.x.x:5173/admin
```

1. Telefon bilgisayarla **aynı Wi‑Fi** ağında olmalı.
2. Panelde **QR Kodlar** sayfasındaki bir masa kodunu telefon kamerasıyla okutun veya adresi telefonun tarayıcısına yazın.
3. **Ana ekrana ekleme:** iPhone'da Safari → Paylaş → *Ana Ekrana Ekle*; Android'de Chrome → ⋮ → *Ana ekrana ekle*. Menü sayfasından eklenirse restoranın adı ve rengiyle, panelden eklenirse "EasyDine" olarak açılır.

Notlar: Windows ilk çalıştırmada Node.js için güvenlik duvarı izni sorar; izin vermezseniz telefon bağlanamaz. Android'in tam PWA kurulumu (çevrimdışı çalışma) HTTPS ister; yerel ağda http ile ana ekrana kısayol eklenir. Canlıda `CLIENT_URL`'i gerçek HTTPS alan adınız yapın.

## Süper admin

Tüm restoranları görmek ve yönetmek için `/super` paneli vardır: istatistikler, restoran listesi ve arama, menüyü açma, restoranın paneline şifresiz girme ("Open dashboard", 2 saatlik oturum), yayından kaldırma/yayına alma ve silme.

Güvenlik nedeniyle süper admin hesabı kayıt formundan açılamaz, sunucuda şu komutla oluşturulur:

```bash
npm run superadmin -w server -- admin@ornek.com            # rastgele şifre üretir ve gösterir
npm run superadmin -w server -- admin@ornek.com "uzun-sifre" # şifreyi siz belirleyin (en az 10 karakter)
```

Mevcut bir hesabın e-postası verilirse o hesap süper admin yapılır. Yetki her istekte veritabanından kontrol edilir.

## Demo veri

`npm run db:seed -w server` "Lokma Mutfak" demo restoranını 6 kategori, 21 ürün ve 3 dille (TR/EN/DE) yeniden oluşturur. Fotoğraflar `server/prisma/seed-images/` klasöründedir ve Wikimedia Commons'tan serbest lisanslarla alınmıştır; yazar ve lisanslar [CREDITS.md](server/prisma/seed-images/CREDITS.md) dosyasında ve uygulamadaki `/kaynaklar` sayfasındadır.

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
