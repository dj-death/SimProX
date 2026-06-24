import { QueryClient } from '@tanstack/react-query';
import { ApiRequestError } from './client';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // never retry auth failures; retry transient errors twice
        if (error instanceof ApiRequestError && error.isUnauthorized) return false;
        return failureCount < 2;
      },
      staleTime: 30_000,
    },
  },
});
