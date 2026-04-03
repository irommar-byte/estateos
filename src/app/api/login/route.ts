import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { encryptSession } from '@/lib/sessionUtils';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { login, password } = body;

    if (!login || !password) {
      return NextResponse.json({ error: 'Brak danych' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: login },
          { phone: login }
        ]
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Nieprawidłowe dane' }, { status: 401 });
    }

    const valid = user.password ? await bcrypt.compare(password, user.password) : false;

    if (!valid) {
      return NextResponse.json({ error: 'Nieprawidłowe dane' }, { status: 401 });
    }

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
