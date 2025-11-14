'use client';

import { SessionProvider } from 'next-auth/react';
import type { ReactNode } from 'react';

interface AuthProvidersProps {
  readonly children: ReactNode;
}

/**
 * NextAuth SessionProvider wrapper
 */
export function AuthProviders({ children }: AuthProvidersProps) {
  return <SessionProvider>{children}</SessionProvider>;
}
