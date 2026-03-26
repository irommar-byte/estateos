import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { field, value } = body;

    if (!field || !value) {
      return NextResponse.json({ error: 'Brak danych' }, { status: 400 });
    }

    let isTaken = false;

    if (field === 'email') {
      const user = await prisma.user.findUnique({
        where: { email: value.trim().toLowerCase() }
      });
      if (user) isTaken = true;
    } else if (field === 'phone') {
      // Czyścimy numer do samych cyfr i ujednolicamy z formatem bazy (+48)
      const cleanPhone = value.replace(/\D/g, '');
      const finalPhone = cleanPhone.startsWith('48') ? cleanPhone : '48' + cleanPhone;
      
      const user = await prisma.user.findFirst({
        where: { phone: finalPhone }
      });
      if (user) isTaken = true;
    }

    return NextResponse.json({ exists: isTaken });

  } catch (error) {
    console.error('Błąd walidacji w bazie:', error);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}
