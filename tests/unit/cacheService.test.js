const sinon = require('sinon');
const { expect } = require('chai');
const redis = require('redis');

describe('CacheService', () => {
  let cacheService;
  let redisClientStub;
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    
    // Create Redis client stub
    redisClientStub = {
      connect: sandbox.stub().resolves(),
      disconnect: sandbox.stub().resolves(),
      quit: sandbox.stub().resolves(),
      ping: sandbox.stub().resolves('PONG'),
      get: sandbox.stub(),
      set: sandbox.stub(),
      setEx: sandbox.stub(),
      del: sandbox.stub(),
      exists: sandbox.stub(),
      expire: sandbox.stub(),
      ttl: sandbox.stub(),
      incr: sandbox.stub(),
      incrBy: sandbox.stub(),
      decr: sandbox.stub(),
      decrBy: sandbox.stub(),
      lPush: sandbox.stub(),
      rPush: sandbox.stub(),
      lPop: sandbox.stub(),
      rPop: sandbox.stub(),
      lRange: sandbox.stub(),
      lLen: sandbox.stub(),
      sAdd: sandbox.stub(),
      sRem: sandbox.stub(),
      sMembers: sandbox.stub(),
      sIsMember: sandbox.stub(),
      sCard: sandbox.stub(),
      hSet: sandbox.stub(),
      hGet: sandbox.stub(),
      hGetAll: sandbox.stub(),
      hDel: sandbox.stub(),
      hExists: sandbox.stub(),
      hLen: sandbox.stub(),
      zAdd: sandbox.stub(),
      zRem: sandbox.stub(),
      zRange: sandbox.stub(),
      zRangeByScore: sandbox.stub(),
      zScore: sandbox.stub(),
      zCard: sandbox.stub(),
      flushAll: sandbox.stub(),
      flushDb: sandbox.stub(),
      multi: sandbox.stub().returns({
        exec: sandbox.stub(),
        set: sandbox.stub().returnsThis(),
        get: sandbox.stub().returnsThis(),
        del: sandbox.stub().returnsThis()
      })
    };
    
    // Stub Redis client creation
    sandbox.stub(redis, 'createClient').returns(redisClientStub);
    
    // Initialize service
    const CacheService = require('../../services/CacheService');
    cacheService = new CacheService();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('Constructor', () => {
    it('should initialize with default options', () => {
      expect(cacheService.config).to.exist;
      expect(cacheService.defaultTTL).to.equal(3600);
      expect(cacheService.stats).to.deep.equal({ hits: 0, misses: 0, sets: 0, deletes: 0 });
    });

    it('should initialize with custom options', () => {
      const customOptions = {
        defaultTTL: 7200,
        maxRetries: 5,
        retryDelay: 2000
      };
      
      const customService = new (require('../../services/CacheService'))(customOptions);
      
      expect(customService.config.defaultTTL).to.equal(7200);
      expect(customService.config.maxRetries).to.equal(5);
      expect(customService.config.retryDelay).to.equal(2000);
    });

    it('should use environment variables when available', () => {
      process.env.REDIS_HOST = 'custom.redis.host';
      process.env.REDIS_PORT = '6380';
      process.env.REDIS_PASSWORD = 'custom_password';
      
      const envService = new (require('../../services/CacheService'))();
      
      expect(redis.createClient.calledWith(sinon.match({
        socket: {
          host: 'custom.redis.host',
          port: 6380
        },
        password: 'custom_password'
      }))).to.be.true;
    });
  });

  describe('connect', () => {
    it('should connect to Redis successfully', async () => {
      redisClientStub.connect.resolves();
      redisClientStub.ping.resolves('PONG');
      
      const result = await cacheService.connect();
      
      expect(result).to.be.true;
      expect(redisClientStub.connect.calledOnce).to.be.true;
      expect(redisClientStub.ping.calledOnce).to.be.true;
    });

    it('should handle connection failure', async () => {
      redisClientStub.connect.rejects(new Error('Connection refused'));
      
      const result = await cacheService.connect();
      
      expect(result).to.be.false;
    });

    it('should handle ping failure', async () => {
      redisClientStub.connect.resolves();
      redisClientStub.ping.rejects(new Error('Ping failed'));
      
      const result = await cacheService.connect();
      
      expect(result).to.be.false;
    });
  });

  describe('get', () => {
    it('should retrieve cached value successfully', async () => {
      const key = 'test_key';
      const value = { data: 'test_value' };
      
      redisClientStub.get.resolves(JSON.stringify(value));
      
      const result = await cacheService.get(key);
      
      expect(result).to.deep.equal(value);
      expect(cacheService.stats.hits).to.equal(1);
      expect(cacheService.stats.misses).to.equal(0);
    });

    it('should return null for non-existent key', async () => {
      redisClientStub.get.resolves(null);
      
      const result = await cacheService.get('nonexistent');
      
      expect(result).to.be.null;
      expect(cacheService.stats.hits).to.equal(0);
      expect(cacheService.stats.misses).to.equal(1);
    });

    it('should handle Redis errors', async () => {
      redisClientStub.get.rejects(new Error('Redis error'));
      
      const result = await cacheService.get('test_key');
      
      expect(result).to.be.null;
    });

    it('should handle JSON parsing errors', async () => {
      redisClientStub.get.resolves('invalid json');
      
      const result = await cacheService.get('test_key');
      
      expect(result).to.be.null;
    });
  });

  describe('set', () => {
    it('should set cache value successfully', async () => {
      const key = 'test_key';
      const value = { data: 'test_value' };
      
      redisClientStub.set.resolves('OK');
      
      const result = await cacheService.set(key, value);
      
      expect(result).to.be.true;
      expect(redisClientStub.set.calledWith(key, JSON.stringify(value))).to.be.true;
      expect(cacheService.stats.sets).to.equal(1);
    });

    it('should set cache value with custom TTL', async () => {
      const key = 'test_key';
      const value = { data: 'test_value' };
      const ttl = 7200;
      
      redisClientStub.setEx.resolves('OK');
      
      const result = await cacheService.set(key, value, ttl);
      
      expect(result).to.be.true;
      expect(redisClientStub.setEx.calledWith(key, ttl, JSON.stringify(value))).to.be.true;
    });

    it('should handle Redis errors', async () => {
      redisClientStub.set.rejects(new Error('Redis error'));
      
      const result = await cacheService.set('test_key', 'value');
      
      expect(result).to.be.false;
    });

    it('should handle circular references', async () => {
      const obj = { name: 'test' };
      obj.self = obj; // Create circular reference
      
      redisClientStub.set.resolves('OK');
      
      const result = await cacheService.set('test_key', obj);
      
      expect(result).to.be.true;
      // Should handle circular reference gracefully
    });
  });

  describe('delete', () => {
    it('should delete cached value successfully', async () => {
      redisClientStub.del.resolves(1);
      
      const result = await cacheService.delete('test_key');
      
      expect(result).to.be.true;
      expect(redisClientStub.del.calledWith('test_key')).to.be.true;
      expect(cacheService.stats.deletes).to.equal(1);
    });

    it('should return false for non-existent key', async () => {
      redisClientStub.del.resolves(0);
      
      const result = await cacheService.delete('nonexistent');
      
      expect(result).to.be.false;
    });

    it('should handle Redis errors', async () => {
      redisClientStub.del.rejects(new Error('Redis error'));
      
      const result = await cacheService.delete('test_key');
      
      expect(result).to.be.false;
    });
  });

  describe('exists', () => {
    it('should return true for existing key', async () => {
      redisClientStub.exists.resolves(1);
      
      const result = await cacheService.exists('test_key');
      
      expect(result).to.be.true;
    });

    it('should return false for non-existent key', async () => {
      redisClientStub.exists.resolves(0);
      
      const result = await cacheService.exists('nonexistent');
      
      expect(result).to.be.false;
    });

    it('should handle Redis errors', async () => {
      redisClientStub.exists.rejects(new Error('Redis error'));
      
      const result = await cacheService.exists('test_key');
      
      expect(result).to.be.false;
    });
  });

  describe('increment', () => {
    it('should increment counter successfully', async () => {
      redisClientStub.incr.resolves(5);
      
      const result = await cacheService.increment('counter_key');
      
      expect(result).to.equal(5);
    });

    it('should increment by custom value', async () => {
      redisClientStub.incrBy.resolves(15);
      
      const result = await cacheService.increment('counter_key', 10);
      
      expect(result).to.equal(15);
      expect(redisClientStub.incrBy.calledWith('counter_key', 10)).to.be.true;
    });

    it('should handle Redis errors', async () => {
      redisClientStub.incr.rejects(new Error('Redis error'));
      
      const result = await cacheService.increment('counter_key');
      
      expect(result).to.be.null;
    });
  });

  describe('decrement', () => {
    it('should decrement counter successfully', async () => {
      redisClientStub.decr.resolves(3);
      
      const result = await cacheService.decrement('counter_key');
      
      expect(result).to.equal(3);
    });

    it('should decrement by custom value', async () => {
      redisClientStub.decrBy.resolves(5);
      
      const result = await cacheService.decrement('counter_key', 5);
      
      expect(result).to.equal(5);
      expect(redisClientStub.decrBy.calledWith('counter_key', 5)).to.be.true;
    });

    it('should handle Redis errors', async () => {
      redisClientStub.decr.rejects(new Error('Redis error'));
      
      const result = await cacheService.decrement('counter_key');
      
      expect(result).to.be.null;
    });
  });

  describe('List Operations', () => {
    describe('pushToList', () => {
      it('should push to left of list', async () => {
        redisClientStub.lPush.resolves(3);
        
        const result = await cacheService.pushToList('list_key', 'item1', 'left');
        
        expect(result).to.equal(3);
        expect(redisClientStub.lPush.calledWith('list_key', 'item1')).to.be.true;
      });

      it('should push to right of list', async () => {
        redisClientStub.rPush.resolves(3);
        
        const result = await cacheService.pushToList('list_key', 'item1', 'right');
        
        expect(result).to.equal(3);
        expect(redisClientStub.rPush.calledWith('list_key', 'item1')).to.be.true;
      });

      it('should handle Redis errors', async () => {
        redisClientStub.lPush.rejects(new Error('Redis error'));
        
        const result = await cacheService.pushToList('list_key', 'item1', 'left');
        
        expect(result).to.be.null;
      });
    });

    describe('popFromList', () => {
      it('should pop from left of list', async () => {
        redisClientStub.lPop.resolves('item1');
        
        const result = await cacheService.popFromList('list_key', 'left');
        
        expect(result).to.equal('item1');
        expect(redisClientStub.lPop.calledWith('list_key')).to.be.true;
      });

      it('should pop from right of list', async () => {
        redisClientStub.rPop.resolves('item3');
        
        const result = await cacheService.popFromList('list_key', 'right');
        
        expect(result).to.equal('item3');
        expect(redisClientStub.rPop.calledWith('list_key')).to.be.true;
      });

      it('should handle empty list', async () => {
        redisClientStub.lPop.resolves(null);
        
        const result = await cacheService.popFromList('empty_list', 'left');
        
        expect(result).to.be.null;
      });

      it('should handle Redis errors', async () => {
        redisClientStub.lPop.rejects(new Error('Redis error'));
        
        const result = await cacheService.popFromList('list_key', 'left');
        
        expect(result).to.be.null;
      });
    });

    describe('getListRange', () => {
      it('should get list range successfully', async () => {
        const items = ['item1', 'item2', 'item3'];
        redisClientStub.lRange.resolves(items);
        
        const result = await cacheService.getListRange('list_key', 0, 2);
        
        expect(result).to.deep.equal(items);
        expect(redisClientStub.lRange.calledWith('list_key', 0, 2)).to.be.true;
      });

      it('should handle Redis errors', async () => {
        redisClientStub.lRange.rejects(new Error('Redis error'));
        
        const result = await cacheService.getListRange('list_key', 0, 10);
        
        expect(result).to.be.null;
      });
    });

    describe('getListLength', () => {
      it('should get list length successfully', async () => {
        redisClientStub.lLen.resolves(5);
        
        const result = await cacheService.getListLength('list_key');
        
        expect(result).to.equal(5);
      });

      it('should handle Redis errors', async () => {
        redisClientStub.lLen.rejects(new Error('Redis error'));
        
        const result = await cacheService.getListLength('list_key');
        
        expect(result).to.be.null;
      });
    });
  });

  describe('Set Operations', () => {
    describe('addToSet', () => {
      it('should add member to set successfully', async () => {
        redisClientStub.sAdd.resolves(1);
        
        const result = await cacheService.addToSet('set_key', 'member1');
        
        expect(result).to.equal(1);
        expect(redisClientStub.sAdd.calledWith('set_key', 'member1')).to.be.true;
      });

      it('should handle Redis errors', async () => {
        redisClientStub.sAdd.rejects(new Error('Redis error'));
        
        const result = await cacheService.addToSet('set_key', 'member1');
        
        expect(result).to.be.null;
      });
    });

    describe('removeFromSet', () => {
      it('should remove member from set successfully', async () => {
        redisClientStub.sRem.resolves(1);
        
        const result = await cacheService.removeFromSet('set_key', 'member1');
        
        expect(result).to.equal(1);
        expect(redisClientStub.sRem.calledWith('set_key', 'member1')).to.be.true;
      });

      it('should handle Redis errors', async () => {
        redisClientStub.sRem.rejects(new Error('Redis error'));
        
        const result = await cacheService.removeFromSet('set_key', 'member1');
        
        expect(result).to.be.null;
      });
    });

    describe('getSetMembers', () => {
      it('should get set members successfully', async () => {
        const members = ['member1', 'member2', 'member3'];
        redisClientStub.sMembers.resolves(members);
        
        const result = await cacheService.getSetMembers('set_key');
        
        expect(result).to.deep.equal(members);
      });

      it('should handle Redis errors', async () => {
        redisClientStub.sMembers.rejects(new Error('Redis error'));
        
        const result = await cacheService.getSetMembers('set_key');
        
        expect(result).to.be.null;
      });
    });

    describe('isSetMember', () => {
      it('should check set membership successfully', async () => {
        redisClientStub.sIsMember.resolves(true);
        
        const result = await cacheService.isSetMember('set_key', 'member1');
        
        expect(result).to.be.true;
        expect(redisClientStub.sIsMember.calledWith('set_key', 'member1')).to.be.true;
      });

      it('should handle Redis errors', async () => {
        redisClientStub.sIsMember.rejects(new Error('Redis error'));
        
        const result = await cacheService.isSetMember('set_key', 'member1');
        
        expect(result).to.be.false;
      });
    });

    describe('getSetSize', () => {
      it('should get set size successfully', async () => {
        redisClientStub.sCard.resolves(5);
        
        const result = await cacheService.getSetSize('set_key');
        
        expect(result).to.equal(5);
      });

      it('should handle Redis errors', async () => {
        redisClientStub.sCard.rejects(new Error('Redis error'));
        
        const result = await cacheService.getSetSize('set_key');
        
        expect(result).to.be.null;
      });
    });
  });

  describe('Hash Operations', () => {
    describe('setHashField', () => {
      it('should set hash field successfully', async () => {
        redisClientStub.hSet.resolves(1);
        
        const result = await cacheService.setHashField('hash_key', 'field1', 'value1');
        
        expect(result).to.equal(1);
        expect(redisClientStub.hSet.calledWith('hash_key', 'field1', 'value1')).to.be.true;
      });

      it('should handle Redis errors', async () => {
        redisClientStub.hSet.rejects(new Error('Redis error'));
        
        const result = await cacheService.setHashField('hash_key', 'field1', 'value1');
        
        expect(result).to.be.null;
      });
    });

    describe('getHashField', () => {
      it('should get hash field successfully', async () => {
        redisClientStub.hGet.resolves('field_value');
        
        const result = await cacheService.getHashField('hash_key', 'field1');
        
        expect(result).to.equal('field_value');
        expect(redisClientStub.hGet.calledWith('hash_key', 'field1')).to.be.true;
      });

      it('should return null for non-existent field', async () => {
        redisClientStub.hGet.resolves(null);
        
        const result = await cacheService.getHashField('hash_key', 'nonexistent');
        
        expect(result).to.be.null;
      });

      it('should handle Redis errors', async () => {
        redisClientStub.hGet.rejects(new Error('Redis error'));
        
        const result = await cacheService.getHashField('hash_key', 'field1');
        
        expect(result).to.be.null;
      });
    });

    describe('getHashAll', () => {
      it('should get all hash fields successfully', async () => {
        const fields = { field1: 'value1', field2: 'value2' };
        redisClientStub.hGetAll.resolves(fields);
        
        const result = await cacheService.getHashAll('hash_key');
        
        expect(result).to.deep.equal(fields);
      });

      it('should handle Redis errors', async () => {
        redisClientStub.hGetAll.rejects(new Error('Redis error'));
        
        const result = await cacheService.getHashAll('hash_key');
        
        expect(result).to.be.null;
      });
    });

    describe('deleteHashField', () => {
      it('should delete hash field successfully', async () => {
        redisClientStub.hDel.resolves(1);
        
        const result = await cacheService.deleteHashField('hash_key', 'field1');
        
        expect(result).to.equal(1);
        expect(redisClientStub.hDel.calledWith('hash_key', 'field1')).to.be.true;
      });

      it('should handle Redis errors', async () => {
        redisClientStub.hDel.rejects(new Error('Redis error'));
        
        const result = await cacheService.deleteHashField('hash_key', 'field1');
        
        expect(result).to.be.null;
      });
    });
  });

  describe('Sorted Set Operations', () => {
    describe('addToSortedSet', () => {
      it('should add member to sorted set successfully', async () => {
        redisClientStub.zAdd.resolves(1);
        
        const result = await cacheService.addToSortedSet('zset_key', 'member1', 10);
        
        expect(result).to.equal(1);
        expect(redisClientStub.zAdd.calledWith('zset_key', { score: 10, value: 'member1' })).to.be.true;
      });

      it('should handle Redis errors', async () => {
        redisClientStub.zAdd.rejects(new Error('Redis error'));
        
        const result = await cacheService.addToSortedSet('zset_key', 'member1', 10);
        
        expect(result).to.be.null;
      });
    });

    describe('getSortedSetRange', () => {
      it('should get sorted set range successfully', async () => {
        const members = ['member1', 'member2', 'member3'];
        redisClientStub.zRange.resolves(members);
        
        const result = await cacheService.getSortedSetRange('zset_key', 0, 2);
        
        expect(result).to.deep.equal(members);
        expect(redisClientStub.zRange.calledWith('zset_key', 0, 2)).to.be.true;
      });

      it('should handle Redis errors', async () => {
        redisClientStub.zRange.rejects(new Error('Redis error'));
        
        const result = await cacheService.getSortedSetRange('zset_key', 0, 10);
        
        expect(result).to.be.null;
      });
    });

    describe('getSortedSetScore', () => {
      it('should get member score successfully', async () => {
        redisClientStub.zScore.resolves(10);
        
        const result = await cacheService.getSortedSetScore('zset_key', 'member1');
        
        expect(result).to.equal(10);
        expect(redisClientStub.zScore.calledWith('zset_key', 'member1')).to.be.true;
      });

      it('should return null for non-existent member', async () => {
        redisClientStub.zScore.resolves(null);
        
        const result = await cacheService.getSortedSetScore('zset_key', 'nonexistent');
        
        expect(result).to.be.null;
      });

      it('should handle Redis errors', async () => {
        redisClientStub.zScore.rejects(new Error('Redis error'));
        
        const result = await cacheService.getSortedSetScore('zset_key', 'member1');
        
        expect(result).to.be.null;
      });
    });

    describe('getSortedSetSize', () => {
      it('should get sorted set size successfully', async () => {
        redisClientStub.zCard.resolves(5);
        
        const result = await cacheService.getSortedSetSize('zset_key');
        
        expect(result).to.equal(5);
      });

      it('should handle Redis errors', async () => {
        redisClientStub.zCard.rejects(new Error('Redis error'));
        
        const result = await cacheService.getSortedSetSize('zset_key');
        
        expect(result).to.be.null;
      });
    });
  });

  describe('Bulk Operations', () => {
    describe('setBulk', () => {
      it('should set multiple key-value pairs successfully', async () => {
        const items = [
          { key: 'key1', value: 'value1' },
          { key: 'key2', value: 'value2' }
        ];
        
        redisClientStub.set.resolves('OK');
        
        const result = await cacheService.setBulk(items);
        
        expect(result).to.be.true;
        expect(redisClientStub.set.callCount).to.equal(2);
      });

      it('should handle partial failures', async () => {
        const items = [
          { key: 'key1', value: 'value1' },
          { key: 'key2', value: 'value2' }
        ];
        
        redisClientStub.set
          .onFirstCall().resolves('OK')
          .onSecondCall().rejects(new Error('Redis error'));
        
        const result = await cacheService.setBulk(items);
        
        expect(result).to.be.false;
      });
    });

    describe('getBulk', () => {
      it('should get multiple values successfully', async () => {
        const keys = ['key1', 'key2', 'key3'];
        const values = ['value1', 'value2', null];
        
        redisClientStub.get
          .onFirstCall().resolves(JSON.stringify('value1'))
          .onSecondCall().resolves(JSON.stringify('value2'))
          .onThirdCall().resolves(null);
        
        const result = await cacheService.getBulk(keys);
        
        expect(result).to.deep.equal(['value1', 'value2', null]);
        expect(redisClientStub.get.callCount).to.equal(3);
      });

      it('should handle Redis errors', async () => {
        const keys = ['key1', 'key2'];
        
        redisClientStub.get.rejects(new Error('Redis error'));
        
        const result = await cacheService.getBulk(keys);
        
        expect(result).to.be.null;
      });
    });

    describe('deleteBulk', () => {
      it('should delete multiple keys successfully', async () => {
        const keys = ['key1', 'key2', 'key3'];
        
        redisClientStub.del.resolves(3);
        
        const result = await cacheService.deleteBulk(keys);
        
        expect(result).to.equal(3);
        expect(cacheService.stats.deletes).to.equal(3);
      });

      it('should handle Redis errors', async () => {
        const keys = ['key1', 'key2'];
        
        redisClientStub.del.rejects(new Error('Redis error'));
        
        const result = await cacheService.deleteBulk(keys);
        
        expect(result).to.be.null;
      });
    });
  });

  describe('Cache Management', () => {
    describe('flushAll', () => {
      it('should flush all cache successfully', async () => {
        redisClientStub.flushAll.resolves('OK');
        
        const result = await cacheService.flushAll();
        
        expect(result).to.be.true;
        expect(redisClientStub.flushAll.calledOnce).to.be.true;
      });

      it('should handle Redis errors', async () => {
        redisClientStub.flushAll.rejects(new Error('Redis error'));
        
        const result = await cacheService.flushAll();
        
        expect(result).to.be.false;
      });
    });

    describe('flushDb', () => {
      it('should flush current database successfully', async () => {
        redisClientStub.flushDb.resolves('OK');
        
        const result = await cacheService.flushDb();
        
        expect(result).to.be.true;
        expect(redisClientStub.flushDb.calledOnce).to.be.true;
      });

      it('should handle Redis errors', async () => {
        redisClientStub.flushDb.rejects(new Error('Redis error'));
        
        const result = await cacheService.flushDb();
        
        expect(result).to.be.false;
      });
    });

    describe('getStats', () => {
      it('should return cache statistics', () => {
        const stats = cacheService.getStats();
        
        expect(stats).to.deep.include({
          hits: 0,
          misses: 0,
          sets: 0,
          deletes: 0
        });
        expect(stats.hitRate).to.be.a('number');
      });

      it('should calculate hit rate correctly', async () => {
        // Simulate cache operations
        redisClientStub.get.resolves(null); // Miss
        await cacheService.get('key1');
        
        redisClientStub.get.resolves(JSON.stringify('value')); // Hit
        await cacheService.get('key2');
        
        redisClientStub.get.resolves(JSON.stringify('value')); // Hit
        await cacheService.get('key3');
        
        const stats = cacheService.getStats();
        
        expect(stats.hits).to.equal(2);
        expect(stats.misses).to.equal(1);
        expect(stats.hitRate).to.be.closeTo(0.667, 0.01);
      });
    });

    describe('resetStats', () => {
      it('should reset cache statistics', () => {
        // Simulate some operations
        cacheService.stats.hits = 10;
        cacheService.stats.misses = 5;
        cacheService.stats.sets = 8;
        cacheService.stats.deletes = 3;
        
        cacheService.resetStats();
        
        expect(cacheService.stats).to.deep.equal({
          hits: 0,
          misses: 0,
          sets: 0,
          deletes: 0
        });
      });
    });
  });

  describe('Rate Limiting', () => {
    describe('checkRateLimit', () => {
      it('should allow request within rate limit', async () => {
        const key = 'rate_limit_key';
        const limit = 10;
        const window = 60;
        
        redisClientStub.incr.resolves(5);
        redisClientStub.expire.resolves(1);
        
        const result = await cacheService.checkRateLimit(key, limit, window);
        
        expect(result.allowed).to.be.true;
        expect(result.remaining).to.equal(5);
      });

      it('should block request exceeding rate limit', async () => {
        const key = 'rate_limit_key';
        const limit = 5;
        const window = 60;
        
        redisClientStub.incr.resolves(6);
        redisClientStub.expire.resolves(1);
        
        const result = await cacheService.checkRateLimit(key, limit, window);
        
        expect(result.allowed).to.be.false;
        expect(result.remaining).to.equal(0);
      });

      it('should handle Redis errors', async () => {
        redisClientStub.incr.rejects(new Error('Redis error'));
        
        const result = await cacheService.checkRateLimit('key', 10, 60);
        
        expect(result.allowed).to.be.false;
        expect(result.error).to.equal('Redis error');
      });
    });
  });

  describe('Health Check', () => {
    describe('healthCheck', () => {
      it('should pass health check when connected', async () => {
        redisClientStub.ping.resolves('PONG');
        
        const result = await cacheService.healthCheck();
        
        expect(result.status).to.equal('healthy');
        expect(result.timestamp).to.be.a('date');
        expect(result.uptime).to.be.a('number');
      });

      it('should fail health check when disconnected', async () => {
        redisClientStub.ping.rejects(new Error('Connection lost'));
        
        const result = await cacheService.healthCheck();
        
        expect(result.status).to.equal('unhealthy');
        expect(result.error).to.equal('Connection lost');
      });
    });
  });

  describe('Connection Management', () => {
    describe('disconnect', () => {
      it('should disconnect from Redis successfully', async () => {
        redisClientStub.disconnect.resolves();
        
        const result = await cacheService.disconnect();
        
        expect(result).to.be.true;
        expect(redisClientStub.disconnect.calledOnce).to.be.true;
      });

      it('should handle disconnection errors', async () => {
        redisClientStub.disconnect.rejects(new Error('Disconnect failed'));
        
        const result = await cacheService.disconnect();
        
        expect(result).to.be.false;
      });
    });

    describe('quit', () => {
      it('should quit Redis connection gracefully', async () => {
        redisClientStub.quit.resolves();
        
        const result = await cacheService.quit();
        
        expect(result).to.be.true;
        expect(redisClientStub.quit.calledOnce).to.be.true;
      });

      it('should handle quit errors', async () => {
        redisClientStub.quit.rejects(new Error('Quit failed'));
        
        const result = await cacheService.quit();
        
        expect(result).to.be.false;
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle Redis client initialization failure', () => {
      redis.createClient.throws(new Error('Invalid configuration'));
      
      expect(() => {
        new (require('../../services/CacheService'))();
      }).to.throw('Failed to initialize Redis client');
    });

    it('should handle connection failures gracefully', async () => {
      redisClientStub.connect.rejects(new Error('Connection refused'));
      
      const result = await cacheService.connect();
      
      expect(result).to.be.false;
    });

    it('should handle operation timeouts', async () => {
      redisClientStub.get.resolves(new Promise(resolve => {
        setTimeout(() => resolve('value'), 6000); // Simulate timeout
      }));
      
      const result = await cacheService.get('key');
      
      // Should handle timeout gracefully
      expect(result).to.be.null;
    });
  });

  describe('Performance', () => {
    it('should handle high-frequency operations efficiently', async () => {
      redisClientStub.get.resolves(JSON.stringify('value'));
      
      const start = Date.now();
      
      // Simulate high-frequency operations
      const promises = Array(100).fill(null).map((_, i) => 
        cacheService.get(`key_${i}`)
      );
      
      await Promise.all(promises);
      
      const duration = Date.now() - start;
      
      expect(duration).to.be.lessThan(1000); // Should complete within 1 second
      expect(redisClientStub.get.callCount).to.equal(100);
    });

    it('should efficiently handle bulk operations', async () => {
      redisClientStub.set.resolves('OK');
      
      const items = Array(50).fill(null).map((_, i) => ({
        key: `bulk_key_${i}`,
        value: `bulk_value_${i}`
      }));
      
      const start = Date.now();
      
      const result = await cacheService.setBulk(items);
      
      const duration = Date.now() - start;
      
      expect(result).to.be.true;
      expect(duration).to.be.lessThan(500); // Should complete quickly
      expect(redisClientStub.set.callCount).to.equal(50);
    });
  });
});