import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { signMobileToken } from '@/lib/jwtMobile';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Brak adresu e-mail lub hasła.' }, { status: 400 });
    }

    // Szukamy użytkownika
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return NextResponse.json({ error: 'Nieprawidłowe dane logowania.' }, { status: 401 });
    }

    // Weryfikacja hasła
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Nieprawidłowe dane logowania.' }, { status: 401 });
    }

    // 🍏 Generujemy bezpieczny Token JWT dla iOS/Android
    const token = signMobileToken({ 
      id: user.id, 
      email: user.email, 
      role: user.role 
    });

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        planType: user.planType
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Mobile Login Error:', error);
    return NextResponse.json({ error: 'Wystąpił błąd serwera.' }, { status: 500 });
  }
}
