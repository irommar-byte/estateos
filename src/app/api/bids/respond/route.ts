import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { bidId, status } = await req.json();
    const bid = await prisma.bid.update({
      where: { id: bidId },
      data: { status }
    });

    await prisma.notification.create({
      data: {
        userId: bid.buyerId,
        title: status === 'ACCEPTED' ? '✅ Oferta Zakupu Zaakceptowana!' : '❌ Oferta Zakupu Odrzucona',
        message: status === 'ACCEPTED' ? `Gratulacje! Właściciel zaakceptował Twoją ofertę zakupu (${bid.amount.toLocaleString('pl-PL')} PLN). Skontaktuj się w celu podpisania umowy.` : `Sprzedający odrzucił Twoją propozycję finansową. Możesz złożyć nową, wyższą ofertę.`,
        type: 'BID'
      }
    });

    return NextResponse.json({ success: true });
  } catch(e) {
    return NextResponse.json({ error: 'Błąd' }, { status: 500 });
  }
}
