"""Database connections, shared validation and audit records."""

import os
import re
import sqlite3
import time
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
                                 ("latitude", "REAL"), ("longitude", "REAL")):
            if name not in event_columns:
                db.execute(f"ALTER TABLE events ADD COLUMN {name} {definition}")


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
