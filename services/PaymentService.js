const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'payment-service' },
  transports: [
    new winston.transports.File({ filename: 'logs/payment-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/payment-combined.log' })
  ]
});

class PaymentService {
  constructor() {
    this.stripe = stripe;
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  }

  async createCustomer(userData) {
    try {
      const customer = await this.stripe.customers.create({
        email: userData.email,
        name: userData.name,
        metadata: {
          userId: userData.userId,
          neurodiversityProfile: userData.neurodiversityProfile
        }
      });

      logger.info(`Stripe customer created: ${customer.id}`);
      return {
        id: customer.id,
        email: customer.email,
        name: customer.name
      };
    } catch (error) {
      logger.error('Stripe customer creation error:', error);
      throw new Error('Failed to create Stripe customer');
    }
  }

  async updateCustomer(customerId, updateData) {
    try {
      const customer = await this.stripe.customers.update(customerId, {
        email: updateData.email,
        name: updateData.name,
        metadata: {
          ...updateData.metadata
        }
      });

      logger.info(`Stripe customer updated: ${customerId}`);
      return {
        id: customer.id,
        email: customer.email,
        name: customer.name
      };
    } catch (error) {
      logger.error('Stripe customer update error:', error);
      throw new Error('Failed to update Stripe customer');
    }
  }

  async createSubscription(customerId, planData) {
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{
          price: planData.priceId
        }],
        trial_period_days: planData.trialDays || 0,
        metadata: {
          planType: planData.planType,
          neurodiversityOptimized: planData.neurodiversityOptimized ? 'true' : 'false',
          userId: planData.userId
        }
      });

      logger.info(`Stripe subscription created: ${subscription.id}`);
      return {
        id: subscription.id,
        status: subscription.status,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        trial_start: subscription.trial_start,
        trial_end: subscription.trial_end,
        customer_id: subscription.customer,
        items: subscription.items.data.map(item => ({
          id: item.id,
          price_id: item.price.id,
          amount: item.price.unit_amount
        }))
      };
    } catch (error) {
      logger.error('Stripe subscription creation error:', error);
      throw new Error('Failed to create Stripe subscription');
    }
  }

  async updateSubscription(subscriptionId, updateData) {
    try {
      const subscription = await this.stripe.subscriptions.update(subscriptionId, {
        items: [{
          id: updateData.itemId,
          price: updateData.newPriceId
        }],
        proration_behavior: updateData.prorationBehavior || 'create_prorations',
        metadata: {
          ...updateData.metadata
        }
      });

      logger.info(`Stripe subscription updated: ${subscriptionId}`);
      return {
        id: subscription.id,
        status: subscription.status,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        items: subscription.items.data.map(item => ({
          id: item.id,
          price_id: item.price.id,
          amount: item.price.unit_amount
        }))
      };
    } catch (error) {
      logger.error('Stripe subscription update error:', error);
      throw new Error('Failed to update Stripe subscription');
    }
  }

  async cancelSubscription(subscriptionId, cancelAtPeriodEnd = true) {
    try {
      const subscription = await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: cancelAtPeriodEnd
      });

      logger.info(`Stripe subscription cancelled: ${subscriptionId}`);
      return {
        id: subscription.id,
        status: subscription.status,
        cancel_at_period_end: subscription.cancel_at_period_end,
        current_period_end: subscription.current_period_end
      };
    } catch (error) {
      logger.error('Stripe subscription cancellation error:', error);
      throw new Error('Failed to cancel Stripe subscription');
    }
  }

  async createPaymentIntent(amount, currency, customerId, metadata = {}) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        customer: customerId,
        metadata: {
          ...metadata,
          neurodiversityOptimized: 'true'
        },
        automatic_payment_methods: {
          enabled: true
        }
      });

      logger.info(`Stripe payment intent created: ${paymentIntent.id}`);
      return {
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency
      };
    } catch (error) {
      logger.error('Stripe payment intent creation error:', error);
      throw new Error('Failed to create Stripe payment intent');
    }
  }

  async confirmPaymentIntent(paymentIntentId, paymentMethodId) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentMethodId
      });

      logger.info(`Stripe payment intent confirmed: ${paymentIntentId}`);
      return {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        charges: paymentIntent.charges.data.map(charge => ({
          id: charge.id,
          amount: charge.amount,
          status: charge.status,
          payment_method: charge.payment_method
        }))
      };
    } catch (error) {
      logger.error('Stripe payment intent confirmation error:', error);
      throw new Error('Failed to confirm Stripe payment intent');
    }
  }

  async createSetupIntent(customerId, metadata = {}) {
    try {
      const setupIntent = await this.stripe.setupIntents.create({
        customer: customerId,
        metadata: {
          ...metadata,
          neurodiversityOptimized: 'true'
        },
        usage: 'off_session',
        automatic_payment_methods: {
          enabled: true
        }
      });

      logger.info(`Stripe setup intent created: ${setupIntent.id}`);
      return {
        id: setupIntent.id,
        client_secret: setupIntent.client_secret,
        status: setupIntent.status,
        customer: setupIntent.customer
      };
    } catch (error) {
      logger.error('Stripe setup intent creation error:', error);
      throw new Error('Failed to create Stripe setup intent');
    }
  }

  async attachPaymentMethod(customerId, paymentMethodId) {
    try {
      const paymentMethod = await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId
      });

      logger.info(`Payment method attached to customer: ${customerId}`);
      return {
        id: paymentMethod.id,
        type: paymentMethod.type,
        customer: paymentMethod.customer
      };
    } catch (error) {
      logger.error('Stripe payment method attachment error:', error);
      throw new Error('Failed to attach payment method to customer');
    }
  }

  async getPaymentMethods(customerId, type = 'card') {
    try {
      const paymentMethods = await this.stripe.paymentMethods.list({
        customer: customerId,
        type: type
      });

      logger.info(`Payment methods retrieved for customer: ${customerId}`);
      return paymentMethods.data.map(pm => ({
        id: pm.id,
        type: pm.type,
        card: pm.card ? {
          brand: pm.card.brand,
          last4: pm.card.last4,
          exp_month: pm.card.exp_month,
          exp_year: pm.card.exp_year,
          funding: pm.card.funding
        } : null,
        created: pm.created
      }));
    } catch (error) {
      logger.error('Stripe payment methods retrieval error:', error);
      throw new Error('Failed to retrieve payment methods');
    }
  }

  async createInvoice(customerId, invoiceData) {
    try {
      const invoice = await this.stripe.invoices.create({
        customer: customerId,
        auto_advance: false,
        metadata: {
          ...invoiceData.metadata,
          neurodiversityOptimized: 'true'
        }
      });

      // Add invoice items
      for (const item of invoiceData.items) {
        await this.stripe.invoiceItems.create({
          customer: customerId,
          invoice: invoice.id,
          amount: Math.round(item.amount * 100),
          currency: item.currency.toLowerCase(),
          description: item.description
        });
      }

      // Finalize the invoice
      const finalizedInvoice = await this.stripe.invoices.finalizeInvoice(invoice.id);

      logger.info(`Stripe invoice created: ${finalizedInvoice.id}`);
      return {
        id: finalizedInvoice.id,
        status: finalizedInvoice.status,
        amount_due: finalizedInvoice.amount_due,
        currency: finalizedInvoice.currency,
        hosted_invoice_url: finalizedInvoice.hosted_invoice_url,
        invoice_pdf: finalizedInvoice.invoice_pdf
      };
    } catch (error) {
      logger.error('Stripe invoice creation error:', error);
      throw new Error('Failed to create Stripe invoice');
    }
  }

  async processWebhook(payload, signature) {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret
      );

      logger.info(`Stripe webhook received: ${event.type}`);

      switch (event.type) {
        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object);
          break;
        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object);
          break;
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event.data.object);
          break;
        default:
          logger.info(`Unhandled webhook event type: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      logger.error('Stripe webhook processing error:', error);
      throw new Error('Failed to process Stripe webhook');
    }
  }

  async handlePaymentSucceeded(invoice) {
    logger.info(`Payment succeeded for invoice: ${invoice.id}`);
    // Update subscription status in database
    // Send confirmation email
    // Update analytics
  }

  async handlePaymentFailed(invoice) {
    logger.error(`Payment failed for invoice: ${invoice.id}`);
    // Update subscription status in database
    // Send failure notification
    // Handle retry logic
  }

  async handleSubscriptionUpdated(subscription) {
    logger.info(`Subscription updated: ${subscription.id}`);
    // Update subscription in database
    // Handle plan changes
    // Update user permissions
  }

  async handleSubscriptionDeleted(subscription) {
    logger.info(`Subscription deleted: ${subscription.id}`);
    // Update subscription status in database
    // Remove user permissions
    // Send cancellation confirmation
  }

  async handlePaymentIntentSucceeded(paymentIntent) {
    logger.info(`Payment intent succeeded: ${paymentIntent.id}`);
    // Update order status
    // Send confirmation
    // Update analytics
  }

  async handlePaymentIntentFailed(paymentIntent) {
    logger.error(`Payment intent failed: ${paymentIntent.id}`);
    // Update order status
    // Handle failure
    // Send failure notification
  }

  async createRefund(chargeId, amount = null) {
    try {
      const refundData = {
        charge: chargeId
      };

      if (amount) {
        refundData.amount = Math.round(amount * 100); // Convert to cents
      }

      const refund = await this.stripe.refunds.create(refundData);

      logger.info(`Stripe refund created: ${refund.id}`);
      return {
        id: refund.id,
        status: refund.status,
        amount: refund.amount,
        currency: refund.currency,
        charge: refund.charge
      };
    } catch (error) {
      logger.error('Stripe refund creation error:', error);
      throw new Error('Failed to create Stripe refund');
    }
  }

  async getSubscription(subscriptionId) {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);

      return {
        id: subscription.id,
        status: subscription.status,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        trial_start: subscription.trial_start,
        trial_end: subscription.trial_end,
        customer_id: subscription.customer,
        items: subscription.items.data.map(item => ({
          id: item.id,
          price_id: item.price.id,
          amount: item.price.unit_amount,
          interval: item.price.recurring.interval,
          currency: item.price.currency
        }))
      };
    } catch (error) {
      logger.error('Stripe subscription retrieval error:', error);
      throw new Error('Failed to retrieve Stripe subscription');
    }
  }

  async getCustomer(customerId) {
    try {
      const customer = await this.stripe.customers.retrieve(customerId);

      return {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        created: customer.created,
        subscriptions: customer.subscriptions?.data?.map(sub => ({
          id: sub.id,
          status: sub.status,
          current_period_end: sub.current_period_end
        })) || []
      };
    } catch (error) {
      logger.error('Stripe customer retrieval error:', error);
      throw new Error('Failed to retrieve Stripe customer');
    }
  }

  async calculateProration(customerId, subscriptionId, newPriceId) {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
      
      const items = [{
        id: subscription.items.data[0].id,
        price: newPriceId,
      }];

      const invoice = await this.stripe.invoices.retrieveUpcoming({
        customer: customerId,
        subscription: subscriptionId,
        subscription_items: items,
        subscription_proration_date: Math.floor(Date.now() / 1000),
      });

      const prorationAmount = invoice.amount_due;

      logger.info(`Proration calculated for subscription: ${subscriptionId}`);
      return {
        amount: prorationAmount,
        currency: invoice.currency,
        next_invoice_amount: invoice.total
      };
    } catch (error) {
      logger.error('Stripe proration calculation error:', error);
      throw new Error('Failed to calculate proration');
    }
  }
}

module.exports = PaymentService;