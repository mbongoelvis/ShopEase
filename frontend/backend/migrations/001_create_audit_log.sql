-- Create audit_log table for tracking all system activities
CREATE TABLE IF NOT EXISTS audit_log (
  audit_id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES user_account(user_id) ON DELETE SET NULL,
  store_id UUID NOT NULL REFERENCES store(store_id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  entity_name VARCHAR(255),
  status VARCHAR(20) DEFAULT 'SUCCESS',
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT valid_status CHECK (status IN ('SUCCESS', 'FAILED'))
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_audit_log_store_id ON audit_log(store_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity_type, entity_id);
