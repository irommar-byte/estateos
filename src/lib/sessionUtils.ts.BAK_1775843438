import crypto from 'crypto';

const SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'estateos_secure_key_2026';

export function encryptSession(payload: any) {
    const data = Buffer.from(JSON.stringify(payload)).toString('base64');
    const signature = crypto.createHmac('sha256', SECRET).update(data).digest('hex');
    return `${data}.${signature}`;
}

export function decryptSession(token: string) {
    try {
        if (!token) return null;
        
        // Kompatybilność wsteczna: Jeśli ciastko to wciąż stary, jawny JSON
        if (token.includes('{') && token.includes('}')) {
            return JSON.parse(token); 
        }
        
        const parts = token.split('.');
        if (parts.length !== 2) return null;
        
        const [data, signature] = parts;
        const expectedSig = crypto.createHmac('sha256', SECRET).update(data).digest('hex');
        
        if (signature !== expectedSig) return null;
        
        return JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));
    } catch (e) {
        return null;
    }
}
