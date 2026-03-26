import { encryptSession, decryptSession } from '@/lib/sessionUtils';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('luxestate_user') || cookieStore.get('estateos_session');

    if (!sessionCookie) return NextResponse.json({ error: 'Brak autoryzacji' }, { status: 401 });

    let sessionData: any = {};
    try { sessionData = decryptSession(sessionCookie.value); } catch(e) {}
    
    let dbUserId = sessionData.id;
    const email = sessionData.email || sessionCookie.value;

    if (email && String(email).includes('@')) {
       const u = await prisma.user.findFirst({ where: { email: String(email) } });
       if (u) dbUserId = u.id;
    }

    const finalUserId = dbUserId || email;

    // 1. Pobierz oferty użytkownika
    const myOffers = await prisma.offer.findMany({
      where: { userId: dbUserId }
    });
    const myOfferIds = myOffers.map(o => String(o.id));

    // 2. Pobierz spotkania (Appointments)
    const myAppointments = await prisma.appointment.findMany({
      where: {
        OR: [
          { sellerId: String(finalUserId) },
          { sellerId: String(email) },
          { buyerId: String(finalUserId) },
          { buyerId: String(email) },
          { offerId: { in: myOfferIds } }
        ]
      },
      orderBy: { proposedDate: 'asc' }
    });

    // 3. Pobierz oferty zakupu (Bids)
    const myLeadTransfers = await prisma.leadTransfer.findMany({
      where: {
        OR: [
          { agencyId: String(finalUserId) },
          { agencyId: String(email) },
          { ownerId: String(finalUserId) },
          { ownerId: String(email) }
        ]
      }
    });
    const myBids = await prisma.bid.findMany({
      where: {
        OR: [
          { sellerId: String(finalUserId) },
          { sellerId: String(email) },
          { buyerId: String(finalUserId) },
          { buyerId: String(email) },
          { offerId: { in: myOfferIds } }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    // 4. Zbierz unikalne kontakty counter-party
    const contactIds = new Set<string>();
    const contactEmails = new Set<string>();

    [...myAppointments, ...myBids].forEach(item => {
       if (item.buyerId !== String(finalUserId) && item.buyerId !== email) {
          if (item.buyerId.includes('@')) contactEmails.add(item.buyerId);
          else contactIds.add(item.buyerId);
       }
       if (item.sellerId !== String(finalUserId) && item.sellerId !== email) {
          if (item.sellerId.includes('@')) contactEmails.add(item.sellerId);
          else contactIds.add(item.sellerId);
       }
    });

    const contactsById = await prisma.user.findMany({
       where: { id: { in: Array.from(contactIds).map(Number).filter(n => !isNaN(n)) } },
       select: { id: true, name: true, email: true, phone: true, buyerType: true }
    });

    const contactsByEmail = await prisma.user.findMany({
       where: { email: { in: Array.from(contactEmails) } },
       select: { id: true, name: true, email: true, phone: true, buyerType: true }
    });

    const allContactsMap = new Map();
    [...contactsById, ...contactsByEmail].forEach(c => allContactsMap.set(c.id, c));

    // --- INJECT: POBIERANIE OFERT I OPINII DLA WIZYTÓWKI PUBLICZNEJ ---
    try {
        const baseContactIds = Array.from(allContactsMap.keys());
        const contactIdsAsNumbers = baseContactIds.map(id => Number(id)).filter(n => !isNaN(n));
        const contactIdsAsStrings = baseContactIds.map(String);
        
        const contactOffers = await prisma.offer.findMany({
            where: { userId: { in: contactIdsAsNumbers } },
            select: { id: true, title: true, userId: true }
        });
        
        const contactReviews = await prisma.review.findMany({
            where: { targetId: { in: contactIdsAsStrings } }
        });

        for (const [id, contact] of allContactsMap.entries()) {
            const strId = String(id);
            contact.publicOffers = contactOffers.filter(o => String(o.userId) === strId);
            const cReviews = contactReviews.filter(r => String(r.targetId) === strId);
            
            let sum = 0;
            let dist: Record<number, number> = {1:0, 2:0, 3:0, 4:0, 5:0};
            cReviews.forEach(r => { 
                sum += r.rating; 
                dist[r.rating] = (dist[r.rating] || 0) + 1; 
            });
            
            contact.reviewsData = {
                averageRating: cReviews.length > 0 ? sum / cReviews.length : 5.0,
                totalReviews: cReviews.length,
                distribution: dist,
                reviews: cReviews
            };
        }
    } catch(err) { console.error("Błąd pobierania danych profilowych:", err); }
    // ------------------------------------------------------------------

    return NextResponse.json({
      offers: myOffers,
      appointments: myAppointments,
      bids: myBids,
      contacts: Array.from(allContactsMap.values()),
      appointmentsCount: myAppointments.length + myBids.length + myLeadTransfers.length,
      leadTransfers: myLeadTransfers
    });
  } catch (error) {
    console.error("CRM Data Error:", error);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}
