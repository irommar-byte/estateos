const fs = require('fs');

// 1. NAPRAWA KUPUJĄCYCH (Wyszukiwarka)
const szukajApi = 'src/app/api/szukaj/rejestracja/route.ts';
if (fs.existsSync(szukajApi)) {
    let code = fs.readFileSync(szukajApi, 'utf8');
    // Zamieniamy sztywne "USER" na "BUYER"
    code = code.replace(/role:\s*["']USER["']/g, 'role: "BUYER"');
    fs.writeFileSync(szukajApi, code);
    console.log('✓ API Szukaj: Nowi użytkownicy to teraz automatycznie Inwestorzy (BUYER).');
}

// 2. NAPRAWA STANDARDOWEJ REJESTRACJI (Aby przyjmowała rolę z frontendu)
const regApi = 'src/app/api/register/route.ts';
if (fs.existsSync(regApi)) {
    let code = fs.readFileSync(regApi, 'utf8');
    if (!code.includes('role: role')) {
        code = code.replace(/const \{ email, password, name, phone \} = body;/, 'const { email, password, name, phone, role } = body;');
        code = code.replace(/phone\n\s*\}/, "phone,\n        role: role || 'BUYER'\n      }");
        fs.writeFileSync(regApi, code);
        console.log('✓ API Rejestracji: Obsługa ról dodana.');
    }
}
