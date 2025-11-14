import { useState, useEffect, useCallback } from 'react';
import { logger } from '@logger';
export interface PersistOptions<T> {
  key: string;
  version?: number;
  migrate?: (oldValue: unknown, oldVersion: number) => T;
  serialize?: (value: T) => string;
  deserialize?: (value: string) => T;
}

const defaultSerialize = <T>(value: T): string => JSON.stringify(value);
const defaultDeserialize = <T>(value: string): T => JSON.parse(value);

export function usePersistedState<T>(
  defaultValue: T | (() => T),
  options: PersistOptions<T>
) {
  // Ensure the uniqueness of the key
  const storageKey = `persisted_state:${options.key}:v${options.version || 1}`;

  // initialize function - try to read from storage, if not present use default value
  const getInitialValue = (): T => {
    try {
      const serializedValue = localStorage.getItem(storageKey);
      if (serializedValue === null) {
        return typeof defaultValue === 'function' 
          ? (defaultValue as () => T)() 
          : defaultValue;
      }

      // if there is a version migration function, perform the migration
      if (options.migrate) {
        const oldVersion = Number(localStorage.getItem(`${storageKey}:version`)) || 1;
        if (oldVersion < (options.version || 1)) {
          const deserialize = options.deserialize || defaultDeserialize;
          const oldValue = deserialize(serializedValue);
          return options.migrate(oldValue, oldVersion);
        }
      }

      const deserialize = options.deserialize || defaultDeserialize;
      return deserialize(serializedValue);
    } catch (error) {
      logger.warn(`Failed to load persisted state for key "${options.key}":`, error);
      return typeof defaultValue === 'function' 
        ? (defaultValue as () => T)() 
        : defaultValue;
    }
  };

  const [state, setState] = useState<T>(getInitialValue);

  // persist to localStorage
  const persistState = useCallback((value: T) => {
    try {
      const serialize = options.serialize || defaultSerialize;
      localStorage.setItem(storageKey, serialize(value));
      if (options.version) {
        localStorage.setItem(`${storageKey}:version`, String(options.version));
      }
    } catch (error) {
      logger.warn(`Failed to persist state for key "${options.key}":`, error);
    }
  }, [storageKey, options]);

  // update state wrapper function
  const setPersistedState = useCallback((value: T | ((prev: T) => T)) => {
    setState(prev => {
      const nextValue = typeof value === 'function' 
        ? (value as ((prev: T) => T))(prev) 
        : value;
      persistState(nextValue);
      return nextValue;
    });
  }, [persistState]);

  // subscribe to storage events for cross-tab synchronization
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === storageKey && event.newValue !== null) {
        try {
          const deserialize = options.deserialize || defaultDeserialize;
          const newValue = deserialize(event.newValue);
          setState(newValue);
        } catch (error) {
          logger.warn(`Failed to sync state for key "${options.key}":`, error);
        }
      }
    };

    globalThis.addEventListener('storage', handleStorage);
    return () => globalThis.removeEventListener('storage', handleStorage);
  }, [storageKey, options]);

  return [state, setPersistedState] as const;
} 