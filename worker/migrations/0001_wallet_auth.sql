PRAGMA foreign_keys = ON;

CREATE TABLE wallet_users (
  wallet_address TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  last_login_at INTEGER NOT NULL,
  CHECK(length(wallet_address) BETWEEN 32 AND 44)
) STRICT;

CREATE TABLE auth_challenges (
  id TEXT PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  nonce TEXT NOT NULL UNIQUE,
  input_json TEXT NOT NULL CHECK(json_valid(input_json)),
  issued_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  consumed_at INTEGER,
  consume_token TEXT UNIQUE,
  CHECK(length(wallet_address) BETWEEN 32 AND 44)
) STRICT;

CREATE INDEX auth_challenges_expiry_idx
ON auth_challenges(expires_at);

CREATE TABLE auth_sessions (
  token_hash TEXT PRIMARY KEY,
  wallet_address TEXT NOT NULL
    REFERENCES wallet_users(wallet_address) ON DELETE CASCADE,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  revoked_at INTEGER
) STRICT;

CREATE INDEX auth_sessions_wallet_expiry_idx
ON auth_sessions(wallet_address, expires_at);

CREATE TABLE binder_profiles (
  wallet_address TEXT PRIMARY KEY
    REFERENCES wallet_users(wallet_address) ON DELETE CASCADE,
  is_public INTEGER NOT NULL DEFAULT 1 CHECK(is_public IN (0, 1)),
  is_discoverable INTEGER NOT NULL DEFAULT 0 CHECK(is_discoverable IN (0, 1)),
  card_order_json TEXT NOT NULL DEFAULT '[]' CHECK(json_valid(card_order_json)),
  cover_json TEXT NOT NULL DEFAULT '{}' CHECK(json_valid(cover_json)),
  table_json TEXT NOT NULL DEFAULT '{}' CHECK(json_valid(table_json)),
  schema_version INTEGER NOT NULL DEFAULT 1,
  revision INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
) STRICT;

CREATE TABLE auth_rate_limits (
  bucket_key TEXT PRIMARY KEY,
  request_count INTEGER NOT NULL,
  window_started_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
) STRICT;

CREATE INDEX auth_rate_limits_expiry_idx
ON auth_rate_limits(expires_at);
