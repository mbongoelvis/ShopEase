-- Add payment_method column to invoice table
ALTER TABLE invoice ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'PENDING';

-- Add payment_method column to subscription table (to store preferred method)
ALTER TABLE subscription ADD COLUMN IF NOT EXISTS preferred_payment_method VARCHAR(50);

-- Valid payment methods: PENDING, CREDIT_CARD, BANK_TRANSFER, MOBILE_MONEY, CASH, CHECK, WIRE_TRANSFER

-- Create index for filtering by payment method
CREATE INDEX IF NOT EXISTS idx_invoice_payment_method ON invoice(payment_method);
