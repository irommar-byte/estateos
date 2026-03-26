import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { name, email, password, phone, type, districts, maxPrice, areaFrom, areaTo, plotArea, buyerType, amenities, rooms } = await req.json();

    // 1. NORMALIZACJA NUMERU I BLOKADA DUPLIKATÓW
    const cleanPhone = phone.replace(/\D/g, '');
    const finalPhone = cleanPhone.startsWith('48') ? cleanPhone : '48' + cleanPhone;

    const phoneExists = await prisma.user.findFirst({
      where: {
        phone: finalPhone,
        NOT: { email: email }
      }
    });

    if (phoneExists) {
      return NextResponse.json({ 
        error: "Ten numer telefonu jest już przypisany do innego konta. Zaloguj się lub użyj innego numeru." 
      }, { status: 400 });
    }

    // SPRAWDZENIE STANU MASTER SWITCHA
    let isSmsEnabled = process.env.ENABLE_SMS_VERIFICATION !== 'false';
    try {
      const fs = require('fs');
      const path = require('path');
      const envContent = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8');
      isSmsEnabled = !envContent.includes('ENABLE_SMS_VERIFICATION=false');
    } catch(e) {}
    
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);
    const parsedMaxPrice = maxPrice ? parseInt(String(maxPrice).replace(/\D/g, '')) : null;
    const firstName = name ? name.split(' ')[0] : 'Inwestorze';

    // 2. INTELIGENTNY UPSERT (Zapisuje/Aktualizuje użytkownika)
    await prisma.user.upsert({
      where: { email },
      update: { 
        isVerified: !isSmsEnabled, otpCode, otpExpiry, 
        name, phone: finalPhone, password, 
        searchType: type, searchDistricts: districts.join(','), 
        searchMaxPrice: parsedMaxPrice, buyerType, searchAmenities: amenities ? amenities.join(",") : null, searchAreaFrom: areaFrom ? parseInt(String(areaFrom), 10) : null, searchRooms: rooms ? parseInt(String(rooms), 10) : null 
      },
      create: { 
        isVerified: !isSmsEnabled, otpCode, otpExpiry, 
        email, password, role: "USER", name, phone: finalPhone, 
        searchType: type, searchDistricts: districts.join(','), 
        searchMaxPrice: parsedMaxPrice, buyerType, searchAmenities: amenities ? amenities.join(",") : null, searchAreaFrom: areaFrom ? parseInt(String(areaFrom), 10) : null, searchRooms: rooms ? parseInt(String(rooms), 10) : null 
      }
    });

    // 3. WYSYŁKA SMS (Zależna od Master Switcha)
    if (isSmsEnabled) {
        try {
          const params = new URLSearchParams();
          params.append('to', finalPhone);
          params.append('from', 'EstateOS'); 
          params.append('msg', `Kod weryfikacyjny EstateOS: ${otpCode}`);

          const smsRes = await fetch('https://api2.smsplanet.pl/sms', {
            method: 'POST',
            headers: { 
              'Authorization': 'Bearer BW936z97108280b73b5343b99b67b8d87488c529',
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params
          });
          const smsText = await smsRes.text();
          console.log('🟢 SMS STATUS:', smsText);
        } catch (smsError) {
          console.error('❌ Błąd SMS:', smsError);
        }
    }

    // 4. LOGOTYP ADAPTACYJNY DO MAILA
    const logoHtml = `<span style="color: #10b981; font-weight: bold;">E</span><span style="font-weight: bold;">state</span><span style="color: #10b981; font-weight: bold;">OS</span><sup style="font-weight: normal;">&trade;</sup>`;

    return NextResponse.json({ success: true, requiresVerification: isSmsEnabled, email });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
  }
}
