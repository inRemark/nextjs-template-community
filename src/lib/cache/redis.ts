/**
 * Redis Cache Configuration
 */

import { Redis } from 'ioredis';
import { logger } from '@logger';

// Redis client configuration
const redisConfig = {
  url: process.env.REDIS_URL,
  host: process.env.REDIS_HOST || 'localhost',
  port: Number.parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: Number.parseInt(process.env.REDIS_DB || '0'),
};

// create a singleton Redis client
let redisClient: Redis | null = null;

export async function getRedisClient(): Promise<Redis | null> {
  if (!redisClient) {
    try {
      // use REDIS_URL first, if not present use separate configs
      if (redisConfig.url) {
        redisClient = new Redis(redisConfig.url, {
          maxRetriesPerRequest: 3,
          lazyConnect: true,
        });
      } else {
        redisClient = new Redis({
          host: redisConfig.host,
          port: redisConfig.port,
          password: redisConfig.password,
          db: redisConfig.db,
          maxRetriesPerRequest: 3,
          lazyConnect: true,
        });
      }

      redisClient.on('error', (err: Error) => {
        logger.error('Redis client error', err);
      });

      redisClient.on('connect', () => {
        logger.success('Redis client connected successfully');
      });

      // Test connection
      await redisClient.ping();
    } catch (error) {
      logger.error('Failed to connect to Redis', error);
      // when Redis is unavailable, return null to use in-memory cache as fallback
      return null;
    }
  }

  return redisClient;
}

// Cache key prefixes
export const CACHE_KEYS = {
  SEARCH_RESULTS: 'search:results',
} as const;

// Cache expiration times (in seconds)
export const CACHE_TTL = {
  SHORT: 60 * 5,        // 5 minutes
  MEDIUM: 60 * 30,      // 30 minutes
  LONG: 60 * 60,        // 1 hour
  DAILY: 60 * 60 * 24,  // 24 hours
} as const;

// In-memory cache as a fallback
const memoryCache = new Map<string, { data: any; expiry: number }>();

/**
 * Cache management class - Simplified version with core operations only
 */
export class CacheManager {
  private redis: Redis | null = null;

  async init(): Promise<void> {
    try {
      this.redis = await getRedisClient();
    } catch (error) {
      logger.error('Redis initialization failed, using memory cache:', error);
    }
  }

  /**
   * Set cache with TTL
   */
  async set(key: string, value: unknown, ttl: number = CACHE_TTL.MEDIUM): Promise<void> {
    const serializedValue = JSON.stringify(value);

    try {
      if (this.redis) {
        await this.redis.setex(key, ttl, serializedValue);
      } else {
        memoryCache.set(key, {
          data: value,
          expiry: Date.now() + ttl * 1000,
        });
        this.cleanupMemoryCache();
      }
    } catch (error) {
      logger.error('Cache set error:', error);
    }
  }

  /**
   * Get cache value
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      if (this.redis) {
        const value = await this.redis.get(key);
        return value ? JSON.parse(value) : null;
      }
      
      const cached = memoryCache.get(key);
      if (cached) {
        if (cached.expiry > Date.now()) {
          return cached.data;
        }
        memoryCache.delete(key);
      }
      return null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Delete single cache key
   */
  async del(key: string): Promise<void> {
    try {
      if (this.redis) {
        await this.redis.del(key);
      } else {
        memoryCache.delete(key);
      }
    } catch (error) {
      logger.error('Cache delete error:', error);
    }
  }

  /**
   * Delete multiple keys by pattern (use sparingly in production)
   */
  async delPattern(pattern: string): Promise<void> {
    try {
      if (this.redis) {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      } else {
        const keysToDelete = Array.from(memoryCache.keys()).filter(key =>
          this.matchPattern(key, pattern)
        );
        for (const key of keysToDelete) {
          memoryCache.delete(key);
        }
      }
    } catch (error) {
      logger.error('Cache delete pattern error:', error);
    }
  }

  /**
   * Cleanup expired entries from memory cache
   */
  private cleanupMemoryCache(): void {
    const now = Date.now();
    for (const [key, value] of memoryCache.entries()) {
      if (value.expiry <= now) {
        memoryCache.delete(key);
      }
    }
  }

  /**
   * Pattern matching for memory cache keys
   */
  private matchPattern(key: string, pattern: string): boolean {
    const regex = new RegExp(pattern.replaceAll('*', '.*'));
    return regex.test(key);
  }
}

// export a singleton CacheManager instance
export const cacheManager = new CacheManager();
// Call cacheManager.init() for asynchronous initialization when the application starts

/**
 * Cache decorator utility function
 */
export function withCache<T extends any[], R>(
  keyGenerator: (...args: T) => string,
  ttl: number = CACHE_TTL.MEDIUM
) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value;

    descriptor.value = async function (...args: T): Promise<R> {
      const cacheKey = keyGenerator(...args);

      // Try to get from cache
      const cached = await cacheManager.get<R>(cacheKey);
      if (cached !== null) {
        return cached;
      }

      // Execute original method
      const result = await method.apply(this, args);

      // Cache result
      await cacheManager.set(cacheKey, result, ttl);
      
      return result;
    };
  };
}

export function generateCacheKey(prefix: string, ...parts: (string | number)[]): string {
  return `${prefix}:${parts.join(':')}`;
}