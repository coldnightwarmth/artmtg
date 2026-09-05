CREATE TABLE live_card_status_snapshots (
  collection_id TEXT PRIMARY KEY,
  snapshot_json TEXT NOT NULL CHECK(json_valid(snapshot_json)),
  refreshed_at INTEGER NOT NULL,
  CHECK(collection_id IN ('cardnft2', 'poncho'))
) STRICT;

CREATE INDEX live_card_status_snapshots_refreshed_idx
ON live_card_status_snapshots(refreshed_at);
