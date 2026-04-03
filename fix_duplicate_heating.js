const fs = require('fs');
const path = 'prisma/schema.prisma';
let code = fs.readFileSync(path, 'utf8');

// Sprawdzamy, czy w schemacie jest więcej niż jedno wystąpienie "heating"
const heatingMatches = code.match(/heating\s+String\?/g);

if (heatingMatches && heatingMatches.length > 1) {
    // Znajdujemy indeks OSTATNIEGO wystąpienia w pliku i je wycinamy
    const lastIndex = code.lastIndexOf('heating String?');
    code = code.substring(0, lastIndex) + code.substring(lastIndex + 'heating String?'.length);
    fs.writeFileSync(path, code);
    console.log('✔ SUKCES: Usunięto zduplikowane pole "heating".');
} else {
    console.log('✖ UWAGA: Nie znaleziono duplikatów "heating".');
}
