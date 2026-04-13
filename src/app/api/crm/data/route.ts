import { decryptSession } from "@/lib/sessionUtils";
import { cookies } from "next/headers";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

 

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("estateos_session");

    if (!sessionCookie) {
      return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
    }

    let emailToSearch = sessionCookie.value;

    try {
      const parsedSession = decryptSession(sessionCookie.value);
      if (parsedSession && parsedSession.email) {
        emailToSearch = parsedSession.email;
      }
    } catch (e) {}

    const user = await prisma.user.findUnique({
      where: { email: emailToSearch }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const finalUserId = user.id;

    // OFERTY
    const myOffers = await prisma.offer.findMany({
      where: { userId: finalUserId },
      orderBy: { createdAt: 'desc' }
    });

    const myOfferIds = myOffers.map(o => o.id);

    // SPOTKANIA
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

    // LEADY
    const leads = await prisma.leadTransfer.findMany({
      where: {
        OR: [
          { agencyId: finalUserId },
          { ownerId: finalUserId }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    // BIDS
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

    // KONTAKTY
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
      offers: myOffers,
      contacts: contactsData
    });

  } catch (error) {
    console.error("CRM Data Error:", error);
    return NextResponse.json({ error: 'Błąd podczas pobierania danych CRM' }, { status: 500 });
  }
}
