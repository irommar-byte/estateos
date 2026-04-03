import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { encryptSession } from '@/lib/sessionUtils';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name, phone, role } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Brak danych' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({
      where: { email }
    });

    if (existing) {
      return NextResponse.json({ error: 'Użytkownik istnieje' }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        name,
        phone,
        role: role || 'BUYER'
      }
    });

    const session = encryptSession({ id: user.id });

    const res = NextResponse.json({ success: true });

    res.cookies.set('estateos_session', session, {
      httpOnly: true,
      path: '/',
    });

    return res;

  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
