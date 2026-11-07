#!/usr/bin/env python3
"""Same-origin HTTP server and CLI for ChispaPlay."""

import argparse
import getpass
import ipaddress
import json
import mimetypes
import os
import re
import sqlite3
import traceback
from http.cookies import CookieError, SimpleCookie
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlsplit

import auth
import events
import management
from core import APIError, ROOT, audit, database, init_db, now, prune

HOST = os.environ.get("HOST", "127.0.0.1")
PORT = int(os.environ.get("PORT", "8080"))
ORIGIN = os.environ.get("CHISPA_PUBLIC_ORIGIN", "").rstrip("/")
LOCAL_HTTP = HOST in ("127.0.0.1", "localhost") and not ORIGIN
COOKIE = "chispa_session" if LOCAL_HTTP else "__Host-chispa_session"
MAX_BODY = 4 * ((events.MAX_IMAGE + 2) // 3) + 16_384
PAGES = {"index.html", "actividades.html", "actividad.html", "perfil.html", "nosotros.html", "coordinador.html", "ceo.html"}
ASSETS = {"css/global.css", "js/app.js"}


class Handler(BaseHTTPRequestHandler):
    def setup(self):
        self.request.settimeout(15)
        super().setup()

    def log_request(self, code="-", size="-"):
        if str(code).startswith("5"):
            self.log_message("%s -> %s", self.command, code)

    def send(self, content, mime, status=200, cookie=None, cache="no-store", head=False):
        self.send_response(status)
        self.send_header("Content-Type", mime)
        self.send_header("Content-Length", str(len(content)))
        self.send_header("Cache-Control", cache)
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "same-origin")
        self.send_header("Content-Security-Policy", "default-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; img-src 'self' data:")
        self.send_header("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
        if not LOCAL_HTTP:
            self.send_header("Strict-Transport-Security", "max-age=31536000")
        if cookie is not None:
            token, lifetime = cookie
            secure = "" if LOCAL_HTTP else "; Secure"
            self.send_header("Set-Cookie", f"{COOKIE}={token}; Max-Age={lifetime}; Path=/; HttpOnly; SameSite=Strict{secure}")
        self.end_headers()
        if not head:
            self.wfile.write(content)

    def json(self, data, status=200, cookie=None):
        self.send(json.dumps(data, ensure_ascii=False).encode(), "application/json; charset=utf-8", status, cookie)

    def do_GET(self):
        self.dispatch()

    def do_HEAD(self):
        self.dispatch(head=True)

    def do_POST(self):
        self.dispatch(write=True)

    def dispatch(self, write=False, head=False):
        try:
            parsed = urlsplit(self.path)
            path = parsed.path
            if not write and not path.startswith("/api/"):
                relative = path.removeprefix("/") or "index.html"
                if relative not in PAGES | ASSETS:
                    raise APIError(404, "Página no encontrada.")
                file = ROOT / relative
                return self.send(file.read_bytes(), f"{mimetypes.guess_type(file)[0]}; charset=utf-8",
                                 cache="no-cache", head=head)
            if head:
                raise APIError(405, "Método no admitido.")
            token = self.cookie_token()
            if write:
                self.check_origin()
                if not path.startswith("/api/"):
                    raise APIError(404, "Ruta no encontrada.")
                data, cookie = self.post(path, self.read_json(), token)
                return self.json(data, cookie=cookie)
            if match := re.fullmatch(r"/api/events/([0-9a-f]{32})/photo", path):
                with database() as db:
                    photo = db.execute("""SELECT p.mime,p.content FROM photos p JOIN events e ON e.id=p.event_id
                        WHERE e.id=? AND e.status='published'""", (match[1],)).fetchone()
                    if not photo:
                        raise APIError(404, "Foto no disponible.")
                return self.send(photo["content"], photo["mime"], cache="no-cache")
            return self.json(self.get(path, parse_qs(parsed.query), token))
        except (BrokenPipeError, ConnectionResetError, TimeoutError):
            return
        except APIError as error:
            if head:
                return self.send(b"", "text/plain", error.status, head=True)
            self.json({"error": error.message}, error.status)
        except sqlite3.OperationalError:
            traceback.print_exc()
            self.json({"error": "El servicio está ocupado. Intenta nuevamente."}, 503)
        except Exception:
            traceback.print_exc()
            self.json({"error": "Ocurrió un error interno."}, 500)

    def check_origin(self):
        origin = self.headers.get("Origin")
        expected = ORIGIN or f"{'http' if LOCAL_HTTP else 'https'}://{self.headers.get('Host', '')}"
        if self.headers.get("Sec-Fetch-Site") == "cross-site" or (origin and origin != expected):
            raise APIError(403, "Origen no autorizado.")

    def read_json(self):
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            raise APIError(400, "Solicitud inválida.") from None
        if not 0 < length <= MAX_BODY:
            raise APIError(413, "Solicitud demasiado grande o vacía.")
        if self.headers.get_content_type() != "application/json":
            raise APIError(415, "Usa el formato JSON.")
        try:
            body = json.loads(self.rfile.read(length))
        except (ValueError, RecursionError):
            raise APIError(400, "Solicitud inválida.") from None
        if not isinstance(body, dict):
            raise APIError(400, "Solicitud inválida.")
        return body

    def cookie_token(self):
        try:
            entry = SimpleCookie(self.headers.get("Cookie", "")).get(COOKIE)
            if entry and re.fullmatch(r"[A-Za-z0-9_-]{43}", entry.value):
                return entry.value
        except CookieError:
            pass
        return None

    def client_ip(self):
        if os.environ.get("CHISPA_TRUST_PROXY") == "1":
            value = self.headers.get("X-Forwarded-For", "").split(",")[-1].strip()
            try:
                return str(ipaddress.ip_address(value))
            except ValueError:
                pass
        return self.client_address[0]

    def get(self, path, params, token):
        with database() as db:
            if path == "/api/health":
                db.execute("SELECT 1 FROM staff LIMIT 1").fetchone()
                return {"status": "online"}
            if path == "/api/session":
                return {"actor": auth.public_actor(auth.actor_for(db, token))}
            if path == "/api/events":
                return {"events": events.catalog(db)}
            if match := re.fullmatch(r"/api/events/([0-9a-f]{32})", path):
                event = events.event_row(db, match[1])
                actor = auth.actor_for(db, token)
                booking = None
                if actor and actor["role"] == "neighbor":
                    booking = db.execute("SELECT status FROM bookings WHERE event_id=? AND neighbor_id=?",
                                         (event["id"], actor["id"])).fetchone()
                return {"event": events.result(event), "booking": booking["status"] if booking else None}
            if path == "/api/me":
                actor = auth.actor_for(db, token, "neighbor")
                bookings = db.execute("""SELECT e.id,e.title,e.starts,e.status AS event_status,b.status
                    FROM bookings b JOIN events e ON e.id=b.event_id
                    WHERE b.neighbor_id=? AND b.status!='cancelled' ORDER BY e.starts DESC""", (actor["id"],))
                reports = db.execute("""SELECT r.id,r.status,e.title FROM reports r JOIN events e ON e.id=r.event_id
                    WHERE r.neighbor_id=? ORDER BY r.created DESC""", (actor["id"],))
                return {"actor": auth.public_actor(actor), "bookings": [dict(r) for r in bookings],
                        "reports": [dict(r) for r in reports]}
            if path == "/api/coordinator":
                actor = auth.actor_for(db, token, "coordinator")
                return {"events": events.catalog(db, owner=actor["id"])}
            if match := re.fullmatch(r"/api/coordinator/events/([0-9a-f]{32})/bookings", path):
                actor = auth.actor_for(db, token, "coordinator")
                events.require_owner(events.event_row(db, match[1]), actor)
                rows = db.execute("""SELECT n.name,b.status,b.created,b.attended_at
                    FROM bookings b JOIN neighbors n ON n.id=b.neighbor_id
                    WHERE b.event_id=? AND b.status!='cancelled' ORDER BY b.created,b.rowid""", (match[1],))
                return {"bookings": [dict(r) for r in rows]}
            if path == "/api/ceo":
                auth.actor_for(db, token, "ceo")
                return management.dashboard(db, params.get("search", [""])[0][:100])
        raise APIError(404, "Ruta no encontrada.")

    def post(self, path, body, token):
        if path == "/api/sms/start":
            return auth.send_sms(body, self.client_ip()), None
        if path == "/api/sms/check":
            return auth.confirm_sms(body, token)
        if path == "/api/staff/login":
            return auth.login_staff(body, self.client_ip(), token)
        if path == "/api/staff/password":
            return auth.change_password(body, token)
        with database(write=True) as db:
            if path == "/api/logout":
                auth.revoke(db, token)
                return {"ok": True}, ("", 0)
            return self.mutate(db, path, body, token), None

    def mutate(self, db, path, body, token):
        if path == "/api/me/tracking":
            return management.tracking(db, auth.actor_for(db, token, "neighbor"), body.get("enabled"))
        if path == "/api/traffic":
            return management.visit(db, auth.actor_for(db, token, "neighbor"), body)
        if match := re.fullmatch(r"/api/events/([0-9a-f]{32})/(reserve|cancel|report)", path):
            actor = auth.actor_for(db, token, "neighbor")
            event = events.event_row(db, match[1])
            if match[2] == "report":
                return management.report(db, actor, event["id"], body)
            return events.reserve(db, actor, event, match[2] == "cancel")
        if path == "/api/coordinator/events":
            return events.save(db, auth.actor_for(db, token, "coordinator"), body)
        if match := re.fullmatch(r"/api/coordinator/events/([0-9a-f]{32})/(edit|cancel|attendance)", path):
            actor = auth.actor_for(db, token, "coordinator")
            event = events.event_row(db, match[1])
            events.require_owner(event, actor)
            if match[2] == "edit":
                return events.save(db, actor, body, event)
            if match[2] == "cancel":
                return events.cancel(db, actor, event)
            return events.attendance(db, actor, event, body)
        if path.startswith("/api/ceo/"):
            actor = auth.actor_for(db, token, "ceo")
            if path == "/api/ceo/history":
                return management.history(db, actor, body.get("neighbor"))
            return management.manage(db, actor, path, body)
        raise APIError(404, "Ruta no encontrada.")


class Server(ThreadingHTTPServer):
    cleanup_after = 0

    def service_actions(self):
        if now() >= self.cleanup_after:
            self.cleanup_after = now() + 3600
            try:
                prune()
            except sqlite3.Error:
                traceback.print_exc()


def setup_ceo(args):
    username = auth.username_for(args.username)
    name = args.name.strip()
    if not 2 <= len(name) <= 120:
        raise APIError(400, "Revisa el nombre.")
    password = auth.validate_password(getpass.getpass("Contraseña CEO: "))
    if password != getpass.getpass("Confirma contraseña: "):
        raise APIError(400, "Las contraseñas no coinciden.")
    encoded = auth.password_hash(password)
    with database(write=True) as db:
        existing = db.execute("SELECT * FROM staff WHERE username=?", (username,)).fetchone()
        if existing:
            if not args.reset or existing["role"] != "ceo":
                raise APIError(409, "El usuario ya existe. Usa --reset solo para una cuenta CEO existente.")
            db.execute("UPDATE staff SET password_hash=?,name=?,active=1 WHERE id=?", (encoded, name, existing["id"]))
            db.execute("DELETE FROM sessions WHERE actor_id=?", (existing["id"],))
            audit(db, existing, "credencial_ceo_restaurada")
        else:
            staff_id = auth.create_staff(db, username, name, encoded, "ceo")
            audit(db, {"id": staff_id, "role": "ceo"}, "cuenta_ceo_creada")
    print(f"Cuenta CEO habilitada: {username}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command")
    ceo = commands.add_parser("ceo", help="Crear o restablecer una cuenta CEO desde el servidor")
    ceo.add_argument("username")
    ceo.add_argument("--name", required=True)
    ceo.add_argument("--reset", action="store_true")
    args = parser.parse_args()
    init_db()
    if args.command == "ceo":
        try:
            return setup_ceo(args)
        except APIError as error:
            parser.error(error.message)
    with Server((HOST, PORT), Handler) as server:
        print(f"ChispaPlay en {HOST}:{PORT}", flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass


if __name__ == "__main__":
    main()
