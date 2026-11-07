"""Role enforcement, password hashing, SMS challenges and server-side sessions."""

import hashlib
import hmac
import os
import re
import secrets

import sms
from core import APIError, audit, database, field, now, rate_limit

PASSWORD_ITERATIONS = 600_000
SMS_HOURLY_LIMIT = int(os.environ.get("CHISPA_SMS_HOURLY_LIMIT", "100"))


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
            actor = db.execute("SELECT * FROM staff WHERE id=? AND active=1", (row["actor_id"],)).fetchone()
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


def send_sms(body, ip):
    phone = phone_number(body.get("phone"))
    rate_limit(("sms-global", SMS_HOURLY_LIMIT, 3600), (f"sms-ip:{ip}", 12, 900),
               (f"sms-phone:{phone}", 3, 900), (f"sms-phone:{phone}", 1, 60))
    try:
        provider_id = sms.start(phone)
    except sms.Rejected:
        raise APIError(429, "No se pudo enviar el SMS. Verifica el número e inténtalo más tarde.") from None
    except sms.Unavailable:
        raise APIError(503, "El envío de SMS no está disponible en este momento.") from None
    challenge = secrets.token_urlsafe(24)
    with database(write=True) as db:
        db.execute("DELETE FROM sms_requests WHERE expires<=? OR (phone=? AND checking=0)", (now(), phone))
        db.execute("INSERT INTO sms_requests(id,phone,provider_id,expires) VALUES (?,?,?,?)",
                   (challenge, phone, provider_id, now() + 600))
    return {"challenge": challenge}


def confirm_sms(body, previous):
    challenge = field(body, "challenge", "la solicitud de verificación", 48)
    code = field(body, "code", "el código SMS", 10)
    name = field(body, "name", "el nombre", 100, 2)
    if not re.fullmatch(r"[0-9]{4,10}", code):
        raise APIError(400, "Ingresa el código numérico recibido por SMS.")
    with database(write=True) as db:
        row = db.execute("SELECT * FROM sms_requests WHERE id=? AND expires>?", (challenge, now())).fetchone()
        if not row or row["attempts"] >= 5:
            raise APIError(400, "Solicita un código SMS nuevo.")
        if row["checking"]:
            raise APIError(409, "Ya estamos verificando este código.")
        db.execute("UPDATE sms_requests SET checking=1, attempts=attempts+1 WHERE id=?", (challenge,))
    try:
        approved = sms.check(row["provider_id"], row["phone"], code)
    except sms.Rejected:
        approved = False
    except sms.Unavailable:
        with database(write=True) as db:
            db.execute("UPDATE sms_requests SET checking=0, attempts=attempts-1 WHERE id=?", (challenge,))
        raise APIError(503, "No se pudo verificar el SMS. Intenta nuevamente.") from None
    with database(write=True) as db:
        if not approved:
            db.execute("UPDATE sms_requests SET checking=0 WHERE id=?", (challenge,))
        else:
            if not db.execute("DELETE FROM sms_requests WHERE id=? AND expires>?", (challenge, now())).rowcount:
                raise APIError(400, "Solicita un código SMS nuevo.")
            actor = db.execute("SELECT *, 'neighbor' AS role FROM neighbors WHERE phone=?", (row["phone"],)).fetchone()
            if not actor:
                user_id = secrets.token_hex(16)
                personal_code = "CP-" + secrets.token_hex(6).upper()
                db.execute("INSERT INTO neighbors(id,phone,name,personal_code,created) VALUES (?,?,?,?,?)",
                           (user_id, row["phone"], name, personal_code, now()))
                actor = db.execute("SELECT *, 'neighbor' AS role FROM neighbors WHERE id=?", (user_id,)).fetchone()
                audit(db, actor, "vecino_registrado")
            audit(db, actor, "sesion_vecinal_iniciada")
            cookie = session(db, actor, previous)
    if not approved:
        raise APIError(400, "Código incorrecto o vencido.")
    return {"actor": public_actor(actor)}, cookie


def login_staff(body, ip, previous):
    username = username_for(body.get("username"))
    password = body.get("password")
    role = body.get("role")
    if role not in ("coordinator", "ceo") or not isinstance(password, str) or not 1 <= len(password) <= 128:
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
