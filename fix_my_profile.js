const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const updatedUser = await prisma.user.update({
      where: { email: 'marian.romanienko@gmail.com' },
      data: { 
        name: 'Marian Romanienko',
        phone: '+48 883 040 044', // Wpisz tutaj swój prawdziwy numer
        isVerified: true
      }
    });
    console.log(`✅ PROFIL ZAKTUALIZOWANY!`);
    console.log(`Imię: ${updatedUser.name}`);
    console.log(`Telefon: ${updatedUser.phone}`);
    console.log(`Weryfikacja: ${updatedUser.isVerified}`);
  } catch (error) {
    console.log(`❌ BŁĄD:`, error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
