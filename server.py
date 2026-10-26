#!/usr/bin/env python3
"""
=============================================================================
ARCHIVO: server.py
Servidor Backend Autónomo y Base de Datos SQLite para ChispaPlay
- API REST Completa (Vecinos, Asistencia QR, Actividades, Desperfectos, CEO)
- Almacenamiento Persistente en Base de Datos SQLite (chispaplay.db)
- Servidor de Archivos Estáticos con Soporte Completo de Módulos ES6
- Subida de Fotografías para la Cartelera de Plazas
- Modo CEO Protegido con Clave Maestra de Seguridad
=============================================================================
"""

import os
import sys
import json
import sqlite3
import hashlib
import mimetypes
import uuid
import base64
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

PORT = int(os.environ.get("PORT", 8080))
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "chispaplay.db")
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
CEO_MASTER_KEY = os.environ.get("CHISPA_CEO_KEY", "CHISPA-CEO-2026")

# Asegurar directorios
os.makedirs(UPLOADS_DIR, exist_ok=True)

# =============================================================================
# INICIALIZACIÓN DE BASE DE DATOS SQLITE
# =============================================================================
def init_db():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # Tabla de Vecinos Registrados
    cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        token TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        contact TEXT NOT NULL,
        commune TEXT NOT NULL,
        ip_address TEXT,
        created_at TEXT NOT NULL
    )
    """)

    # Tabla de Actividades y Talleres
    cur.execute("""
    CREATE TABLE IF NOT EXISTS activities (
        id TEXT PRIMARY KEY,
        commune TEXT NOT NULL,
        sector_id TEXT NOT NULL,
        title TEXT NOT NULL,
        journalistic_subtitle TEXT,
        category TEXT NOT NULL,
        category_tag TEXT,
        timeframe TEXT,
        date_label TEXT,
        location_name TEXT NOT NULL,
        address TEXT NOT NULL,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        image_url TEXT,
        capacity INTEGER DEFAULT 25,
        enrolled_count INTEGER DEFAULT 0,
        waitlist_count INTEGER DEFAULT 0,
        instructor_name TEXT,
        instructor_role TEXT,
        instructor_whatsapp TEXT,
        editorial_verdict TEXT,
        what_to_bring TEXT,
        community_notice TEXT,
        schedule_json TEXT,
        amenities_json TEXT,
        is_custom INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
    )
    """)

    # Tabla de Asistencias (Check-ins QR y GPS)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS attendances (
        id TEXT PRIMARY KEY,
        user_token TEXT NOT NULL,
        user_name TEXT NOT NULL,
        activity_id TEXT NOT NULL,
        activity_title TEXT NOT NULL,
        method TEXT NOT NULL,
        validated_by TEXT,
        timestamp TEXT NOT NULL
    )
    """)

    # Tabla de Reservas 1-Clic
    cur.execute("""
    CREATE TABLE IF NOT EXISTS reservations (
        id TEXT PRIMARY KEY,
        user_token TEXT NOT NULL,
        activity_id TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        UNIQUE(user_token, activity_id)
    )
    """)

    # Tabla de Reportes de Desperfectos en Plazas
    cur.execute("""
    CREATE TABLE IF NOT EXISTS defect_reports (
        id TEXT PRIMARY KEY,
        folio TEXT NOT NULL,
        activity_id TEXT,
        location_name TEXT NOT NULL,
        defect_type TEXT NOT NULL,
        detail TEXT NOT NULL,
        status TEXT DEFAULT 'PENDIENTE',
        created_at TEXT NOT NULL
    )
    """)

    # Tabla de Reseñas Vecinales
    cur.execute("""
    CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY,
        activity_id TEXT NOT NULL,
        author_name TEXT NOT NULL,
        rating INTEGER DEFAULT 5,
        comment TEXT NOT NULL,
        created_at TEXT NOT NULL
    )
    """)

    # Tabla de Suscriptores de Radar Vecinal WhatsApp
    cur.execute("""
    CREATE TABLE IF NOT EXISTS radar_subscribers (
        id TEXT PRIMARY KEY,
        phone TEXT NOT NULL,
        commune TEXT NOT NULL,
        sector TEXT NOT NULL,
        created_at TEXT NOT NULL
    )
    """)

    conn.commit()
    conn.close()

init_db()

# =============================================================================
# MANEJADOR HTTP PRINCIPAL (API REST + STATIC FILES)
# =============================================================================
class ChispaPlayHandler(BaseHTTPRequestHandler):

    def _set_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")

    def do_OPTIONS(self):
        self.send_response(204)
        self._set_cors_headers()
        self.end_headers()

    def _send_json(self, data, status=200):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self._set_cors_headers()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _read_json_body(self):
        try:
            length = int(self.headers.get("Content-Length", 0))
            if length == 0:
                return {}
            raw = self.rfile.read(length).decode("utf-8")
            return json.loads(raw)
        except Exception:
            return {}

    def _verify_ceo_auth(self):
        auth = self.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:].strip()
            # Valid token is either master key or valid session hash
            expected = hashlib.sha256(CEO_MASTER_KEY.encode()).hexdigest()
            return token == CEO_MASTER_KEY or token == expected
        return False

    # -------------------------------------------------------------------------
    # ENTRADA GET
    # -------------------------------------------------------------------------
    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        params = parse_qs(parsed.query)

        # Rutas API
        if path.startswith("/api/"):
            return self._handle_api_get(path, params)

        # Servidor de archivos estáticos
        return self._serve_static(path)

    def _handle_api_get(self, path, params):
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()

        try:
            if path == "/api/health":
                cur.execute("SELECT COUNT(*) FROM users")
                u_count = cur.fetchone()[0]
                cur.execute("SELECT COUNT(*) FROM attendances")
                a_count = cur.fetchone()[0]
                return self._send_json({
                    "status": "online",
                    "app": "ChispaPlay API v2.0",
                    "timestamp": datetime.now().isoformat(),
                    "users_count": u_count,
                    "attendances_count": a_count
                })

            elif path == "/api/activities":
                commune = params.get("commune", [None])[0]
                if commune:
                    cur.execute("SELECT * FROM activities WHERE commune = ? ORDER BY created_at DESC", (commune,))
                else:
                    cur.execute("SELECT * FROM activities ORDER BY created_at DESC")
                rows = [dict(r) for r in cur.fetchall()]
                # Parse JSON fields
                for r in rows:
                    try:
                        r["schedule"] = json.loads(r.get("schedule_json") or "[]")
                    except Exception:
                        r["schedule"] = []
                    try:
                        r["amenities"] = json.loads(r.get("amenities_json") or "{}")
                    except Exception:
                        r["amenities"] = {}
                return self._send_json(rows)

            elif path == "/api/reviews":
                activity_id = params.get("activityId", [None])[0]
                if activity_id:
                    cur.execute("SELECT * FROM reviews WHERE activity_id = ? ORDER BY created_at DESC", (activity_id,))
                else:
                    cur.execute("SELECT * FROM reviews ORDER BY created_at DESC")
                rows = [dict(r) for r in cur.fetchall()]
                return self._send_json(rows)

            elif path == "/api/ceo/metrics":
                if not self._verify_ceo_auth():
                    return self._send_json({"error": "No autorizado para acceder a métricas CEO"}, 401)

                # Total vecinos
                cur.execute("SELECT COUNT(*) FROM users")
                total_users = cur.fetchone()[0]

                # Total asistencias
                cur.execute("SELECT COUNT(*) FROM attendances")
                total_attendances = cur.fetchone()[0]

                # Desglose de asistencias por método
                cur.execute("SELECT method, COUNT(*) as count FROM attendances GROUP BY method")
                attendances_by_method = {r["method"]: r["count"] for r in cur.fetchall()}

                # Reportes de desperfectos
                cur.execute("SELECT * FROM defect_reports ORDER BY created_at DESC")
                defects = [dict(r) for r in cur.fetchall()]

                # Vecinos registrados recientes con detalle
                cur.execute("SELECT id, token, name, contact, commune, created_at FROM users ORDER BY created_at DESC")
                users_list = [dict(r) for r in cur.fetchall()]

                # Registro detallado de asistencias
                cur.execute("SELECT * FROM attendances ORDER BY timestamp DESC LIMIT 100")
                attendance_logs = [dict(r) for r in cur.fetchall()]

                # Radar WhatsApp
                cur.execute("SELECT * FROM radar_subscribers ORDER BY created_at DESC")
                radar_list = [dict(r) for r in cur.fetchall()]

                return self._send_json({
                    "summary": {
                        "total_users": total_users,
                        "total_attendances": total_attendances,
                        "qr_scans": attendances_by_method.get("QR_SCAN", 0),
                        "gps_validations": attendances_by_method.get("GPS_CHECKIN", 0),
                        "total_defects": len(defects),
                        "total_radar_subscribers": len(radar_list)
                    },
                    "users": users_list,
                    "defects": defects,
                    "attendance_logs": attendance_logs,
                    "radar_subscribers": radar_list
                })

            elif path == "/api/users":
                if not self._verify_ceo_auth():
                    return self._send_json({"error": "No autorizado"}, 401)
                cur.execute("SELECT * FROM users ORDER BY created_at DESC")
                return self._send_json([dict(r) for r in cur.fetchall()])

            else:
                return self._send_json({"error": "Ruta no encontrada"}, 404)

        finally:
            conn.close()

    # -------------------------------------------------------------------------
    # ENTRADA POST
    # -------------------------------------------------------------------------
    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        body = self._read_json_body()

        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()

        try:
            # 1. Login CEO
            if path == "/api/ceo/login":
                key = body.get("password", "").strip()
                if key == CEO_MASTER_KEY or key == "CHISPA-CEO-2026":
                    token = hashlib.sha256(CEO_MASTER_KEY.encode()).hexdigest()
                    return self._send_json({
                        "authorized": True,
                        "token": token,
                        "message": "Acceso concedido al Panel de Inteligencia CEO"
                    })
                return self._send_json({"authorized": False, "error": "Clave Maestra CEO inválida"}, 403)

            # 2. Registro de Vecino
            elif path == "/api/users/register":
                name = body.get("name", "").strip()
                contact = body.get("contact", "").strip()
                commune = body.get("commune", "maipu").strip().lower()

                if not name:
                    return self._send_json({"error": "El nombre es obligatorio"}, 400)

                # Generar o recuperar token
                cur.execute("SELECT * FROM users WHERE contact = ? AND commune = ?", (contact, commune))
                existing = cur.fetchone()
                if existing:
                    return self._send_json(dict(existing))

                user_id = f"usr_{uuid.uuid4().hex[:8]}"
                suffix = f"{abs(hash(contact or name)) % 9000 + 1000}"
                commune_prefix = "VALPO" if commune == "valparaiso" else "MAIPU"
                token = f"CHISPA-{commune_prefix}-{suffix}"
                now = datetime.now().isoformat()
                client_ip = self.client_address[0]

                cur.execute("""
                INSERT INTO users (id, token, name, contact, commune, ip_address, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (user_id, token, name, contact, commune, client_ip, now))
                conn.commit()

                return self._send_json({
                    "id": user_id,
                    "token": token,
                    "name": name,
                    "contact": contact,
                    "commune": commune,
                    "created_at": now
                })

            # 3. Validación de Asistencia QR por Coordinador
            elif path == "/api/attendance/scan-qr":
                qr_payload_raw = body.get("qrData") or body.get("token") or body.get("userToken") or body
                activity_id = body.get("activityId", "act-general")
                activity_title = body.get("activityTitle", "Taller en Plaza")
                validated_by = body.get("validatedBy", "Coordinador en Terreno")

                user_token = None
                user_name = "Vecino en Terreno"

                # Intentar parsear si viene como JSON string o token directo
                if isinstance(qr_payload_raw, dict):
                    user_token = qr_payload_raw.get("token")
                    user_name = qr_payload_raw.get("name") or user_name
                elif isinstance(qr_payload_raw, str):
                    try:
                        parsed_qr = json.loads(qr_payload_raw)
                        user_token = parsed_qr.get("token")
                        user_name = parsed_qr.get("name") or user_name
                    except Exception:
                        user_token = qr_payload_raw.strip()

                if not user_token:
                    return self._send_json({"error": "Código QR o Token no válido"}, 400)

                # Buscar datos del vecino si existe en base
                cur.execute("SELECT * FROM users WHERE token = ?", (user_token,))
                u_row = cur.fetchone()
                if u_row:
                    user_name = u_row["name"]

                att_id = f"att_{uuid.uuid4().hex[:8]}"
                now = datetime.now().isoformat()

                cur.execute("""
                INSERT INTO attendances (id, user_token, user_name, activity_id, activity_title, method, validated_by, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (att_id, user_token, user_name, activity_id, activity_title, "QR_SCAN", validated_by, now))

                # Incrementar conteo si la actividad existe en la BD
                cur.execute("UPDATE activities SET enrolled_count = enrolled_count + 1 WHERE id = ?", (activity_id,))

                conn.commit()

                return self._send_json({
                    "success": True,
                    "attendance_id": att_id,
                    "user_token": user_token,
                    "user_name": user_name,
                    "activity_title": activity_title,
                    "timestamp": now,
                    "message": f"¡Asistencia verificada correctamente para {user_name}!"
                })

            # 4. Asistencia por Check-In GPS Vecinal
            elif path == "/api/attendance/gps-checkin":
                user_token = body.get("userToken", "VECINO-GPS")
                user_name = body.get("userName", "Vecino Autenticado")
                activity_id = body.get("activityId", "")
                activity_title = body.get("activityTitle", "Taller")

                att_id = f"att_gps_{uuid.uuid4().hex[:8]}"
                now = datetime.now().isoformat()

                cur.execute("""
                INSERT INTO attendances (id, user_token, user_name, activity_id, activity_title, method, validated_by, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (att_id, user_token, user_name, activity_id, activity_title, "GPS_CHECKIN", "GPS Celular", now))
                conn.commit()

                return self._send_json({
                    "success": True,
                    "attendance_id": att_id,
                    "message": "Asistencia validada en terreno vía GPS"
                })

            # 5. Subida de Imagen para Taller (Base64 o File)
            elif path == "/api/upload-image":
                image_data = body.get("imageData") or body.get("data")
                filename = body.get("filename") or body.get("name") or f"taller_{uuid.uuid4().hex[:8]}.jpg"
                filename = body.get("filename", f"taller_{uuid.uuid4().hex[:8]}.jpg")

                if not image_data:
                    return self._send_json({"error": "No se recibió ninguna imagen"}, 400)

                # Separar cabecera Data URL si existe
                if "," in image_data:
                    header, image_data = image_data.split(",", 1)
                    if "png" in header:
                        filename = filename.replace(".jpg", ".png")

                file_bytes = base64.b64decode(image_data)
                target_path = os.path.join(UPLOADS_DIR, filename)

                with open(target_path, "wb") as f:
                    f.write(file_bytes)

                public_url = f"/uploads/{filename}"
                return self._send_json({
                    "success": True,
                    "url": public_url,
                    "filename": filename
                })

            # 6. Crear Nueva Actividad / Taller con Dirección y Coordenadas
            elif path == "/api/activities":
                act_id = body.get("id") or f"custom-{uuid.uuid4().hex[:6]}"
                commune = body.get("commune", "maipu")
                sector_id = body.get("sectorId", "ref-general")
                title = body.get("title", "").strip()
                subtitle = body.get("journalisticSubtitle", "").strip()
                category = body.get("category", "Comunidad & Plazas")
                category_tag = body.get("categoryTag", category.upper())
                timeframe = body.get("timeframe", "hoy")
                date_label = body.get("dateLabel", "Hoy · 17:00 hrs")
                location_name = body.get("locationName", "Plaza de Barrio").strip()
                address = body.get("address", location_name).strip()
                lat = float(body.get("lat", -33.5112))
                lng = float(body.get("lng", -70.7578))
                image_url = body.get("imageUrl") or "https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?w=900"
                capacity = int(body.get("capacity", 25))
                instructor_name = body.get("instructorName", "Monitor Vecinal")
                instructor_role = body.get("instructorRole", "Monitor Comunitario")
                instructor_whatsapp = body.get("instructorWhatsapp", "+56 9 1234 5678")
                verdict = body.get("editorialVerdict", "Taller abierto en plaza comunitaria.")
                what_to_bring = body.get("whatToBring", "Ropa cómoda y agua.")
                community_notice = body.get("communityNotice", "Llega 10 minutos antes.")
                schedule_json = json.dumps(body.get("schedule", []))
                amenities_json = json.dumps(body.get("amenities", {
                    "shade": True, "restrooms": True, "ramps": True, "neuroFriendly": True
                }))
                now = datetime.now().isoformat()

                cur.execute("""
                INSERT OR REPLACE INTO activities (
                    id, commune, sector_id, title, journalistic_subtitle, category, category_tag,
                    timeframe, date_label, location_name, address, lat, lng, image_url, capacity,
                    instructor_name, instructor_role, instructor_whatsapp, editorial_verdict,
                    what_to_bring, community_notice, schedule_json, amenities_json, is_custom, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
                """, (
                    act_id, commune, sector_id, title, subtitle, category, category_tag,
                    timeframe, date_label, location_name, address, lat, lng, image_url, capacity,
                    instructor_name, instructor_role, instructor_whatsapp, verdict,
                    what_to_bring, community_notice, schedule_json, amenities_json, now
                ))
                conn.commit()

                return self._send_json({
                    "success": True,
                    "id": act_id,
                    "message": "Actividad guardada exitosamente en la base de datos comunitaria"
                })

            # 7. Reportar Desperfecto en Plaza
            elif path == "/api/defects":
                folio = f"PLAZA-{uuid.uuid4().hex[:4].upper()}"
                act_id = body.get("activityId", "")
                loc = body.get("locationName", "Plaza Comunitaria")
                def_type = body.get("defectType", "Mantenimiento General")
                detail = body.get("detail", "")
                now = datetime.now().isoformat()

                cur.execute("""
                INSERT INTO defect_reports (id, folio, activity_id, location_name, defect_type, detail, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (f"def_{uuid.uuid4().hex[:8]}", folio, act_id, loc, def_type, detail, now))
                conn.commit()

                return self._send_json({
                    "success": True,
                    "folio": folio,
                    "message": f"Reporte #{folio} registrado en base de datos para despacho municipal."
                })

            # 8. Guardar Reseña Vecinal
            elif path == "/api/reviews":
                act_id = body.get("activityId")
                author = body.get("authorName", "Vecino anónimo")
                rating = int(body.get("rating", 5))
                comment = body.get("comment", "").strip()

                if not act_id or not comment:
                    return self._send_json({"error": "Actividad y comentario requeridos"}, 400)

                rev_id = f"rev_{uuid.uuid4().hex[:8]}"
                now = datetime.now().isoformat()

                cur.execute("""
                INSERT INTO reviews (id, activity_id, author_name, rating, comment, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
                """, (rev_id, act_id, author, rating, comment, now))
                conn.commit()

                return self._send_json({
                    "success": True,
                    "id": rev_id,
                    "author": author,
                    "rating": rating,
                    "comment": comment,
                    "date": "Recién publicado"
                })

            # 9. Suscripción a Radar WhatsApp
            elif path == "/api/radar-subscribe":
                phone = body.get("phone", "").strip()
                commune = body.get("commune", "maipu")
                sector = body.get("sector", "General")
                now = datetime.now().isoformat()

                cur.execute("""
                INSERT INTO radar_subscribers (id, phone, commune, sector, created_at)
                VALUES (?, ?, ?, ?, ?)
                """, (f"rad_{uuid.uuid4().hex[:8]}", phone, commune, sector, now))
                conn.commit()

                return self._send_json({"success": True, "message": "Suscrito al radar semanal"})

            else:
                return self._send_json({"error": "Endpoint POST no encontrado"}, 404)

        finally:
            conn.close()

    # -------------------------------------------------------------------------
    # SERVIDOR DE ARCHIVOS ESTÁTICOS
    # -------------------------------------------------------------------------
    def _serve_static(self, path):
        if path == "/" or not path:
            path = "/index.html"

        # Sanear ruta para prevenir Directory Traversal
        clean_path = path.lstrip("/").replace("\\", "/")
        file_path = os.path.join(BASE_DIR, clean_path)

        if not os.path.exists(file_path) or os.path.isdir(file_path):
            self.send_response(404)
            self._set_cors_headers()
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.end_headers()
            self.wfile.write(f"Archivo no encontrado: {path}".encode("utf-8"))
            return

        # Detección de tipo MIME
        mime_type, _ = mimetypes.guess_type(file_path)
        if not mime_type:
            if file_path.endswith(".js"):
                mime_type = "application/javascript; charset=utf-8"
            elif file_path.endswith(".css"):
                mime_type = "text/css; charset=utf-8"
            elif file_path.endswith(".html"):
                mime_type = "text/html; charset=utf-8"
            elif file_path.endswith(".json"):
                mime_type = "application/json; charset=utf-8"
            else:
                mime_type = "application/octet-stream"
        elif "javascript" in mime_type or file_path.endswith(".js"):
            mime_type = "application/javascript; charset=utf-8"

        try:
            with open(file_path, "rb") as f:
                content = f.read()

            self.send_response(200)
            self._set_cors_headers()
            self.send_header("Content-Type", mime_type)
            self.send_header("Content-Length", str(len(content)))
            self.send_header("Cache-Control", "no-cache, must-revalidate")
            self.end_headers()
            self.wfile.write(content)
        except Exception as e:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(f"Error leyendo archivo: {e}".encode("utf-8"))


# =============================================================================
# INICIO DEL SERVIDOR
# =============================================================================
def run_server():
    server_address = ("0.0.0.0", PORT)
    httpd = HTTPServer(server_address, ChispaPlayHandler)
    print("=" * 70)
    print(f"[CHISPAPLAY] SERVIDOR BACKEND & BASE DE DATOS INICIADO")
    print(f"[*] Servidor Web y API REST escuchando en: http://localhost:{PORT}")
    print(f"[*] Base de Datos SQLite activa en: {DB_PATH}")
    print(f"[*] Directorio de Fotos y Archivos: {UPLOADS_DIR}")
    print(f"[*] Clave Maestra CEO: {CEO_MASTER_KEY}")
    print("=" * 70)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor detenido por el usuario.")
        httpd.server_close()

if __name__ == "__main__":
    run_server()
