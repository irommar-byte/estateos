const fs = require('fs');

// 1. ZAKTUALIZOWANIE PAGE.TSX (Przekazywanie roli do formularza)
const pageFile = 'src/app/dodaj-oferte/page.tsx';
if (fs.existsSync(pageFile)) {
    let pageCode = fs.readFileSync(pageFile, 'utf8');
    if (!pageCode.includes('role: realUser.role')) {
        pageCode = pageCode.replace(
            /email: realUser\.email,/, 
            "email: realUser.email,\n          role: realUser.role,\n          isPro: realUser.isPro,"
        );
        fs.writeFileSync(pageFile, pageCode);
        console.log('✓ dodaj-oferte/page.tsx: Dodano przekazywanie Roli.');
    }
}

// 2. WSTRZYKNIĘCIE LOGIKI BRAMKI STRIPE DO CLIENTFORM.TSX
const clientFile = 'src/app/dodaj-oferte/ClientForm.tsx';
if (fs.existsSync(clientFile)) {
    let clientCode = fs.readFileSync(clientFile, 'utf8');
    
    const stripeLogic = `
    // --- TWARDA LOGIKA BIZNESOWA ESTATEOS ---
    if (data?.advertiserType === 'agency') {
        const isAgency = initialUser?.role === 'AGENCY' || initialUser?.role === 'ADMIN';
        if (!isAgency) {
            // Zatrzymujemy wysyłkę, chowamy ewentualny spinner
            setIsSubmitting(false);
            
            // Zapisujemy wpisane dane w przeglądarce, żeby klient ich nie stracił!
            try { localStorage.setItem('estateos_saved_offer', JSON.stringify(data)); } catch(e) {}
            
            alert("Funkcja Premium: Aby wystawiać ogłoszenia jako Agencja/Biuro i uzyskać dostęp do bazy Kupujących (Radar Pro), musisz wykupić pakiet Agencja PRO.");
            
            // Przekierowanie prosto do bramki płatności Stripe
            fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan: 'agency', returnUrl: window.location.origin + '/dodaj-oferte' })
            }).then(res => res.json()).then(d => {
                if (d.url) window.location.href = d.url;
            }).catch(() => alert("Błąd połączenia z bramką płatności."));
            return; // BLOKADA DALSZEJ REJESTRACJI I WYSYŁKI!
        }
    }
    
    // Ustawiamy odpowiednią rolę do wysłania na backend
    data.registerRole = data?.advertiserType === 'agency' ? 'AGENCY' : 'SELLER';
    // ----------------------------------------
`;

    // Szukamy rozpoczęcia funkcji handleSubmit i wstrzykujemy kod
    if (!clientCode.includes("TWARDA LOGIKA BIZNESOWA ESTATEOS")) {
        clientCode = clientCode.replace(
            /const handleSubmit = async \(\) => \{\n/, 
            `const handleSubmit = async () => {\n${stripeLogic}\n`
        );
        fs.writeFileSync(clientFile, clientCode);
        console.log('✓ ClientForm.tsx: Zabezpieczono Agencje bramką Stripe i dodano rolę SELLER dla prywatnych.');
    }
}

// 3. NAPRAWA BACKENDU (Odnalezienie pliku API i zamiana na dynamiczną rolę)
const { execSync } = require('child_process');
try {
    // Szukamy gdzie backend tworzy usera przy ofercie (pomijając te naprawione wcześniej)
    const grepRes = execSync('grep -rl "prisma.user.upsert\\|prisma.user.create" src/app/api/ | grep -v "register" | grep -v "szukaj"').toString().split('\\n').filter(Boolean);
    
    let patchedAny = false;
    for (const apiFile of grepRes) {
        let apiCode = fs.readFileSync(apiFile, 'utf8');
        if (apiCode.includes('role: "USER"')) {
            apiCode = apiCode.replace(/role:\s*"USER"/g, "role: body.registerRole || 'SELLER'");
            fs.writeFileSync(apiFile, apiCode);
            patchedAny = true;
            console.log(`✓ Zaktualizowano role w backendzie: ${apiFile}`);
        }
    }
    if(!patchedAny) console.log("⚠ Nie znaleziono endpointu tworzącego użytkownika z twardą rolą USER, upewnij się, że backend czyta `registerRole`.");
} catch(e) {}
