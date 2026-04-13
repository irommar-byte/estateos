import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString(); // Generuje 4 cyfry
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // Ważne 10 minut

    await prisma.user.update({
      where: { id: Number(userId) },
      data: { otpCode, otpExpiry: expiry }
    });

    // TUTAJ: W przyszłości dodasz integrację z Twilio/SMSAPI
    console.log(`[SMS GATEWAY] Wysyłanie kodu ${otpCode} do użytkownika ID: ${userId}`);

    return NextResponse.json({ success: true, message: 'Kod został wysłany.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
