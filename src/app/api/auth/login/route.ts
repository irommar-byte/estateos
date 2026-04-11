import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { encryptSession } from '@/lib/sessionUtils';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Brak danych' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return NextResponse.json({ success: false, message: 'Błędne dane logowania' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!user.password.startsWith("$2b$")) {
      const newHash = await bcrypt.hash(password, 10);
      await prisma.user.update({ where: { id: user.id }, data: { password: newHash } });
    }

    if (!isValid) {
      return NextResponse.json({ success: false, message: 'Błędne dane logowania' }, { status: 401 });
    }

    const session = encryptSession({ id: user.id, email: user.email, role: user.role || 'USER' });
    
    // Bezpieczne ustawianie ciasteczek
    (await cookies()).set('estateos_session', session, { httpOnly: true, path: '/' });

    return NextResponse.json({ 
      success: true, 
      token: session, 
      role: user.role || 'USER', 
      name: user.name, 
      id: user.id 
    });

  } catch (e: any) {
    console.error("🔥 BŁĄD LOGOWANIA:", e);
    return NextResponse.json({ success: false, message: e.message || String(e) }, { status: 500 });
  }
}
