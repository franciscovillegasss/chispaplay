"""Role enforcement, password hashing and server-side sessions."""

import hashlib
import hmac
import re
import secrets
import sqlite3

from core import APIError, audit, database, field, now, rate_limit, personal_code

PASSWORD_ITERATIONS = 600_000


def phone_number(value):
    phone = re.sub(r"[\s()-]", "", value) if isinstance(value, str) else ""
    if re.fullmatch(r"9[0-9]{8}", phone):
        phone = "+56" + phone
    elif re.fullmatch(r"569[0-9]{8}", phone):
        phone = "+" + phone
    if not re.fullmatch(r"\+569[0-9]{8}", phone):
        raise APIError(400, "Ingresa un celular chileno: +56 9 seguido de ocho dígitos.")
    return phone


def username_for(value):
    if not isinstance(value, str) or not re.fullmatch(r"[a-zA-Z0-9_.-]{3,64}", value.strip()):
        raise APIError(400, "Usa entre 3 y 64 letras, números, puntos, guiones o guiones bajos para el usuario.")
    return value.strip().lower()


def validate_password(value):
    if not isinstance(value, str) or not 12 <= len(value) <= 128:
        raise APIError(400, "La contraseña debe tener entre 12 y 128 caracteres.")
    return value


def password_hash(password, salt=None):
    salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt), PASSWORD_ITERATIONS)
    return salt + "$" + digest.hex()


DUMMY_HASH = password_hash(secrets.token_hex(32))


def verify_password(password, encoded):
    salt = encoded.split("$", 1)[0]
    return hmac.compare_digest(password_hash(password, salt), encoded)


def create_staff(db, username, name, encoded, role, temporary=False):
    actor_id = secrets.token_hex(16)
    db.execute("INSERT INTO staff(id,username,name,password_hash,role,must_change,created) VALUES (?,?,?,?,?,?,?)",
               (actor_id, username, name, encoded, role, int(temporary), now()))
    return actor_id


def digest(token):
    return hashlib.sha256(token.encode()).hexdigest()


def revoke(db, token):
    if token:
        db.execute("DELETE FROM sessions WHERE digest=?", (digest(token),))


def session(db, actor, previous=None):
    revoke(db, previous)
    token = secrets.token_urlsafe(32)
    lifetime = 30 * 86400 if actor["role"] == "neighbor" else 8 * 3600
    db.execute("DELETE FROM sessions WHERE expires<=?", (now(),))
    db.execute("INSERT INTO sessions VALUES (?,?,?,?)", (digest(token), actor["id"], actor["role"], now() + lifetime))
    return token, lifetime


def actor_for(db, token, *roles, temporary=False):
    actor = None
    if token:
        row = db.execute("SELECT * FROM sessions WHERE digest=? AND expires>?", (digest(token), now())).fetchone()
        if row and row["role"] == "neighbor":
            actor = db.execute("SELECT *, 'neighbor' AS role FROM neighbors WHERE id=?", (row["actor_id"],)).fetchone()
        elif row:
            actor = db.execute("SELECT * FROM staff WHERE id=? AND role=? AND active=1", (row["actor_id"], row["role"])).fetchone()
    if roles:
        if not actor:
            raise APIError(401, "Inicia sesión para continuar.")
        if actor["role"] not in roles:
            raise APIError(403, "Tu cuenta no tiene acceso a esta función.")
        if actor["role"] != "neighbor" and actor["must_change"] and not temporary:
            raise APIError(403, "Cambia tu contraseña temporal para continuar.")
    return actor


def public_actor(actor):
    if actor is None:
        return None
    fields = ("id", "role", "name", "phone", "personal_code", "tracking") if actor["role"] == "neighbor" else (
        "id", "role", "name", "username", "must_change"
    )
    return {key: actor[key] for key in fields}


def register_neighbor(body, ip, previous):
    phone = phone_number(body.get("phone"))
    name = field(body, "name", "el nombre", 100, 2)
    password = validate_password(body.get("password"))
    if body.get("website"):
        raise APIError(400, "No se pudo registrar la cuenta.")
    rate_limit((f"neighbor-register:{ip}", 8, 3600))
    encoded = password_hash(password)
    with database(write=True) as db:
        if db.execute("SELECT 1 FROM staff WHERE role='ceo' AND phone=?", (phone,)).fetchone():
            raise APIError(409, "Este celular está reservado para una cuenta de administración.")
        if db.execute("SELECT 1 FROM neighbors WHERE phone=?", (phone,)).fetchone():
            raise APIError(409, "Ya existe una cuenta para este número. Inicia sesión.")
        actor_id = secrets.token_hex(16)
        code = personal_code(db)
        db.execute("""INSERT INTO neighbors(id,phone,name,personal_code,created,password_hash,tracking)
            VALUES (?,?,?,?,?,?,1)""", (actor_id, phone, name, code, now(), encoded))
        actor = db.execute("SELECT *, 'neighbor' AS role FROM neighbors WHERE id=?", (actor_id,)).fetchone()
        audit(db, actor, "vecino_registrado")
        cookie = session(db, actor, previous)
    return {"actor": public_actor(actor)}, cookie


def login_neighbor(body, ip, previous):
    phone = phone_number(body.get("phone"))
    password = body.get("password")
    if not isinstance(password, str) or not 1 <= len(password) <= 128:
        raise APIError(400, "Ingresa celular y contraseña.")
    rate_limit((f"neighbor-login-ip:{ip}", 30, 900), (f"neighbor-login-phone:{phone}", 10, 900))
    with database() as db:
        actor = db.execute("SELECT *, 'neighbor' AS role FROM neighbors WHERE phone=?", (phone,)).fetchone()
    encoded = actor["password_hash"] if actor else None
    if not verify_password(password, encoded or DUMMY_HASH) or not encoded:
        raise APIError(401, "Celular o contraseña incorrectos.")
    with database(write=True) as db:
        audit(db, actor, "sesion_vecinal_iniciada")
        cookie = session(db, actor, previous)
    return {"actor": public_actor(actor)}, cookie


def login_staff(body, ip, previous):
    username = username_for(body.get("username"))
    password = body.get("password")
    role = body.get("role")
    if role != "coordinator" or not isinstance(password, str) or not 1 <= len(password) <= 128:
        raise APIError(400, "Ingresa usuario y contraseña.")
    rate_limit((f"staff-ip:{ip}", 25, 900), (f"staff-user:{username}", 8, 900))
    with database() as db:
        actor = db.execute("SELECT * FROM staff WHERE username=? AND role=?", (username, role)).fetchone()
    if not verify_password(password, actor["password_hash"] if actor else DUMMY_HASH) or not actor or not actor["active"]:
        raise APIError(401, "Usuario o contraseña incorrectos.")
    with database(write=True) as db:
        active = db.execute("SELECT * FROM staff WHERE id=? AND active=1", (actor["id"],)).fetchone()
        if not active or active["password_hash"] != actor["password_hash"]:
            raise APIError(401, "Vuelve a iniciar sesión.")
        cookie = session(db, active, previous)
        audit(db, active, "sesion_equipo_iniciada")
    return {"actor": public_actor(active)}, cookie


def change_password(body, token):
    old = body.get("current_password")
    new = validate_password(body.get("new_password"))
    if not isinstance(old, str) or len(old) > 128 or old == new:
        raise APIError(400, "Usa una contraseña nueva y distinta de la actual.")
    with database() as db:
        actor = actor_for(db, token, "coordinator", "ceo", temporary=True)
    rate_limit((f"staff-password:{actor['id']}", 8, 900))
    if not verify_password(old, actor["password_hash"]):
        raise APIError(400, "La contraseña actual es incorrecta.")
    encoded = password_hash(new)
    with database(write=True) as db:
        actor_for(db, token, "coordinator", "ceo", temporary=True)
        if not db.execute("UPDATE staff SET password_hash=?,must_change=0 WHERE id=? AND password_hash=?",
                          (encoded, actor["id"], actor["password_hash"])).rowcount:
            raise APIError(409, "La contraseña cambió. Inicia sesión nuevamente.")
        db.execute("DELETE FROM sessions WHERE actor_id=?", (actor["id"],))
        actor = db.execute("SELECT * FROM staff WHERE id=?", (actor["id"],)).fetchone()
        cookie = session(db, actor)
        audit(db, actor, "contrasena_actualizada")
    return {"actor": public_actor(actor)}, cookie


def login_ceo(body, ip, previous):
    username = field(body, "username", "el usuario CEO", 64)
    phone = phone_number(body.get("phone"))
    password = body.get("password")
    if not isinstance(password, str) or not 1 <= len(password) <= 128:
        raise APIError(400, "Ingresa tus credenciales.")
    rate_limit((f"ceo-ip:{ip}", 10, 900), ("ceo-access", 20, 900))
    with database() as db:
        actor = db.execute("SELECT * FROM staff WHERE role='ceo' AND active=1").fetchone()
    valid_password = verify_password(password, actor["password_hash"] if actor else DUMMY_HASH)
    valid_identity = bool(actor and actor["phone"] and
                          hmac.compare_digest(username.encode(), actor["username"].encode()) and
                          hmac.compare_digest(phone.encode(), actor["phone"].encode()))
    if not valid_password or not valid_identity:
        raise APIError(401, "Credenciales de administración incorrectas.")
    with database(write=True) as db:
        current = db.execute("SELECT * FROM staff WHERE id=? AND active=1", (actor["id"],)).fetchone()
        if not current or current["password_hash"] != actor["password_hash"]:
            raise APIError(401, "Vuelve a iniciar sesión.")
        cookie = session(db, current, previous)
        audit(db, current, "sesion_ceo_iniciada")
    return {"actor": public_actor(current)}, cookie


def request_coordinator(body, ip):
    username = username_for(body.get("username"))
    name = field(body, "name", "tu nombre", 120, 2)
    phone = phone_number(body.get("phone"))
    organization = field(body, "organization", "la organización", 150, 2)
    reason = field(body, "reason", "el motivo de la solicitud", 800, 10)
    password = validate_password(body.get("password"))
    if body.get("website"):
        raise APIError(400, "No se pudo enviar la solicitud.")
    rate_limit((f"coordinator-request:{ip}", 5, 3600), (f"coordinator-request-phone:{phone}", 2, 3600))
    encoded = password_hash(password)
    request_id = secrets.token_hex(16)
    with database(write=True) as db:
        if db.execute("SELECT 1 FROM staff WHERE username=? OR (role='ceo' AND phone=?)", (username, phone)).fetchone():
            raise APIError(409, "Ese usuario o celular ya está reservado.")
        try:
            db.execute("""INSERT INTO coordinator_requests
                (id,username,name,phone,organization,reason,password_hash,created) VALUES (?,?,?,?,?,?,?,?)""",
                (request_id, username, name, phone, organization, reason, encoded, now()))
        except sqlite3.IntegrityError:
            raise APIError(409, "Ya existe una solicitud para ese usuario.") from None
    return {"status": "pending"}
