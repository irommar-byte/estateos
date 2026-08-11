import { NextResponse } from "next/server";

/** Pobieranie APK/AAB wyłączone — Android wkrótce dostępny. */
export async function GET() {
  return NextResponse.json(
    {
      error: "Aplikacja na Androida będzie wkrótce dostępna.",
      status: "coming_soon",
    },
    {
      status: 503,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
