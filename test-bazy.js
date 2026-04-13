const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function sprawdz() {
  console.log("🕵️  Szukam użytkownika w bazie...");
  const user = await prisma.user.findUnique({ where: { email: 'irommar@icloud.com' } });
  
  if (!user) {
    console.log("❌ BŁĄD: Nie ma takiego maila w bazie MySQL!");
    return;
  }
  
  console.log(`✅ Znaleziono: ${user.email} (Rola: ${user.role})`);
  
  const isValid = await bcrypt.compare('111111', user.password);
  console.log(`🛡️  Test hasła (bcrypt): ${isValid ? 'ZGODNE (TRUE) 🎉' : 'NIEZGODNE (FALSE) ❌'}`);
  
  console.log("\n🔍 Sprawdzam klucze w pliku .env...");
  const fs = require('fs');
  const envFile = fs.existsSync('.env') ? fs.readFileSync('.env', 'utf8') : '';
  
  if (!envFile.includes('NEXTAUTH_SECRET')) console.log("⚠️ BRAK NEXTAUTH_SECRET w pliku .env!");
  else console.log("✅ NEXTAUTH_SECRET istnieje.");
  
  if (!envFile.includes('NEXTAUTH_URL')) console.log("⚠️ BRAK NEXTAUTH_URL w pliku .env!");
  else console.log("✅ NEXTAUTH_URL istnieje.");
}

sprawdz().finally(() => prisma.$disconnect());
