const fs = require('fs');

// --- CZYSTY KOD BACKENDU CRM ---
const cleanRouteCode = `import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    let finalUserId = userId ? parseInt(userId) : null;
    
    if (!finalUserId && session?.user?.email) {
      const user = await prisma.user.findUnique({ where: { email: session.user.email } });
      if (user) finalUserId = user.id;
    }

    if (!finalUserId) {
      return NextResponse.json({ error: 'Brak autoryzacji lub ID użytkownika' }, { status: 401 });
    }

    // Pobranie ofert użytkownika (żeby wiedzieć co sprzedaje)
    const myOffers = await prisma.offer.findMany({
      where: { userId: finalUserId },
      select: { id: true, title: true, imageUrl: true }
    });
    
    const myOfferIds = myOffers.map(o => o.id);

    // 1. SPOTKANIA
    const appointments = await prisma.appointment.findMany({
      where: {
        OR: [
          { sellerId: finalUserId },
          { buyerId: finalUserId },
          { offerId: { in: myOfferIds } }
        ]
      },
      orderBy: { proposedDate: 'asc' }
    });

    // 2. LEADY
    const leads = await prisma.leadTransfer.findMany({
      where: {
        OR: [
          { agencyId: finalUserId },
          { ownerId: finalUserId }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    // 3. OFERTY CENOWE (BIDS)
    const bids = await prisma.bid.findMany({
      where: {
        OR: [
          { sellerId: finalUserId },
          { buyerId: finalUserId },
          { offerId: { in: myOfferIds } }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    // Zbieranie unikalnych ID kontaktów z kim handlujemy
    const contactIds = new Set<number>();
    
    appointments.forEach(item => {
      if (item.buyerId !== finalUserId) contactIds.add(item.buyerId);
      if (item.sellerId !== finalUserId) contactIds.add(item.sellerId);
    });
    
    bids.forEach(item => {
      if (item.buyerId !== finalUserId) contactIds.add(item.buyerId);
      if (item.sellerId !== finalUserId) contactIds.add(item.sellerId);
    });

    const contactsData = await prisma.user.findMany({
      where: { id: { in: Array.from(contactIds) } },
      select: { id: true, name: true, image: true, phone: true, buyerType: true, email: true }
    });

    return NextResponse.json({
      appointments,
      bids,
      leads,
      myOffers,
      contacts: contactsData
    });

  } catch (error) {
    console.error("CRM Data Error:", error);
    return NextResponse.json({ error: 'Błąd podczas pobierania danych CRM' }, { status: 500 });
  }
}
`;

fs.writeFileSync('src/app/api/crm/data/route.ts', cleanRouteCode);
console.log('✔ SUKCES: Odtworzono czysty kod API CRM (bez błędów NaN).');

// --- ZMIANA KOLORU NA POMARAŃCZOWY ---
const pagePath = 'src/app/moje-konto/crm/page.tsx';
if(fs.existsSync(pagePath)) {
    let pageCode = fs.readFileSync(pagePath, 'utf8');
    // Zmieniamy text-emerald-500 na text-amber-500 (pomarańcz/złoto jak teczka)
    pageCode = pageCode.replace(/{activeTab === 'transakcje' && <>Szyfrowane <span className="text-emerald-500">Deal Roomy<\/span><\/>}/, 
                                "{activeTab === 'transakcje' && <>Szyfrowane <span className=\"text-amber-500\">Deal Roomy</span></>}");
    fs.writeFileSync(pagePath, pageCode);
    console.log('✔ SUKCES: Kolor Deal Roomów zmieniony na pomarańczowy.');
}
