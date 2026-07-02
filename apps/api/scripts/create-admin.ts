import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const email = process.argv[2] ?? process.env.ADMIN_EMAIL;
const password = process.argv[3] ?? process.env.ADMIN_PASSWORD;

async function main() {
  if (!email || !password) {
    console.error("Uso: npm run create-admin -- <email> <password>");
    console.error("     (ou define ADMIN_EMAIL e ADMIN_PASSWORD no ambiente)");
    process.exit(1);
  }
  if (password.length < 6) {
    console.error("A palavra-passe precisa de pelo menos 6 caracteres.");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const admin = await prisma.admin.upsert({
    where: { email: email.toLowerCase() },
    update: { passwordHash },
    create: { email: email.toLowerCase(), passwordHash },
  });

  console.log(`Conta pronta: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
