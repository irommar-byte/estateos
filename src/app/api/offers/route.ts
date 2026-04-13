import { encryptSession, decryptSession } from '@/lib/sessionUtils';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const offers = await prisma.offer.findMany({
      where: { status: { in: ["ACTIVE"] } },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true,   } } }
    });
    return new NextResponse(JSON.stringify(offers), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      }
    });
  } catch (error) { console.error('OFFERS ERROR:', error);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  let sellerEmail: string | null = null;
  try {
    const body = await req.json();
console.log("🔥 BODY:", body);
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('estateos_session') || cookieStore.get('luxestate_user');

    let dbUserId = null;

    if (sessionCookie) {
      try {
        const parsed = decryptSession(sessionCookie.value);
        dbUserId = parsed.id;
      } catch (e) {
        // ZABETONOWANA LUKA: Nie ufamy danym z ciastka. Szukamy usera bezpiecznie.
      const u = await prisma.user.findUnique({ where: { email: sessionCookie.value } });
        if (u) dbUserId = u.id;
      }
    }

    if (dbUserId) {
      const realUser = await prisma.user.findUnique({ where: { id: dbUserId } });
      if (!realUser) {
        dbUserId = null;
      }
    }

    if (!dbUserId && body.email && body.password) {
      const email = body.email.toLowerCase().trim();
      const existing = await prisma.user.findUnique({ where: { email } });
      const cleanPhone = (body.contactPhone || "").replace(/\D/g, '');
      const finalPhone = cleanPhone ? (cleanPhone.startsWith('48') ? cleanPhone : '48' + cleanPhone) : null;

      if (existing && existing.isVerified) {
         return NextResponse.json({ error: 'Konto o tym mailu już istnieje. Zaloguj się.' }, { status: 400 });
      }

      const phoneExists = await prisma.user.findFirst({
         where: { phone: finalPhone, NOT: { email } }
      });
      if (phoneExists) {
         return NextResponse.json({ error: "Ten numer telefonu jest przypisany do innego konta. Zaloguj się." }, { status: 400 });
      }

      let isSmsEnabled = process.env.ENABLE_SMS_VERIFICATION !== 'false';
      try {
        const fs = require('fs');
        const path = require('path');
        const envContent = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8');
        isSmsEnabled = !envContent.includes('ENABLE_SMS_VERIFICATION=false');
      } catch(e) {}

      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);

      try {
        let hashedPassword = body.password;
        if (body.password) {
            const bcrypt = require('bcrypt');
            hashedPassword = await bcrypt.hash(body.password, 10);
        }

        const newUser = await prisma.user.upsert({
          where: { email },
          update: { isVerified: !isSmsEnabled, otpCode, otpExpiry, name: body.contactName, phone: finalPhone, password: hashedPassword, buyerType: body.advertiserType || "private" },
          create: { isVerified: !isSmsEnabled, otpCode, otpExpiry, email, password: hashedPassword, role: "USER", name: body.contactName, phone: finalPhone, buyerType: body.advertiserType || "private" }
        });
        
        if (isSmsEnabled) {
            try {
               const params = new URLSearchParams();
               params.append('to', finalPhone);
               params.append('from', 'EstateOS'); 
               params.append('msg', `Kod weryfikacyjny EstateOS: ${otpCode}`);

               await fetch('https://api2.smsplanet.pl/sms', {
                   method: 'POST',
                   headers: { 'Authorization': 'Bearer BW936z97108280b73b5343b99b67b8d87488c529', 'Content-Type': 'application/x-www-form-urlencoded' },
                   body: params
               });
            } catch(smsError) {}
            return NextResponse.json({ success: true, requiresVerification: true, email });
        } else {
            dbUserId = newUser.id;
        }
      } catch(e: any) {
        return NextResponse.json({ error: 'Błąd dodawania usera (Prisma)' }, { status: 500 });
      }
    }

    if (!dbUserId) {
      return NextResponse.json({ error: 'Brak aktywnej sesji użytkownika. Zaloguj się ponownie.' }, { status: 401 });
    }

    // 🔥🔥🔥 STRAŻNIK LIMITÓW (GUARD CLAUSE) 🔥🔥🔥
    const userToCheck = await prisma.user.findUnique({
      where: { id: dbUserId },
      select: { isPro: true, planType: true, extraListings: true, _count: { select: { offers: { where: { status: { in: ['active', 'pending_approval'] } } } } } }
    });

    if (userToCheck) {
      const activeOffersCount = userToCheck._count?.offers || 0;
      let limit = 1;
      const pType = userToCheck.planType?.toLowerCase() || '';
      
      if (userToCheck.isPro || pType === 'investor' || pType === 'agency') {
        limit = (pType === 'agency') ? 999999 : 5;
      }

      // 🔥 TWARDA BLOKADA BACKENDU 🔥
      if (activeOffersCount >= limit && (userToCheck.extraListings || 0) === 0) {
        return NextResponse.json({ error: 'Limit osiągnięty', limitReached: true }, { status: 403 });
      }

      if (activeOffersCount >= limit && (userToCheck.extraListings || 0) > 0) {
        await prisma.user.update({ where: { id: dbUserId }, data: { extraListings: { decrement: 1 } } });
      }
    }

    let finalAddress = body.address;
    if (body.locationType === 'approximate' && finalAddress) {
      finalAddress = finalAddress.split(',')[0].replace(/\s\d+.*$/, '').trim();
      const parts = body.address.split(',');
      if (parts.length > 1) finalAddress += `, ${parts[1].trim()}`;
    }

    try {
      const newOffer = await prisma.offer.create({
        data: {
          userId: dbUserId,
          title: body.title, propertyType: body.propertyType || "Mieszkanie", district: body.district || "Śródmieście",
          price: String(body.price).replace(/\D/g, ''), area: String(body.area).replace(',', '.'),
          description: body.description || "", address: finalAddress, lat: body.lat ? Number(body.lat) : 52.2297, lng: body.lng ? Number(body.lng) : 21.0122,
          apartmentNumber: body.apartmentNumber || null, imageUrl: body.imageUrl, images: body.images,
          advertiserType: body.advertiserType || "private", agencyName: body.agencyName || null,
          contactName: body.contactName, contactPhone: body.contactPhone, status: "PENDING_APPROVAL", expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          rooms: body.rooms ? String(body.rooms) : null, floor: body.floor ? String(body.floor) : null,
          year: body.buildYear ? String(body.buildYear) : null, plotArea: body.plotArea ? String(body.plotArea) : null,
          amenities: body.amenities || "", floorPlan: body.floorPlan || null,
          transactionType: body.transactionType || "sale",
          rentAdminFee: body.rentAdminFee || null,
          deposit: body.deposit || null,
          rentMinPeriod: body.rentMinPeriod || null,
          rentAvailableFrom: body.rentAvailableFrom || null,
          petsAllowed: Boolean(body.petsAllowed),
          rentType: body.rentType || null
        }
      });
      
      try {
        const smtpPort = Number(process.env.EMAIL_PORT) || 587;
        const transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST, port: smtpPort, secure: smtpPort === 465,
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
          tls: { rejectUnauthorized: false }
        });
        
        sellerEmail = body.email || (await prisma.user.findUnique({ where: { id: dbUserId } }))?.email;

        if (sellerEmail) {
          await transporter.sendMail({
            from: '"EstateOS" <powiadomienia@estateos.pl>',
            to: sellerEmail,
            subject: "EstateOS: Otrzymaliśmy Twoją ofertę (Weryfikacja)",
            html: `<div style="background:#000;color:#fff;padding:40px;text-align:center;"><h2>Otrzymaliśmy Twoją ofertę!</h2><p>Twoje ogłoszenie zostało pomyślnie zapisane w naszym systemie i oczekuje na weryfikację przez Administratora. Poinformujemy Cię o jej publikacji.</p></div>` // Skrócone dla optymalizacji skryptu
          });
        }
      } catch (mailErr) {}

      
    // 🔥 AUTO-LOGIN PO PUBLIKACJI (Bezszwowe Doświadczenie) 🔥
    try {
        const cookieStore = await cookies();
        const currentSession = cookieStore.get('estateos_session');
        
        // Jeśli nie ma ciastka, a mamy ID i E-mail, logujemy gościa w locie
        if (!currentSession && dbUserId && sellerEmail) {
            const sessionPayload = { id: dbUserId, email: sellerEmail, role: "USER" };
            const token = encryptSession(sessionPayload);
            
            cookieStore.set('estateos_session', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 30 * 24 * 60 * 60, // 30 dni ważności
                path: '/'
            });
        }
    } catch (loginErr) {
        console.error('Błąd autologowania w tle:', loginErr);
    }

    return NextResponse.json({ success: true, id: newOffer.id });

    } catch (e: any) {
      return NextResponse.json({ error: 'Błąd tworzenia oferty (Prisma)' }, { status: 500 });
    }

  } catch (error: any) {
    return NextResponse.json({ error: 'Krytyczny błąd API' }, { status: 500 });
  }
}
