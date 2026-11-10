"""Private documents and controlled self-service changes for coordinators."""

import base64
import binascii
import secrets

import auth
from core import APIError, audit, database, field, identifier, now, rate_limit

MAX_DOCUMENT = 2 * 1024 * 1024
PROFILE_INTERVAL = 86400


def profile(db, actor):
    rows = db.execute("SELECT id,name,created FROM coordinator_documents WHERE owner_id=? ORDER BY created DESC", (actor["id"],))
    return {"phone": actor["phone"], "next_change": actor["profile_changed"] + PROFILE_INTERVAL,
            "documents": [dict(row) for row in rows]}


def change_profile(body, token):
    column = body.get("field")
    if column not in ("username", "name"):
        raise APIError(400, "Selecciona el usuario o el nombre de la organización.")
    value = field(body, "value", "el nuevo dato", 64 if column == "username" else 150, 2)
    if column == "username":
        value = auth.username_for(value)
    password = body.get("password")
    if not isinstance(password, str) or not 1 <= len(password) <= 128:
        raise APIError(400, "Ingresa tu contraseña actual.")
    with database() as db:
        actor = auth.actor_for(db, token, "coordinator")
    rate_limit((f"coordinator-profile:{actor['id']}", 8, 900))
    if not auth.verify_password(password, actor["password_hash"]):
        raise APIError(401, "La contraseña actual es incorrecta.")
    with database(write=True) as db:
        current = auth.actor_for(db, token, "coordinator")
        if current["password_hash"] != actor["password_hash"]:
            raise APIError(409, "Vuelve a iniciar sesión.")
        if value == current[column]:
            raise APIError(400, "El nuevo dato debe ser distinto al actual.")
        if current["profile_changed"] + PROFILE_INTERVAL > now():
            raise APIError(409, "Puedes cambiar un dato cada 24 horas.")
        if column == "username" and db.execute("SELECT 1 FROM staff WHERE username=?", (value,)).fetchone():
            raise APIError(409, "Ese usuario ya está ocupado.")
        db.execute(f"UPDATE staff SET {column}=?,profile_changed=? WHERE id=?", (value, now(), actor["id"]))
        audit(db, actor, "perfil_coordinador_actualizado")
        return {"actor": auth.public_actor(auth.actor_for(db, token, "coordinator"))}


def upload(db, actor, body):
    if not actor["phone"]:
        raise APIError(400, "Pide al equipo que registre tu celular de coordinación.")
    name = field(body, "name", "el nombre del documento", 120)
    value = body.get("content")
    if not name.lower().endswith(".pdf") or not isinstance(value, str):
        raise APIError(415, "Sube un documento PDF.")
    if len(value) > 4 * ((MAX_DOCUMENT + 2) // 3):
        raise APIError(413, "El PDF debe pesar hasta 2 MB.")
    try:
        data = base64.b64decode(value, validate=True)
    except (ValueError, binascii.Error):
        raise APIError(400, "No se pudo leer el PDF.") from None
    if len(data) > MAX_DOCUMENT:
        raise APIError(413, "El PDF debe pesar hasta 2 MB.")
    if not data.startswith(b"%PDF-") or b"%%EOF" not in data[-1024:]:
        raise APIError(415, "El archivo no tiene el formato de un PDF.")
    if db.execute("SELECT COUNT(*) FROM coordinator_documents WHERE owner_id=?", (actor["id"],)).fetchone()[0] >= 3:
        raise APIError(409, "Puedes conservar hasta tres documentos. Elimina uno antes de subir otro.")
    document_id = secrets.token_hex(16)
    db.execute("INSERT INTO coordinator_documents VALUES (?,?,?,?,?)", (document_id, actor["id"], name, data, now()))
    audit(db, actor, "documento_coordinador_subido", document_id)
    return {"id": document_id}


def remove(db, actor, body):
    document = identifier(body.get("id"), "el documento")
    if not db.execute("DELETE FROM coordinator_documents WHERE id=? AND owner_id=?", (document, actor["id"])).rowcount:
        raise APIError(404, "Documento no encontrado.")
    audit(db, actor, "documento_coordinador_eliminado", document)
    return {"ok": True}
