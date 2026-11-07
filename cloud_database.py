"""PostgreSQL support for a hosted database, keeping credentials on the server."""

import os
import sqlite3
from contextlib import contextmanager
from pathlib import Path

DATABASE_URL = os.environ.get("CHISPA_DATABASE_URL", "").strip()
WRITE_LOCK = 714224270


class Record(dict):
    def __getitem__(self, name):
        if isinstance(name, int):
            return tuple(self.values())[name]
        return super().__getitem__(name)


class Result:
    def __init__(self, cursor):
        self.cursor = cursor

    @property
    def rowcount(self):
        return self.cursor.rowcount

    def fetchone(self):
        row = self.cursor.fetchone()
        return Record(row) if row is not None else None

    def fetchall(self):
        return [Record(row) for row in self.cursor.fetchall()]

    def __iter__(self):
        return (Record(row) for row in self.cursor)


class Connection:
    def __init__(self, connection, driver):
        self.connection = connection
        self.driver = driver

    def execute(self, statement, values=()):
        # All SQL is authored by the application. Values always stay bound parameters.
        query = statement.replace("?", "%s").replace("instr(", "strpos(")
        params = tuple(int(value) if isinstance(value, bool) else value for value in values)
        try:
            return Result(self.connection.execute(query, params or None))
        except self.driver.IntegrityError:
            raise sqlite3.IntegrityError("El dato ya existe o infringe una restricción.") from None
        except self.driver.Error:
            raise sqlite3.OperationalError("No se pudo completar la operación en la base alojada.") from None

    def executemany(self, statement, values):
        for row in values:
            self.execute(statement, row)


def connect():
    try:
        import psycopg
        from psycopg.rows import dict_row
        from psycopg.conninfo import conninfo_to_dict
    except ImportError:
        raise sqlite3.OperationalError("Instala las dependencias de PostgreSQL antes de activar CHISPA_DATABASE_URL.") from None
    try:
        options = conninfo_to_dict(DATABASE_URL)
        local = options.get("host") in ("127.0.0.1", "localhost", "::1")
        connection = psycopg.connect(
            DATABASE_URL, row_factory=dict_row, autocommit=True, prepare_threshold=None,
            connect_timeout=10, sslmode="disable" if local else (
                options.get("sslmode") if options.get("sslmode") in ("verify-ca", "verify-full") else "require"
            )
        )
        connection.execute("SET search_path TO chispa")
        connection.execute("SET statement_timeout TO '20s'")
        return connection, psycopg
    except psycopg.Error:
        raise sqlite3.OperationalError("No se pudo conectar con la base alojada. Revisa la conexión del servidor.") from None


@contextmanager
def database(write=False):
    connection, driver = connect()
    try:
        with connection.transaction():
            if write:
                # Matches SQLite's serialized write transactions, including reservation checks.
                connection.execute("SELECT pg_advisory_xact_lock(%s)", (WRITE_LOCK,))
            yield Connection(connection, driver)
    finally:
        connection.close()


def initialize():
    connection, driver = connect()
    try:
        with connection.transaction():
            connection.execute("SELECT pg_advisory_xact_lock(%s)", (WRITE_LOCK,))
            connection.execute("CREATE SCHEMA IF NOT EXISTS chispa")
            connection.execute("REVOKE ALL ON SCHEMA chispa FROM PUBLIC")
            schema = (Path(__file__).parent / "schema.postgres.sql").read_text(encoding="utf-8")
            connection.execute(schema, prepare=False)
            for role in ("anon", "authenticated", "service_role"):
                if connection.execute("SELECT 1 FROM pg_roles WHERE rolname=%s", (role,)).fetchone():
                    connection.execute(f"REVOKE ALL ON SCHEMA chispa FROM {role}")
                    connection.execute(f"REVOKE ALL ON ALL TABLES IN SCHEMA chispa FROM {role}")
                    connection.execute(f"REVOKE ALL ON ALL SEQUENCES IN SCHEMA chispa FROM {role}")
    except driver.Error:
        raise sqlite3.OperationalError("No se pudo inicializar el esquema de ChispaPlay en PostgreSQL.") from None
    finally:
        connection.close()
