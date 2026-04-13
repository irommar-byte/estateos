export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 1. POBIERANIE OFERT NA RADAR ORAZ DO PROFILU (Obsługa parametru includeAll)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const includeAll = searchParams.get('includeAll') === 'true';

  // LOG DLA DEBUGOWANIA - zobaczysz to w 'pm2 logs'
  console.log("📱 MOBILE API GET: includeAll =", includeAll);

  const whereClause = includeAll 
    ? {} 
    : { status: 'ACTIVE', lat: { not: null }, lng: { not: null } };

  try {
    const offers = await prisma.offer.findMany({
      where: whereClause,
      include: {
        user: {
          select: { name: true, email: true, phone: true, image: true, companyName: true, role: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ success: true, offers });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// 2. DODAWANIE NOWEJ OFERTY (Wpada domyślnie jako PENDING)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const {
      title, description, transactionType, propertyType, condition,
      price, pricePerSqm, adminFee, deposit,
      area, plotArea, rooms, floor, totalFloors, yearBuilt,
      hasBalcony, hasElevator, hasStorage, hasParking, hasGarden, isFurnished, petsAllowed, airConditioning,
      city, district, street, buildingNumber, lat, lng, isExactLocation,
      images, videoUrl, floorPlanUrl,
      userId, status
    } = body;

    if (!userId) {
      return NextResponse.json({ success: false, message: 'Brak ID użytkownika' }, { status: 400 });
    }

    const offer = await prisma.offer.create({
      data: {
        title: title || 'Nowa Oferta',
        description: description || '',
        transactionType: transactionType || 'SALE',
        propertyType: propertyType || 'APARTMENT',
        condition: condition || 'READY',
        
        price: Number(price) || 0,
        pricePerSqm: pricePerSqm ? Number(pricePerSqm) : null,
        adminFee: adminFee ? Number(adminFee) : null,
        deposit: deposit ? Number(deposit) : null,
        
        area: Number(area) || 0,
        plotArea: plotArea ? Number(plotArea) : null,
        rooms: rooms ? Number(rooms) : null,
        floor: floor !== undefined && floor !== null && floor !== '' ? Number(floor) : null,
        totalFloors: totalFloors ? Number(totalFloors) : null,
        yearBuilt: yearBuilt ? Number(yearBuilt) : null,
        
        hasBalcony: hasBalcony === true || hasBalcony === 'true',
        hasElevator: hasElevator === true || hasElevator === 'true',
        hasStorage: hasStorage === true || hasStorage === 'true',
        hasParking: hasParking === true || hasParking === 'true',
        hasGarden: hasGarden === true || hasGarden === 'true',
        isFurnished: isFurnished === true || isFurnished === 'true',
        petsAllowed: petsAllowed === true || petsAllowed === 'true',
        airConditioning: airConditioning === true || airConditioning === 'true',
        
        city: city || 'Warszawa',
        district: district || 'OTHER',
        street: street || '',
        buildingNumber: buildingNumber || '',
        lat: lat ? Number(lat) : null,
        lng: lng ? Number(lng) : null,
        isExactLocation: isExactLocation !== undefined ? Boolean(isExactLocation) : true,
        
        images: typeof images === 'string' ? images : JSON.stringify(images || []),
        videoUrl: videoUrl || null,
        floorPlanUrl: floorPlanUrl || null,
        
        status: status || 'PENDING',
        userId: Number(userId)
      }
    });

    return NextResponse.json({ success: true, offer });
  } catch (error: any) {
    console.error("🔥 BŁĄD DODAWANIA OFERTY:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
