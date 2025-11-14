'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: Readonly<ProtectedRouteProps>) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const loading = status === 'loading';
  const user = session?.user;

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    } else if (!loading && user && requireAdmin && user.role !== 'ADMIN') {
      router.push('/unauthorized');
    }
  }, [user, loading, router, requireAdmin]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // If admin rights are required but the user is not an admin
  if (user && requireAdmin && user.role !== 'ADMIN') {
    return null;
  }

  // If the user is authenticated (and meets admin requirements, if any)
  if (user && (!requireAdmin || user.role === 'ADMIN')) {
    return children;
  }

  return null;
}