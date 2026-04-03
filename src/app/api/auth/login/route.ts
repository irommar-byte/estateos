import bcrypt from "bcryptjs";
import { encryptSession } from '@/lib/sessionUtils';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { login, email, password } = await req.json();
    const identifier = login || email;
    const emailNormalized = identifier;
    if (!identifier || !password) {
      return NextResponse.json({ success: false, message: "Brak danych logowania" }, { status: 400 });
    }


    const cleanInput = emailNormalized.replace(/\s+/g, '');
    const isPhone = /^\+?[0-9]{7,15}$/.test(cleanInput);
    const phoneFormatted = isPhone ? cleanInput.replace(/\D/g, '') : null;
    const finalPhone = phoneFormatted ? (phoneFormatted.startsWith('48') ? phoneFormatted : '48' + phoneFormatted) : null;

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: emailNormalized.trim().toLowerCase() },
          { phone: finalPhone || 'impossible_value' }
        ]
      }
    });

    if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ success: false, message: "Błędne dane logowania" }, { status: 401 });
    }

    // --- MAGIA PAKIETU PREMIUM: Wznowienie weryfikacji SMS ---
    if (!user.isVerified) {
      if (!user.otpExpiry || user.otpExpiry < new Date()) {
         return NextResponse.json({ success: false, message: "Konto niezweryfikowane, a Twój kod SMS wygasł. Zarejestruj się ponownie." }, { status: 401 });
      }
      return NextResponse.json({ 
         success: false, 
         needs_otp: true, 
         email: user.email,
         phone: user.phone,
         message: "Wpisz kod SMS, który dostałeś przy rejestracji." 
      }, { status: 200 }); // Status 200 bo to krok logowania, nie błąd
    }
    // --------------------------------------------------------

    const sessionPayload = encryptSession({ id: user.id, email: user.email, role: user.role });

    const response = NextResponse.json({ 
      success: true, 
      role: user.role,
      name: user.name 
    });

    response.cookies.set("estateos_session", sessionPayload, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return response;

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return NextResponse.json({ success: false, message: "Błąd serwera" }, { status: 500 });
  }
}
