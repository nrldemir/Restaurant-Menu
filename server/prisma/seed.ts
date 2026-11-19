import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type T = { tr: [string, string?]; en: [string, string?] };

const menu: { category: T; products: { t: T; price: number; available?: boolean }[] }[] = [
  {
    category: { tr: ["Kahvaltı"], en: ["Breakfast"] },
    products: [
      { t: { tr: ["Serpme Kahvaltı", "2 kişilik, peynir çeşitleri, zeytin, bal-kaymak, sıcaklar"], en: ["Turkish Breakfast Spread", "For two: cheeses, olives, honey & clotted cream, hot dishes"] }, price: 850 },
      { t: { tr: ["Menemen", "Domates, biber ve yumurta"], en: ["Menemen", "Tomatoes, peppers and eggs"] }, price: 220 },
      { t: { tr: ["Sucuklu Yumurta"], en: ["Eggs with Sucuk", "Turkish spicy sausage"] }, price: 260 },
    ],
  },
  {
    category: { tr: ["Ana Yemekler"], en: ["Main Courses"] },
    products: [
      { t: { tr: ["Adana Kebap", "Közlenmiş domates ve biber, lavaş ile"], en: ["Adana Kebab", "With grilled tomatoes, peppers and lavash"] }, price: 480 },
      { t: { tr: ["Izgara Köfte", "Pilav ve salata ile"], en: ["Grilled Meatballs", "Served with rice and salad"] }, price: 420 },
      { t: { tr: ["İskender", "Tereyağı ve yoğurt ile"], en: ["Iskender", "With butter and yogurt"] }, price: 520, available: false },
    ],
  },
  {
    category: { tr: ["Tatlılar"], en: ["Desserts"] },
    products: [
      { t: { tr: ["Künefe", "Antep fıstıklı"], en: ["Kunefe", "With pistachios"] }, price: 240 },
      { t: { tr: ["Sütlaç"], en: ["Rice Pudding"] }, price: 150 },
    ],
  },
  {
    category: { tr: ["İçecekler"], en: ["Drinks"] },
    products: [
      { t: { tr: ["Çay"], en: ["Turkish Tea"] }, price: 30 },
      { t: { tr: ["Türk Kahvesi"], en: ["Turkish Coffee"] }, price: 90 },
      { t: { tr: ["Ayran"], en: ["Ayran", "Salted yogurt drink"] }, price: 50 },
    ],
  },
];

function rows(t: T) {
  return (["tr", "en"] as const).map((lang) => ({
    lang,
    name: t[lang][0],
    description: t[lang][1] ?? null,
  }));
}

async function main() {
  const email = "demo@example.com";
  await prisma.restaurant.deleteMany({ where: { slug: "demo-restoran" } });
  await prisma.user.deleteMany({ where: { email } });

  const restaurant = await prisma.restaurant.create({
    data: {
      slug: "demo-restoran",
      name: "Demo Restoran",
      description: "Geleneksel lezzetler, modern sunum.",
      currency: "TRY",
      languages: "tr,en",
      defaultLanguage: "tr",
      users: { create: { email, passwordHash: await bcrypt.hash("demo1234", 10) } },
    },
  });

  for (const [ci, section] of menu.entries()) {
    await prisma.category.create({
      data: {
        restaurantId: restaurant.id,
        sortOrder: ci,
        translations: { create: rows(section.category) },
        products: {
          create: section.products.map((p, pi) => ({
            restaurantId: restaurant.id,
            price: p.price,
            isAvailable: p.available ?? true,
            sortOrder: pi,
            translations: { create: rows(p.t) },
          })),
        },
      },
    });
  }

  console.log("Demo veri oluşturuldu.");
  console.log("  Menü:  /menu/demo-restoran");
  console.log(`  Giriş: ${email} / demo1234`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
