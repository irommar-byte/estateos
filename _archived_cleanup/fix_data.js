const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clean() {
  console.log('🚀 Rozpoczynam czyszczenie bazy...');
  // Usuwa oferty, które nie mają przypisanego maila właściciela lub mają status null
  const deleted = await prisma.offer.deleteMany({
    where: {
      OR: [
        { email: "" },
        { contactPhone: "" },
        { title: "" }
      ]
    }
  });
  console.log(`✅ Usunięto ${deleted.count} uszkodzonych rekordów.`);
  process.exit(0);
}
clean();
