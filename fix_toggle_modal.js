const fs = require('fs');
const file = 'src/components/ui/PremiumModeToggle.tsx';
if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf8');
    
    // Dodajemy wyciągnięcie upgradeModalType z kontekstu
    code = code.replace(/const \{ mode, selectMode, isUpgradeModalOpen, setIsUpgradeModalOpen \} = useUserMode\(\);/, 'const { mode, selectMode, isUpgradeModalOpen, setIsUpgradeModalOpen, upgradeModalType } = useUserMode();');
    
    // Zmieniamy tekst modalu na dynamiczny
    const oldText = /Płynne przełączanie ról i dostęp do bazy Kupców \(Tryb Partner\) to wyłączna domena systemu <strong>EstateOS PRO<\/strong>\./;
    const newText = `{upgradeModalType === 'AGENCY' ? 'Dostęp do trybu Partner EstateOS™ (Baza Kupców i Radar Pro) wymaga najwyższego pakietu: Agencja PRO.' : 'Płynne przełączanie między panelem Właściciela a Inwestora to wyłączna domena systemu EstateOS PRO.'}`;
    code = code.replace(oldText, newText);
    
    fs.writeFileSync(file, code);
    console.log('✓ Zaktualizowano Modal zablokowanych trybów.');
}
