import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';

 

export async function GET() {
  try {
    const usersCount = await prisma.user.count();
    const adminsCount = await prisma.user.count({ where: { role: 'ADMIN' } });
    const totalOffers = await prisma.offer.count();
    const activeOffers = await prisma.offer.count({ where: { status: 'active' } });
    const agencyOffers = await prisma.offer.count({ where: { advertiserType: 'agency' } });
    const privateOffers = await prisma.offer.count({ where: { advertiserType: 'private' } });
    
    // POBIERAMY DANE DO ANALIZY RYNKU
    const offersRaw = await prisma.offer.findMany({ 
      select: { price: true, area: true, district: true, propertyType: true, status: true, createdAt: true, advertiserType: true } 
    });
    const totalValue = offersRaw.reduce((acc, curr) => acc + (parseInt((curr.price || '0').replace(/\D/g, '')) || 0), 0);
    
    const usersRaw = await prisma.user.findMany({ select: { createdAt: true, searchType: true, offers: { select: { id: true } } } });
    const visitsRaw = await prisma.siteVisit.findMany({ select: { ip: true, country: true, path: true, createdAt: true }, orderBy: { createdAt: 'desc' } });

    return NextResponse.json({
      kpis: { totalValue, active: activeOffers, private: privateOffers, agency: agencyOffers },
      timeline: { offers: offersRaw, users: usersRaw, visits: visitsRaw }
    });
  } catch (error) {
    return NextResponse.json({ error: "Błąd obliczeń" }, { status: 500 });
  }
}
