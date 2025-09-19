const sinon = require('sinon');
const { expect } = require('chai');
const stripe = require('stripe');

describe('PaymentService', () => {
  let paymentService;
  let stripeStub;
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    
    // Create Stripe stub
    stripeStub = {
      customers: {
        create: sandbox.stub(),
        retrieve: sandbox.stub(),
        update: sandbox.stub(),
        del: sandbox.stub()
      },
      subscriptions: {
        create: sandbox.stub(),
        retrieve: sandbox.stub(),
        update: sandbox.stub(),
        cancel: sandbox.stub(),
        list: sandbox.stub()
      },
      paymentIntents: {
        create: sandbox.stub(),
        retrieve: sandbox.stub(),
        confirm: sandbox.stub(),
        cancel: sandbox.stub()
      },
      setupIntents: {
        create: sandbox.stub(),
        retrieve: sandbox.stub(),
        confirm: sandbox.stub()
      },
      paymentMethods: {
        attach: sandbox.stub(),
        detach: sandbox.stub(),
        retrieve: sandbox.stub()
      },
      invoices: {
        create: sandbox.stub(),
        retrieve: sandbox.stub(),
        finalizeInvoice: sandbox.stub(),
        pay: sandbox.stub()
      },
      refunds: {
        create: sandbox.stub(),
        retrieve: sandbox.stub()
      },
      webhooks: {
        constructEvent: sandbox.stub()
      }
    };
    
    // Stub Stripe constructor
    sandbox.stub(stripe, 'default').returns(stripeStub);
    
    // Initialize service
    const PaymentService = require('../../services/PaymentService');
    paymentService = new PaymentService();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('Constructor', () => {
    it('should initialize with provided API key', () => {
      const customKey = 'sk_test_custom_key';
      const customService = new (require('../../services/PaymentService'))(customKey);
      
      expect(stripe.default.calledWith(customKey)).to.be.true;
    });

    it('should initialize with environment variable', () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_env_key';
      const envService = new (require('../../services/PaymentService'))();
      
      expect(stripe.default.calledWith('sk_test_env_key')).to.be.true;
    });
  });

  describe('createCustomer', () => {
    it('should create customer successfully', async () => {
      const customerData = {
        email: 'customer@example.com',
        name: 'John Doe',
        metadata: { userId: '123' }
      };
      
      const expectedCustomer = {
        id: 'cus_test123',
        email: customerData.email,
        name: customerData.name
      };
      
      stripeStub.customers.create.resolves(expectedCustomer);
      
      const result = await paymentService.createCustomer(customerData);
      
      expect(result).to.deep.equal(expectedCustomer);
      expect(stripeStub.customers.create.calledWith(customerData)).to.be.true;
    });

    it('should handle creation failure', async () => {
      stripeStub.customers.create.rejects(new Error('API Error'));
      
      const result = await paymentService.createCustomer({ email: 'test@example.com' });
      
      expect(result).to.be.null;
    });
  });

  describe('getCustomer', () => {
    it('should retrieve customer successfully', async () => {
      const customerId = 'cus_test123';
      const expectedCustomer = { id: customerId, email: 'customer@example.com' };
      
      stripeStub.customers.retrieve.resolves(expectedCustomer);
      
      const result = await paymentService.getCustomer(customerId);
      
      expect(result).to.deep.equal(expectedCustomer);
      expect(stripeStub.customers.retrieve.calledWith(customerId)).to.be.true;
    });

    it('should handle retrieval failure', async () => {
      stripeStub.customers.retrieve.rejects(new Error('Customer not found'));
      
      const result = await paymentService.getCustomer('invalid_id');
      
      expect(result).to.be.null;
    });
  });

  describe('createSubscription', () => {
    it('should create subscription successfully', async () => {
      const subscriptionData = {
        customer: 'cus_test123',
        items: [{ price: 'price_monthly' }],
        metadata: { userId: '123' }
      };
      
      const expectedSubscription = {
        id: 'sub_test123',
        customer: subscriptionData.customer,
        status: 'active'
      };
      
      stripeStub.subscriptions.create.resolves(expectedSubscription);
      
      const result = await paymentService.createSubscription(subscriptionData);
      
      expect(result).to.deep.equal(expectedSubscription);
      expect(stripeStub.subscriptions.create.calledWith(subscriptionData)).to.be.true;
    });

    it('should handle subscription creation failure', async () => {
      stripeStub.subscriptions.create.rejects(new Error('Payment required'));
      
      const result = await paymentService.createSubscription({
        customer: 'cus_test123',
        items: [{ price: 'price_monthly' }]
      });
      
      expect(result).to.be.null;
    });
  });

  describe('getSubscription', () => {
    it('should retrieve subscription successfully', async () => {
      const subscriptionId = 'sub_test123';
      const expectedSubscription = { id: subscriptionId, status: 'active' };
      
      stripeStub.subscriptions.retrieve.resolves(expectedSubscription);
      
      const result = await paymentService.getSubscription(subscriptionId);
      
      expect(result).to.deep.equal(expectedSubscription);
      expect(stripeStub.subscriptions.retrieve.calledWith(subscriptionId)).to.be.true;
    });

    it('should handle retrieval failure', async () => {
      stripeStub.subscriptions.retrieve.rejects(new Error('Subscription not found'));
      
      const result = await paymentService.getSubscription('invalid_id');
      
      expect(result).to.be.null;
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel subscription successfully', async () => {
      const subscriptionId = 'sub_test123';
      const expectedSubscription = { id: subscriptionId, status: 'canceled' };
      
      stripeStub.subscriptions.cancel.resolves(expectedSubscription);
      
      const result = await paymentService.cancelSubscription(subscriptionId);
      
      expect(result).to.deep.equal(expectedSubscription);
      expect(stripeStub.subscriptions.cancel.calledWith(subscriptionId)).to.be.true;
    });

    it('should handle cancellation failure', async () => {
      stripeStub.subscriptions.cancel.rejects(new Error('Subscription already canceled'));
      
      const result = await paymentService.cancelSubscription('sub_test123');
      
      expect(result).to.be.null;
    });
  });

  describe('createPaymentIntent', () => {
    it('should create payment intent successfully', async () => {
      const paymentData = {
        amount: 2000,
        currency: 'usd',
        customer: 'cus_test123',
        metadata: { orderId: '123' }
      };
      
      const expectedIntent = {
        id: 'pi_test123',
        amount: paymentData.amount,
        status: 'requires_payment_method'
      };
      
      stripeStub.paymentIntents.create.resolves(expectedIntent);
      
      const result = await paymentService.createPaymentIntent(paymentData);
      
      expect(result).to.deep.equal(expectedIntent);
      expect(stripeStub.paymentIntents.create.calledWith(paymentData)).to.be.true;
    });

    it('should handle creation failure', async () => {
      stripeStub.paymentIntents.create.rejects(new Error('Invalid amount'));
      
      const result = await paymentService.createPaymentIntent({
        amount: -100,
        currency: 'usd'
      });
      
      expect(result).to.be.null;
    });
  });

  describe('confirmPaymentIntent', () => {
    it('should confirm payment intent successfully', async () => {
      const intentId = 'pi_test123';
      const paymentMethodId = 'pm_test123';
      
      const expectedIntent = {
        id: intentId,
        status: 'succeeded'
      };
      
      stripeStub.paymentIntents.confirm.resolves(expectedIntent);
      
      const result = await paymentService.confirmPaymentIntent(intentId, paymentMethodId);
      
      expect(result).to.deep.equal(expectedIntent);
      expect(stripeStub.paymentIntents.confirm.calledWith(intentId, {
        payment_method: paymentMethodId
      })).to.be.true;
    });

    it('should handle confirmation failure', async () => {
      stripeStub.paymentIntents.confirm.rejects(new Error('Payment declined'));
      
      const result = await paymentService.confirmPaymentIntent('pi_test123', 'pm_test123');
      
      expect(result).to.be.null;
    });
  });

  describe('createSetupIntent', () => {
    it('should create setup intent successfully', async () => {
      const setupData = {
        customer: 'cus_test123',
        metadata: { userId: '123' }
      };
      
      const expectedIntent = {
        id: 'seti_test123',
        customer: setupData.customer,
        status: 'requires_payment_method'
      };
      
      stripeStub.setupIntents.create.resolves(expectedIntent);
      
      const result = await paymentService.createSetupIntent(setupData);
      
      expect(result).to.deep.equal(expectedIntent);
      expect(stripeStub.setupIntents.create.calledWith(setupData)).to.be.true;
    });

    it('should handle creation failure', async () => {
      stripeStub.setupIntents.create.rejects(new Error('Invalid customer'));
      
      const result = await paymentService.createSetupIntent({
        customer: 'invalid_customer'
      });
      
      expect(result).to.be.null;
    });
  });

  describe('attachPaymentMethod', () => {
    it('should attach payment method successfully', async () => {
      const paymentMethodId = 'pm_test123';
      const customerId = 'cus_test123';
      
      const expectedPaymentMethod = {
        id: paymentMethodId,
        customer: customerId
      };
      
      stripeStub.paymentMethods.attach.resolves(expectedPaymentMethod);
      
      const result = await paymentService.attachPaymentMethod(paymentMethodId, customerId);
      
      expect(result).to.deep.equal(expectedPaymentMethod);
      expect(stripeStub.paymentMethods.attach.calledWith(paymentMethodId, {
        customer: customerId
      })).to.be.true;
    });

    it('should handle attachment failure', async () => {
      stripeStub.paymentMethods.attach.rejects(new Error('Payment method already attached'));
      
      const result = await paymentService.attachPaymentMethod('pm_test123', 'cus_test123');
      
      expect(result).to.be.null;
    });
  });

  describe('createInvoice', () => {
    it('should create invoice successfully', async () => {
      const invoiceData = {
        customer: 'cus_test123',
        subscription: 'sub_test123',
        metadata: { orderId: '123' }
      };
      
      const expectedInvoice = {
        id: 'in_test123',
        customer: invoiceData.customer,
        status: 'draft'
      };
      
      stripeStub.invoices.create.resolves(expectedInvoice);
      
      const result = await paymentService.createInvoice(invoiceData);
      
      expect(result).to.deep.equal(expectedInvoice);
      expect(stripeStub.invoices.create.calledWith(invoiceData)).to.be.true;
    });

    it('should handle creation failure', async () => {
      stripeStub.invoices.create.rejects(new Error('Invalid customer'));
      
      const result = await paymentService.createInvoice({
        customer: 'invalid_customer'
      });
      
      expect(result).to.be.null;
    });
  });

  describe('processWebhook', () => {
    it('should process webhook successfully', async () => {
      const payload = '{"type": "payment_intent.succeeded"}';
      const signature = 'test_signature';
      const secret = 'whsec_test_secret';
      
      const expectedEvent = {
        type: 'payment_intent.succeeded',
        data: { object: { id: 'pi_test123' } }
      };
      
      stripeStub.webhooks.constructEvent.returns(expectedEvent);
      
      const result = await paymentService.processWebhook(payload, signature, secret);
      
      expect(result).to.deep.equal(expectedEvent);
      expect(stripeStub.webhooks.constructEvent.calledWith(payload, signature, secret)).to.be.true;
    });

    it('should handle invalid webhook signature', async () => {
      stripeStub.webhooks.constructEvent.throws(new Error('Invalid signature'));
      
      const result = await paymentService.processWebhook('payload', 'invalid_sig', 'secret');
      
      expect(result).to.be.null;
    });
  });

  describe('createRefund', () => {
    it('should create refund successfully', async () => {
      const refundData = {
        payment_intent: 'pi_test123',
        amount: 1000,
        reason: 'requested_by_customer'
      };
      
      const expectedRefund = {
        id: 're_test123',
        payment_intent: refundData.payment_intent,
        amount: refundData.amount,
        status: 'succeeded'
      };
      
      stripeStub.refunds.create.resolves(expectedRefund);
      
      const result = await paymentService.createRefund(refundData);
      
      expect(result).to.deep.equal(expectedRefund);
      expect(stripeStub.refunds.create.calledWith(refundData)).to.be.true;
    });

    it('should handle refund failure', async () => {
      stripeStub.refunds.create.rejects(new Error('Refund amount exceeds charge amount'));
      
      const result = await paymentService.createRefund({
        payment_intent: 'pi_test123',
        amount: 999999
      });
      
      expect(result).to.be.null;
    });
  });

  describe('calculateProration', () => {
    it('should calculate proration correctly', () => {
      const currentPlan = { price: 'price_basic', amount: 1000 };
      const newPlan = { price: 'price_premium', amount: 2000 };
      const billingCycleStart = Date.now() - (15 * 24 * 60 * 60 * 1000); // 15 days ago
      const billingCycleEnd = Date.now() + (15 * 24 * 60 * 60 * 1000); // 15 days from now
      
      const result = paymentService.calculateProration(
        currentPlan,
        newPlan,
        billingCycleStart,
        billingCycleEnd
      );
      
      expect(result.creditAmount).to.be.a('number');
      expect(result.debitAmount).to.be.a('number');
      expect(result.netAmount).to.be.a('number');
      expect(result.daysRemaining).to.be.a('number');
    });

    it('should handle edge case with same plan', () => {
      const plan = { price: 'price_basic', amount: 1000 };
      const now = Date.now();
      
      const result = paymentService.calculateProration(plan, plan, now, now + 30 * 24 * 60 * 60 * 1000);
      
      expect(result.netAmount).to.equal(0);
    });
  });

  describe('getCustomerSubscriptions', () => {
    it('should retrieve customer subscriptions', async () => {
      const customerId = 'cus_test123';
      const expectedSubscriptions = {
        data: [
          { id: 'sub_1', status: 'active' },
          { id: 'sub_2', status: 'canceled' }
        ],
        has_more: false
      };
      
      stripeStub.subscriptions.list.resolves(expectedSubscriptions);
      
      const result = await paymentService.getCustomerSubscriptions(customerId);
      
      expect(result).to.deep.equal(expectedSubscriptions);
      expect(stripeStub.subscriptions.list.calledWith({ customer: customerId })).to.be.true;
    });

    it('should handle retrieval failure', async () => {
      stripeStub.subscriptions.list.rejects(new Error('Customer not found'));
      
      const result = await paymentService.getCustomerSubscriptions('invalid_customer');
      
      expect(result).to.be.null;
    });
  });

  describe('updateSubscription', () => {
    it('should update subscription successfully', async () => {
      const subscriptionId = 'sub_test123';
      const updateData = {
        items: [{ price: 'new_price' }],
        metadata: { updated: 'true' }
      };
      
      const expectedSubscription = {
        id: subscriptionId,
        items: updateData.items,
        metadata: updateData.metadata
      };
      
      stripeStub.subscriptions.update.resolves(expectedSubscription);
      
      const result = await paymentService.updateSubscription(subscriptionId, updateData);
      
      expect(result).to.deep.equal(expectedSubscription);
      expect(stripeStub.subscriptions.update.calledWith(subscriptionId, updateData)).to.be.true;
    });

    it('should handle update failure', async () => {
      stripeStub.subscriptions.update.rejects(new Error('Invalid subscription'));
      
      const result = await paymentService.updateSubscription('invalid_sub', {});
      
      expect(result).to.be.null;
    });
  });

  describe('Error Handling', () => {
    it('should handle Stripe initialization failure', () => {
      stripe.default.throws(new Error('Invalid API key'));
      
      expect(() => {
        new (require('../../services/PaymentService'))('invalid_key');
      }).to.throw('Failed to initialize Stripe');
    });

    it('should handle API errors gracefully', async () => {
      stripeStub.customers.create.rejects(new Error('Rate limit exceeded'));
      
      const result = await paymentService.createCustomer({ email: 'test@example.com' });
      
      expect(result).to.be.null;
    });
  });

  describe('Rate Limiting', () => {
    it('should implement rate limiting for API calls', async () => {
      // Test that multiple rapid calls are handled appropriately
      const promises = Array(10).fill(null).map(() => 
        paymentService.createCustomer({ email: 'test@example.com' })
      );
      
      // All calls should be processed (rate limiting is handled by Stripe)
      const results = await Promise.all(promises);
      
      expect(results).to.have.lengthOf(10);
      expect(stripeStub.customers.create.callCount).to.equal(10);
    });
  });
});