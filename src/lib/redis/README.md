# Redis配置说明

本项目支持两种Redis配置方式，都从环境变量读取配置信息。

## 配置方式

### 方式1：使用连接字符串（推荐）

设置 `REDIS_URL` 环境变量：

```bash
# 基本连接
REDIS_URL="redis://localhost:6379"

# 带密码的连接
REDIS_URL="redis://user:password@localhost:6379"

# 指定数据库
REDIS_URL="redis://localhost:6379/1"

# 完整配置
REDIS_URL="redis://user:password@localhost:6379/1"
```

### 方式2：使用分离的配置项

如果不想使用连接字符串，可以分别设置：

```bash
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD="your-password"
REDIS_DB="0"
```

## 使用示例

### RedisService (ioredis)

```typescript
import { getRedisService } from '@/lib/redis/client';

const redis = getRedisService();
await redis.connect();

// 基本操作
await redis.set('key', 'value', 60); // 60秒过期
const value = await redis.get('key');
await redis.del('key');

// 队列操作
await redis.lpush('queue', 'item');
const item = await redis.rpop('queue');
```

### CacheManager (缓存管理)

```typescript
import { cacheManager } from '@/lib/cache/redis';

// 设置缓存
await cacheManager.set('user:123', { name: 'John' }, 300);

// 获取缓存
const user = await cacheManager.get('user:123');

// 删除缓存
await cacheManager.del('user:123');

// 批量删除
await cacheManager.delPattern('user:*');
```

## 环境变量配置

在 `.env.local` 或 `.env.production` 中配置：

```bash
# Redis配置
REDIS_URL="redis://localhost:6379"
# 或者使用分离配置
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD=""
REDIS_DB="0"
```

## 测试配置

运行测试脚本验证配置：

```bash
npx tsx src/lib/redis/test-config.ts
```

## 注意事项

1. **优先级**：如果同时设置了 `REDIS_URL` 和分离的配置项，优先使用 `REDIS_URL`
2. **降级方案**：如果Redis不可用，CacheManager会自动降级到内存缓存
3. **连接池**：两个Redis客户端都使用单例模式，避免重复连接
4. **错误处理**：所有Redis操作都有错误处理，不会影响主业务逻辑

## 生产环境部署

在Vercel等平台部署时，在环境变量中设置：

```bash
REDIS_URL="redis://your-redis-host:6379"
```

或者使用Redis云服务：

```bash
REDIS_URL="redis://user:password@your-redis-cloud-host:6379"
```
