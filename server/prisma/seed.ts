import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SLUG = "demo-restoran";
const EMAIL = "demo@example.com";
const IMAGES_DIR = path.resolve(__dirname, "seed-images");
const UPLOAD_DIR = path.resolve(__dirname, "../uploads");

/** [isim, açıklama] — tr / en / de */
type T = Record<"tr" | "en" | "de", [string, string?]>;
type Item = { t: T; price: number; image?: string; available?: boolean };

const MENU: { category: T; items: Item[] }[] = [
  {
    category: {
      tr: ["Kahvaltı", "Her gün 08:00 – 13:00 arası"],
      en: ["Breakfast", "Served daily 8 am – 1 pm"],
      de: ["Frühstück", "Täglich von 8 bis 13 Uhr"],
    },
    items: [
      {
        image: "serpme",
        price: 1450,
        t: {
          tr: ["Serpme Kahvaltı", "2 kişilik. Beyaz peynir, kaşar, zeytin çeşitleri, bal-kaymak, ev reçelleri, domates-salatalık, sıcak pişi ve sınırsız çay"],
          en: ["Turkish Breakfast Spread", "For two. Feta, kashar cheese, olives, honey with clotted cream, homemade jams, tomatoes, cucumbers, warm fried dough and bottomless tea"],
          de: ["Türkisches Frühstück", "Für zwei. Schafskäse, Kaşar, Oliven, Honig mit Rahm, hausgemachte Marmeladen, Tomaten, Gurken, warmes Fladengebäck und Tee nach Belieben"],
        },
      },
      {
        image: "menemen",
        price: 320,
        t: {
          tr: ["Menemen", "Bakır sahanda domates, sivri biber ve köy yumurtası"],
          en: ["Menemen", "Tomatoes, green peppers and free-range eggs in a copper pan"],
          de: ["Menemen", "Tomaten, grüne Paprika und Landeier in der Kupferpfanne"],
        },
      },
      {
        image: "sucuk",
        price: 360,
        t: {
          tr: ["Sucuklu Yumurta", "Afyon sucuğu ve iki köy yumurtası, tereyağında"],
          en: ["Eggs with Sucuk", "Spiced Turkish beef sausage with two free-range eggs, cooked in butter"],
          de: ["Eier mit Sucuk", "Würzige türkische Rindswurst mit zwei Landeiern, in Butter gebraten"],
        },
      },
      {
        image: "simit",
        price: 45,
        t: {
          tr: ["Simit", "Taş fırından çıtır, bol susamlı"],
          en: ["Simit", "Crispy sesame bread ring from the stone oven"],
          de: ["Simit", "Knuspriger Sesamring aus dem Steinofen"],
        },
      },
    ],
  },
  {
    category: {
      tr: ["Çorba & Mezeler"],
      en: ["Soups & Starters"],
      de: ["Suppen & Vorspeisen"],
    },
    items: [
      {
        image: "mercimek",
        price: 180,
        t: {
          tr: ["Mercimek Çorbası", "Kırmızı mercimek, tereyağında pul biber ve limon ile"],
          en: ["Red Lentil Soup", "With chili butter and a squeeze of lemon"],
          de: ["Rote Linsensuppe", "Mit Chilibutter und Zitrone"],
        },
      },
      {
        image: "humus",
        price: 220,
        t: {
          tr: ["Humus", "Nohut, tahin, sızma zeytinyağı ve kimyon"],
          en: ["Hummus", "Chickpeas, tahini, extra virgin olive oil and cumin"],
          de: ["Hummus", "Kichererbsen, Tahini, natives Olivenöl und Kreuzkümmel"],
        },
      },
      {
        image: "sigara",
        price: 240,
        t: {
          tr: ["Sigara Böreği", "Beyaz peynirli ve maydanozlu çıtır börek, 6 adet"],
          en: ["Cheese Rolls", "Crispy filo rolls with feta and parsley, 6 pieces"],
          de: ["Käseröllchen", "Knusprige Yufka-Röllchen mit Schafskäse und Petersilie, 6 Stück"],
        },
      },
      {
        image: "ezme",
        price: 190,
        t: {
          tr: ["Acılı Ezme", "Elde doğranmış domates, biber ve soğan, nar ekşisi ile"],
          en: ["Spicy Ezme", "Hand-chopped tomatoes, peppers and onion with pomegranate molasses"],
          de: ["Scharfe Ezme", "Handgehackte Tomaten, Paprika und Zwiebeln mit Granatapfelsirup"],
        },
      },
    ],
  },
  {
    category: {
      tr: ["Izgaralar", "Tüm etlerimiz odun kömüründe pişer"],
      en: ["From the Grill", "All our meats are cooked over charcoal"],
      de: ["Vom Grill", "Alle Fleischgerichte über Holzkohle gegrillt"],
    },
    items: [
      {
        image: "adana",
        price: 620,
        t: {
          tr: ["Adana Kebap", "Zırhta çekilmiş acılı kuzu eti, közlenmiş domates ve biber, lavaş, sumaklı soğan"],
          en: ["Adana Kebab", "Hand-minced spicy lamb, charred tomatoes and peppers, lavash and sumac onions"],
          de: ["Adana Kebap", "Handgehacktes, scharfes Lammfleisch, gegrillte Tomaten und Paprika, Lavash und Sumach-Zwiebeln"],
        },
      },
      {
        image: "iskender",
        price: 680,
        t: {
          tr: ["İskender", "Pide üzerinde yaprak döner, domates sosu, kızgın tereyağı ve yoğurt"],
          en: ["Iskender", "Sliced döner on pide bread with tomato sauce, sizzling butter and yogurt"],
          de: ["Iskender", "Döner auf Fladenbrot mit Tomatensauce, heißer Butter und Joghurt"],
        },
      },
      {
        image: "kofte",
        price: 540,
        t: {
          tr: ["Izgara Köfte", "Dana köfte, tereyağlı pilav ve közlenmiş biber"],
          en: ["Grilled Meatballs", "Beef köfte with buttered rice and charred peppers"],
          de: ["Gegrillte Köfte", "Rinderfrikadellen mit Butterreis und gegrillter Paprika"],
        },
      },
      {
        image: "tavuk",
        price: 480,
        t: {
          tr: ["Tavuk Şiş", "Yoğurtlu marine tavuk göğsü, bulgur pilavı ve közlenmiş sebze"],
          en: ["Chicken Shish", "Yogurt-marinated chicken breast with bulgur pilaf and grilled vegetables"],
          de: ["Hähnchenspieß", "In Joghurt marinierte Hähnchenbrust mit Bulgur und Grillgemüse"],
        },
      },
    ],
  },
  {
    category: {
      tr: ["Pide & Lahmacun", "Odun ateşinde, taş fırında"],
      en: ["Pide & Lahmacun", "Baked in our wood-fired oven"],
      de: ["Pide & Lahmacun", "Aus dem Holzofen"],
    },
    items: [
      {
        image: "lahmacun",
        price: 160,
        t: {
          tr: ["Lahmacun", "İncecik hamur, baharatlı kıyma; maydanoz ve limon ile"],
          en: ["Lahmacun", "Thin flatbread with spiced minced meat, served with parsley and lemon"],
          de: ["Lahmacun", "Dünnes Fladenbrot mit gewürztem Hackfleisch, dazu Petersilie und Zitrone"],
        },
      },
      {
        image: "pide",
        price: 420,
        t: {
          tr: ["Kaşarlı Kıymalı Pide", "Dana kıyma ve bol kaşar peyniri"],
          en: ["Minced Meat & Cheese Pide", "Beef mince and melted kashar cheese"],
          de: ["Pide mit Hackfleisch & Käse", "Rinderhack und geschmolzener Kaşar-Käse"],
        },
      },
    ],
  },
  {
    category: {
      tr: ["Tatlılar"],
      en: ["Desserts"],
      de: ["Desserts"],
    },
    items: [
      {
        image: "kunefe",
        price: 290,
        t: {
          tr: ["Künefe", "Hatay peyniri, tel kadayıf ve Antep fıstığı; sıcak servis"],
          en: ["Künefe", "Shredded pastry with melted cheese and pistachios, served hot"],
          de: ["Künefe", "Engelshaar-Teig mit geschmolzenem Käse und Pistazien, heiß serviert"],
        },
      },
      {
        image: "baklava",
        price: 340,
        t: {
          tr: ["Fıstıklı Baklava", "El açması yufka ve bol Antep fıstığı, 4 dilim"],
          en: ["Pistachio Baklava", "Hand-rolled filo with plenty of pistachios, 4 pieces"],
          de: ["Pistazien-Baklava", "Handgezogener Yufka-Teig mit viel Pistazie, 4 Stück"],
        },
      },
      {
        image: "sutlac",
        price: 190,
        available: false,
        t: {
          tr: ["Fırın Sütlaç", "Toprak kapta fırınlanmış, üzeri karamelize"],
          en: ["Baked Rice Pudding", "Oven-baked in a clay pot with a caramelized top"],
          de: ["Gebackener Milchreis", "Im Tontopf gebacken, mit karamellisierter Haube"],
        },
      },
    ],
  },
  {
    category: {
      tr: ["İçecekler"],
      en: ["Drinks"],
      de: ["Getränke"],
    },
    items: [
      {
        image: "cay",
        price: 35,
        t: {
          tr: ["Çay", "İnce belli bardakta, demlikten taze"],
          en: ["Turkish Tea", "Freshly brewed, served in a tulip glass"],
          de: ["Türkischer Tee", "Frisch aufgebrüht, im Tulpenglas serviert"],
        },
      },
      {
        image: "kahve",
        price: 110,
        t: {
          tr: ["Türk Kahvesi", "Közde pişmiş, lokum eşliğinde"],
          en: ["Turkish Coffee", "Cooked on hot coals, served with Turkish delight"],
          de: ["Türkischer Mokka", "Auf heißer Glut zubereitet, mit Lokum"],
        },
      },
      {
        image: "ayran",
        price: 70,
        t: {
          tr: ["Yayık Ayranı", "Bakır maşrapada, bol köpüklü"],
          en: ["Frothy Ayran", "Salted yogurt drink in a copper mug"],
          de: ["Ayran", "Schaumiges Joghurtgetränk im Kupferbecher"],
        },
      },
      {
        price: 120,
        t: {
          tr: ["Ev Yapımı Limonata", "Taze sıkılmış limon ve nane"],
          en: ["Homemade Lemonade", "Freshly squeezed lemons and mint"],
          de: ["Hausgemachte Limonade", "Frisch gepresste Zitronen und Minze"],
        },
      },
    ],
  },
];

function rows(t: T) {
  return (["tr", "en", "de"] as const).map((lang) => ({
    lang,
    name: t[lang][0],
    description: t[lang][1] ?? null,
  }));
}

/** seed-images/<name>.jpg dosyasını uploads/ klasörüne kopyalar, /uploads/... adresini döner. */
function copyImage(name: string) {
  const src = path.join(IMAGES_DIR, `${name}.jpg`);
  if (!fs.existsSync(src)) return null;
  const file = `${crypto.randomUUID()}.jpg`;
  fs.copyFileSync(src, path.join(UPLOAD_DIR, file));
  return `/uploads/${file}`;
}

function removeUpload(url: string | null) {
  if (!url?.startsWith("/uploads/")) return;
  fs.rmSync(path.join(UPLOAD_DIR, path.basename(url)), { force: true });
}

async function main() {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });

  // Önceki demo verisini ve görsellerini temizle
  const old = await prisma.restaurant.findUnique({
    where: { slug: SLUG },
    include: { products: { select: { imageUrl: true } } },
  });
  if (old) {
    [old.logoUrl, old.coverUrl, ...old.products.map((p) => p.imageUrl)].forEach(removeUpload);
    await prisma.restaurant.delete({ where: { id: old.id } });
  }
  await prisma.user.deleteMany({ where: { email: EMAIL } });

  const restaurant = await prisma.restaurant.create({
    data: {
      slug: SLUG,
      name: "Lokma Mutfak",
      description: "Odun ateşinde geleneksel Anadolu lezzetleri",
      coverUrl: copyImage("cover"),
      theme: "bordo",
      currency: "TRY",
      languages: "tr,en,de",
      defaultLanguage: "tr",
      users: { create: { email: EMAIL, passwordHash: await bcrypt.hash("demo1234", 10) } },
    },
  });

  let count = 0;
  for (const [ci, section] of MENU.entries()) {
    await prisma.category.create({
      data: {
        restaurantId: restaurant.id,
        sortOrder: ci,
        translations: { create: rows(section.category) },
        products: {
          create: section.items.map((item, pi) => ({
            restaurantId: restaurant.id,
            price: item.price,
            imageUrl: item.image ? copyImage(item.image) : null,
            isAvailable: item.available ?? true,
            sortOrder: pi,
            translations: { create: rows(item.t) },
          })),
        },
      },
    });
    count += section.items.length;
  }

  console.log(`Demo veri oluşturuldu: ${MENU.length} kategori, ${count} ürün (tr, en, de).`);
  console.log(`  Menü:  /menu/${SLUG}`);
  console.log(`  Giriş: ${EMAIL} / demo1234`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
