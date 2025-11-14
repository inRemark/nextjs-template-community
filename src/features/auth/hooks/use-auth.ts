'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

/**
 * Unified Authentication Hook (NextAuth only)
 * Provides a consistent API interface, wrapping NextAuth's useSession
 */
export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const login = useCallback(async (email: string, password: string) => {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      throw new Error(result.error);
    }

    return result;
  }, []);

  const logout = useCallback(async () => {
    await signOut({ redirect: false });
    router.push('/');
  }, [router]);

  return {
    // User information
    user: session?.user || null,
    session,
    
    // Loading status
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    
    // Auth actions
    login,
    logout,
    signIn, // Expose NextAuth's signIn for OAuth
  };
}
