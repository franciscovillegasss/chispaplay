"""Copy an operational SQLite database into an empty hosted ChispaPlay schema."""

import argparse
import re
import sqlite3
from pathlib import Path

import cloud_database
from core import database, init_db

TABLES = (
    "neighbors", "staff", "events", "photos", "bookings", "audit", "traffic",
    "reports", "coordinator_requests", "whatsapp_subscriptions", "recovery_codes", "coordinator_documents",
)


def migrate(source):
    if not cloud_database.DATABASE_URL:
        raise ValueError("Configura CHISPA_DATABASE_URL antes de migrar.")
    source = Path(source).resolve(strict=True)
    init_db()
    local = sqlite3.connect(source.as_uri() + "?mode=ro", uri=True)
    local.row_factory = sqlite3.Row
    try:
        local.execute("BEGIN")
        with database(write=True) as remote:
            if any(remote.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0] for table in TABLES):
                raise ValueError("El esquema remoto ya tiene datos. La migración requiere un destino vacío.")
            totals = {}
            for table in TABLES:
                if not local.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?", (table,)).fetchone():
                    totals[table] = 0
                    continue
                source_columns = {row["name"] for row in local.execute(f"PRAGMA table_info({table})")}
                target_columns = [row["column_name"] for row in remote.execute(
                    "SELECT column_name FROM information_schema.columns WHERE table_schema='chispa' AND table_name=? ORDER BY ordinal_position",
                    (table,)
                )]
                columns = [name for name in target_columns if name in source_columns]
                if not all(re.fullmatch(r"[a-z_]+", name) for name in columns):
                    raise ValueError("Esquema de origen inválido.")
                names = ",".join(columns)
                rows = local.execute(f"SELECT {names} FROM {table}").fetchall()
                if table == "bookings" and "queue_order" not in columns and rows:
                    raise ValueError("Inicia una vez la versión actual con la base local para migrar el orden de reservas.")
                placeholders = ",".join("?" for _ in columns)
                remote.executemany(f"INSERT INTO {table}({names}) VALUES ({placeholders})", [tuple(row) for row in rows])
                totals[table] = len(rows)
            for table in ("audit", "traffic"):
                remote.execute(f"SELECT setval(pg_get_serial_sequence('chispa.{table}','id'), COALESCE(MAX(id),0)+1,false) FROM {table}")
        return totals
    finally:
        local.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", help="Ruta al archivo SQLite operativo")
    args = parser.parse_args()
    try:
        counts = migrate(args.source)
    except (ValueError, OSError, sqlite3.Error) as error:
        parser.exit(1, str(error) + "\n")
    for table, count in counts.items():
        print(f"{table}: {count}")
    print("Migración completada. Las cuentas deben iniciar sesión nuevamente.")
