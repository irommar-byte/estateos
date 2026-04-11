import jwt from 'jsonwebtoken';

// W produkcji użyjemy NEXTAUTH_SECRET z pliku .env
const SECRET = process.env.NEXTAUTH_SECRET || 'apple-premium-estateos-secret-key-2026';

export const signMobileToken = (payload: any) => {
  return jwt.sign(payload, SECRET, { expiresIn: '30d' }); // Token ważny 30 dni
};

export const verifyMobileToken = (token: string) => {
  try {
    return jwt.verify(token, SECRET);
  } catch (error) {
    return null;
  }
};
