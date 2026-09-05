export interface WalletUserRow {
  wallet_address: string;
  created_at: number;
  last_login_at: number;
}

export interface AuthChallengeRow {
  id: string;
  wallet_address: string;
  input_json: string;
  issued_at: number;
  expires_at: number;
  consumed_at: number | null;
  consume_token: string | null;
}

export interface AuthSessionRow {
  token_hash: string;
  wallet_address: string;
  created_at: number;
  expires_at: number;
  revoked_at: number | null;
}

export interface BinderProfileRow {
  wallet_address: string;
  is_public: 0 | 1;
  is_discoverable: 0 | 1;
  card_order_json: string;
  trade_card_ids_json: string;
  cover_json: string;
  table_json: string;
  schema_version: number;
  revision: number;
  created_at: number;
  updated_at: number;
}

export interface LiveCardStatusSnapshotRow {
  collection_id: "cardnft2" | "poncho" | "clear";
  snapshot_json: string;
  refreshed_at: number;
}
