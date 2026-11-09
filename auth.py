"""Role enforcement, password hashing and server-side sessions."""

import hashlib
import hmac
import re
import secrets
import sqlite3

from core import APIError, audit, database, field, identifier, now, rate_limit, personal_code

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


def neighbor_username(value):
    name = username_for(value)
    try:
        phone_number(name)
    except APIError:
        return name
    raise APIError(400, "El nombre de usuario no puede ser un número de celular.")


def validate_password(value):
    if not isinstance(value, str) or not 8 <= len(value) <= 128:
        raise APIError(400, "La contraseña debe tener entre 8 y 128 caracteres.")
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


def session(db, actor, previous=None, remember=False):
    revoke(db, previous)
    token = secrets.token_urlsafe(32)
    if actor["role"] == "neighbor":
        lifetime = (90 if remember else 30) * 86400
    else:
        lifetime = 7 * 86400 if remember and actor["role"] == "coordinator" and not actor["must_change"] else 8 * 3600
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
    fields = ("id", "role", "name", "phone", "username", "personal_code", "tracking") if actor["role"] == "neighbor" else (
        "id", "role", "name", "username", "must_change"
    )
    return {key: actor[key] for key in fields}


def register_neighbor(body, ip, previous):
    phone = phone_number(body["phone"]) if body.get("phone") else None
    username = neighbor_username(body["username"]) if body.get("username") else None
    if not phone and not username:
        raise APIError(400, "Elige un nombre de usuario para entrar sin celular.")
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
        if db.execute("SELECT 1 FROM neighbors WHERE username=?", (username,)).fetchone():
            raise APIError(409, "Ese nombre de usuario ya está ocupado.")
        actor_id = secrets.token_hex(16)
        code = personal_code(db)
        db.execute("""INSERT INTO neighbors(id,phone,username,name,personal_code,created,password_hash,tracking)
            VALUES (?,?,?,?,?,?,?,1)""", (actor_id, phone, username, name, code, now(), encoded))
        actor = db.execute("SELECT *, 'neighbor' AS role FROM neighbors WHERE id=?", (actor_id,)).fetchone()
        audit(db, actor, "vecino_registrado")
        cookie = session(db, actor, previous, body.get("remember") == "on")
    return {"actor": public_actor(actor)}, cookie


def find_neighbor(db, account, by_phone=False):
    if not by_phone:
        actor = db.execute("SELECT *, 'neighbor' AS role FROM neighbors WHERE username=?", (account.lower(),)).fetchone()
        if actor:
            return actor
    try:
        phone = phone_number(account)
    except APIError:
        return None
    return db.execute("SELECT *, 'neighbor' AS role FROM neighbors WHERE phone=?", (phone,)).fetchone()


def login_neighbor(body, ip, previous):
    by_phone = "account" not in body
    account = field(body, "phone" if by_phone else "account", "el usuario o celular", 64)
    password = body.get("password")
    if not isinstance(password, str) or not 1 <= len(password) <= 128:
        raise APIError(400, "Ingresa usuario o celular y contraseña.")
    rate_limit((f"neighbor-login-ip:{ip}", 30, 900))
    with database() as db:
        actor = find_neighbor(db, account, by_phone)
    identity = actor["id"] if actor else digest(account.lower())
    rate_limit((f"neighbor-login-account:{identity}", 10, 900))
    encoded = actor["password_hash"] if actor else None
    if not verify_password(password, encoded or DUMMY_HASH) or not encoded:
        raise APIError(401, "Celular o contraseña incorrectos.")
    with database(write=True) as db:
        current = db.execute("SELECT *, 'neighbor' AS role FROM neighbors WHERE id=?", (actor["id"],)).fetchone()
        if not current or current["password_hash"] != encoded or current["phone"] != actor["phone"] or current["username"] != actor["username"]:
            raise APIError(401, "Vuelve a iniciar sesión.")
        audit(db, current, "sesion_vecinal_iniciada")
        cookie = session(db, current, previous, body.get("remember") == "on")
    return {"actor": public_actor(current)}, cookie


def update_neighbor(body, token):
    password = body.get("password")
    if not isinstance(password, str) or not 1 <= len(password) <= 128:
        raise APIError(400, "Ingresa tu contraseña actual.")
    phone = phone_number(body["phone"]) if body.get("phone") else None
    username = neighbor_username(body["username"]) if body.get("username") else None
    if not phone and not username:
        raise APIError(400, "Conserva al menos un nombre de usuario o un celular para entrar.")
    with database() as db:
        actor = actor_for(db, token, "neighbor")
    rate_limit((f"neighbor-contact:{actor['id']}", 8, 3600))
    if not verify_password(password, actor["password_hash"] or DUMMY_HASH) or not actor["password_hash"]:
        raise APIError(401, "La contraseña actual es incorrecta.")
    with database(write=True) as db:
        current = actor_for(db, token, "neighbor")
        if current["password_hash"] != actor["password_hash"]:
            raise APIError(409, "Vuelve a iniciar sesión.")
        if db.execute("SELECT 1 FROM neighbors WHERE id<>? AND (phone=? OR username=?)", (actor["id"], phone, username)).fetchone() or db.execute(
            "SELECT 1 FROM staff WHERE role='ceo' AND phone=?", (phone,)
        ).fetchone():
            raise APIError(409, "Ese usuario o celular ya está reservado.")
        if current["phone"] != phone:
            db.execute("UPDATE whatsapp_subscriptions SET active=0 WHERE neighbor_id=?", (actor["id"],))
            db.execute("DELETE FROM recovery_codes WHERE actor_id=? AND expires>0", (actor["id"],))
        db.execute("UPDATE neighbors SET phone=?,username=? WHERE id=?", (phone, username, actor["id"]))
        audit(db, actor, "contacto_vecinal_actualizado")
    return {"ok": True}


def find_coordinator(db, account, by_username=False):
    if not by_username:
        try:
            phone = phone_number(account)
        except APIError:
            pass
        else:
            rows = db.execute("SELECT * FROM staff WHERE phone=? AND role='coordinator' LIMIT 2", (phone,)).fetchall()
            if rows:
                return rows[0] if len(rows) == 1 else None
    return db.execute("SELECT * FROM staff WHERE username=? AND role='coordinator'", (account.lower(),)).fetchone()


def login_staff(body, ip, previous):
    legacy = "account" not in body
    account = field(body, "username" if legacy else "account", "el usuario o celular", 64)
    password = body.get("password")
    role = body.get("role")
    if role != "coordinator" or not isinstance(password, str) or not 1 <= len(password) <= 128:
        raise APIError(400, "Ingresa usuario y contraseña.")
    rate_limit((f"staff-ip:{ip}", 25, 900))
    with database() as db:
        actor = find_coordinator(db, account, by_username=legacy)
    account_key = actor["username"] if actor else account.lower()
    rate_limit((f"staff-user:{account_key}", 8, 900))
    if not verify_password(password, actor["password_hash"] if actor else DUMMY_HASH) or not actor or not actor["active"]:
        raise APIError(401, "Usuario o contraseña incorrectos.")
    with database(write=True) as db:
        active = db.execute("SELECT * FROM staff WHERE id=? AND active=1", (actor["id"],)).fetchone()
        if not active or active["password_hash"] != actor["password_hash"] or active["phone"] != actor["phone"]:
            raise APIError(401, "Vuelve a iniciar sesión.")
        cookie = session(db, active, previous, body.get("remember") == "on")
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
        db.execute("DELETE FROM recovery_codes WHERE actor_id=?", (actor["id"],))
        actor = db.execute("SELECT * FROM staff WHERE id=?", (actor["id"],)).fetchone()
        cookie = session(db, actor)
        audit(db, actor, "contrasena_actualizada")
    return {"actor": public_actor(actor)}, cookie


def save_recovery_code(db, actor_id, expires=0):
    code = secrets.token_hex(6).upper()
    db.execute("""INSERT INTO recovery_codes(actor_id,digest,expires) VALUES (?,?,?)
        ON CONFLICT(actor_id) DO UPDATE SET digest=excluded.digest,expires=excluded.expires""",
        (actor_id, digest(code), expires))
    return code[:6] + "-" + code[6:]


def issue_recovery_code(body, token):
    password = body.get("password")
    if not isinstance(password, str) or not 1 <= len(password) <= 128:
        raise APIError(400, "Ingresa tu contraseña actual.")
    with database() as db:
        actor = actor_for(db, token, "neighbor", "coordinator")
    rate_limit((f"recovery-issue:{actor['id']}", 8, 3600))
    if not verify_password(password, actor["password_hash"] or DUMMY_HASH) or not actor["password_hash"]:
        raise APIError(401, "La contraseña actual es incorrecta.")
    with database(write=True) as db:
        current = actor_for(db, token, "neighbor", "coordinator")
        if current["password_hash"] != actor["password_hash"]:
            raise APIError(409, "La contraseña cambió. Inicia sesión nuevamente.")
        code = save_recovery_code(db, current["id"])
        audit(db, current, "codigo_recuperacion_generado")
    return {"code": code}


def issue_assisted_recovery(db, actor, body):
    neighbor = identifier(body.get("neighbor"), "la cuenta vecinal")
    if body.get("confirmed") is not True:
        raise APIError(400, "Confirma que verificaste el celular registrado.")
    row = db.execute("SELECT phone FROM neighbors WHERE id=?", (neighbor,)).fetchone()
    if not row or not row["phone"]:
        raise APIError(404, "La cuenta vecinal no tiene un celular registrado.")
    code = save_recovery_code(db, neighbor, now() + 30 * 60)
    audit(db, actor, "recuperacion_vecinal_asistida", neighbor)
    return {"code": code, "phone": row["phone"]}


def reset_password(body, ip):
    role = body.get("role")
    if role not in ("neighbor", "coordinator"):
        raise APIError(400, "Selecciona el tipo de cuenta.")
    account = field(body, "account", "el usuario o celular", 64)
    code = re.sub(r"[\s-]", "", field(body, "code", "el código de recuperación", 50)).upper()
    if not re.fullmatch(r"[A-F0-9]{12}(?:[A-F0-9]{12})?", code):
        raise APIError(400, "Revisa el formato del código de recuperación.")
    password = validate_password(body.get("new_password"))
    rate_limit((f"recovery-reset:{ip}", 15, 900))
    with database() as db:
        actor = find_coordinator(db, account) if role == "coordinator" else find_neighbor(db, account)
        stored = db.execute("SELECT digest FROM recovery_codes WHERE actor_id=? AND (expires=0 OR expires>?)",
                            (actor["id"], now())).fetchone() if actor else None
    rate_limit((f"recovery-account:{actor['id'] if actor else digest(account.lower())}", 8, 900))
    code_digest = digest(code)
    invalid = APIError(401, "La cuenta o el código de recuperación no son válidos.")
    if not stored or not hmac.compare_digest(stored["digest"], code_digest):
        raise invalid
    encoded = password_hash(password)
    with database(write=True) as db:
        if role == "coordinator" and not db.execute(
            "SELECT 1 FROM staff WHERE id=? AND role='coordinator' AND active=1 AND must_change=0", (actor["id"],)
        ).fetchone():
            raise invalid
        if not db.execute("DELETE FROM recovery_codes WHERE actor_id=? AND digest=? AND (expires=0 OR expires>?)",
                          (actor["id"], code_digest, now())).rowcount:
            raise invalid
        if role == "coordinator":
            db.execute("UPDATE staff SET password_hash=? WHERE id=?", (encoded, actor["id"]))
        else:
            db.execute("UPDATE neighbors SET password_hash=? WHERE id=?", (encoded, actor["id"]))
        db.execute("DELETE FROM sessions WHERE actor_id=?", (actor["id"],))
        audit(db, actor, "contrasena_recuperada")
    return {"ok": True}


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
    rate_limit((f"coordinator-request:{ip}", 5, 3600), (f"coordinator-request-phone:{digest(phone)}", 2, 3600))
    encoded = password_hash(password)
    request_id = secrets.token_hex(16)
    with database(write=True) as db:
        if db.execute("SELECT 1 FROM staff WHERE username=? OR phone=?", (username, phone)).fetchone():
            raise APIError(409, "Ese usuario o celular ya está reservado.")
        try:
            db.execute("""INSERT INTO coordinator_requests
                (id,username,name,phone,organization,reason,password_hash,created) VALUES (?,?,?,?,?,?,?,?)""",
                (request_id, username, name, phone, organization, reason, encoded, now()))
        except sqlite3.IntegrityError:
            raise APIError(409, "Ya existe una solicitud para ese usuario.") from None
    return {"status": "pending"}


def login_account(body, ip, previous):
    value = field(body, "account" if "account" in body else "phone", "el usuario o celular", 64)
    try:
        phone = phone_number(value)
    except APIError:
        phone = None
    with database() as db:
        ceo = db.execute("SELECT 1 FROM staff WHERE role='ceo' AND active=1 AND phone=?", (phone,)).fetchone()
    try:
        if ceo:
            name = body.get("name")
            if not isinstance(name, str) or not 2 <= len(name.strip()) <= 64:
                name = "_"
            return login_ceo({"username": name, "phone": phone, "password": body.get("password")}, ip, previous)
        return login_neighbor(body, ip, previous)
    except APIError as error:
        if error.status == 401:
            raise APIError(401, "Los datos de acceso son incorrectos.") from None
        raise
