DROP INDEX IF EXISTS live_card_status_snapshots_refreshed_idx;

ALTER TABLE live_card_status_snapshots
RENAME TO live_card_status_snapshots_previous;

CREATE TABLE live_card_status_snapshots (
  collection_id TEXT PRIMARY KEY,
  snapshot_json TEXT NOT NULL CHECK(json_valid(snapshot_json)),
  refreshed_at INTEGER NOT NULL,
  CHECK(collection_id IN ('cardnft2', 'poncho', 'clear'))
) STRICT;

INSERT INTO live_card_status_snapshots (collection_id, snapshot_json, refreshed_at)
SELECT collection_id, snapshot_json, refreshed_at
FROM live_card_status_snapshots_previous;

DROP TABLE live_card_status_snapshots_previous;

CREATE INDEX live_card_status_snapshots_refreshed_idx
ON live_card_status_snapshots(refreshed_at);
