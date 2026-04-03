const fs = require('fs');
const file = 'src/app/moje-konto/crm/page.tsx';

if (fs.existsSync(file)) {
    let crm = fs.readFileSync(file, 'utf8');

    // 1. Zapewniamy dostęp do initModeFromUser
    crm = crm.replace(/const \{ mode, forceMode \} = useUserMode\(\);/g, 'const { mode, forceMode, initModeFromUser } = useUserMode();');
    crm = crm.replace(/const \{ mode \} = useUserMode\(\);/g, 'const { mode, forceMode, initModeFromUser } = useUserMode();');

    // 2. Po pobraniu profilu w initCrm zmuszamy system do załadowania właściwej roli!
    crm = crm.replace(/setCurrentUser\(uData\);/g, 'setCurrentUser(uData);\n      if (initModeFromUser) initModeFromUser(uData);');

    // 3. Usuwamy stary, uszkodzony kod z wymuszaniem ról, który łamał logikę
    const badLogicRegex = /if \(\!uData\.isPro && uData\.role !== 'ADMIN' && uData\.role !== 'AGENCY'\) \{[\s\S]*?else forceMode\('BUYER'\);\s*\}/g;
    crm = crm.replace(badLogicRegex, '// Automatyczna weryfikacja ról przejęta przez UserModeContext');

    fs.writeFileSync(file, crm);
    console.log('✓ Logika inicjalizacji Ról w CRM załatana.');
}
