const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

async function run() {
    console.log('\n=== 1. OSTATNIE BŁĘDY SERWERA (PM2) ===');
    try {
        const { execSync } = require('child_process');
        console.log(execSync('pm2 logs nieruchomosci --lines 15 --err --nostream').toString());
    } catch(e) { console.log('Brak logów pm2.'); }

    console.log('=== 2. SPRAWDZENIE BAZY DANYCH (DLA ID: 128) ===');
    const prisma = new PrismaClient();
    try {
        const bids = await prisma.bid.findMany({
            where: { OR: [{ buyerId: 128 }, { sellerId: 128 }] },
            orderBy: { createdAt: 'desc' },
            take: 1
        });
        console.log(`Liczba aktywnych licytacji dla Ciebie: ${bids.length > 0 ? 'ZNALEZIONO' : '0 (PUSTO)'}`);
        if(bids.length > 0) console.log('Ostatni BID:', bids[0]);

        const notifs = await prisma.notification.findMany({
            where: { userId: 128 },
            orderBy: { createdAt: 'desc' },
            take: 2
        });
        console.log('\nOstatnie powiadomienia w bazie:');
        notifs.forEach(n => console.log(`- Tytuł: ${n.title} | Link: ${n.link}`));
    } catch(e) {
        console.log("Błąd odczytu bazy:", e.message);
    }

    console.log('\n=== 3. KOD TWORZĄCY OFERTY (bids/route.ts) ===');
    try {
        const code = fs.readFileSync('src/app/api/bids/route.ts', 'utf8');
        const lines = code.split('\n');
        const createIdx = lines.findIndex(l => l.includes('prisma.bid.create'));
        if(createIdx !== -1) {
            for(let i = Math.max(0, createIdx - 2); i <= Math.min(lines.length-1, createIdx + 7); i++) {
                console.log(`${i+1}: ${lines[i]}`);
            }
        }
    } catch(e) { console.log('Brak pliku lub inna ścieżka.'); }
}
run().finally(() => process.exit(0));
