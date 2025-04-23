'use client';
import { ReactNode } from 'react';
import RainbowKitProvider from './RainbowKitProvider';
import AuthProvider from './AuthProvider';
import { Session } from 'next-auth';
import ThemeProviderWrapper from './ThemeProvider';
export default function Providers({
  children,
  cookie,
  session,
}: {
  children: ReactNode;
  cookie: string;
  session: Session;
}) {
  return (
    <ThemeProviderWrapper>
      <AuthProvider session={session}>
        <RainbowKitProvider cookie={cookie}>{children}</RainbowKitProvider>
      </AuthProvider>
    </ThemeProviderWrapper>
  );
}
