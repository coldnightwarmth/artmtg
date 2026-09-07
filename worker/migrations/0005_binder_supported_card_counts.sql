ALTER TABLE binder_profiles ADD COLUMN supported_card_count INTEGER;
ALTER TABLE binder_profiles ADD COLUMN holdings_checked_at INTEGER;

CREATE INDEX IF NOT EXISTS idx_binder_profiles_public_holdings
  ON binder_profiles (is_public, supported_card_count, updated_at DESC, wallet_address DESC);
