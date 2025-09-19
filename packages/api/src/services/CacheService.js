const redis = require('redis');
const { promisify } = require('util');
const winston = require('winston');
const crypto = require('crypto');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'cache-service' },
  transports: [
    new winston.transports.File({ filename: 'logs/cache-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/cache-combined.log' })
  ]
});

class CacheService {
  constructor(options = {}) {
    this.options = {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || null,
      db: process.env.REDIS_DB || 0,
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 100,
      enableReadyCheck: true,
      maxmemoryPolicy: 'allkeys-lru',
      ttl: 3600, // Default 1 hour
      ...options
    };

    this.client = null;
    this.isConnected = false;
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0
    };
    
    this.namespaces = {
      USER: 'user',
      CONTENT: 'content',
      ANALYTICS: 'analytics',
      SESSION: 'session',
      RATE_LIMIT: 'rate_limit',
      CONFIG: 'config',
      TEMPLATE: 'template',
      API_RESPONSE: 'api_response',
      CALENDAR: 'calendar',
      PAYMENT: 'payment'
    };

    this.init();
  }

  async init() {
    try {
      this.client = redis.createClient(this.options);
      
      // Promisify Redis methods
      this.getAsync = promisify(this.client.get).bind(this.client);
      this.setAsync = promisify(this.client.set).bind(this.client);
      this.delAsync = promisify(this.client.del).bind(this.client);
      this.existsAsync = promisify(this.client.exists).bind(this.client);
      this.keysAsync = promisify(this.client.keys).bind(this.client);
      this.flushdbAsync = promisify(this.client.flushdb).bind(this.client);
      this.infoAsync = promisify(this.client.info).bind(this.client);
      this.ttlAsync = promisify(this.client.ttl).bind(this.client);
      this.expireAsync = promisify(this.client.expire).bind(this.client);
      this.incrAsync = promisify(this.client.incr).bind(this.client);
      this.decrAsync = promisify(this.client.decr).bind(this.client);
      this.lpushAsync = promisify(this.client.lpush).bind(this.client);
      this.rpushAsync = promisify(this.client.rpush).bind(this.client);
      this.lpopAsync = promisify(this.client.lpop).bind(this.client);
      this.rpopAsync = promisify(this.client.rpop).bind(this.client);
      this.llenAsync = promisify(this.client.llen).bind(this.client);
      this.saddAsync = promisify(this.client.sadd).bind(this.client);
      this.sremAsync = promisify(this.client.srem).bind(this.client);
      this.smembersAsync = promisify(this.client.smembers).bind(this.client);
      this.sismemberAsync = promisify(this.client.sismember).bind(this.client);
      this.hsetAsync = promisify(this.client.hset).bind(this.client);
      this.hgetAsync = promisify(this.client.hget).bind(this.client);
      this.hgetallAsync = promisify(this.client.hgetall).bind(this.client);
      this.hdelAsync = promisify(this.client.hdel).bind(this.client);
      this.zaddAsync = promisify(this.client.zadd).bind(this.client);
      this.zrangeAsync = promisify(this.client.zrange).bind(this.client);
      this.zrevrangeAsync = promisify(this.client.zrevrange).bind(this.client);
      this.zremAsync = promisify(this.client.zrem).bind(this.client);

      // Event handlers
      this.client.on('connect', () => {
        this.isConnected = true;
        logger.info('Redis client connected');
      });

      this.client.on('ready', () => {
        logger.info('Redis client ready');
        this.isConnected = true;
      });

      this.client.on('error', (err) => {
        this.isConnected = false;
        this.stats.errors++;
        logger.error('Redis client error', err);
      });

      this.client.on('end', () => {
        this.isConnected = false;
        logger.info('Redis client disconnected');
      });

      // Connect to Redis
      await this.client.connect();
      
    } catch (error) {
      logger.error('Failed to initialize Redis client', error);
      throw error;
    }
  }

  // Generate cache key with namespace
  generateKey(namespace, key) {
    return `${namespace}:${key}`;
  }

  // Get cache key hash for long keys
  getKeyHash(key) {
    return crypto.createHash('sha256').update(key).digest('hex');
  }

  // Basic cache operations
  async get(key, namespace = 'default') {
    try {
      const cacheKey = this.generateKey(namespace, key);
      const result = await this.getAsync(cacheKey);
      
      if (result) {
        this.stats.hits++;
        logger.debug(`Cache hit: ${cacheKey}`);
        return JSON.parse(result);
      } else {
        this.stats.misses++;
        logger.debug(`Cache miss: ${cacheKey}`);
        return null;
      }
    } catch (error) {
      this.stats.errors++;
      logger.error(`Cache get error for key ${key}`, error);
      return null;
    }
  }

  async set(key, value, ttl = this.options.ttl, namespace = 'default') {
    try {
      const cacheKey = this.generateKey(namespace, key);
      const serializedValue = JSON.stringify(value);
      
      if (ttl) {
        await this.setAsync(cacheKey, serializedValue, 'EX', ttl);
      } else {
        await this.setAsync(cacheKey, serializedValue);
      }
      
      this.stats.sets++;
      logger.debug(`Cache set: ${cacheKey}`);
      return true;
    } catch (error) {
      this.stats.errors++;
      logger.error(`Cache set error for key ${key}`, error);
      return false;
    }
  }

  async del(key, namespace = 'default') {
    try {
      const cacheKey = this.generateKey(namespace, key);
      const result = await this.delAsync(cacheKey);
      
      this.stats.deletes++;
      logger.debug(`Cache delete: ${cacheKey}`);
      return result > 0;
    } catch (error) {
      this.stats.errors++;
      logger.error(`Cache delete error for key ${key}`, error);
      return false;
    }
  }

  async exists(key, namespace = 'default') {
    try {
      const cacheKey = this.generateKey(namespace, key);
      const result = await this.existsAsync(cacheKey);
      return result === 1;
    } catch (error) {
      this.stats.errors++;
      logger.error(`Cache exists error for key ${key}`, error);
      return false;
    }
  }

  async ttl(key, namespace = 'default') {
    try {
      const cacheKey = this.generateKey(namespace, key);
      const result = await this.ttlAsync(cacheKey);
      return result;
    } catch (error) {
      this.stats.errors++;
      logger.error(`Cache TTL error for key ${key}`, error);
      return -1;
    }
  }

  async expire(key, ttl, namespace = 'default') {
    try {
      const cacheKey = this.generateKey(namespace, key);
      const result = await this.expireAsync(cacheKey, ttl);
      return result === 1;
    } catch (error) {
      this.stats.errors++;
      logger.error(`Cache expire error for key ${key}`, error);
      return false;
    }
  }

  // Advanced cache operations
  async getOrSet(key, factory, ttl = this.options.ttl, namespace = 'default') {
    try {
      let value = await this.get(key, namespace);
      
      if (value === null) {
        value = await factory();
        if (value !== null && value !== undefined) {
          await this.set(key, value, ttl, namespace);
        }
      }
      
      return value;
    } catch (error) {
      logger.error(`Cache getOrSet error for key ${key}`, error);
      return null;
    }
  }

  async increment(key, amount = 1, ttl = null, namespace = 'default') {
    try {
      const cacheKey = this.generateKey(namespace, key);
      const result = await this.incrAsync(cacheKey, amount);
      
      if (ttl) {
        await this.expireAsync(cacheKey, ttl);
      }
      
      return result;
    } catch (error) {
      this.stats.errors++;
      logger.error(`Cache increment error for key ${key}`, error);
      return null;
    }
  }

  async decrement(key, amount = 1, ttl = null, namespace = 'default') {
    try {
      const cacheKey = this.generateKey(namespace, key);
      const result = await this.decrAsync(cacheKey, amount);
      
      if (ttl) {
        await this.expireAsync(cacheKey, ttl);
      }
      
      return result;
    } catch (error) {
      this.stats.errors++;
      logger.error(`Cache decrement error for key ${key}`, error);
      return null;
    }
  }

  // List operations
  async listPush(key, value, namespace = 'default') {
    try {
      const cacheKey = this.generateKey(namespace, key);
      const serializedValue = JSON.stringify(value);
      await this.rpushAsync(cacheKey, serializedValue);
      return true;
    } catch (error) {
      this.stats.errors++;
      logger.error(`Cache list push error for key ${key}`, error);
      return false;
    }
  }

  async listPop(key, namespace = 'default') {
    try {
      const cacheKey = this.generateKey(namespace, key);
      const result = await this.rpopAsync(cacheKey);
      return result ? JSON.parse(result) : null;
    } catch (error) {
      this.stats.errors++;
      logger.error(`Cache list pop error for key ${key}`, error);
      return null;
    }
  }

  async listLength(key, namespace = 'default') {
    try {
      const cacheKey = this.generateKey(namespace, key);
      return await this.llenAsync(cacheKey);
    } catch (error) {
      this.stats.errors++;
      logger.error(`Cache list length error for key ${key}`, error);
      return 0;
    }
  }

  // Set operations
  async setAdd(key, value, namespace = 'default') {
    try {
      const cacheKey = this.generateKey(namespace, key);
      const serializedValue = JSON.stringify(value);
      await this.saddAsync(cacheKey, serializedValue);
      return true;
    } catch (error) {
      this.stats.errors++;
      logger.error(`Cache set add error for key ${key}`, error);
      return false;
    }
  }

  async setRemove(key, value, namespace = 'default') {
    try {
      const cacheKey = this.generateKey(namespace, key);
      const serializedValue = JSON.stringify(value);
      await this.sremAsync(cacheKey, serializedValue);
      return true;
    } catch (error) {
      this.stats.errors++;
      logger.error(`Cache set remove error for key ${key}`, error);
      return false;
    }
  }

  async setMembers(key, namespace = 'default') {
    try {
      const cacheKey = this.generateKey(namespace, key);
      const members = await this.smembersAsync(cacheKey);
      return members.map(member => JSON.parse(member));
    } catch (error) {
      this.stats.errors++;
      logger.error(`Cache set members error for key ${key}`, error);
      return [];
    }
  }

  async setContains(key, value, namespace = 'default') {
    try {
      const cacheKey = this.generateKey(namespace, key);
      const serializedValue = JSON.stringify(value);
      const result = await this.sismemberAsync(cacheKey, serializedValue);
      return result === 1;
    } catch (error) {
      this.stats.errors++;
      logger.error(`Cache set contains error for key ${key}`, error);
      return false;
    }
  }

  // Hash operations
  async hashSet(key, field, value, namespace = 'default') {
    try {
      const cacheKey = this.generateKey(namespace, key);
      const serializedValue = JSON.stringify(value);
      await this.hsetAsync(cacheKey, field, serializedValue);
      return true;
    } catch (error) {
      this.stats.errors++;
      logger.error(`Cache hash set error for key ${key}`, error);
      return false;
    }
  }

  async hashGet(key, field, namespace = 'default') {
    try {
      const cacheKey = this.generateKey(namespace, key);
      const result = await this.hgetAsync(cacheKey, field);
      return result ? JSON.parse(result) : null;
    } catch (error) {
      this.stats.errors++;
      logger.error(`Cache hash get error for key ${key}`, error);
      return null;
    }
  }

  async hashGetAll(key, namespace = 'default') {
    try {
      const cacheKey = this.generateKey(namespace, key);
      const result = await this.hgetallAsync(cacheKey);
      const parsed = {};
      
      for (const [field, value] of Object.entries(result)) {
        parsed[field] = JSON.parse(value);
      }
      
      return parsed;
    } catch (error) {
      this.stats.errors++;
      logger.error(`Cache hash get all error for key ${key}`, error);
      return {};
    }
  }

  async hashDelete(key, field, namespace = 'default') {
    try {
      const cacheKey = this.generateKey(namespace, key);
      const result = await this.hdelAsync(cacheKey, field);
      return result > 0;
    } catch (error) {
      this.stats.errors++;
      logger.error(`Cache hash delete error for key ${key}`, error);
      return false;
    }
  }

  // Sorted set operations
  async sortedSetAdd(key, score, value, namespace = 'default') {
    try {
      const cacheKey = this.generateKey(namespace, key);
      const serializedValue = JSON.stringify(value);
      await this.zaddAsync(cacheKey, score, serializedValue);
      return true;
    } catch (error) {
      this.stats.errors++;
      logger.error(`Cache sorted set add error for key ${key}`, error);
      return false;
    }
  }

  async sortedSetRange(key, start, stop, namespace = 'default') {
    try {
      const cacheKey = this.generateKey(namespace, key);
      const members = await this.zrangeAsync(cacheKey, start, stop);
      return members.map(member => JSON.parse(member));
    } catch (error) {
      this.stats.errors++;
      logger.error(`Cache sorted set range error for key ${key}`, error);
      return [];
    }
  }

  async sortedSetReverseRange(key, start, stop, namespace = 'default') {
    try {
      const cacheKey = this.generateKey(namespace, key);
      const members = await this.zrevrangeAsync(cacheKey, start, stop);
      return members.map(member => JSON.parse(member));
    } catch (error) {
      this.stats.errors++;
      logger.error(`Cache sorted set reverse range error for key ${key}`, error);
      return [];
    }
  }

  // Cache management operations
  async flushNamespace(namespace) {
    try {
      const pattern = `${namespace}:*`;
      const keys = await this.keysAsync(pattern);
      
      if (keys.length > 0) {
        await Promise.all(keys.map(key => this.delAsync(key)));
      }
      
      logger.info(`Flushed namespace: ${namespace}`, { keyCount: keys.length });
      return keys.length;
    } catch (error) {
      this.stats.errors++;
      logger.error(`Cache flush namespace error: ${namespace}`, error);
      return 0;
    }
  }

  async flushAll() {
    try {
      await this.flushdbAsync();
      logger.info('Flushed all cache');
      return true;
    } catch (error) {
      this.stats.errors++;
      logger.error('Cache flush all error', error);
      return false;
    }
  }

  async getKeys(pattern = '*') {
    try {
      const keys = await this.keysAsync(pattern);
      return keys;
    } catch (error) {
      this.stats.errors++;
      logger.error(`Cache get keys error for pattern ${pattern}`, error);
      return [];
    }
  }

  // Cache statistics
  getStats() {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;
    
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      sets: this.stats.sets,
      deletes: this.stats.deletes,
      errors: this.stats.errors,
      hitRate: hitRate.toFixed(2),
      totalRequests,
      isConnected: this.isConnected
    };
  }

  resetStats() {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0
    };
    logger.info('Cache statistics reset');
  }

  // Cache health check
  async healthCheck() {
    try {
      if (!this.isConnected) {
        throw new Error('Redis client not connected');
      }

      const start = Date.now();
      await this.pingAsync();
      const responseTime = Date.now() - start;

      return {
        status: 'healthy',
        responseTime: `${responseTime}ms`,
        connected: this.isConnected,
        stats: this.getStats()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        connected: this.isConnected
      };
    }
  }

  // Rate limiting functionality
  async checkRateLimit(key, limit, window = 3600, namespace = 'rate_limit') {
    try {
      const cacheKey = this.generateKey(namespace, key);
      const current = await this.incrAsync(cacheKey);
      
      if (current === 1) {
        await this.expireAsync(cacheKey, window);
      }
      
      const ttl = await this.ttlAsync(cacheKey);
      
      return {
        allowed: current <= limit,
        current,
        limit,
        remaining: Math.max(0, limit - current),
        resetTime: new Date(Date.now() + ttl * 1000)
      };
    } catch (error) {
      this.stats.errors++;
      logger.error(`Rate limit check error for key ${key}`, error);
      return { allowed: true, current: 0, limit, remaining: limit }; // Fail open
    }
  }

  // Cache warming
  async warmCache(items) {
    const results = [];
    
    for (const item of items) {
      try {
        const { key, value, ttl, namespace } = item;
        const success = await this.set(key, value, ttl, namespace);
        results.push({ key, success });
      } catch (error) {
        logger.error(`Cache warming error for key ${item.key}`, error);
        results.push({ key: item.key, success: false, error: error.message });
      }
    }
    
    logger.info('Cache warming completed', { 
      total: results.length, 
      successful: results.filter(r => r.success).length 
    });
    
    return results;
  }

  // Bulk operations
  async bulkSet(items, namespace = 'default') {
    const results = [];
    
    for (const item of items) {
      try {
        const { key, value, ttl } = item;
        const success = await this.set(key, value, ttl || this.options.ttl, namespace);
        results.push({ key, success });
      } catch (error) {
        logger.error(`Bulk set error for key ${item.key}`, error);
        results.push({ key: item.key, success: false, error: error.message });
      }
    }
    
    return results;
  }

  async bulkGet(keys, namespace = 'default') {
    const results = {};
    
    for (const key of keys) {
      try {
        const value = await this.get(key, namespace);
        results[key] = value;
      } catch (error) {
        logger.error(`Bulk get error for key ${key}`, error);
        results[key] = null;
      }
    }
    
    return results;
  }

  // Cleanup
  async cleanup() {
    try {
      if (this.client) {
        await this.client.quit();
        logger.info('Cache service cleaned up');
      }
    } catch (error) {
      logger.error('Error during cache cleanup', error);
    }
  }
}

module.exports = CacheService;