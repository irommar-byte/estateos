import { encryptSession, decryptSession } from '@/lib/sessionUtils';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const cleanInput = email.replace(/\s+/g, '');
    const isPhone = /^\+?[0-9]{7,15}$/.test(cleanInput);
    const phoneFormatted = isPhone ? cleanInput.replace(/\D/g, '') : null;
    const finalPhone = phoneFormatted ? (phoneFormatted.startsWith('48') ? phoneFormatted : '48' + phoneFormatted) : null;

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.trim().toLowerCase() },
          { phone: finalPhone || 'impossible_value' }
        ]
      }
    });

    // Pamiętaj: w przyszłości dodamy tu bcrypt do szyfrowania haseł
    if (!user || user.password !== password) {
      return NextResponse.json({ success: false, message: "Błędne dane logowania" }, { status: 401 });
    }

    const cookieStore = await cookies();
    
    // Zapisujemy inteligentny pakiet w sesji zamiast samego tekstu
    const sessionPayload = encryptSession({ id: user.id, email: user.email, role: user.role });
    
    cookieStore.set('estateos_session', sessionPayload, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Wymusza HTTPS na produkcji
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 dni
      path: '/',
    });

    return NextResponse.json({ 
      success: true, 
      role: user.role,
      name: user.name 
    });

  } catch (error) {
    return NextResponse.json({ success: false, message: "Błąd serwera" }, { status: 500 });
  }
}
