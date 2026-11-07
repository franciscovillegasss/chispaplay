"""CEO accounts, operations and audited analytics."""

import secrets
import sqlite3

import auth
import events
from core import APIError, TRAFFIC_DAYS, audit, field, identifier, now

VISIT_ACTIONS = {"cartelera_abierta", "filtros_usados", "ficha_abierta", "enlace_compartido", "mapa_abierto", "calendario_guardado"}


def dashboard(db, search):
    counts = db.execute("""
        SELECT (SELECT COUNT(*) FROM neighbors) AS neighbors,
               (SELECT COUNT(*) FROM events WHERE status='published') AS events,
               (SELECT COUNT(*) FROM bookings b JOIN events e ON e.id=b.event_id
                 WHERE e.status='published' AND b.status IN ('reserved','attended')) AS confirmed,
               (SELECT COUNT(*) FROM bookings b JOIN events e ON e.id=b.event_id
                 WHERE e.status='published' AND b.status='waiting') AS waiting,
               (SELECT COUNT(*) FROM bookings WHERE status='attended') AS attended,
               (SELECT COUNT(*) FROM bookings b JOIN events e ON e.id=b.event_id
                 WHERE e.status='published' AND e.ends<=? AND b.status IN ('reserved','attended')) AS finished_bookings,
               (SELECT COUNT(*) FROM bookings b JOIN events e ON e.id=b.event_id
                 WHERE e.status='published' AND e.ends<=? AND b.status='attended') AS finished_attendance
        """, (now(), now())).fetchone()
    cutoff = now() - TRAFFIC_DAYS * 86400
    traffic = db.execute("""SELECT action,COUNT(*) AS total,COUNT(DISTINCT neighbor_id) AS people
        FROM traffic WHERE created>=? GROUP BY action""", (cutoff,))
    staff = db.execute("SELECT id,username,name,active,must_change FROM staff WHERE role='coordinator' ORDER BY name")
    neighbors = db.execute("""SELECT id,name,phone,tracking,created FROM neighbors
        WHERE instr(lower(name),lower(?))>0 OR instr(phone,?)>0 ORDER BY created DESC LIMIT 100""", (search, search))
    entries = db.execute("""
        SELECT a.*,COALESCE(n.name,s.name,'Equipo') AS actor_name,e.title
        FROM audit a LEFT JOIN neighbors n ON n.id=a.actor_id LEFT JOIN staff s ON s.id=a.actor_id
        LEFT JOIN events e ON e.id=a.event_id ORDER BY a.id DESC LIMIT 100
        """)
    reports = db.execute("""SELECT r.id,r.status,r.detail,r.created,e.title FROM reports r
        JOIN events e ON e.id=r.event_id ORDER BY r.status='resolved',r.created DESC LIMIT 100""")
    requests = db.execute("""SELECT id,username,name,phone,organization,reason,status,created FROM coordinator_requests
        WHERE status='pending' ORDER BY created""")
    return {"requests": [dict(row) for row in requests], "counts": dict(counts), "traffic": [dict(r) for r in traffic], "staff": [dict(r) for r in staff],
            "neighbors": [dict(r) for r in neighbors], "audit": [dict(r) for r in entries],
            "reports": [dict(r) for r in reports], "events": events.catalog(db, all_events=True)}


def history(db, viewer, neighbor):
    identifier(neighbor, "el vecino")
    person = db.execute("SELECT id,name,tracking FROM neighbors WHERE id=?", (neighbor,)).fetchone()
    if not person:
        raise APIError(404, "Vecino no encontrado.")
    operations = db.execute("""
        SELECT a.action,a.created,e.title FROM audit a LEFT JOIN events e ON e.id=a.event_id
        WHERE a.actor_id=? OR a.subject_id=? ORDER BY a.id DESC LIMIT 200
        """, (neighbor, neighbor)).fetchall()
    visits = db.execute("""SELECT t.action,t.created,e.title FROM traffic t LEFT JOIN events e ON e.id=t.event_id
        WHERE t.neighbor_id=? AND t.created>=? ORDER BY t.id DESC LIMIT 200""",
        (neighbor, now() - TRAFFIC_DAYS * 86400)).fetchall()
    audit(db, viewer, "historial_consultado", neighbor)
    return {"neighbor": dict(person), "operations": [dict(r) for r in operations], "visits": [dict(r) for r in visits]}


def manage(db, actor, path, body):
    if path == "/api/ceo/requests/review":
        request_id = identifier(body.get("id"), "la solicitud")
        decision = body.get("decision")
        if decision not in ("approved", "rejected"):
            raise APIError(400, "Selecciona aprobar o rechazar.")
        request = db.execute("SELECT * FROM coordinator_requests WHERE id=?", (request_id,)).fetchone()
        if not request:
            raise APIError(404, "Solicitud no encontrada.")
        if request["status"] != "pending":
            return {"status": request["status"]}
        if decision == "approved":
            try:
                staff_id = auth.create_staff(db, request["username"], request["organization"],
                                             request["password_hash"], "coordinator")
            except sqlite3.IntegrityError:
                raise APIError(409, "El usuario solicitado ya existe.") from None
            db.execute("UPDATE staff SET phone=? WHERE id=?", (request["phone"], staff_id))
        db.execute("UPDATE coordinator_requests SET status=?,reviewed_at=?,reviewed_by=? WHERE id=?",
                   (decision, now(), actor["id"], request_id))
        audit(db, actor, "solicitud_" + decision, request_id)
        return {"status": decision}
    if path == "/api/ceo/staff":
        username = auth.username_for(body.get("username"))
        name = field(body, "name", "el nombre del coordinador u organización", 120, 2)
        password = auth.validate_password(body.get("password"))
        try:
            staff_id = auth.create_staff(db, username, name, auth.password_hash(password), "coordinator", True)
        except sqlite3.IntegrityError:
            raise APIError(409, "Ese usuario ya existe.") from None
        audit(db, actor, "coordinador_creado", staff_id)
        return {"id": staff_id}
    if path in ("/api/ceo/staff/status", "/api/ceo/staff/password"):
        staff_id = identifier(body.get("id"), "el coordinador")
        if not db.execute("SELECT 1 FROM staff WHERE id=? AND role='coordinator'", (staff_id,)).fetchone():
            raise APIError(404, "Coordinador no encontrado.")
        if path.endswith("/status"):
            active = body.get("active")
            if type(active) is not bool:
                raise APIError(400, "Selecciona un estado válido.")
            db.execute("UPDATE staff SET active=? WHERE id=?", (active, staff_id))
            action = "coordinador_activado" if active else "coordinador_suspendido"
        else:
            encoded = auth.password_hash(auth.validate_password(body.get("password")))
            db.execute("UPDATE staff SET password_hash=?,must_change=1 WHERE id=?", (encoded, staff_id))
            action = "contrasena_temporal_emitida"
        db.execute("DELETE FROM sessions WHERE actor_id=?", (staff_id,))
        audit(db, actor, action, staff_id)
        return {"ok": True}
    if path == "/api/ceo/events/cancel":
        event = events.event_row(db, identifier(body.get("id"), "la actividad"))
        return events.cancel(db, actor, event)
    if path == "/api/ceo/reports/status":
        folio = field(body, "id", "el folio", 16)
        status = body.get("status")
        if status not in ("received", "reviewed", "resolved"):
            raise APIError(400, "Selecciona un estado válido.")
        report = db.execute("SELECT event_id FROM reports WHERE id=?", (folio,)).fetchone()
        if not report:
            raise APIError(404, "Reporte no encontrado.")
        db.execute("UPDATE reports SET status=? WHERE id=?", (status, folio))
        audit(db, actor, "reporte_" + status, folio, report["event_id"])
        return {"ok": True}
    raise APIError(404, "Ruta no encontrada.")


def visit(db, actor, body):
    action = body.get("action")
    if not isinstance(action, str) or action not in VISIT_ACTIONS:
        raise APIError(400, "Acción de navegación inválida.")
    event_id = None
    if action in {"ficha_abierta", "enlace_compartido", "mapa_abierto", "calendario_guardado"}:
        event_id = identifier(body.get("event_id"), "la actividad")
        events.event_row(db, event_id)
    current = now()
    db.execute("DELETE FROM traffic WHERE created<?", (current - TRAFFIC_DAYS * 86400,))
    recent = db.execute("SELECT COUNT(*) FROM traffic WHERE neighbor_id=? AND created>=?",
                        (actor["id"], current - 60)).fetchone()[0]
    if recent >= 30:
        return {"recorded": False}
    db.execute("INSERT INTO traffic(neighbor_id,action,event_id,created) VALUES (?,?,?,?)",
               (actor["id"], action, event_id, current))
    return {"recorded": True}


def report(db, actor, event_id, body):
    detail = field(body, "detail", "el detalle del reporte", 1000, 5)
    recent = db.execute("SELECT COUNT(*) FROM reports WHERE neighbor_id=? AND created>?",
                        (actor["id"], now() - 3600)).fetchone()[0]
    if recent >= 5:
        raise APIError(429, "Espera antes de enviar otro reporte.")
    folio = secrets.token_hex(6).upper()
    db.execute("INSERT INTO reports(id,event_id,neighbor_id,detail,created) VALUES (?,?,?,?,?)",
               (folio, event_id, actor["id"], detail, now()))
    audit(db, actor, "reporte_recibido", folio, event_id)
    return {"folio": folio}
