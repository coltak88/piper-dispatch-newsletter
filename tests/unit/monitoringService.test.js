const sinon = require('sinon');
const { expect } = require('chai');
const prometheus = require('prom-client');

describe('MonitoringService', () => {
  let monitoringService;
  let sandbox;
  let mockRegistry;
  let mockMetrics;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    
    // Create mock registry and metrics
    mockRegistry = {
      metrics: sandbox.stub().returns('# HELP test_metric Test metric\n# TYPE test_metric gauge\ntest_metric 1\n'),
      clear: sandbox.stub()
    };
    
    mockMetrics = {
      httpRequestsTotal: {
        inc: sandbox.stub()
      },
      httpRequestDuration: {
        observe: sandbox.stub()
      },
      activeConnections: {
        inc: sandbox.stub(),
        dec: sandbox.stub(),
        set: sandbox.stub()
      },
      errorRate: {
        inc: sandbox.stub()
      },
      activeUsers: {
        inc: sandbox.stub(),
        dec: sandbox.stub(),
        set: sandbox.stub()
      },
      cpuUsage: {
        set: sandbox.stub()
      },
      memoryUsage: {
        set: sandbox.stub()
      },
      diskUsage: {
        set: sandbox.stub()
      },
      databaseConnections: {
        set: sandbox.stub()
      },
      queueSize: {
        set: sandbox.stub()
      },
      cacheHitRate: {
        set: sandbox.stub()
      },
      responseTime: {
        observe: sandbox.stub()
      }
    };
    
    // Stub Prometheus methods
    sandbox.stub(prometheus, 'Registry').returns(mockRegistry);
    sandbox.stub(prometheus, 'Counter').returns(mockMetrics.httpRequestsTotal);
    sandbox.stub(prometheus, 'Histogram').returns(mockMetrics.httpRequestDuration);
    sandbox.stub(prometheus, 'Gauge').callsFake((config) => {
      const metricName = config.name;
      switch (metricName) {
        case 'active_connections':
          return mockMetrics.activeConnections;
        case 'error_rate':
          return mockMetrics.errorRate;
        case 'active_users':
          return mockMetrics.activeUsers;
        case 'cpu_usage_percent':
          return mockMetrics.cpuUsage;
        case 'memory_usage_percent':
          return mockMetrics.memoryUsage;
        case 'disk_usage_percent':
          return mockMetrics.diskUsage;
        case 'database_connections':
          return mockMetrics.databaseConnections;
        case 'queue_size':
          return mockMetrics.queueSize;
        case 'cache_hit_rate':
          return mockMetrics.cacheHitRate;
        case 'response_time':
          return mockMetrics.responseTime;
        default:
          return { inc: sandbox.stub(), set: sandbox.stub(), observe: sandbox.stub() };
      }
    });
    
    // Initialize service
    const MonitoringService = require('../../services/MonitoringService');
    monitoringService = new MonitoringService();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('Constructor', () => {
    it('should initialize with default options', () => {
      expect(monitoringService.registry).to.exist;
      expect(monitoringService.metrics).to.exist;
      expect(monitoringService.alerts).to.be.an('array');
      expect(monitoringService.healthChecks).to.be.an('array');
      expect(monitoringService.startTime).to.be.a('date');
    });

    it('should initialize with custom options', () => {
      const customOptions = {
        collectDefaultMetrics: false,
        defaultLabels: { service: 'test-service' }
      };
      
      const customService = new (require('../../services/MonitoringService'))(customOptions);
      
      expect(customService.config.collectDefaultMetrics).to.be.false;
      expect(customService.config.defaultLabels).to.deep.equal({ service: 'test-service' });
    });

    it('should use environment variables when available', () => {
      process.env.MONITORING_PORT = '9090';
      process.env.METRICS_PATH = '/custom-metrics';
      
      const envService = new (require('../../services/MonitoringService'))();
      
      expect(envService.config.port).to.equal(9090);
      expect(envService.config.metricsPath).to.equal('/custom-metrics');
    });
  });

  describe('HTTP Request Metrics', () => {
    describe('recordHttpRequest', () => {
      it('should record HTTP request metrics', () => {
        const method = 'GET';
        const route = '/api/users';
        const statusCode = 200;
        const duration = 150;
        
        monitoringService.recordHttpRequest(method, route, statusCode, duration);
        
        expect(mockMetrics.httpRequestsTotal.inc.calledWith({
          method: 'GET',
          route: '/api/users',
          status_code: 200
        })).to.be.true;
        
        expect(mockMetrics.httpRequestDuration.observe.calledWith({
          method: 'GET',
          route: '/api/users',
          status_code: 200
        }, 0.15)).to.be.true; // Converted to seconds
      });

      it('should handle error status codes', () => {
        const method = 'POST';
        const route = '/api/users';
        const statusCode = 500;
        const duration = 200;
        
        monitoringService.recordHttpRequest(method, route, statusCode, duration);
        
        expect(mockMetrics.errorRate.inc.calledOnce).to.be.true;
      });

      it('should handle missing parameters', () => {
        expect(() => {
          monitoringService.recordHttpRequest();
        }).to.not.throw();
      });
    });

    describe('httpMetricsMiddleware', () => {
      it('should create Express middleware', () => {
        const middleware = monitoringService.httpMetricsMiddleware();
        
        expect(middleware).to.be.a('function');
        expect(middleware.length).to.equal(3); // req, res, next
      });

      it('should record metrics for successful requests', (done) => {
        const req = {
          method: 'GET',
          route: { path: '/api/users' }
        };
        const res = {
          statusCode: 200,
          on: (event, callback) => {
            if (event === 'finish') {
              setTimeout(callback, 10);
            }
          }
        };
        const next = () => {};
        
        const middleware = monitoringService.httpMetricsMiddleware();
        
        middleware(req, res, next);
        
        setTimeout(() => {
          expect(mockMetrics.httpRequestsTotal.inc.calledOnce).to.be.true;
          expect(mockMetrics.httpRequestDuration.observe.calledOnce).to.be.true;
          done();
        }, 50);
      });

      it('should handle requests without route path', (done) => {
        const req = {
          method: 'POST',
          originalUrl: '/api/posts/123'
        };
        const res = {
          statusCode: 201,
          on: (event, callback) => {
            if (event === 'finish') {
              setTimeout(callback, 10);
            }
          }
        };
        const next = () => {};
        
        const middleware = monitoringService.httpMetricsMiddleware();
        
        middleware(req, res, next);
        
        setTimeout(() => {
          expect(mockMetrics.httpRequestsTotal.inc.calledOnce).to.be.true;
          expect(mockMetrics.httpRequestDuration.observe.calledOnce).to.be.true;
          done();
        }, 50);
      });
    });
  });

  describe('Connection Metrics', () => {
    describe('recordConnection', () => {
      it('should increment active connections', () => {
        monitoringService.recordConnection('open');
        
        expect(mockMetrics.activeConnections.inc.calledOnce).to.be.true;
      });

      it('should decrement active connections', () => {
        monitoringService.recordConnection('close');
        
        expect(mockMetrics.activeConnections.dec.calledOnce).to.be.true;
      });

      it('should set active connections count', () => {
        monitoringService.recordConnection('set', 100);
        
        expect(mockMetrics.activeConnections.set.calledWith(100)).to.be.true;
      });

      it('should handle invalid action', () => {
        expect(() => {
          monitoringService.recordConnection('invalid');
        }).to.not.throw();
      });
    });
  });

  describe('User Metrics', () => {
    describe('recordUserActivity', () => {
      it('should increment active users', () => {
        monitoringService.recordUserActivity('login');
        
        expect(mockMetrics.activeUsers.inc.calledOnce).to.be.true;
      });

      it('should decrement active users', () => {
        monitoringService.recordUserActivity('logout');
        
        expect(mockMetrics.activeUsers.dec.calledOnce).to.be.true;
      });

      it('should set active users count', () => {
        monitoringService.recordUserActivity('set', 50);
        
        expect(mockMetrics.activeUsers.set.calledWith(50)).to.be.true;
      });

      it('should handle invalid action', () => {
        expect(() => {
          monitoringService.recordUserActivity('invalid');
        }).to.not.throw();
      });
    });
  });

  describe('System Metrics', () => {
    describe('updateSystemMetrics', () => {
      it('should update CPU usage', () => {
        monitoringService.updateSystemMetrics('cpu', 75.5);
        
        expect(mockMetrics.cpuUsage.set.calledWith(75.5)).to.be.true;
      });

      it('should update memory usage', () => {
        monitoringService.updateSystemMetrics('memory', 82.3);
        
        expect(mockMetrics.memoryUsage.set.calledWith(82.3)).to.be.true;
      });

      it('should update disk usage', () => {
        monitoringService.updateSystemMetrics('disk', 65.7);
        
        expect(mockMetrics.diskUsage.set.calledWith(65.7)).to.be.true;
      });

      it('should handle invalid metric type', () => {
        expect(() => {
          monitoringService.updateSystemMetrics('invalid', 50);
        }).to.not.throw();
      });
    });

    describe('updateDatabaseMetrics', () => {
      it('should update database connections', () => {
        monitoringService.updateDatabaseMetrics('connections', 25);
        
        expect(mockMetrics.databaseConnections.set.calledWith(25)).to.be.true;
      });

      it('should update queue size', () => {
        monitoringService.updateDatabaseMetrics('queue', 10);
        
        expect(mockMetrics.queueSize.set.calledWith(10)).to.be.true;
      });

      it('should handle invalid metric type', () => {
        expect(() => {
          monitoringService.updateDatabaseMetrics('invalid', 15);
        }).to.not.throw();
      });
    });

    describe('updateCacheMetrics', () => {
      it('should update cache hit rate', () => {
        monitoringService.updateCacheMetrics('hit_rate', 0.85);
        
        expect(mockMetrics.cacheHitRate.set.calledWith(0.85)).to.be.true;
      });

      it('should handle invalid metric type', () => {
        expect(() => {
          monitoringService.updateCacheMetrics('invalid', 0.9);
        }).to.not.throw();
      });
    });

    describe('recordResponseTime', () => {
      it('should record response time', () => {
        const duration = 250; // milliseconds
        
        monitoringService.recordResponseTime(duration);
        
        expect(mockMetrics.responseTime.observe.calledWith(0.25)).to.be.true; // Converted to seconds
      });

      it('should handle zero duration', () => {
        monitoringService.recordResponseTime(0);
        
        expect(mockMetrics.responseTime.observe.calledWith(0)).to.be.true;
      });
    });
  });

  describe('Custom Metrics', () => {
    describe('createCustomCounter', () => {
      it('should create custom counter', () => {
        const counter = monitoringService.createCustomCounter('test_counter', 'Test counter', ['label1']);
        
        expect(counter).to.exist;
        expect(counter.inc).to.be.a('function');
      });

      it('should handle duplicate counter names', () => {
        monitoringService.createCustomCounter('duplicate_counter', 'First counter');
        
        expect(() => {
          monitoringService.createCustomCounter('duplicate_counter', 'Second counter');
        }).to.throw('Counter with name duplicate_counter already exists');
      });
    });

    describe('createCustomGauge', () => {
      it('should create custom gauge', () => {
        const gauge = monitoringService.createCustomGauge('test_gauge', 'Test gauge', ['label1']);
        
        expect(gauge).to.exist;
        expect(gauge.set).to.be.a('function');
        expect(gauge.inc).to.be.a('function');
        expect(gauge.dec).to.be.a('function');
      });

      it('should handle duplicate gauge names', () => {
        monitoringService.createCustomGauge('duplicate_gauge', 'First gauge');
        
        expect(() => {
          monitoringService.createCustomGauge('duplicate_gauge', 'Second gauge');
        }).to.throw('Gauge with name duplicate_gauge already exists');
      });
    });

    describe('createCustomHistogram', () => {
      it('should create custom histogram', () => {
        const histogram = monitoringService.createCustomHistogram('test_histogram', 'Test histogram', ['label1']);
        
        expect(histogram).to.exist;
        expect(histogram.observe).to.be.a('function');
      });

      it('should handle duplicate histogram names', () => {
        monitoringService.createCustomHistogram('duplicate_histogram', 'First histogram');
        
        expect(() => {
          monitoringService.createCustomHistogram('duplicate_histogram', 'Second histogram');
        }).to.throw('Histogram with name duplicate_histogram already exists');
      });
    });
  });

  describe('Health Checks', () => {
    describe('registerHealthCheck', () => {
      it('should register health check function', () => {
        const healthCheckFn = () => ({ status: 'healthy' });
        
        monitoringService.registerHealthCheck('database', healthCheckFn);
        
        expect(monitoringService.healthChecks).to.have.lengthOf(1);
        expect(monitoringService.healthChecks[0].name).to.equal('database');
      });

      it('should handle duplicate health check names', () => {
        monitoringService.registerHealthCheck('database', () => ({ status: 'healthy' }));
        
        expect(() => {
          monitoringService.registerHealthCheck('database', () => ({ status: 'healthy' }));
        }).to.throw('Health check with name database already exists');
      });
    });

    describe('runHealthChecks', () => {
      it('should run all health checks successfully', async () => {
        const dbCheck = sandbox.stub().resolves({ status: 'healthy', responseTime: 50 });
        const redisCheck = sandbox.stub().resolves({ status: 'healthy', responseTime: 30 });
        
        monitoringService.registerHealthCheck('database', dbCheck);
        monitoringService.registerHealthCheck('redis', redisCheck);
        
        const results = await monitoringService.runHealthChecks();
        
        expect(results.overall).to.equal('healthy');
        expect(results.checks).to.have.lengthOf(2);
        expect(results.checks[0].name).to.equal('database');
        expect(results.checks[1].name).to.equal('redis');
        expect(dbCheck.calledOnce).to.be.true;
        expect(redisCheck.calledOnce).to.be.true;
      });

      it('should handle failing health checks', async () => {
        const dbCheck = sandbox.stub().resolves({ status: 'healthy' });
        const failingCheck = sandbox.stub().resolves({ status: 'unhealthy', error: 'Connection failed' });
        
        monitoringService.registerHealthCheck('database', dbCheck);
        monitoringService.registerHealthCheck('failing_service', failingCheck);
        
        const results = await monitoringService.runHealthChecks();
        
        expect(results.overall).to.equal('unhealthy');
        expect(results.checks).to.have.lengthOf(2);
        expect(results.checks[1].status).to.equal('unhealthy');
      });

      it('should handle health check errors', async () => {
        const errorCheck = sandbox.stub().rejects(new Error('Health check failed'));
        
        monitoringService.registerHealthCheck('error_service', errorCheck);
        
        const results = await monitoringService.runHealthChecks();
        
        expect(results.overall).to.equal('unhealthy');
        expect(results.checks[0].status).to.equal('error');
        expect(results.checks[0].error).to.equal('Health check failed');
      });

      it('should handle timeout in health checks', async () => {
        const slowCheck = sandbox.stub().resolves(new Promise(resolve => {
          setTimeout(() => resolve({ status: 'healthy' }), 6000);
        }));
        
        monitoringService.registerHealthCheck('slow_service', slowCheck);
        
        const results = await monitoringService.runHealthChecks();
        
        expect(results.overall).to.equal('unhealthy');
        expect(results.checks[0].status).to.equal('timeout');
      });
    });
  });

  describe('Alerts', () => {
    describe('createAlert', () => {
      it('should create alert successfully', () => {
        const alert = monitoringService.createAlert('high_cpu', 'CPU usage above 80%', {
          threshold: 80,
          duration: 300,
          severity: 'warning'
        });
        
        expect(alert).to.exist;
        expect(alert.name).to.equal('high_cpu');
        expect(alert.message).to.equal('CPU usage above 80%');
        expect(alert.config.threshold).to.equal(80);
      });

      it('should handle duplicate alert names', () => {
        monitoringService.createAlert('duplicate_alert', 'First alert');
        
        expect(() => {
          monitoringService.createAlert('duplicate_alert', 'Second alert');
        }).to.throw('Alert with name duplicate_alert already exists');
      });
    });

    describe('evaluateAlert', () => {
      it('should evaluate alert successfully', () => {
        const alert = monitoringService.createAlert('test_alert', 'Test alert', {
          threshold: 50,
          duration: 60,
          severity: 'warning'
        });
        
        const result = monitoringService.evaluateAlert('test_alert', 75);
        
        expect(result.triggered).to.be.true;
        expect(result.currentValue).to.equal(75);
        expect(result.threshold).to.equal(50);
      });

      it('should not trigger alert below threshold', () => {
        const alert = monitoringService.createAlert('test_alert', 'Test alert', {
          threshold: 50,
          duration: 60,
          severity: 'warning'
        });
        
        const result = monitoringService.evaluateAlert('test_alert', 25);
        
        expect(result.triggered).to.be.false;
      });

      it('should handle non-existent alert', () => {
        const result = monitoringService.evaluateAlert('nonexistent', 75);
        
        expect(result).to.be.null;
      });
    });

    describe('getActiveAlerts', () => {
      it('should return active alerts', () => {
        monitoringService.createAlert('alert1', 'First alert', { threshold: 50 });
        monitoringService.createAlert('alert2', 'Second alert', { threshold: 75 });
        
        monitoringService.evaluateAlert('alert1', 60); // Trigger alert1
        monitoringService.evaluateAlert('alert2', 70); // Don't trigger alert2
        
        const activeAlerts = monitoringService.getActiveAlerts();
        
        expect(activeAlerts).to.have.lengthOf(1);
        expect(activeAlerts[0].name).to.equal('alert1');
      });
    });
  });

  describe('Metrics Export', () => {
    describe('getMetrics', () => {
      it('should return metrics in Prometheus format', () => {
        const metrics = monitoringService.getMetrics();
        
        expect(metrics).to.be.a('string');
        expect(mockRegistry.metrics.calledOnce).to.be.true;
      });

      it('should handle registry errors', () => {
        mockRegistry.metrics.throws(new Error('Registry error'));
        
        expect(() => {
          monitoringService.getMetrics();
        }).to.throw('Registry error');
      });
    });
  });

  describe('Performance Monitoring', () => {
    describe('startTimer', () => {
      it('should start timer and return end function', () => {
        const endTimer = monitoringService.startTimer('test_operation');
        
        expect(endTimer).to.be.a('function');
        
        const result = endTimer();
        
        expect(result).to.be.a('number');
        expect(result).to.be.greaterThan(0);
      });

      it('should handle multiple timers', () => {
        const timer1 = monitoringService.startTimer('operation1');
        const timer2 = monitoringService.startTimer('operation2');
        
        expect(timer1).to.not.equal(timer2);
        
        const duration1 = timer1();
        const duration2 = timer2();
        
        expect(duration1).to.be.a('number');
        expect(duration2).to.be.a('number');
      });
    });

    describe('recordOperationDuration', () => {
      it('should record operation duration', () => {
        const operation = 'database_query';
        const duration = 150; // milliseconds
        
        monitoringService.recordOperationDuration(operation, duration);
        
        expect(mockMetrics.responseTime.observe.calledWith({ operation }, 0.15)).to.be.true;
      });

      it('should handle zero duration', () => {
        monitoringService.recordOperationDuration('test_operation', 0);
        
        expect(mockMetrics.responseTime.observe.calledWith({ operation: 'test_operation' }, 0)).to.be.true;
      });
    });
  });

  describe('Cleanup', () => {
    describe('cleanup', () => {
      it('should clear registry and timers', () => {
        monitoringService.cleanup();
        
        expect(mockRegistry.clear.calledOnce).to.be.true;
      });

      it('should handle cleanup errors', () => {
        mockRegistry.clear.throws(new Error('Cleanup failed'));
        
        expect(() => {
          monitoringService.cleanup();
        }).to.not.throw();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle metric creation failures', () => {
      prometheus.Counter.throws(new Error('Counter creation failed'));
      
      expect(() => {
        new (require('../../services/MonitoringService'))();
      }).to.throw('Counter creation failed');
    });

    it('should handle health check registration failures', () => {
      const invalidHealthCheck = 'not a function';
      
      expect(() => {
        monitoringService.registerHealthCheck('invalid', invalidHealthCheck);
      }).to.throw('Health check must be a function');
    });

    it('should handle alert evaluation errors', () => {
      monitoringService.createAlert('error_alert', 'Error alert', {
        threshold: 50,
        duration: 60
      });
      
      // Simulate error in alert evaluation
      sandbox.stub(monitoringService.alerts[0], 'evaluate').throws(new Error('Evaluation failed'));
      
      const result = monitoringService.evaluateAlert('error_alert', 75);
      
      expect(result).to.be.null;
    });
  });

  describe('Integration', () => {
    it('should handle concurrent metric updates', async () => {
      const promises = Array(100).fill(null).map((_, i) => {
        return Promise.resolve().then(() => {
          monitoringService.recordHttpRequest('GET', '/api/test', 200, i);
          monitoringService.updateSystemMetrics('cpu', i % 100);
          monitoringService.recordConnection('open');
        });
      });
      
      await Promise.all(promises);
      
      expect(mockMetrics.httpRequestsTotal.inc.callCount).to.equal(100);
      expect(mockMetrics.cpuUsage.set.callCount).to.equal(100);
      expect(mockMetrics.activeConnections.inc.callCount).to.equal(100);
    });

    it('should maintain consistent state during high load', async () => {
      // Simulate high load
      const operations = Array(1000).fill(null).map((_, i) => {
        return new Promise(resolve => {
          setTimeout(() => {
            monitoringService.recordHttpRequest('GET', '/api/load', 200, Math.random() * 1000);
            monitoringService.updateSystemMetrics('memory', Math.random() * 100);
            resolve();
          }, Math.random() * 10);
        });
      });
      
      await Promise.all(operations);
      
      expect(mockMetrics.httpRequestsTotal.inc.callCount).to.equal(1000);
      expect(mockMetrics.memoryUsage.set.callCount).to.equal(1000);
    });
  });
});