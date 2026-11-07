"""Database connections, shared validation and audit records."""

import os
import re
import secrets
import sqlite3
import time

import cloud_database
from contextlib import contextmanager
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DATA_DIR = Path(os.environ.get("CHISPA_DATA_DIR") or ROOT).resolve()
DB_PATH = DATA_DIR / "chispaplay.db"
TRAFFIC_DAYS = 90


class APIError(Exception):
    def __init__(self, status, message):
        self.status = status
        self.message = message


def now():
    return int(time.time())


@contextmanager
def database(write=False):
    if cloud_database.DATABASE_URL:
        with cloud_database.database(write) as connection:
            yield connection
        return
    conn = sqlite3.connect(DB_PATH, timeout=10)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys=ON")
    try:
        if write:
            conn.execute("BEGIN IMMEDIATE")
        with conn:
            yield conn
    finally:
        conn.close()


def init_db():
    if cloud_database.DATABASE_URL:
        cloud_database.initialize()
        with database(write=True) as db:
            normalize_records(db)
        return
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with database() as db:
        db.execute("PRAGMA journal_mode=WAL")
        db.executescript((ROOT / "schema.sql").read_text(encoding="utf-8-sig"))
        db.execute("BEGIN IMMEDIATE")
        columns = {column["name"] for column in db.execute("PRAGMA table_info(neighbors)")}
        if "password_hash" not in columns:
            db.execute("ALTER TABLE neighbors ADD COLUMN password_hash TEXT")
        event_columns = {column["name"] for column in db.execute("PRAGMA table_info(events)")}
        for name, definition in (("wheelchair", "INTEGER NOT NULL DEFAULT 0"), ("sensory", "INTEGER NOT NULL DEFAULT 0"),
                                 ("latitude", "REAL"), ("longitude", "REAL"), ("why_go", "TEXT NOT NULL DEFAULT ''"),
                                 ("schedule_json", "TEXT NOT NULL DEFAULT '[]'")):
            if name not in event_columns:
                db.execute(f"ALTER TABLE events ADD COLUMN {name} {definition}")
        staff_columns = {column["name"] for column in db.execute("PRAGMA table_info(staff)")}
        if "phone" not in staff_columns:
            db.execute("ALTER TABLE staff ADD COLUMN phone TEXT")
        booking_columns = {column["name"] for column in db.execute("PRAGMA table_info(bookings)")}
        if "queue_order" not in booking_columns:
            db.execute("ALTER TABLE bookings ADD COLUMN queue_order INTEGER")
        rows = db.execute("SELECT event_id,neighbor_id FROM bookings WHERE queue_order IS NULL ORDER BY created,rowid").fetchall()
        next_order = db.execute("SELECT COALESCE(MAX(queue_order),0) FROM bookings").fetchone()[0]
        for offset, row in enumerate(rows, 1):
            db.execute("UPDATE bookings SET queue_order=? WHERE event_id=? AND neighbor_id=?",
                       (next_order + offset, row["event_id"], row["neighbor_id"]))
        normalize_records(db)


def normalize_records(db):
    db.execute("UPDATE neighbors SET tracking=1 WHERE tracking!=1")
    for neighbor in db.execute("SELECT id,personal_code FROM neighbors").fetchall():
        if not re.fullmatch(r"[0-9]{5}", neighbor["personal_code"]):
            db.execute("UPDATE neighbors SET personal_code=? WHERE id=?", (personal_code(db), neighbor["id"]))
    ceos = db.execute("SELECT id FROM staff WHERE role='ceo' AND active=1 ORDER BY created,id").fetchall()
    for duplicate in ceos[1:]:
        db.execute("UPDATE staff SET active=0 WHERE id=?", (duplicate["id"],))
        db.execute("DELETE FROM sessions WHERE actor_id=?", (duplicate["id"],))
    db.execute("CREATE UNIQUE INDEX IF NOT EXISTS single_active_ceo ON staff(role) WHERE role='ceo' AND active=1")


def field(body, key, label, maximum=150, minimum=1):
    value = body.get(key)
    if not isinstance(value, str) or not minimum <= len(value.strip()) <= maximum:
        raise APIError(400, f"Revisa {label}.")
    return value.strip()


def identifier(value, label="el identificador"):
    if not isinstance(value, str) or not re.fullmatch(r"[0-9a-f]{32}", value):
        raise APIError(400, f"Revisa {label}.")
    return value


def rate_limit(*limits):
    current = now()
    with database(write=True) as db:
        db.execute("DELETE FROM rate_limits WHERE created<?", (current - 3600,))
        for bucket, count, interval in limits:
            used = db.execute("SELECT COUNT(*) FROM rate_limits WHERE bucket=? AND created>?",
                              (bucket, current - interval)).fetchone()[0]
            if used >= count:
                raise APIError(429, "Demasiados intentos. Espera antes de volver a intentarlo.")
        buckets = {bucket for bucket, _, _ in limits}
        db.executemany("INSERT INTO rate_limits VALUES (?,?)", [(bucket, current) for bucket in buckets])


def audit(db, actor, action, subject=None, event=None):
    db.execute("INSERT INTO audit(actor_id,role,action,subject_id,event_id,created) VALUES (?,?,?,?,?,?)",
               (actor["id"], actor["role"], action, subject, event, now()))


def prune():
    current = now()
    with database(write=True) as db:
        db.execute("DELETE FROM rate_limits WHERE created<?", (current - 3600,))
        db.execute("DELETE FROM sessions WHERE expires<=?", (current,))
        db.execute("DELETE FROM traffic WHERE created<?", (current - TRAFFIC_DAYS * 86400,))


def personal_code(db):
    if db.execute("SELECT COUNT(*) FROM neighbors").fetchone()[0] >= 90000:
        raise APIError(409, "Se alcanzó el límite de códigos personales disponibles.")
    for _ in range(100):
        code = str(10000 + secrets.randbelow(90000))
        if not db.execute("SELECT 1 FROM neighbors WHERE personal_code=?", (code,)).fetchone():
            return code
    raise APIError(503, "No se pudo asignar un código. Intenta nuevamente.")
