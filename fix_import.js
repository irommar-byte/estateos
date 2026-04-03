const fs = require('fs');
const file = 'src/app/moje-konto/crm/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// Szukamy importów z lucide-react i dodajemy 'Search'
if (!code.includes(', Search') && !code.includes('Search,')) {
    code = code.replace(/import \{([\s\S]*?)\} from 'lucide-react';/, "import { $1, Search } from 'lucide-react';");
    fs.writeFileSync(file, code);
}
