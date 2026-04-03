const fs = require('fs');
const file = 'src/contexts/UserModeContext.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/Przestrzeń <span className=\{themeColor\}>\{isPartner \? 'Partnera' : isInvestor \? 'Inwestora' : 'Właściciela'\}<\/span>/g, 
`Przestrzeń <span className={themeColor}>{isPartner ? 'Partnera EstateOS™' : isInvestor ? 'Inwestora' : 'Właściciela'}</span>`);

fs.writeFileSync(file, code);
