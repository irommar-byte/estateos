import { encryptSession, decryptSession } from '@/lib/sessionUtils';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dealId = searchParams.get('dealId');
    if (!dealId) return NextResponse.json({ error: 'Brak ID' }, { status: 400 });

    const messages = await prisma.dealMessage.findMany({
      where: { dealId: String(dealId) },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json(messages);
  } catch(e) { return NextResponse.json({ error: 'Błąd' }, { status: 500 }); }
}

export async function POST(req: Request) {
  try {
    const { dealId, text, attachmentUrl, attachmentType } = await req.json();
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('luxestate_user') || cookieStore.get('estateos_session');
    if (!sessionCookie) return NextResponse.json({ error: 'Brak autoryzacji' }, { status: 401 });

    let sessionData: any = {}; try { sessionData = decryptSession(sessionCookie.value); } catch(e) {}
    
    let senderId = sessionData.id;
    let senderName = sessionData.name || sessionData.email;

    if (!senderId && sessionData.email) {
      const u = await prisma.user.findFirst({ where: { email: sessionData.email } });
      if(u) { senderId = u.id; senderName = u.name; }
    }

    const message = await prisma.dealMessage.create({
      data: { dealId: String(dealId), senderId: String(senderId || sessionData.email), senderName: String(senderName), text: text || "", attachmentUrl, attachmentType }
    });

    return NextResponse.json({ success: true, message });
  } catch(e) { return NextResponse.json({ error: 'Błąd' }, { status: 500 }); }
}
