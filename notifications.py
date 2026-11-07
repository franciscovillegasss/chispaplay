"""Opt-in WhatsApp subscriptions. Messages are prepared for manual sending."""

from core import APIError, audit, field, now
from geography import COMMUNE_NAMES, key


def subscribe(db, actor, body):
    commune = field(body, "commune", "la comuna", 60)
    commune = COMMUNE_NAMES.get(key(commune))
    if not commune or type(body.get("enabled")) is not bool:
        raise APIError(400, "Selecciona una comuna y una preferencia válidas.")
    enabled = body["enabled"]
    if enabled and body.get("consent") is not True:
        raise APIError(400, "Confirma que quieres recibir avisos por WhatsApp.")
    current = db.execute("SELECT active FROM whatsapp_subscriptions WHERE neighbor_id=? AND commune=?", (actor["id"], commune)).fetchone()
    if current and bool(current["active"]) == enabled:
        return {"commune": commune, "active": enabled}
    db.execute("""INSERT INTO whatsapp_subscriptions(neighbor_id,commune,active,created) VALUES (?,?,?,?)
        ON CONFLICT(neighbor_id,commune) DO UPDATE SET active=excluded.active""",
        (actor["id"], commune, int(enabled), now()))
    audit(db, actor, "avisos_whatsapp_activados" if enabled else "avisos_whatsapp_desactivados")
    return {"commune": commune, "active": enabled}


def preferences(db, actor):
    return [dict(row) for row in db.execute(
        "SELECT commune,active FROM whatsapp_subscriptions WHERE neighbor_id=? ORDER BY commune", (actor["id"],))]


def subscribers(db):
    return [dict(row) for row in db.execute("""
        SELECT n.name,n.phone,w.commune,w.created FROM whatsapp_subscriptions w
        JOIN neighbors n ON n.id=w.neighbor_id WHERE w.active=1 ORDER BY w.commune,n.name
        """)]
