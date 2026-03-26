import React from 'react';
import { UserModeProvider } from '@/contexts/UserModeContext';

export default function MojeKontoLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserModeProvider>
      {children}
    </UserModeProvider>
  );
}
