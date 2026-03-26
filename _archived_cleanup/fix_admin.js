const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: 'admin@estateos.pl' },
    update: { role: 'ADMIN', password: 'admin123' },
    create: { 
      email: 'admin@estateos.pl', 
      password: 'admin123', 
      role: 'ADMIN', 
      name: 'Główny Administrator' 
    }
  });
  console.log('✅ Konto Admina gotowe!');
  console.log('👉 Login: ' + admin.email);
  console.log('👉 Hasło: ' + admin.password);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
