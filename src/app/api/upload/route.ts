export const runtime = "nodejs";
export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { writeFile } from "fs/promises";
import sharp from "sharp";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const files = data.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "Brak plików" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    const tilePath = path.join(process.cwd(), "lib", "estateos_tile.svg");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const savedFiles: string[] = [];

    for (const file of files.slice(0, 7)) {

      // 🔒 WALIDACJA MIME
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json({ error: "Niedozwolony typ pliku" }, { status: 400 });
      }

      // 🔒 LIMIT ROZMIARU
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: "Plik za duży (max 5MB)" }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      let buffer: any = Buffer.from(bytes);

      // 🔒 GENERUJEMY BEZPIECZNE ROZSZERZENIE
      let ext = "jpg";
      if (file.type === "image/png") ext = "png";
      if (file.type === "image/webp") ext = "webp";

      const filename = `${Date.now()}-${Math.round(Math.random() * 10000)}.${ext}`;
      const filepath = path.join(uploadDir, filename);

      // 🔥 watermark
      if (fs.existsSync(tilePath)) {
        try {
          buffer = await sharp(buffer)
            .composite([{ input: tilePath, tile: true, blend: 'over' }])
            .toBuffer();
        } catch {}
      }

      await writeFile(filepath, buffer);
      savedFiles.push(`/uploads/${filename}`);
    }

    return NextResponse.json({ images: savedFiles });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
  }
}
