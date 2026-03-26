import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkAppointments() {
   try {
       const apps = await prisma.appointment.findMany({
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: { 
              id: true, 
              offerId: true, 
              status: true, 
              proposedDate: true, 
              buyerId: true 
          }
       });
       
       console.log("\n🏓 --- RADAR NEGOCJACJI: OSTATNIE 5 SPOTKAŃ W BAZIE ---");
       if (apps.length === 0) {
           console.log("Brak spotkań w bazie danych.");
       } else {
           console.table(apps.map(app => ({
               "ID Spotkania": app.id,
               "ID Oferty": app.offerId,
               "Status API": app.status,
               "Data Propozycji": app.proposedDate.toLocaleString('pl-PL'),
               "Kupujący (ID/Email)": app.buyerId
           })));
       }
   } catch(e) {
       console.error("Błąd odczytu bazy:", e.message);
   } finally {
       await prisma.$disconnect();
   }
}

checkAppointments();
