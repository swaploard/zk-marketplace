'use client';
import { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import React, { ReactNode } from 'react';

/**
 * A wrapper around NextAuth's SessionProvider that sets the `baseUrl` prop
 * to `process.env.NEXTAUTH_URL` for you.
 *
 * @param {ReactNode} children - The components that should have access to the session.
 * @param {Session} session - The session object from NextAuth.
 */
export default function AuthProvider({
  children,
  session,
}: {
  children: ReactNode;
  session: Session;
}) {
  return (
    <SessionProvider baseUrl={process.env.NEXTAUTH_URL} session={session}>
      {children}
    </SessionProvider>
  );
}
