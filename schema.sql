CREATE TABLE IF NOT EXISTS neighbors (
 id TEXT PRIMARY KEY, phone TEXT UNIQUE, name TEXT NOT NULL, username TEXT UNIQUE,
 personal_code TEXT NOT NULL UNIQUE, tracking INTEGER NOT NULL DEFAULT 1, created INTEGER NOT NULL, password_hash TEXT
);
CREATE TABLE IF NOT EXISTS staff (
 id TEXT PRIMARY KEY, username TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, name TEXT NOT NULL,
 role TEXT NOT NULL CHECK(role IN ('ceo','coordinator')), active INTEGER NOT NULL DEFAULT 1,
 must_change INTEGER NOT NULL DEFAULT 0, created INTEGER NOT NULL, phone TEXT, profile_changed INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS coordinator_documents (
 id TEXT PRIMARY KEY, owner_id TEXT NOT NULL REFERENCES staff(id), name TEXT NOT NULL,
 content BLOB NOT NULL, created INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
 digest TEXT PRIMARY KEY, actor_id TEXT NOT NULL, role TEXT NOT NULL, expires INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS session_actor ON sessions(actor_id);
CREATE TABLE IF NOT EXISTS recovery_codes (
 actor_id TEXT PRIMARY KEY, digest TEXT NOT NULL, expires BIGINT NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS rate_limits (bucket TEXT NOT NULL, created INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS rate_bucket ON rate_limits(bucket,created);
CREATE TABLE IF NOT EXISTS events (
 id TEXT PRIMARY KEY, owner_id TEXT NOT NULL REFERENCES staff(id), title TEXT NOT NULL,
 description TEXT NOT NULL, commune TEXT NOT NULL, sector TEXT NOT NULL, venue TEXT NOT NULL,
 address TEXT NOT NULL, category TEXT NOT NULL, ages TEXT NOT NULL, accessibility TEXT NOT NULL,
 starts INTEGER NOT NULL, ends INTEGER NOT NULL, capacity INTEGER NOT NULL CHECK(capacity>0),
 wheelchair INTEGER NOT NULL DEFAULT 0, sensory INTEGER NOT NULL DEFAULT 0, latitude REAL, longitude REAL,
 status TEXT NOT NULL DEFAULT 'published' CHECK(status IN ('published','cancelled')),
 why_go TEXT NOT NULL DEFAULT '', schedule_json TEXT NOT NULL DEFAULT '[]',
 created INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS event_owner ON events(owner_id,starts);
CREATE TABLE IF NOT EXISTS photos (event_id TEXT PRIMARY KEY REFERENCES events(id), mime TEXT NOT NULL, content BLOB NOT NULL);
CREATE TABLE IF NOT EXISTS bookings (
 event_id TEXT NOT NULL REFERENCES events(id), neighbor_id TEXT NOT NULL REFERENCES neighbors(id),
 status TEXT NOT NULL CHECK(status IN ('reserved','waiting','attended','cancelled')),
 created INTEGER NOT NULL, attended_at INTEGER, party TEXT, queue_order INTEGER NOT NULL, PRIMARY KEY(event_id,neighbor_id)
);
CREATE INDEX IF NOT EXISTS booking_queue ON bookings(event_id,status,created);
CREATE INDEX IF NOT EXISTS booking_neighbor ON bookings(neighbor_id);
CREATE TABLE IF NOT EXISTS audit (
 id INTEGER PRIMARY KEY, actor_id TEXT NOT NULL, role TEXT NOT NULL, action TEXT NOT NULL,
 subject_id TEXT, event_id TEXT REFERENCES events(id), created INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS audit_actor ON audit(actor_id,created);
CREATE TABLE IF NOT EXISTS traffic (
 id INTEGER PRIMARY KEY, neighbor_id TEXT NOT NULL REFERENCES neighbors(id), action TEXT NOT NULL,
 event_id TEXT REFERENCES events(id), created INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS traffic_actor ON traffic(neighbor_id,created);
CREATE INDEX IF NOT EXISTS traffic_date ON traffic(created);
CREATE TABLE IF NOT EXISTS reports (
 id TEXT PRIMARY KEY, event_id TEXT NOT NULL REFERENCES events(id), neighbor_id TEXT NOT NULL REFERENCES neighbors(id),
 detail TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'received' CHECK(status IN ('received','reviewed','resolved')),
 created INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS coordinator_requests (
 id TEXT PRIMARY KEY, username TEXT NOT NULL UNIQUE, name TEXT NOT NULL, phone TEXT NOT NULL,
 organization TEXT NOT NULL, reason TEXT NOT NULL, password_hash TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
 created INTEGER NOT NULL, reviewed_at INTEGER, reviewed_by TEXT REFERENCES staff(id)
);

CREATE TABLE IF NOT EXISTS whatsapp_subscriptions (
 neighbor_id TEXT NOT NULL REFERENCES neighbors(id), commune TEXT NOT NULL,
 active INTEGER NOT NULL DEFAULT 1, created INTEGER NOT NULL,
 PRIMARY KEY(neighbor_id,commune)
);
