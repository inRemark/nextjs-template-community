import { useCallback, useEffect, useState } from 'react';

type MediaQueryList = {
  matches: boolean;
  addEventListener(type: string, listener: (e: MediaQueryListEvent) => void): void;
  removeEventListener(type: string, listener: (e: MediaQueryListEvent) => void): void;
  addListener?(listener: (e: MediaQueryListEvent) => void): void;
  removeListener?(listener: (e: MediaQueryListEvent) => void): void;
};

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  const handleChange = useCallback((e: MediaQueryListEvent) => {
    setMatches(e.matches);
  }, []);

  useEffect(() => {
    const mediaQuery = globalThis.matchMedia(query) as MediaQueryList;
    setMatches(mediaQuery.matches);

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (typeof mediaQuery.removeEventListener === 'function') {
        mediaQuery.removeEventListener('change', handleChange);
      } else if (mediaQuery.removeListener) {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [query, handleChange]);

  return matches;
} 