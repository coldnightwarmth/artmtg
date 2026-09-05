ALTER TABLE binder_profiles
ADD COLUMN trade_card_ids_json TEXT NOT NULL DEFAULT '[]' CHECK(json_valid(trade_card_ids_json));
