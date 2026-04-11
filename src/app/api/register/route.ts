import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { encryptSession } from '@/lib/sessionUtils';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Brak danych' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ success: false, message: 'Konto już istnieje' }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        name: name || "Użytkownik",
        role: "USER"
      }
    });

    const session = encryptSession({ id: user.id, email: user.email, role: user.role || 'USER' });
    
    // Bezpieczne ustawianie ciasteczek w nowym Next.js
    (await cookies()).set('estateos_session', session, { httpOnly: true, path: '/' });

    return NextResponse.json({ 
      success: true, 
      token: session, 
      role: user.role || 'USER', 
      name: user.name, 
      id: user.id 
    });

  } catch (e: any) {
    console.error("🔥 BŁĄD REJESTRACJI:", e);
    return NextResponse.json({ success: false, message: e.message || String(e) }, { status: 500 });
  }
}
