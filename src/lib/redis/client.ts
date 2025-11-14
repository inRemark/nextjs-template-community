import { Redis } from 'ioredis';
import { logger } from '@logger';

// Redis configuration
const redisConfig = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  host: process.env.REDIS_HOST || 'localhost',
  port: Number.parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: Number.parseInt(process.env.REDIS_DB || '0'),
};

class RedisService {
  private readonly client: Redis;
  private isConnected: boolean = false;

  constructor() {
    // use REDIS_URL first, if not present use separate configs
    if (redisConfig.url) {
      this.client = new Redis(redisConfig.url, {
        maxRetriesPerRequest: 3,
        lazyConnect: true,
      });
    } else {
      this.client = new Redis({
        host: redisConfig.host,
        port: redisConfig.port,
        password: redisConfig.password,
        db: redisConfig.db,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
      });
    }

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.client.on('connect', () => {
      logger.success('Redis connection successful');
      this.isConnected = true;
    });

    this.client.on('error', (error) => {
      logger.error('Redis connection error', error);
      this.isConnected = false;
    });

    this.client.on('close', () => {
      logger.info('Redis connection closed');
      this.isConnected = false;
    });
  }

  async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.client.connect();
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      this.client.disconnect();
    }
  }

  getClient(): Redis {
    return this.client;
  }

  isReady(): boolean {
    return this.isConnected;
  }

  async ping(): Promise<string> {
    return this.client.ping();
  }

  // Cache operations
  async set(key: string, value: string, ttl?: number): Promise<'OK'> {
    if (ttl) {
      return this.client.setex(key, ttl, value);
    }
    return this.client.set(key, value);
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  async exists(key: string): Promise<number> {
    return this.client.exists(key);
  }

  async expire(key: string, seconds: number): Promise<number> {
    return this.client.expire(key, seconds);
  }

  // Queue operations
  async lpush(key: string, value: string): Promise<number> {
    return this.client.lpush(key, value);
  }

  async rpop(key: string): Promise<string | null> {
    return this.client.rpop(key);
  }

  async llen(key: string): Promise<number> {
    return this.client.llen(key);
  }
}

// Singleton instance
let redisService: RedisService;

export function getRedisService(): RedisService {
  if (!redisService) {
    redisService = new RedisService();
  }
  return redisService;
}

export default RedisService;