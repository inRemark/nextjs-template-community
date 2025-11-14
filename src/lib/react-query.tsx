'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

// create a factory function to create QueryClient instance
const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      // Data freshness time (5 minutes)
      staleTime: 5 * 60 * 1000,
      // Cache time (10 minutes)
      gcTime: 10 * 60 * 1000,
      // Retry count
      retry: (failureCount, error: unknown) => {
        // Do not retry 4xx errors
        const httpError = error as { response?: { status?: number } };
        if (httpError?.response?.status && httpError.response.status >= 400 && httpError.response.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
      // Retry delay
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Do not refetch when window is not focused
      refetchOnWindowFocus: false,
      // Refetch on reconnect
      refetchOnReconnect: true,
      // Pause retries on network errors
      networkMode: 'online',
    },
    mutations: {
      // Change retry count
      retry: 1,
      // Change retry delay
      retryDelay: 1000,
      // Pause retries on network errors
      networkMode: 'online',
    },
  },
});

// React Query Provider组件
interface ReactQueryProviderProps {
  readonly children: ReactNode;
}

export function ReactQueryProvider({ children }: ReactQueryProviderProps) {
  const [queryClient] = useState(() => createQueryClient());
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}