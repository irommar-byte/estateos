import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, otp, newPassword } = body;

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) return NextResponse.json({ error: 'Nie znaleziono konta powiązanego z tym adresem e-mail.' }, { status: 404 });

    // 1. FAZA ŻĄDANIA KODU
    if (!otp && !newPassword) {
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minut ważności

      await prisma.user.update({
        where: { email: user.email },
        data: { otpCode, otpExpiry }
      });

      // Próba wysyłki Maila
      try {
        const smtpPort = Number(process.env.EMAIL_PORT) || 587;
        
        // PANCERNE ZABEZPIECZENIE: Ucinamy białe znaki (spacje/entery) z .env
        const safeHost = process.env.EMAIL_HOST?.trim();
        const safeUser = process.env.EMAIL_USER?.trim();
        const safePass = process.env.EMAIL_PASS?.trim();

        const transporter = nodemailer.createTransport({
          host: safeHost,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: { user: safeUser, pass: safePass },
          tls: { rejectUnauthorized: false }
        });

        // TWARDY ZAPIS: Brak polskich znaków + wymuszony format "Name <email@example.com>"
        const fromHeader = '"EstateOS" <powiadomienia@estateos.pl>';

        await transporter.sendMail({
          from: fromHeader,
          to: user.email,
          subject: "🔑 Kod resetowania hasła",
          html: `
            <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; background-color: #050505; color: #ffffff; padding: 40px; border-radius: 20px;">
              <h2 style="color: #10b981; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">Reset Hasła</h2>
              <p style="color: #aaaaaa; font-size: 16px;">Otrzymaliśmy prośbę o zresetowanie hasła do Twojego konta w systemie EstateOS.</p>
              <div style="background-color: #111111; padding: 30px; border-radius: 10px; border: 1px solid #222; margin: 30px 0; text-align: center;">
                <p style="color: #aaaaaa; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 10px 0;">Twój 6-cyfrowy kod autoryzacyjny</p>
                <h1 style="color: #10b981; font-size: 40px; letter-spacing: 10px; margin: 0;">${otpCode}</h1>
              </div>
            </div>
          `
        });
        
        console.log("✅ Wysłano e-mail z poprawnym nagłówkiem:", fromHeader);
        
      } catch (mailError) {
        console.error("Błąd SMTP, odpalam awaryjny SMS:", mailError);
        // Jeśli mail zawiedzie, strzelamy SMSem
        if (user.phone) {
           const params = new URLSearchParams();
           params.append('to', user.phone);
           params.append('from', 'EstateOS'); 
           params.append('msg', `EstateOS - Kod resetu hasla: ${otpCode}`);

           await fetch('https://api2.smsplanet.pl/sms', {
               method: 'POST',
               headers: { 
                 'Authorization': 'Bearer BW936z97108280b73b5343b99b67b8d87488c529',
                 'Content-Type': 'application/x-www-form-urlencoded'
               },
               body: params
           });
        } else {
           throw mailError;
        }
      }

      return NextResponse.json({ success: true, message: "Kod został wysłany." });
    } 
    
    // 2. FAZA ZMIANY HASŁA
    else {
      if (user.otpCode !== otp || !user.otpExpiry || user.otpExpiry < new Date()) {
        return NextResponse.json({ error: 'Nieprawidłowy lub wygasły kod autoryzacyjny.' }, { status: 400 });
      }

      await prisma.user.update({
        where: { email: user.email },
        data: { password: newPassword, otpCode: null, otpExpiry: null }
      });

      return NextResponse.json({ success: true, message: "Hasło zostało pomyślnie zmienione." });
    }

  } catch (error: any) {
    console.error("Krytyczny błąd resetowania hasła:", error);
    return NextResponse.json({ error: 'Szczegóły błędu: ' + (error.message || String(error)) }, { status: 500 });
  }
}
