"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { logger } from '@logger';
// Local Storage Hook
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
        const item = globalThis.localStorage.getItem(key);
        return item ? JSON.parse(item) : initialValue;
      }
      return initialValue;
    } catch (error) {
      logger.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = typeof value === 'function' ? (value as (val: T) => T)(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (globalThis.window != undefined) {
        globalThis.window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      logger.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (globalThis.window !== undefined) {
        globalThis.window.localStorage.removeItem(key);
      }
    } catch (error) {
      logger.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue] as const;
}

// Debounce Hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Media Query Hook
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (globalThis.window !== undefined) {
      const media = globalThis.window.matchMedia(query);
      setMatches(media.matches);

      const listener = (event: MediaQueryListEvent) => {
        setMatches(event.matches);
      };

      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
  }, [query]);

  return matches;
}

// Pagination Hook
export function usePagination(totalItems: number, itemsPerPage: number = 10) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const hasNext = currentPage < totalPages;
  const hasPrevious = currentPage > 1;

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const goToNext = useCallback(() => {
    if (hasNext) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, hasNext]);

  const goToPrevious = useCallback(() => {
    if (hasPrevious) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage, hasPrevious]);

  const goToFirst = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const goToLast = useCallback(() => {
    setCurrentPage(totalPages);
  }, [totalPages]);

  const getPageItems = useCallback((items: any[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  }, [currentPage, itemsPerPage]);

  return {
    currentPage,
    totalPages,
    hasNext,
    hasPrevious,
    goToPage,
    goToNext,
    goToPrevious,
    goToFirst,
    goToLast,
    getPageItems,
  };
}

// Copy to Clipboard Hook
export function useCopyToClipboard() {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers (without using deprecated execCommand)
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          // Use the Clipboard API if available
          if (globalThis.navigator?.clipboard) {
            await globalThis.navigator.clipboard.writeText(textArea.value);
          }
        } catch (err) {
          logger.error('Clipboard API fallback failed:', err);
        }
        textArea.remove();
      }
      
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      return true;
    } catch (error) {
      logger.error('Failed to copy text:', error);
      setIsCopied(false);
      return false;
    }
  }, []);

  return { isCopied, copyToClipboard };
}

// Toggle Hook
export function useToggle(initialValue: boolean = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => setValue(v => !v), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return [value, { toggle, setTrue, setFalse, setValue }] as const;
}

// Online Status Hook
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (globalThis.window !== undefined) {
      setIsOnline(globalThis.navigator.onLine);

      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      globalThis.window.addEventListener('online', handleOnline);
      globalThis.window.addEventListener('offline', handleOffline);

      return () => {
        globalThis.window.removeEventListener('online', handleOnline);
        globalThis.window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  return isOnline;
}

// Window Size Hook
export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    if (globalThis.window !== undefined) {
      const handleResize = () => {
        setWindowSize({
          width: globalThis.window.innerWidth,
          height: globalThis.window.innerHeight,
        });
      };

      // Set initial size
      handleResize();

      globalThis.window.addEventListener('resize', handleResize);
      return () => globalThis.window.removeEventListener('resize', handleResize);
    }
  }, []);

  return windowSize;
}

// Previous Value Hook
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}