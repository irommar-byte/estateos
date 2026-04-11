const fs = require('fs');
const path = require('path');

const proxyPath = path.join(process.cwd(), 'src', 'proxy.ts');

try {
  let proxyCode = fs.readFileSync(proxyPath, 'utf8');
  
  if (proxyCode.includes('export function middleware')) {
    proxyCode = proxyCode.replace(/export function middleware/g, 'export function proxy');
    fs.writeFileSync(proxyPath, proxyCode);
    console.log("✅ Zmieniono nazwę eksportowanej funkcji z 'middleware' na 'proxy' w src/proxy.ts.");
  } else {
    console.log("⚠️ Nie znaleziono ciągu 'export function middleware' w pliku.");
  }
} catch (e) {
  console.error("❌ Błąd modyfikacji proxy.ts:", e.message);
}
