import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, image } = body;

    if (!userId || !image) {
      return NextResponse.json({ success: false, message: 'Brak wymaganych danych (userId lub image).' }, { status: 400 });
    }

    // Zapisujemy potężny ciąg Base64 bezpośrednio do pola 'image' (oznaczonego w Prismie jako @db.Text)
    const updatedUser = await prisma.user.update({
      where: { id: Number(userId) },
      data: { image: image }
    });

    // Zwracamy sukces, aby aplikacja mobilna wiedziała, że zdjęcie jest bezpieczne
    return NextResponse.json({ success: true, message: 'Awatar zapisany pomyślnie!' });
  } catch (error: any) {
    console.error("Błąd zapisu awatara:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
