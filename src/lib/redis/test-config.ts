import { getRedisService } from './client';
import { getRedisClient } from '../cache/redis';
import { logger } from '@logger';
export async function testRedisConfig() {
  logger.info('=== Test Redis Configuration ===');

  // Show current configuration
  logger.info('Environment Variable Configuration:');
  logger.info(`REDIS_URL: ${process.env.REDIS_URL || 'Not Set'}`);
  logger.info(`REDIS_HOST: ${process.env.REDIS_HOST || 'Not Set'}`);
  logger.info(`REDIS_PORT: ${process.env.REDIS_PORT || 'Not Set'}`);
  logger.info(`REDIS_PASSWORD: ${process.env.REDIS_PASSWORD ? '***Set***' : 'Not Set'}`);
  logger.info(`REDIS_DB: ${process.env.REDIS_DB || 'Not Set'}`);

  try {
    // Test RedisService
    logger.info('\n--- Test RedisService ---');
    const redisService = getRedisService();
    await redisService.connect();
    const pingResult = await redisService.ping();
    logger.info(`RedisService ping result: ${pingResult}`);
    logger.info(`RedisService connection status: ${redisService.isReady()}`);

    // Test basic operations
    await redisService.set('test:config', 'Hello Redis!', 60);
    const value = await redisService.get('test:config');
    logger.info(`RedisService test value: ${value}`);
    await redisService.del('test:config');
    
    await redisService.disconnect();

    // Test CacheManager
    logger.info('\n--- Test CacheManager ---');
    const redisClient = await getRedisClient();
    if (redisClient) {
      const pingResult2 = await redisClient.ping();
      logger.info(`CacheManager ping result: ${pingResult2}`);

      // Test basic operations
      await redisClient.setex('test:cache', 60, 'Hello Cache!');
      const value2 = await redisClient.get('test:cache');
      logger.info(`CacheManager test value: ${value2}`);
      await redisClient.del('test:cache');
      
      redisClient.disconnect();
    } else {
      logger.info('CacheManager: Redis not available, using in-memory cache as fallback.');
    }

    logger.info('\n✅ Redis configuration test completed');

  } catch (error) {
    logger.error('❌ Redis configuration test failed', error);
  }
}

// If this file is run directly, execute the test
if (require.main === module) {
  try {
    await testRedisConfig();
  } catch (error) {
    logger.error('Execution failed', error);
  }
}
