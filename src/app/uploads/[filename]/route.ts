import { NextResponse } from 'next/server';
import path from 'path';
import { readFile } from 'fs/promises';
import fs from 'fs';

// Ten kod przechwytuje zapytania o obrazki i podaje je prosto z dysku!
export async function GET(req: Request, context: any) {
  try {
    const resolvedParams = await context.params;
    const filename = resolvedParams.filename;
    
    // Szukamy pliku na dysku
    const filePath = path.join(process.cwd(), 'public', 'uploads', filename);

    if (!fs.existsSync(filePath)) {
      return new NextResponse('Zdjęcie nie istnieje', { status: 404 });
    }

    const buffer = await readFile(filePath);
    
    // Rozpoznajemy typ pliku, żeby przeglądarka wyświetliła obraz zamiast tekstu
    let mimeType = 'image/jpeg';
    if (filename.endsWith('.png')) mimeType = 'image/png';
    else if (filename.endsWith('.webp')) mimeType = 'image/webp';
    else if (filename.endsWith('.gif')) mimeType = 'image/gif';

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable', // Magia Apple: wczytuje się błyskawicznie przy kolejnych wizytach
      },
    });
  } catch (error) {
    return new NextResponse('Błąd serwera plików', { status: 500 });
  }
}
