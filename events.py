"""Catalog, capacity, waiting lists and attendance."""

import base64
import binascii
import json
import re
import secrets
from datetime import datetime

from core import APIError, audit, field, now
from geography import COMMUNES, COMMUNE_NAMES, key

MAX_IMAGE = 3 * 1024 * 1024
IMAGES = {"image/jpeg": b"\xff\xd8\xff", "image/png": b"\x89PNG\r\n\x1a\n", "image/webp": b"RIFF"}
EVENT_FIELDS = (
    ("title", "el título", 120), ("description", "la descripción", 2000),
    ("commune", "la comuna", 60), ("sector", "el sector", 80), ("venue", "el lugar", 120),
    ("address", "la dirección", 180), ("category", "la categoría", 70), ("ages", "las edades", 120),
    ("accessibility", "la información de accesibilidad", 400),
)
CATALOG = """
 SELECT e.*, s.name AS organizer,
    EXISTS(SELECT 1 FROM photos p WHERE p.event_id=e.id) AS has_photo,
    COUNT(CASE WHEN b.status IN ('reserved','attended') THEN 1 END) AS booked,
    COUNT(CASE WHEN b.status='waiting' THEN 1 END) AS waiting,
    COUNT(CASE WHEN b.status='attended' THEN 1 END) AS attended
 FROM events e JOIN staff s ON s.id=e.owner_id
 LEFT JOIN bookings b ON b.event_id=e.id
"""


def event_row(db, event_id):
    row = db.execute(CATALOG + " WHERE e.id=? GROUP BY e.id,s.name", (event_id,)).fetchone()
    if not row:
        raise APIError(404, "Actividad no encontrada.")
    return row


def result(row, public=True):
    data = dict(row)
    data["schedule"] = json.loads(data.pop("schedule_json"))
    data["available"] = max(0, data["capacity"] - data["booked"])
    data["photo"] = f"/api/events/{data['id']}/photo" if data.pop("has_photo") and row["status"] == "published" else None
    if public:
        for key in ("owner_id", "waiting", "attended", "created"):
            data.pop(key)
    return data


def catalog(db, owner=None, all_events=False):
    if all_events:
        where, values = "", ()
    elif owner:
        where, values = " WHERE e.owner_id=?", (owner,)
    else:
        placeholders = ",".join("?" for _ in COMMUNES)
        where = f" WHERE e.status='published' AND e.ends>? AND e.commune IN ({placeholders})"
        values = (now(), *COMMUNES)
    order = "DESC" if owner or all_events else "ASC"
    rows = db.execute(CATALOG + where + f" GROUP BY e.id,s.name ORDER BY e.starts {order}, e.id", values)
    return [result(row, public=not (owner or all_events)) for row in rows]


def require_owner(event, actor):
    if event["owner_id"] != actor["id"]:
        raise APIError(404, "Actividad no encontrada.")


def event_date(body, key):
    try:
        date = datetime.fromisoformat(field(body, key, "la fecha y hora", 40))
        if date.tzinfo is None:
            raise ValueError()
        return int(date.timestamp())
    except (ValueError, OverflowError, OSError):
        raise APIError(400, "Ingresa una fecha y hora válidas.") from None


def photo_data(value):
    if not isinstance(value, str):
        raise APIError(400, "Foto inválida.")
    header, separator, payload = value.partition(",")
    mime = header.removeprefix("data:").removesuffix(";base64")
    if not separator or mime not in IMAGES or header != f"data:{mime};base64":
        raise APIError(415, "Usa una foto JPEG, PNG o WebP.")
    try:
        image = base64.b64decode(payload, validate=True)
    except (ValueError, binascii.Error):
        raise APIError(400, "Foto inválida.") from None
    if len(image) > MAX_IMAGE:
        raise APIError(413, "La foto debe pesar hasta 3 MB.")
    if not image.startswith(IMAGES[mime]) or (mime == "image/webp" and image[8:12] != b"WEBP"):
        raise APIError(415, "La foto no coincide con el formato indicado.")
    return mime, image


def save(db, actor, body, event=None):
    data = {key: field(body, key, label, limit) for key, label, limit in EVENT_FIELDS}
    if key(data["commune"]) not in COMMUNE_NAMES:
        raise APIError(400, "Selecciona una comuna de la Región Metropolitana.")
    data["commune"] = COMMUNE_NAMES[key(data["commune"])]
    why = body.get("why_go", "")
    if not isinstance(why, str) or len(why) > 240:
        raise APIError(400, "El resumen debe tener hasta 240 caracteres.")
    schedule = body.get("schedule", [])
    if not isinstance(schedule, list) or len(schedule) > 12:
        raise APIError(400, "Revisa el cronograma.")
    cleaned = [{"time": field(item, "time", "la hora del cronograma", 30),
                "activity": field(item, "activity", "la actividad del cronograma", 180)}
               for item in schedule if isinstance(item, dict)]
    if len(cleaned) != len(schedule):
        raise APIError(400, "Revisa el cronograma.")
    data.update(why_go=why.strip(), schedule_json=json.dumps(cleaned, ensure_ascii=False))
    capacity = body.get("capacity")
    if type(capacity) is not int or not 1 <= capacity <= 500:
        raise APIError(400, "Indica entre 1 y 500 cupos.")
    start, end = event_date(body, "starts"), event_date(body, "ends")
    current = now()
    if start <= current or end <= start or end - start > 7 * 86400:
        raise APIError(400, "Indica un inicio futuro y un término posterior, con una duración máxima de siete días.")
    latitude, longitude = body.get("latitude"), body.get("longitude")
    if latitude is not None or longitude is not None:
        if type(latitude) not in (int, float) or type(longitude) not in (int, float):
            raise APIError(400, "Completa ambas coordenadas del lugar.")
        if not -90 <= latitude <= 90 or not -180 <= longitude <= 180:
            raise APIError(400, "Revisa el rango de las coordenadas.")
    data.update(starts=start, ends=end, capacity=capacity, latitude=latitude, longitude=longitude,
                wheelchair=int(body.get("wheelchair") is True), sensory=int(body.get("sensory") is True))
    photo = photo_data(body["photo"]) if "photo" in body else None
    if event:
        if event["status"] != "published" or event["starts"] <= current:
            raise APIError(409, "Solo se puede editar una actividad publicada que todavía no comienza.")
        if capacity < event["booked"]:
            raise APIError(409, "El nuevo aforo es menor que las reservas confirmadas.")
        event_id = event["id"]
        db.execute("UPDATE events SET " + ",".join(f"{key}=?" for key in data) + " WHERE id=?",
                   (*data.values(), event_id))
        fill_seats(db, event_row(db, event_id), actor)
        action = "actividad_editada"
    else:
        event_id = secrets.token_hex(16)
        data.update(id=event_id, owner_id=actor["id"], created=current)
        columns = ",".join(data)
        placeholders = ",".join("?" for _ in data)
        db.execute(f"INSERT INTO events({columns}) VALUES ({placeholders})", tuple(data.values()))
        action = "actividad_publicada"
    if photo:
        db.execute("INSERT INTO photos(event_id,mime,content) VALUES (?,?,?) ON CONFLICT(event_id) DO UPDATE SET mime=excluded.mime,content=excluded.content", (event_id, *photo))
    elif body.get("remove_photo") is True:
        db.execute("DELETE FROM photos WHERE event_id=?", (event_id,))
    audit(db, actor, action, event=event_id)
    return {"event": result(event_row(db, event_id), public=False)}


def cancel(db, actor, event):
    if event["status"] == "cancelled":
        return {"status": "cancelled"}
    if event["ends"] <= now():
        raise APIError(409, "La actividad ya terminó.")
    db.execute("UPDATE events SET status='cancelled' WHERE id=?", (event["id"],))
    audit(db, actor, "actividad_cancelada", event=event["id"])
    return {"status": "cancelled"}


def fill_seats(db, event, actor):
    free = event["capacity"] - event["booked"]
    if free <= 0 or event["status"] != "published" or event["starts"] <= now():
        return
    waiting = db.execute("""SELECT neighbor_id FROM bookings
        WHERE event_id=? AND status='waiting' ORDER BY queue_order LIMIT ?""", (event["id"], free)).fetchall()
    for booking in waiting:
        db.execute("UPDATE bookings SET status='reserved' WHERE event_id=? AND neighbor_id=?",
                   (event["id"], booking["neighbor_id"]))
        audit(db, actor, "reserva_desde_espera", booking["neighbor_id"], event["id"])


def reserve(db, actor, event, cancel_reservation=False):
    keys = (event["id"], actor["id"])
    booking = db.execute("SELECT status FROM bookings WHERE event_id=? AND neighbor_id=?", keys).fetchone()
    status = booking["status"] if booking else None
    if cancel_reservation:
        if status not in ("reserved", "waiting"):
            return {"status": status}
        if event["status"] != "published" or event["starts"] <= now():
            raise APIError(409, "La reserva ya no admite cambios.")
        db.execute("UPDATE bookings SET status='cancelled' WHERE event_id=? AND neighbor_id=?", keys)
        audit(db, actor, "reserva_cancelada" if status == "reserved" else "espera_cancelada", actor["id"], event["id"])
        if status == "reserved":
            fill_seats(db, event_row(db, event["id"]), actor)
        return {"status": "cancelled"}
    if status in ("reserved", "waiting", "attended"):
        return {"status": status}
    if event["status"] != "published" or event["starts"] <= now():
        raise APIError(409, "Las inscripciones están cerradas.")
    status = "reserved" if event["booked"] < event["capacity"] else "waiting"
    if booking:
        db.execute("DELETE FROM bookings WHERE event_id=? AND neighbor_id=?", keys)
    queue_order = db.execute("SELECT COALESCE(MAX(queue_order),0)+1 FROM bookings").fetchone()[0]
    db.execute("INSERT INTO bookings(event_id,neighbor_id,status,created,queue_order) VALUES (?,?,?,?,?)",
               (*keys, status, now(), queue_order))
    audit(db, actor, "reserva_confirmada" if status == "reserved" else "lista_espera", actor["id"], event["id"])
    return {"status": status}


def attendance(db, actor, event, body):
    code = field(body, "personal_code", "el código personal", 20).upper()
    if not re.fullmatch(r"[0-9]{5}", code):
        raise APIError(400, "Revisa el código personal del vecino.")
    row = db.execute("""SELECT n.id,n.name,b.status,b.attended_at FROM bookings b
        JOIN neighbors n ON n.id=b.neighbor_id
        WHERE b.event_id=? AND n.personal_code=? AND b.status IN ('reserved','attended')""",
        (event["id"], code)).fetchone()
    if not row:
        raise APIError(404, "El código no corresponde a una reserva confirmada para esta actividad.")
    if row["status"] == "attended":
        return {"name": row["name"], "attended_at": row["attended_at"], "already_recorded": True}
    current = now()
    if event["status"] != "published" or not event["starts"] - 1800 <= current <= event["ends"] + 7200:
        raise APIError(409, "La asistencia se registra desde 30 minutos antes hasta dos horas después de la actividad.")
    db.execute("UPDATE bookings SET status='attended',attended_at=? WHERE event_id=? AND neighbor_id=?",
               (current, event["id"], row["id"]))
    audit(db, actor, "asistencia_registrada", row["id"], event["id"])
    return {"name": row["name"], "attended_at": current, "already_recorded": False}
