export const runtime = "nodejs";
export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { writeFile } from "fs/promises";
import sharp from "sharp";

// Zwiększone limity dla zdjęć klasy Premium (np. z najnowszych iPhone'ów)
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB na plik
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    
    // Elastyczne odbieranie - rozumie zarówno "file" (Frontend) jak i "files" (Starsze moduły)
    let files = data.getAll("files") as File[];
    const singleFile = data.get("file") as File;

    if (singleFile && files.length === 0) {
        files = [singleFile];
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "Brak plików do wgrania." }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    const tilePath = path.join(process.cwd(), "lib", "estateos_tile.svg");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const savedFiles: string[] = [];

    // Limit podniesiony do 15 zdjęć zgodnie z ustaleniami z formularza
    for (const file of files.slice(0, 15)) {

      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json({ error: `Niedozwolony format: ${file.type}` }, { status: 400 });
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: "Pojedynczy plik przekracza limit 15MB." }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      let buffer: any = Buffer.from(bytes);

      let ext = "jpg";
      if (file.type === "image/png") ext = "png";
      if (file.type === "image/webp") ext = "webp";

      const filename = `${Date.now()}-${Math.round(Math.random() * 10000)}.${ext}`;
      const filepath = path.join(uploadDir, filename);

      // Nakładanie znaku wodnego (jeśli plik SVG istnieje)
      if (fs.existsSync(tilePath)) {
        try {
          const imageMeta = await sharp(buffer).metadata();
          // Zabezpieczenie Premium: nakładamy znak tylko na zdjęcia odpowiedniej wielkości (np. >300px)
          if (imageMeta.width && imageMeta.width > 300 && imageMeta.height && imageMeta.height > 300) {
            buffer = await sharp(buffer)
              .composite([{ input: tilePath, tile: true, blend: 'over' }])
              .toBuffer();
          } else {
            console.warn("Zabezpieczenie: Zdjęcie zbyt małe na znak wodny w trybie tile, pomijam nakładanie.");
          }
        } catch (e) {
            console.warn("Błąd nakładania znaku wodnego:", e);
        }
      }

      await writeFile(filepath, buffer);
      savedFiles.push(`/uploads/${filename}`);
    }

    // Zwraca dane w formacie, którego precyzyjnie oczekuje ClientForm.tsx
    return NextResponse.json({ 
        images: savedFiles,
        url: savedFiles[0],
        fileUrl: savedFiles[0]
    });

  } catch (error) {
    console.error("Błąd API Upload:", error);
    return NextResponse.json({ error: "Krytyczny błąd zapisu na serwerze." }, { status: 500 });
  }
}
