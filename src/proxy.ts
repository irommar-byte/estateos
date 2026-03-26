import { NextResponse } from 'next/server';

// Zneutralizowany bramkarz - przepuszcza ruch dalej.
// Strony mają teraz własne, lepsze zabezpieczenia autoryzacyjne.
export function middleware(request: any) {
  return NextResponse.next();
}

export default middleware;
