-- Migration: Create payment-related tables
-- Created at: 2024-01-01 00:00:00
-- Description: Creates tables for payment processing, billing, and subscription management

-- Payment methods table
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    subscription_id UUID REFERENCES subscriptions(id),
    payment_method_type VARCHAR(50) NOT NULL CHECK (payment_method_type IN ('credit_card', 'debit_card', 'bank_transfer', 'paypal', 'stripe', 'apple_pay', 'google_pay', 'cryptocurrency')),
    provider VARCHAR(50) NOT NULL CHECK (provider IN ('stripe', 'paypal', 'braintree', 'square', 'adyen', 'authorize_net', 'custom')),
    provider_payment_method_id VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    card_brand VARCHAR(50),
    card_last_four VARCHAR(4),
    card_exp_month INTEGER CHECK (card_exp_month >= 1 AND card_exp_month <= 12),
    card_exp_year INTEGER CHECK (card_exp_year >= EXTRACT(YEAR FROM CURRENT_DATE)),
    bank_name VARCHAR(255),
    bank_account_last_four VARCHAR(4),
    routing_number VARCHAR(9),
    account_holder_name VARCHAR(255),
    account_type VARCHAR(50) CHECK (account_type IN ('checking', 'savings', 'business')),
    billing_address JSONB DEFAULT '{}',
    verification_status VARCHAR(50) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'failed', 'expired')),
    verification_method VARCHAR(100),
    risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
    fraud_detection JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL
);

-- Create indexes for payment methods
CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX idx_payment_methods_subscription_id ON payment_methods(subscription_id);
CREATE INDEX idx_payment_methods_payment_method_type ON payment_methods(payment_method_type);
CREATE INDEX idx_payment_methods_provider ON payment_methods(provider);
CREATE INDEX idx_payment_methods_is_primary ON payment_methods(is_primary);
CREATE INDEX idx_payment_methods_is_active ON payment_methods(is_active);
CREATE INDEX idx_payment_methods_card_last_four ON payment_methods(card_last_four);
CREATE INDEX idx_payment_methods_verification_status ON payment_methods(verification_status);
CREATE INDEX idx_payment_methods_created_at ON payment_methods(created_at);
CREATE INDEX idx_payment_methods_deleted_at ON payment_methods(deleted_at) WHERE deleted_at IS NULL;

-- Create updated_at trigger for payment methods
CREATE TRIGGER update_payment_methods_updated_at 
    BEFORE UPDATE ON payment_methods 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_name VARCHAR(255) NOT NULL,
    plan_key VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    plan_type VARCHAR(50) NOT NULL CHECK (plan_type IN ('free', 'trial', 'basic', 'premium', 'enterprise', 'custom')),
    billing_cycle VARCHAR(50) NOT NULL CHECK (billing_cycle IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'one_time')),
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    currency VARCHAR(3) DEFAULT 'USD',
    setup_fee DECIMAL(10,2) DEFAULT 0,
    trial_period_days INTEGER DEFAULT 0,
    max_subscribers INTEGER,
    max_emails_per_month INTEGER,
    max_campaigns_per_month INTEGER,
    features JSONB DEFAULT '[]',
    limitations JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    is_public BOOLEAN DEFAULT TRUE,
    is_recommended BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL
);

-- Create indexes for subscription plans
CREATE INDEX idx_subscription_plans_plan_key ON subscription_plans(plan_key);
CREATE INDEX idx_subscription_plans_plan_type ON subscription_plans(plan_type);
CREATE INDEX idx_subscription_plans_billing_cycle ON subscription_plans(billing_cycle);
CREATE INDEX idx_subscription_plans_is_active ON subscription_plans(is_active);
CREATE INDEX idx_subscription_plans_is_public ON subscription_plans(is_public);
CREATE INDEX idx_subscription_plans_is_recommended ON subscription_plans(is_recommended);
CREATE INDEX idx_subscription_plans_display_order ON subscription_plans(display_order);
CREATE INDEX idx_subscription_plans_created_at ON subscription_plans(created_at);
CREATE INDEX idx_subscription_plans_deleted_at ON subscription_plans(deleted_at) WHERE deleted_at IS NULL;

-- Create updated_at trigger for subscription plans
CREATE TRIGGER update_subscription_plans_updated_at 
    BEFORE UPDATE ON subscription_plans 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- User subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    subscription_plan_id UUID NOT NULL REFERENCES subscription_plans(id),
    payment_method_id UUID REFERENCES payment_methods(id),
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'trial', 'past_due', 'cancelled', 'expired', 'suspended', 'pending')),
    start_date DATE NOT NULL,
    end_date DATE,
    trial_end_date DATE,
    next_billing_date DATE,
    last_billing_date DATE,
    auto_renew BOOLEAN DEFAULT TRUE,
    cancellation_date DATE,
    cancellation_reason TEXT,
    upgrade_downgrade_history JSONB DEFAULT '[]',
    usage_this_cycle JSONB DEFAULT '{}',
    usage_limits JSONB DEFAULT '{}',
    custom_pricing JSONB DEFAULT '{}',
    discount_code VARCHAR(255),
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'partially_refunded')),
    payment_failure_count INTEGER DEFAULT 0,
    last_payment_failure_reason TEXT,
    grace_period_end_date DATE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL
);

-- Create indexes for user subscriptions
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_subscription_plan_id ON user_subscriptions(subscription_plan_id);
CREATE INDEX idx_user_subscriptions_payment_method_id ON user_subscriptions(payment_method_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_start_date ON user_subscriptions(start_date);
CREATE INDEX idx_user_subscriptions_end_date ON user_subscriptions(end_date);
CREATE INDEX idx_user_subscriptions_next_billing_date ON user_subscriptions(next_billing_date);
CREATE INDEX idx_user_subscriptions_auto_renew ON user_subscriptions(auto_renew);
CREATE INDEX idx_user_subscriptions_created_at ON user_subscriptions(created_at);
CREATE INDEX idx_user_subscriptions_deleted_at ON user_subscriptions(deleted_at) WHERE deleted_at IS NULL;

-- Create updated_at trigger for user subscriptions
CREATE TRIGGER update_user_subscriptions_updated_at 
    BEFORE UPDATE ON user_subscriptions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_subscription_id UUID REFERENCES user_subscriptions(id),
    payment_method_id UUID REFERENCES payment_methods(id),
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('subscription_payment', 'setup_fee', 'upgrade_fee', 'downgrade_refund', 'cancellation_refund', 'additional_service')),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    description TEXT,
    provider VARCHAR(50) NOT NULL,
    provider_transaction_id VARCHAR(255),
    provider_charge_id VARCHAR(255),
    provider_payment_intent_id VARCHAR(255),
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partially_refunded', 'disputed')),
    failure_reason TEXT,
    failure_code VARCHAR(100),
    refund_amount DECIMAL(10,2) DEFAULT 0,
    refund_reason TEXT,
    refund_date TIMESTAMP,
    dispute_amount DECIMAL(10,2) DEFAULT 0,
    dispute_reason TEXT,
    dispute_date TIMESTAMP,
    dispute_evidence JSONB DEFAULT '{}',
    tax_amount DECIMAL(10,2) DEFAULT 0,
    processing_fee DECIMAL(10,2) DEFAULT 0,
    net_amount DECIMAL(10,2) DEFAULT 0,
    exchange_rate DECIMAL(10,6),
    risk_score INTEGER DEFAULT 0,
    fraud_detection JSONB DEFAULT '{}',
    invoice_number VARCHAR(255),
    invoice_url VARCHAR(500),
    receipt_url VARCHAR(500),
    metadata JSONB DEFAULT '{}',
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for transactions
CREATE INDEX idx_transactions_user_subscription_id ON transactions(user_subscription_id);
CREATE INDEX idx_transactions_payment_method_id ON transactions(payment_method_id);
CREATE INDEX idx_transactions_transaction_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_provider_transaction_id ON transactions(provider_transaction_id);
CREATE INDEX idx_transactions_invoice_number ON transactions(invoice_number);
CREATE INDEX idx_transactions_processed_at ON transactions(processed_at);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

-- Create updated_at trigger for transactions
CREATE TRIGGER update_transactions_updated_at 
    BEFORE UPDATE ON transactions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    user_subscription_id UUID REFERENCES user_subscriptions(id),
    transaction_id UUID REFERENCES transactions(id),
    invoice_number VARCHAR(255) UNIQUE NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled', 'refunded')),
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    billing_period_start DATE,
    billing_period_end DATE,
    line_items JSONB DEFAULT '[]',
    notes TEXT,
    terms_and_conditions TEXT,
    payment_terms VARCHAR(255),
    payment_instructions TEXT,
    late_fee_amount DECIMAL(10,2) DEFAULT 0,
    late_fee_date DATE,
    reminder_sent_count INTEGER DEFAULT 0,
    last_reminder_sent_at TIMESTAMP,
    pdf_url VARCHAR(500),
    pdf_generated_at TIMESTAMP,
    sent_via VARCHAR(50) CHECK (sent_via IN ('email', 'portal', 'mail')),
    viewed_at TIMESTAMP,
    viewed_ip_address INET,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL
);

-- Create indexes for invoices
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_user_subscription_id ON invoices(user_subscription_id);
CREATE INDEX idx_invoices_transaction_id ON invoices(transaction_id);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_invoice_date ON invoices(invoice_date);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_total_amount ON invoices(total_amount);
CREATE INDEX idx_invoices_created_at ON invoices(created_at);
CREATE INDEX idx_invoices_deleted_at ON invoices(deleted_at) WHERE deleted_at IS NULL;

-- Create updated_at trigger for invoices
CREATE TRIGGER update_invoices_updated_at 
    BEFORE UPDATE ON invoices 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Usage tracking table
CREATE TABLE IF NOT EXISTS usage_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    user_subscription_id UUID NOT NULL REFERENCES user_subscriptions(id),
    usage_date DATE NOT NULL,
    metric_type VARCHAR(100) NOT NULL,
    metric_name VARCHAR(255) NOT NULL,
    current_value INTEGER DEFAULT 0,
    limit_value INTEGER,
    percentage_used DECIMAL(5,2) DEFAULT 0,
    reset_date DATE,
    billing_cycle_start DATE,
    billing_cycle_end DATE,
    overage_count INTEGER DEFAULT 0,
    overage_amount DECIMAL(10,2) DEFAULT 0,
    warning_sent BOOLEAN DEFAULT FALSE,
    limit_exceeded BOOLEAN DEFAULT FALSE,
    limit_exceeded_at TIMESTAMP,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_subscription_id, usage_date, metric_type, metric_name)
);

-- Create indexes for usage tracking
CREATE INDEX idx_usage_tracking_user_id ON usage_tracking(user_id);
CREATE INDEX idx_usage_tracking_user_subscription_id ON usage_tracking(user_subscription_id);
CREATE INDEX idx_usage_tracking_usage_date ON usage_tracking(usage_date);
CREATE INDEX idx_usage_tracking_metric_type ON usage_tracking(metric_type);
CREATE INDEX idx_usage_tracking_metric_name ON usage_tracking(metric_name);
CREATE INDEX idx_usage_tracking_reset_date ON usage_tracking(reset_date);
CREATE INDEX idx_usage_tracking_limit_exceeded ON usage_tracking(limit_exceeded);
CREATE INDEX idx_usage_tracking_created_at ON usage_tracking(created_at);

-- Create updated_at trigger for usage tracking
CREATE TRIGGER update_usage_tracking_updated_at 
    BEFORE UPDATE ON usage_tracking 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate subscription usage percentage
CREATE OR REPLACE FUNCTION calculate_subscription_usage(p_user_subscription_id UUID, p_metric_type VARCHAR, p_metric_name VARCHAR)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    v_current_value INTEGER;
    v_limit_value INTEGER;
    v_percentage DECIMAL(5,2) := 0;
BEGIN
    SELECT current_value, limit_value
    INTO v_current_value, v_limit_value
    FROM usage_tracking
    WHERE user_subscription_id = p_user_subscription_id
    AND metric_type = p_metric_type
    AND metric_name = p_metric_name
    AND usage_date = CURRENT_DATE;

    IF v_limit_value > 0 THEN
        v_percentage := (v_current_value::DECIMAL / v_limit_value::DECIMAL) * 100;
    END IF;

    RETURN v_percentage;
END;
$$ language 'plpgsql';