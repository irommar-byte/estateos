import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

// 🔥 W Next.js 15 params musi być zdefiniowane jako Promise
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // 🔥 Musimy "rozpakować" parametry za pomocą await
    const resolvedParams = await params;
    const userId = Number(resolvedParams.id);
    
    const body = await req.json();
    const { action } = body; // 'give' lub 'take'

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('estateos_session');
    
    // Prosta weryfikacja Admina
    if (!sessionCookie || !sessionCookie.value.includes('powiadomienia@estateos.pl')) {
         return NextResponse.json({ error: 'Brak uprawnień administratora' }, { status: 403 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        return NextResponse.json({ error: 'Użytkownik nie istnieje' }, { status: 404 });
    }

    let updatedData: any = {};

    if (action === 'give') {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // Ustawiamy na 30 dni
        updatedData = {
            isPro: true,
            planType: 'INVESTOR', // Domyślnie nadajemy Inwestora
            proExpiresAt: expiresAt
        };
    } else {
        updatedData = {
            isPro: false,
            planType: 'NONE',
            proExpiresAt: null
        };
    }

    await prisma.user.update({
        where: { id: userId },
        data: updatedData
    });

    return NextResponse.json({ success: true, isPro: updatedData.isPro });

  } catch (error: any) {
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}
