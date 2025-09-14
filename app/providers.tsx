'use client';

import { SahhaDataProvider } from '../dashboard/contexts/SahhaDataContext';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SahhaDataProvider>
      {children}
    </SahhaDataProvider>
  );
}