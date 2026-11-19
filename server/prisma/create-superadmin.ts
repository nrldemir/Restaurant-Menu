/**
 * Süper admin hesabı oluşturur veya mevcut bir hesabı süper admin yapar.
 * Güvenlik için kayıt formundan değil, sadece bu komutla oluşturulabilir.
 *
 *   npm run superadmin -w server -- <email> [şifre]
 *
 * Şifre verilmezse güçlü rastgele bir şifre üretilir ve ekrana yazılır.
 * Hesap zaten varsa rolü süper admin yapılır; şifre verildiyse şifresi de güncellenir.
 */
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const [rawEmail, givenPassword] = process.argv.slice(2);
  const email = rawEmail?.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error("Kullanım: npm run superadmin -w server -- <email> [şifre]");
    process.exit(1);
  }
  if (givenPassword && givenPassword.length < 10) {
    console.error("Süper admin şifresi en az 10 karakter olmalı.");
    process.exit(1);
  }

  const password = givenPassword ?? crypto.randomBytes(12).toString("base64url");
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        role: "superadmin",
        ...(givenPassword ? { passwordHash: await bcrypt.hash(password, 10) } : {}),
      },
    });
    console.log(`"${email}" artık süper admin.${givenPassword ? " Şifresi güncellendi." : " Mevcut şifresi değişmedi."}`);
  } else {
    await prisma.user.create({
      data: { email, passwordHash: await bcrypt.hash(password, 10), role: "superadmin" },
    });
    console.log(`Süper admin oluşturuldu: ${email}`);
    if (!givenPassword) console.log(`Şifre: ${password}  (bir yere kaydedin, tekrar gösterilmez)`);
  }
  console.log("Giriş yaptıktan sonra /super adresinden yönetim paneline ulaşabilirsiniz.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
