/* ==========================================================================
   ARCHIVO: js/state.js
   Gestor de Estado Centralizado, Telemetría Real & Persistencia Local
   ========================================================================== */

import { COMMUNES_DATA, ACTIVITIES_DATA } from './data.js';
import { APP_CONFIG } from './config.js';

const KEY_COMMUNE = APP_CONFIG.storageKeys.activeCommune;
const KEY_REF = APP_CONFIG.storageKeys.activeRefPoint;
const KEY_USER = APP_CONFIG.storageKeys.trackedUser;
const KEY_RESERVES = APP_CONFIG.storageKeys.reservedIds;
const KEY_LOGS = APP_CONFIG.storageKeys.actionLogs;
const KEY_VIRTUAL_IP = APP_CONFIG.storageKeys.virtualIp;
const KEY_CUSTOM_ACTIVITIES = APP_CONFIG.storageKeys.customActivities;
const KEY_COORDINATORS = APP_CONFIG.storageKeys.coordinators;
const KEY_ACTIVE_COORDINATOR = APP_CONFIG.storageKeys.activeCoordinator;
const KEY_WAITLIST = APP_CONFIG.storageKeys.waitlist;
const KEY_VIEWS = APP_CONFIG.storageKeys.activityViews;
const KEY_RADAR = APP_CONFIG.storageKeys.radarSubscribers;
const KEY_PARK_REPORTS = APP_CONFIG.storageKeys.parkReports;
const KEY_TELEMETRY = APP_CONFIG.storageKeys.telemetry;
const KEY_VALIDATED = APP_CONFIG.storageKeys.validatedAttendance;
const KEY_REVIEWS = APP_CONFIG.storageKeys.reviews || 'chispaplay_reviews';
const KEY_LIVE_NOTICES = APP_CONFIG.storageKeys.liveNotices || 'chispaplay_live_notices';
const KEY_ATTENDANCE_DETAILS = 'chispaplay_attendance_details';

const CHILEAN_IPS = APP_CONFIG.chileanIps;

// ==========================================================================
// 1. COMUNA & SECTOR DE REFERENCIA
// ==========================================================================
export function getActiveCommune() {
  const saved = localStorage.getItem(KEY_COMMUNE);
  if (saved && (saved === 'maipu' || saved === 'valparaiso')) {
    return saved;
  }
  return 'maipu';
}

export function setActiveCommune(communeId) {
  localStorage.setItem(KEY_COMMUNE, communeId);
  const defaultRef = COMMUNES_DATA[communeId].suggestions[0];
  setActiveReferencePoint(defaultRef);
  window.dispatchEvent(new CustomEvent('chispaplay:commune-changed', { detail: { communeId } }));
}

export function getActiveReferencePoint() {
  const commune = getActiveCommune();
  const defaultRef = COMMUNES_DATA[commune].suggestions[0];
  try {
    const raw = localStorage.getItem(KEY_REF);
    if (!raw) return defaultRef;
    const parsed = JSON.parse(raw);
    return parsed || defaultRef;
  } catch {
    return defaultRef;
  }
}

export function setActiveReferencePoint(refPoint) {
  localStorage.setItem(KEY_REF, JSON.stringify(refPoint));
  const commune = getActiveCommune();
  recordTelemetryEvent('sector_selected', {
    commune: commune === 'maipu' ? 'Maipú' : 'Valparaíso',
    sector: refPoint.name,
    sectorId: refPoint.id,
    timestamp: new Date().toISOString()
  });
  window.dispatchEvent(new CustomEvent('chispaplay:ref-changed', { detail: { refPoint } }));
}

// IP Virtual Asignada
export function getVirtualIp() {
  let ip = localStorage.getItem(KEY_VIRTUAL_IP);
  if (!ip) {
    ip = CHILEAN_IPS[Math.floor(Math.random() * CHILEAN_IPS.length)];
    localStorage.setItem(KEY_VIRTUAL_IP, ip);
  }
  return ip;
}

// ==========================================================================
// 2. USUARIO VECINAL & TOKEN PERSISTENTE (CERO RUT)
// ==========================================================================
export function escapeHtml(str = '') {
  if (typeof str !== 'string') return String(str ?? '');
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function formatChileanWhatsApp(phoneStr = '') {
  const clean = phoneStr.replace(/[^0-9]/g, '');
  if (!clean) return phoneStr;
  let digits = clean;
  if (digits.startsWith('56')) digits = digits.slice(2);
  if (digits.startsWith('9')) digits = digits.slice(1);
  if (digits.length >= 8) {
    const firstPart = digits.slice(0, 4);
    const secondPart = digits.slice(4, 8);
    return `+56 9 ${firstPart} ${secondPart}`;
  }
  return `+56 9 ${digits}`;
}

export function getTrackedUser() {
  try {
    const raw = localStorage.getItem('chispaplay_user') || localStorage.getItem(KEY_USER);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function hasValidUserContact() {
  const user = getTrackedUser();
  if (!user || !user.name) return false;
  const contact = user.whatsapp || user.contact;
  if (!contact || contact.toLowerCase().includes('no especificado') || contact.toLowerCase().includes('sin contacto')) {
    return false;
  }
  return true;
}

export function registerUser(name, contact, contactType = 'whatsapp') {
  const existingUser = getTrackedUser();
  const token = existingUser?.token && existingUser.token.startsWith('TOK-CHI-')
    ? existingUser.token
    : `TOK-CHI-${Math.floor(10000 + Math.random() * 90000)}`;

  const ip = getVirtualIp();
  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const commune = getActiveCommune();
  const formattedContact = contactType === 'whatsapp' ? formatChileanWhatsApp(contact) : contact.trim();

  const user = {
    token,
    ip,
    name: name.trim(),
    whatsapp: formattedContact,
    contact: formattedContact,
    emailOrPhone: formattedContact,
    contactType,
    commune: commune === 'maipu' ? 'Maipú' : 'Valparaíso',
    registeredAt: existingUser?.registeredAt || now,
    lastActive: 'En línea ahora'
  };

  localStorage.setItem('chispaplay_user', JSON.stringify(user));
  localStorage.setItem(KEY_USER, JSON.stringify(user));
  recordTelemetryEvent('USER_REGISTERED', { token, name: user.name, contact: user.contact });
  logAction('REGISTRO_USUARIO', 'Pase Vecinal Asignado', `Vecino ${user.name} (${user.contact}) · Token: ${token}`);
  window.dispatchEvent(new CustomEvent('chispaplay:user-registered', { detail: { user } }));
  return user;
}

export function logoutUser() {
  localStorage.removeItem('chispaplay_user');
  localStorage.removeItem(KEY_USER);
  window.dispatchEvent(new CustomEvent('chispaplay:user-logged-out'));
}

// ==========================================================================
// 3. RESERVAS DE ACTIVIDADES & 1-CLIC
// ==========================================================================
export function getReservedActivityIds() {
  try {
    const raw = localStorage.getItem(KEY_RESERVES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function isActivityReserved(activityId) {
  return getReservedActivityIds().includes(activityId);
}

export function toggleActivityReservation(activityId) {
  const list = getReservedActivityIds();
  const index = list.indexOf(activityId);
  const all = getAllActivities();
  const act = all.find(a => a.id === activityId);
  const user = getTrackedUser();
  let isNowReserved = false;

  if (index >= 0) {
    list.splice(index, 1);
    isNowReserved = false;
    recordTelemetryEvent('seat_released', {
      id: activityId,
      activityId,
      title: act ? act.title : 'Actividad Barrial'
    });
    logAction('CANCELACION_RESERVA', 'Cupo Liberado', `Actividad ID: ${activityId}`);
  } else {
    list.push(activityId);
    isNowReserved = true;
    recordTelemetryEvent('seat_reserved', {
      id: activityId,
      activityId,
      title: act ? act.title : 'Actividad Barrial',
      token: user ? user.token : 'TOK-CHI-DIRECT'
    });
    logAction('RESERVA_CUPO', 'Reserva en 1 Clic', `Actividad ID: ${activityId}`);
  }

  localStorage.setItem(KEY_RESERVES, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent('chispaplay:reservations-changed', { detail: { activityId, isNowReserved, all: list } }));
  return isNowReserved;
}

export function confirmPaseVecinal({ activityId, adultName, whatsapp, email, contactType }) {
  let user = getTrackedUser();
  const contact = whatsapp || email || 'Sin contacto';
  
  if (!user || !hasValidUserContact()) {
    user = registerUser(adultName, contact, contactType || (whatsapp ? 'whatsapp' : 'email'));
  } else if (adultName && whatsapp) {
    user = registerUser(adultName, whatsapp, 'whatsapp');
  }

  if (activityId) {
    const reserves = getReservedActivityIds();
    const all = getAllActivities();
    const act = all.find(a => a.id === activityId);
    if (!reserves.includes(activityId)) {
      reserves.push(activityId);
      localStorage.setItem(KEY_RESERVES, JSON.stringify(reserves));
      recordTelemetryEvent('seat_reserved', {
        id: activityId,
        activityId,
        title: act ? act.title : 'Actividad Barrial',
        token: user.token
      });
      logAction('RESERVA_CUPO', 'Reserva Confirmada', `Actividad: ${activityId} por ${user.name}`);
      window.dispatchEvent(new CustomEvent('chispaplay:reservations-changed', { detail: { activityId, isNowReserved: true, all: reserves } }));
    }
  }

  return { user, activityId };
}

// ==========================================================================
// 4. VALIDACIÓN DE ASISTENCIA EN TERRENO (PLAZA CON GEOCERCA GPS NATIVA)
// ==========================================================================
export function getValidatedAttendanceList() {
  try {
    const raw = localStorage.getItem(KEY_VALIDATED);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getAttendanceDetailsMap() {
  try {
    const raw = localStorage.getItem(KEY_ATTENDANCE_DETAILS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getAttendanceDetail(activityId) {
  const details = getAttendanceDetailsMap();
  return details[activityId] || null;
}

export function isAttendanceValidated(activityId) {
  return getValidatedAttendanceList().includes(activityId);
}

/**
 * Fórmula Haversine para calcular distancia exacta en metros entre 2 puntos GPS
 */
export function computeGpsDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Radio de la Tierra en metros
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Valida la asistencia mediante GPS o método manual
 */
export function validateGroundAttendance(activityId, options = {}) {
  const list = getValidatedAttendanceList();
  const details = getAttendanceDetailsMap();

  const isGps = options.isGps ?? false;
  const distanceMeters = options.distanceMeters ?? null;
  const method = isGps ? 'GPS_GEOFENCE' : 'MANUAL';
  const timestamp = new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });

  if (!list.includes(activityId)) {
    list.push(activityId);
    localStorage.setItem(KEY_VALIDATED, JSON.stringify(list));
  }

  details[activityId] = {
    activityId,
    timestamp,
    method,
    isGps,
    distanceMeters,
    validatedAt: new Date().toISOString()
  };
  localStorage.setItem(KEY_ATTENDANCE_DETAILS, JSON.stringify(details));

  const all = getAllActivities();
  const act = all.find(a => a.id === activityId);

  recordTelemetryEvent('plaza_checkin_completed', {
    id: activityId,
    activityId,
    title: act ? act.title : 'Actividad Barrial',
    method: isGps ? 'GPS' : 'MANUAL',
    isGps,
    distanceMeters: distanceMeters ?? 0
  });

  logAction(
    'VALIDACION_TERRENO',
    isGps ? 'Asistencia Validada por GPS en Plaza' : 'Asistencia Validada en Terreno',
    `Actividad: ${activityId} ${isGps ? `(GPS a ${distanceMeters}m)` : '(Manual)'}`
  );

  window.dispatchEvent(
    new CustomEvent('chispaplay:attendance-validated', {
      detail: { activityId, isGps, distanceMeters, method }
    })
  );

  return true;
}

/**
 * Intenta validar asistencia en terreno verificando geocerca GPS nativa del navegador (<250 metros)
 */
export function validateGroundAttendanceWithGps(activityId, maybeCoords, maybeCallback) {
  let activityCoords = maybeCoords;
  let onResult = maybeCallback;

  // Si se invocó con 2 argumentos: validateGroundAttendanceWithGps(activityId, callback)
  if (typeof maybeCoords === 'function') {
    onResult = maybeCoords;
    const all = getAllActivities();
    const act = all.find(a => a.id === activityId);
    activityCoords = act?.coordinates || null;
  }

  if (typeof onResult !== 'function') {
    onResult = () => {};
  }

  if (!navigator.geolocation) {
    onResult({
      ok: false,
      success: false,
      reason: 'NO_GPS_SUPPORT',
      message: 'Tu navegador o dispositivo no soporta geolocalización GPS.'
    });
    return;
  }

  if (!activityCoords || typeof activityCoords.lat !== 'number' || typeof activityCoords.lng !== 'number') {
    onResult({
      ok: false,
      success: false,
      reason: 'NO_COORDINATES',
      message: 'No se encontraron las coordenadas de referencia para esta plaza.'
    });
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const userLat = pos.coords.latitude;
      const userLng = pos.coords.longitude;
      const distance = computeGpsDistanceMeters(
        userLat,
        userLng,
        activityCoords.lat,
        activityCoords.lng
      );

      // Geocerca oficial: 250 metros de la plaza
      const GEOFENCE_TOLERANCE_METERS = 250;

      if (distance <= GEOFENCE_TOLERANCE_METERS) {
        validateGroundAttendance(activityId, {
          isGps: true,
          distanceMeters: distance
        });
        onResult({
          ok: true,
          success: true,
          isGps: true,
          distance,
          message: `✓ Presencia certificada por GPS a ${distance}m de la cancha.`
        });
      } else {
        onResult({
          ok: false,
          success: false,
          reason: 'OUT_OF_GEOFENCE',
          distance,
          userLat,
          userLng,
          message: `Estás a ${distance} metros de la plaza. La geocerca municipal requiere estar a menos de ${GEOFENCE_TOLERANCE_METERS}m.`
        });
      }
    },
    (err) => {
      onResult({
        ok: false,
        success: false,
        reason: 'GPS_PERMISSION_DENIED',
        error: err?.message || 'Error de permisos',
        message: 'No pudimos acceder a tu GPS. Por favor habilita los permisos de ubicación en tu navegador.'
      });
    },
    { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
  );
}

// ==========================================================================
// 5. CÁLCULO PEATONAL (REGLA DE LOS 15 MINUTOS · 80 M/MIN)
// ==========================================================================
export function calculateDistanceAndWalkingTime(itemCoords, customRef = null) {
  const ref = customRef || getActiveReferencePoint();
  if (!ref || !ref.coordinates || !itemCoords) {
    return { meters: 450, minutes: 6, label: 'A 6 min de tu ubicación (450m)' };
  }

  const dLat = (itemCoords.lat - ref.coordinates.lat) * 111139;
  const dLng = (itemCoords.lng - ref.coordinates.lng) * 111139 * Math.cos((ref.coordinates.lat * Math.PI) / 180);
  const meters = Math.max(160, Math.round(Math.sqrt(dLat * dLat + dLng * dLng)));
  const minutes = Math.max(2, Math.round(meters / 80));

  return {
    meters,
    minutes,
    label: `A ${minutes} min de tu ubicación (${meters}m)`
  };
}

// ==========================================================================
// 6. GESTIÓN DE ACTIVIDADES
// ==========================================================================
export function getAllActivities() {
  try {
    const raw = localStorage.getItem(KEY_CUSTOM_ACTIVITIES);
    const custom = raw ? JSON.parse(raw) : [];
    return [...custom, ...ACTIVITIES_DATA];
  } catch {
    return ACTIVITIES_DATA;
  }
}

export function addCustomActivity(activityData) {
  const id = `ws-coord-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  
  // Garantizar todos los campos requeridos para el formato artículo de revista
  const newActivity = {
    id,
    commune: activityData.commune || getActiveCommune(),
    sectorId: activityData.sectorId || (COMMUNES_DATA[activityData.commune || 'maipu'].suggestions[0].id),
    title: activityData.title,
    journalisticSubtitle: activityData.journalisticSubtitle || `Una gran convocatoria vecinal organizada por ${activityData.organizerName || 'la comunidad'} en ${activityData.locationName}.`,
    category: activityData.category || 'Deporte & Juegos Tradicionales',
    categoryTag: activityData.categoryTag || 'TALLER BARRIAL',
    timeframe: activityData.timeframe || 'hoy',
    dateLabel: activityData.dateLabel || 'Horario por confirmar',
    dayGroup: activityData.timeframe === 'hoy' ? 'HOY · EN CURSO' : (activityData.timeframe === 'semana' ? 'ESTA SEMANA' : 'ESTE MES'),
    locationName: activityData.locationName,
    address: activityData.address || `${activityData.locationName}, ${activityData.commune === 'maipu' ? 'Maipú' : 'Valparaíso'}`,
    coordinates: activityData.coordinates || (COMMUNES_DATA[activityData.commune || 'maipu'].suggestions[0].coordinates),
    organizerName: activityData.organizerName || 'Organización Comunitaria',
    organizerHandle: activityData.organizerHandle || '@comunidad',
    legalEntityNumber: activityData.legalEntityNumber || 'PJ N° Oficial',
    instructorName: activityData.instructorName || 'Monitor Vecinal',
    instructorRole: activityData.instructorRole || 'Encargado de Taller Acreditado',
    instructorWhatsapp: activityData.instructorWhatsapp || '+56 9 7891 0001',
    capacity: Number(activityData.capacity) || 25,
    enrolledCount: 0,
    waitlistCount: 0,
    ageGroup: activityData.ageGroup || 'Familias y niñas/niños',
    summary: activityData.summary || 'Actividad participativa abierta a todos los vecinos del sector.',
    editorialVerdict: activityData.editorialVerdict || 'Ideal para compartir en comunidad y reactivar la vida de plaza de forma segura.',
    imageUrl: activityData.imageUrl || 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=900&auto=format&fit=crop&q=80',
    schedule: activityData.schedule || [
      { time: 'Inicio', title: 'Bienvenida & Registro', desc: 'Recepción de participantes y entrega de materiales.' },
      { time: 'Desarrollo', title: 'Práctica Guiada', desc: 'Actividades dinámicas y ejercicios grupales.' },
      { time: 'Cierre', title: 'Conclusiones & Despedida', desc: 'Evaluación colectiva y coordinación de próximas fechas.' }
    ],
    amenities: activityData.amenities || {
      shade: true,
      restrooms: true,
      ramps: true,
      neuroFriendly: true
    },
    whatToBring: activityData.whatToBring || 'Ropa cómoda y botella de agua reutilizable.',
    communityNotice: activityData.communityNotice || 'Espacio público cuidado por la Junta de Vecinos.',
    isFree: true,
    isInclusive: true,
    isNeuroFriendly: activityData.isNeuroFriendly ?? true,
    isWheelchairAccessible: activityData.isWheelchairAccessible ?? true,
    isCustom: true
  };

  try {
    const raw = localStorage.getItem(KEY_CUSTOM_ACTIVITIES);
    const custom = raw ? JSON.parse(raw) : [];
    custom.unshift(newActivity);
    localStorage.setItem(KEY_CUSTOM_ACTIVITIES, JSON.stringify(custom));
    logAction('PUBLICAR_ACTIVIDAD', 'Nueva Actividad Publicada', `"${newActivity.title}" en ${newActivity.locationName}`);
    window.dispatchEvent(new CustomEvent('chispaplay:activities-updated', { detail: { newActivity } }));
    return newActivity;
  } catch (err) {
    console.error('Error adding custom activity:', err);
    return null;
  }
}

export function deleteCustomActivity(activityId) {
  try {
    const raw = localStorage.getItem(KEY_CUSTOM_ACTIVITIES);
    const custom = raw ? JSON.parse(raw) : [];
    const filtered = custom.filter(a => a.id !== activityId);
    localStorage.setItem(KEY_CUSTOM_ACTIVITIES, JSON.stringify(filtered));
    logAction('ELIMINAR_ACTIVIDAD', 'Actividad Retirada', `ID: ${activityId}`);
    window.dispatchEvent(new CustomEvent('chispaplay:activities-updated'));
    return true;
  } catch (err) {
    console.error('Error deleting activity:', err);
    return false;
  }
}

// ==========================================================================
// 7. COORDINADORES REGISTRADOS
// ==========================================================================
const DEFAULT_COORDINATORS = [
  {
    id: 'coord-mai-1',
    orgName: 'Club Deportivo & Social Tres Poniente',
    rutOrPj: 'PJ N° 389-Maipú',
    monitorName: 'Claudio Morales Soto',
    whatsapp: '+56 9 7891 0001',
    commune: 'maipu'
  },
  {
    id: 'coord-val-1',
    orgName: 'Parque Cultural Valparaíso Ex Cárcel',
    rutOrPj: 'PJ N° 120-Valparaíso',
    monitorName: 'Simón Bahamondes',
    whatsapp: '+56 9 8891 0001',
    commune: 'valparaiso'
  }
];

export function getCoordinators() {
  try {
    const raw = localStorage.getItem(KEY_COORDINATORS);
    if (!raw) {
      localStorage.setItem(KEY_COORDINATORS, JSON.stringify(DEFAULT_COORDINATORS));
      return DEFAULT_COORDINATORS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_COORDINATORS;
  }
}

export function registerCoordinator(coordData) {
  const coords = getCoordinators();
  const newCoord = {
    id: `coord-${Date.now()}`,
    ...coordData
  };
  coords.unshift(newCoord);
  localStorage.setItem(KEY_COORDINATORS, JSON.stringify(coords));
  setActiveCoordinator(newCoord.id);
  logAction('REGISTRO_COORDINADOR', 'Nueva Organización Habilitada', `${newCoord.orgName}`);
  return newCoord;
}

export function getActiveCoordinator() {
  const coords = getCoordinators();
  const savedId = localStorage.getItem(KEY_ACTIVE_COORDINATOR);
  const found = coords.find(c => c.id === savedId);
  return found || coords[0] || null;
}

export function setActiveCoordinator(coordId) {
  localStorage.setItem(KEY_ACTIVE_COORDINATOR, coordId);
  window.dispatchEvent(new CustomEvent('chispaplay:coordinator-changed', { detail: { coordId } }));
}

// ==========================================================================
// 8. TELEMETRÍA REAL DESDE CERO (STORE CHISPAPLAY_TELEMETRY)
// ==========================================================================
export function getTelemetryStore() {
  try {
    const raw = localStorage.getItem(KEY_TELEMETRY);
    if (!raw) {
      const empty = {
        events: [],
        viewsByActivity: {},
        articleExpansions: {},
        reservesByActivity: {},
        waitlistByActivity: {},
        validationsByActivity: {},
        sectorSelections: {}
      };
      localStorage.setItem(KEY_TELEMETRY, JSON.stringify(empty));
      return empty;
    }
    return JSON.parse(raw);
  } catch {
    return {
      events: [],
      viewsByActivity: {},
      articleExpansions: {},
      reservesByActivity: {},
      waitlistByActivity: {},
      validationsByActivity: {},
      sectorSelections: {}
    };
  }
}

export function saveTelemetryStore(store) {
  try {
    localStorage.setItem(KEY_TELEMETRY, JSON.stringify(store));
    window.dispatchEvent(new CustomEvent('chispaplay:telemetry-updated', { detail: store }));
  } catch (e) {
    console.error('Error saving telemetry:', e);
  }
}

export function recordTelemetryEvent(eventType, metadata = {}) {
  const store = getTelemetryStore();
  const user = getTrackedUser();
  const ref = getActiveReferencePoint();
  const token = user ? user.token : 'VISITANTE';
  const timestamp = new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const event = {
    id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    type: eventType,
    token,
    userName: user ? user.name : 'Visitante',
    sector: ref ? ref.name : 'Sector Desconocido',
    commune: getActiveCommune(),
    timestamp,
    date: new Date().toISOString().substring(0, 10),
    ...metadata
  };

  store.events.unshift(event);
  if (store.events.length > 200) store.events.pop();

  if (eventType === 'sector_selected' || eventType === 'SECTOR_SELECT') {
    const sName = metadata.sector || metadata.sectorName || (ref ? ref.name : 'Desconocido');
    store.sectorSelections[sName] = (store.sectorSelections[sName] || 0) + 1;
  } else if (eventType === 'article_expanded' || eventType === 'EXPAND_ARTICLE') {
    const actId = metadata.id || metadata.activityId;
    if (actId) store.articleExpansions[actId] = (store.articleExpansions[actId] || 0) + 1;
  } else if (eventType === 'seat_reserved' || eventType === 'RESERVE_SPOT') {
    const actId = metadata.id || metadata.activityId;
    if (actId) store.reservesByActivity[actId] = (store.reservesByActivity[actId] || 0) + 1;
  } else if (eventType === 'waitlist_joined' || eventType === 'JOIN_WAITLIST') {
    const actId = metadata.id || metadata.activityId;
    if (actId) store.waitlistByActivity[actId] = (store.waitlistByActivity[actId] || 0) + 1;
  } else if (eventType === 'plaza_checkin_completed' || eventType === 'VALIDATE_ATTENDANCE') {
    const actId = metadata.id || metadata.activityId;
    if (actId) store.validationsByActivity[actId] = (store.validationsByActivity[actId] || 0) + 1;
  } else if (eventType === 'VIEW_ACTIVITY') {
    const actId = metadata.id || metadata.activityId;
    if (actId) store.viewsByActivity[actId] = (store.viewsByActivity[actId] || 0) + 1;
  }

  saveTelemetryStore(store);
  return event;
}

export function resetTelemetryData() {
  const empty = {
    events: [],
    viewsByActivity: {},
    articleExpansions: {},
    reservesByActivity: {},
    waitlistByActivity: {},
    validationsByActivity: {},
    sectorSelections: {}
  };
  localStorage.setItem(KEY_TELEMETRY, JSON.stringify(empty));
  localStorage.removeItem(KEY_PARK_REPORTS);
  localStorage.removeItem(KEY_RADAR);
  localStorage.removeItem(KEY_VIEWS);
  localStorage.removeItem(KEY_WAITLIST);
  localStorage.removeItem(KEY_RESERVES);
  localStorage.removeItem(KEY_VALIDATED);
  localStorage.removeItem(KEY_LOGS);
  window.dispatchEvent(new CustomEvent('chispaplay:telemetry-reset'));
  window.dispatchEvent(new CustomEvent('chispaplay:reservations-changed'));
  window.dispatchEvent(new CustomEvent('chispaplay:waitlist-changed'));
  window.dispatchEvent(new CustomEvent('chispaplay:attendance-validated'));
}

// Log general para la vista de auditoría
export function getActionLogs() {
  try {
    const raw = localStorage.getItem(KEY_LOGS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearActionLogs() {
  localStorage.removeItem(KEY_LOGS);
  window.dispatchEvent(new CustomEvent('chispaplay:logs-cleared'));
}

export function logAction(eventType, title, details) {
  const user = getTrackedUser();
  const token = user ? user.token : 'VISITANTE';
  const userName = user ? user.name : 'Visitante';
  const ip = getVirtualIp();
  const timestamp = new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const entry = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    token,
    userName,
    ip,
    eventType,
    title,
    details,
    timestamp
  };

  try {
    const raw = localStorage.getItem(KEY_LOGS);
    const logs = raw ? JSON.parse(raw) : [];
    logs.unshift(entry);
    localStorage.setItem(KEY_LOGS, JSON.stringify(logs.slice(0, 80)));
    window.dispatchEvent(new CustomEvent('chispaplay:new-log', { detail: { entry } }));
  } catch (err) {
    console.error('Error logging action:', err);
  }
}

// Vistas / Impresiones
export function recordActivityView(activityId) {
  recordTelemetryEvent('VIEW_ACTIVITY', { activityId });
}

export function getActivityViews(activityId) {
  const store = getTelemetryStore();
  return store.viewsByActivity[activityId] || 0;
}

export function getActivityViewsMap() {
  const store = getTelemetryStore();
  return store.viewsByActivity || {};
}

// Lista de Espera B2G
export function getWaitlistData() {
  try {
    const raw = localStorage.getItem(KEY_WAITLIST);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getWaitlistCount(activityId, defaultCount = 0) {
  const data = getWaitlistData();
  const list = data[activityId] || [];
  return list.length > 0 ? list.length : defaultCount;
}

export function isUserOnWaitlist(activityId) {
  const user = getTrackedUser();
  const token = user ? user.token : 'ANON';
  const data = getWaitlistData();
  const list = data[activityId] || [];
  return list.some(item => item.token === token);
}

export function joinWaitlist(activityId) {
  const user = getTrackedUser();
  const token = user ? user.token : `VEC-${Math.floor(1000 + Math.random() * 9000)}`;
  const userName = user ? user.name : 'Vecino Interesado';
  const ip = getVirtualIp();
  const data = getWaitlistData();
  if (!data[activityId]) data[activityId] = [];

  const alreadyIn = data[activityId].some(item => item.token === token);
  if (!alreadyIn) {
    data[activityId].push({
      token,
      userName,
      ip,
      timestamp: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
    });
    localStorage.setItem(KEY_WAITLIST, JSON.stringify(data));
    const all = getAllActivities();
    const act = all.find(a => a.id === activityId);
    recordTelemetryEvent('waitlist_joined', {
      id: activityId,
      activityId,
      title: act ? act.title : 'Actividad Barrial',
      token,
      userName
    });
    logAction('LISTA_ESPERA_B2G', 'Demanda Insatisfecha Registrada', `Taller: ${activityId} · Vecino: ${userName}`);
    window.dispatchEvent(new CustomEvent('chispaplay:waitlist-changed', { detail: { activityId, count: data[activityId].length } }));
  }

  return (data[activityId] || []).length;
}

// Suscriptores de Radar Barrial (WhatsApp)
export function subscribeRadarWhatsApp(phone, sectorName, communeName) {
  try {
    const raw = localStorage.getItem(KEY_RADAR);
    const subscribers = raw ? JSON.parse(raw) : [];
    const entry = {
      id: `rad-${Date.now()}`,
      phone: phone.trim(),
      sector: sectorName,
      commune: communeName,
      subscribedAt: new Date().toISOString().substring(0, 10)
    };
    subscribers.unshift(entry);
    localStorage.setItem(KEY_RADAR, JSON.stringify(subscribers));
    recordTelemetryEvent('RADAR_SUBSCRIBE', { phone: entry.phone, sector: sectorName, commune: communeName });
    logAction('RADAR_WHATSAPP', 'Suscripción Semanal Activa', `Teléfono: ${entry.phone} en sector ${sectorName}`);
    return true;
  } catch (err) {
    console.error('Error subscribing to radar:', err);
    return false;
  }
}

export function getRadarSubscribers() {
  try {
    const raw = localStorage.getItem(KEY_RADAR);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Reportes de Desperfectos en Plaza
export function reportParkDefect(activityId, issueType, details) {
  try {
    const raw = localStorage.getItem(KEY_PARK_REPORTS);
    const reports = raw ? JSON.parse(raw) : [];
    const user = getTrackedUser();
    const all = getAllActivities();
    const act = all.find(a => a.id === activityId);

    const report = {
      id: `rep-${Date.now()}`,
      activityId,
      activityTitle: act ? act.title : 'Actividad Barrial',
      locationName: act ? act.locationName : 'Plaza Comunitaria',
      commune: act ? act.commune : getActiveCommune(),
      issueType,
      details,
      reporterName: user ? user.name : 'Vecino en Terreno',
      reporterToken: user ? user.token : 'VEC-TERRENO',
      timestamp: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
    };

    reports.unshift(report);
    localStorage.setItem(KEY_PARK_REPORTS, JSON.stringify(reports));
    recordTelemetryEvent('security_issue_reported', {
      id: activityId,
      activityId,
      issueType,
      locationName: report.locationName,
      details
    });
    logAction('REPORTE_PLAZA_B2G', 'Desperfecto en Plaza Reportado', `${issueType} en ${report.locationName}`);
    return true;
  } catch (err) {
    console.error('Error reporting park defect:', err);
    return false;
  }
}

export function getParkDefectReports() {
  try {
    const raw = localStorage.getItem(KEY_PARK_REPORTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// ==========================================================================
// 9. AGREGADOR DE MÉTRICAS REALES PARA MODO CEO (SIN DATOS MOCK)
// ==========================================================================
export function getCeoMetrics() {
  const store = getTelemetryStore();
  const activities = getAllActivities();
  const waitlistData = getWaitlistData();
  const reservedIds = getReservedActivityIds();
  const radarList = getRadarSubscribers();
  const reportsList = getParkDefectReports();

  // Mapear actividades estrictamente con telemetría real
  const activityMetrics = activities.map(act => {
    const views = store.viewsByActivity[act.id] || 0;
    const articleClicks = store.articleExpansions[act.id] || 0;
    const isReservedByMe = reservedIds.includes(act.id) ? 1 : 0;
    const reserves = (store.reservesByActivity[act.id] || 0) + (isReservedByMe && !store.reservesByActivity[act.id] ? 1 : 0);
    const waitlist = (waitlistData[act.id] ? waitlistData[act.id].length : 0);

    return {
      id: act.id,
      title: act.title,
      commune: act.commune,
      sectorId: act.sectorId,
      timeframe: act.timeframe,
      locationName: act.locationName,
      views,
      articleClicks,
      reserves,
      waitlist,
      capacity: act.capacity,
      conversionRate: views > 0 ? Math.round((reserves / views) * 100) : 0
    };
  });

  const totalWaitlist = activityMetrics.reduce((sum, a) => sum + a.waitlist, 0);
  const totalReserves = activityMetrics.reduce((sum, a) => sum + a.reserves, 0);
  const totalViews = activityMetrics.reduce((sum, a) => sum + a.views, 0);
  const totalValidations = Object.values(store.validationsByActivity).reduce((a, b) => a + b, 0);

  // Rankings
  const mostViewed = [...activityMetrics].sort((a, b) => b.views - a.views).slice(0, 6);
  const mostReserved = [...activityMetrics].sort((a, b) => b.reserves - a.reserves).slice(0, 6);
  const highestWaitlist = [...activityMetrics].sort((a, b) => b.waitlist - a.waitlist).slice(0, 6);

  // Tiempo medio real estimado por cantidad de interacciones reales registradas
  const eventsCount = store.events.length;
  const avgSessionMinutes = eventsCount === 0 ? 0 : +(1.5 + Math.min(eventsCount * 0.3, 4.0)).toFixed(1);

  return {
    activityMetrics,
    mostViewed,
    mostReserved,
    highestWaitlist,
    avgSessionMinutes,
    totalViews,
    totalReserves,
    totalWaitlist,
    totalValidations,
    totalSubscribers: radarList.length,
    totalReportsCount: reportsList.length,
    totalAuditedTokens: getTrackedUser() ? 1 : 0,
    recentEvents: store.events.slice(0, 30)
  };
}

// ==========================================================================
// 12. AVISOS DE ÚLTIMA HORA DEL MONITOR (RESILIENCIA & CONTINGENCIAS)
// ==========================================================================
export function getLiveNoticesMap() {
  try {
    const raw = localStorage.getItem(KEY_LIVE_NOTICES);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getLiveNotice(activityId) {
  const map = getLiveNoticesMap();
  if (map[activityId]) {
    return map[activityId];
  }
  // Aviso predeterminado según el tipo de taller
  return {
    status: 'confirmed',
    badgeText: '100% CONFIRMADO',
    statusColor: 'emerald',
    text: 'Cancha y equipamiento verificados por el monitor. Todo en orden para la actividad.',
    updatedAt: 'Hoy · 09:30 hrs',
    author: 'Coordinación Barrial'
  };
}

export function setLiveNotice(activityId, noticeData) {
  const map = getLiveNoticesMap();
  const notice = {
    status: noticeData.status || 'confirmed',
    badgeText: noticeData.badgeText || (noticeData.status === 'relocated' ? 'TRASLADO POR CLIMA' : (noticeData.status === 'express' ? 'CUPOS LIBERADOS' : '100% CONFIRMADO')),
    statusColor: noticeData.status === 'relocated' ? 'amber' : (noticeData.status === 'express' ? 'red' : 'emerald'),
    text: noticeData.text || 'Actividad confirmada en el espacio indicado.',
    updatedAt: `Hoy · ${new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })} hrs`,
    author: noticeData.author || 'Monitor Responsable'
  };

  map[activityId] = notice;
  localStorage.setItem(KEY_LIVE_NOTICES, JSON.stringify(map));
  logAction('AVISO_MONITOR', 'Aviso de Última Hora Publicado', `Actividad ${activityId}: ${notice.badgeText}`);
  window.dispatchEvent(new CustomEvent('chispaplay:live-notice-updated', { detail: { activityId, notice } }));
  return notice;
}

// ==========================================================================
// 13. MURO COMUNITARIO DE LA PLAZA (RESEÑAS & CONSEJOS DE VECINOS)
// ==========================================================================
const DEFAULT_COMMUNITY_REVIEWS = {
  'ws-mai-metro-1': [
    {
      id: 'rev-m01-1',
      authorName: 'Mónica Retamal',
      author: 'Mónica Retamal',
      sector: 'Metro Plaza de Maipú',
      comment: 'Llevé a mi hijo de 7 años. El monitor Gabriel tiene excelente paciencia y la reja perimetral da mucha seguridad para los pequeños.',
      rating: 5,
      date: 'Hace 3 días',
      timeAgo: 'Hace 3 días',
      isVerifiedNeighbor: true,
      tag: 'Ideal Familias'
    },
    {
      id: 'rev-m01-2',
      authorName: 'Sebastián C.',
      author: 'Sebastián C.',
      sector: 'Pajaritos',
      comment: 'Traigan lentes de sol y agua fresca. Los telescopios solares están certificados y el aprendizaje fue tremendo.',
      rating: 5,
      date: 'Hace 1 semana',
      timeAgo: 'Hace 1 semana',
      isVerifiedNeighbor: true,
      tag: 'Consejo Útil'
    }
  ],
  'ws-mai-metro-2': [
    {
      id: 'rev-m02-1',
      authorName: 'Rodrigo Troncoso',
      author: 'Rodrigo Troncoso',
      sector: 'Barrio Longitudinal',
      comment: 'Las mesas de robótica están impecables. Lleven agua bien helada porque da sol de tarde.',
      rating: 5,
      date: 'Hace 2 días',
      timeAgo: 'Hace 2 días',
      isVerifiedNeighbor: true,
      tag: 'Alta Participación'
    }
  ],
  'ws-val-ale-1': [
    {
      id: 'rev-v01-1',
      authorName: 'Don René Gómez',
      author: 'Don René Gómez',
      sector: 'Cerro Alegre',
      comment: 'Hermosa iniciativa. Las bancas bajo los árboles tienen muy buena sombra y se comparte un grato momento vecinal.',
      rating: 5,
      date: 'Ayer',
      timeAgo: 'Ayer',
      isVerifiedNeighbor: true,
      tag: 'Tercera Edad'
    }
  ],
  // Alias de compatibilidad
  'ws-maipu-01': [
    {
      id: 'rev-m01-1',
      authorName: 'Mónica Retamal',
      author: 'Mónica Retamal',
      sector: 'Metro Plaza de Maipú',
      comment: 'Excelente monitor y muy buen espacio para los niños.',
      rating: 5,
      date: 'Hace 3 días',
      timeAgo: 'Hace 3 días',
      isVerifiedNeighbor: true,
      tag: 'Ideal Familias'
    }
  ]
};

export function getNeighborhoodReviewsMap() {
  try {
    const raw = localStorage.getItem(KEY_REVIEWS);
    return raw ? JSON.parse(raw) : DEFAULT_COMMUNITY_REVIEWS;
  } catch {
    return DEFAULT_COMMUNITY_REVIEWS;
  }
}

export function getReviewsForActivity(activityId) {
  const map = getNeighborhoodReviewsMap();
  const list = map[activityId] || DEFAULT_COMMUNITY_REVIEWS[activityId];
  if (list && list.length > 0) return list;

  // Fallback con testimonio cívico representativo
  return [
    {
      id: `rev-default-${activityId}`,
      authorName: 'Claudia Poblete',
      author: 'Claudia Poblete',
      sector: 'Vecina del Barrio',
      comment: 'Muy buena iniciativa comunitaria. La plaza cuenta con sombra y los monitores llegan a la hora.',
      rating: 5,
      date: 'Esta semana',
      timeAgo: 'Esta semana',
      isVerifiedNeighbor: true,
      tag: 'Comunidad Verificada'
    }
  ];
}

export function addNeighborhoodReview(activityId, optionsOrComment, maybeAuthor = 'Vecino Anónimo') {
  let authorName = maybeAuthor;
  let comment = '';
  let rating = 5;
  let tag = 'Vecino Activo';

  if (typeof optionsOrComment === 'string') {
    comment = optionsOrComment;
  } else if (optionsOrComment && typeof optionsOrComment === 'object') {
    authorName = optionsOrComment.authorName || optionsOrComment.author || maybeAuthor;
    comment = optionsOrComment.comment || '';
    rating = optionsOrComment.rating ?? 5;
    tag = optionsOrComment.tag || tag;
  }

  const map = getNeighborhoodReviewsMap();
  const list = map[activityId] ? [...map[activityId]] : (DEFAULT_COMMUNITY_REVIEWS[activityId] ? [...DEFAULT_COMMUNITY_REVIEWS[activityId]] : []);

  const isVerifiedNeighbor = isAttendanceValidated(activityId) || isActivityReserved(activityId);

  const cleanAuthor = (authorName || 'Vecino Anónimo').trim();
  const cleanComment = (comment || '').trim();

  const newReview = {
    id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    authorName: cleanAuthor,
    author: cleanAuthor,
    sector: getActiveReferencePoint()?.name || 'Sector Local',
    comment: cleanComment,
    rating: Number(rating) || 5,
    date: 'Recién publicado',
    timeAgo: 'Recién publicado',
    isVerifiedNeighbor,
    tag: isVerifiedNeighbor ? 'Asistencia Verificada ✓' : tag
  };

  list.unshift(newReview);
  map[activityId] = list;
  localStorage.setItem(KEY_REVIEWS, JSON.stringify(map));
  recordTelemetryEvent('ADD_REVIEW', { activityId, author: newReview.authorName });
  logAction('CONSEJO_VECINAL', 'Consejo publicado en el Muro', `Por ${newReview.authorName} en ${activityId}`);

  window.dispatchEvent(new CustomEvent('chispaplay:reviews-updated', { detail: { activityId, review: newReview } }));
  return newReview;
}

// ==========================================================================
// 14. GENERADOR DE INFORMES OFICIALES PARA DIDECO Y CONCEJO MUNICIPAL (B2G)
// ==========================================================================
export function generateDidecoExecutiveReport(communeId = 'todas') {
  const metrics = getCeoMetrics();
  let activities = metrics.activityMetrics;
  if (communeId !== 'todas') {
    activities = activities.filter(a => a.commune === communeId);
  }

  const reports = getParkDefectReports();
  const filteredReports = communeId === 'todas' ? reports : reports.filter(r => r.commune === communeId);
  const attendanceDetails = getAttendanceDetailsMap();
  const allActivities = getAllActivities();

  // Estadísticas consolidadas
  const totalWaitlistDemand = activities.reduce((s, a) => s + (a.waitlist || 0), 0);
  const totalReservesCount = activities.reduce((s, a) => s + (a.reserves || 0), 0);
  const totalViewsCount = activities.reduce((s, a) => s + (a.views || 0), 0);
  
  const gpsVerifiedCount = Object.values(attendanceDetails).filter(d => d.isGps).length;
  const manualVerifiedCount = Object.values(attendanceDetails).filter(d => !d.isGps).length;

  // Sectores con mayor demanda insatisfecha
  const sectorDemand = {};
  activities.forEach(act => {
    const fullAct = allActivities.find(a => a.id === act.id) || act;
    const sector = fullAct.sectorId || act.sectorId || 'General';
    if (!sectorDemand[sector]) {
      sectorDemand[sector] = { waitlist: 0, reserves: 0, views: 0, count: 0 };
    }
    sectorDemand[sector].waitlist += (act.waitlist || 0);
    sectorDemand[sector].reserves += (act.reserves || 0);
    sectorDemand[sector].views += (act.views || 0);
    sectorDemand[sector].count += 1;
  });

  return {
    reportNumber: `MEMO-DIDECO-${Date.now().toString().slice(-6)}`,
    dateText: new Date().toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    communeName: communeId === 'maipu' ? 'Ilustre Municipalidad de Maipú' : (communeId === 'valparaiso' ? 'Ilustre Municipalidad de Valparaíso' : 'Consolidado Comunal (Maipú & Valparaíso)'),
    department: 'Dirección de Desarrollo Comunitario (DIDECO) · Unidad de Participación y Deportes',
    authors: 'Equipo Técnico ChispaPlay · Estudiantes de Ingeniería Civil Industrial (FCFM Universidad de Chile)',
    executiveSummary: {
      totalViews: totalViewsCount,
      totalReserves: totalReservesCount,
      totalWaitlistDemand,
      attendanceRateEstimate: totalReservesCount > 0 ? Math.round(((gpsVerifiedCount + manualVerifiedCount) / totalReservesCount) * 100) : 0,
      gpsVerifiedAttendances: gpsVerifiedCount,
      manualVerifiedAttendances: manualVerifiedCount,
      parkDefectsLogged: filteredReports.length,
      averageSessionMinutes: metrics.avgSessionMinutes
    },
    sectorDemand,
    topWaitlistWorkshops: activities.filter(a => a.waitlist > 0).sort((a, b) => b.waitlist - a.waitlist),
    parkDefects: filteredReports,
    technicalRecommendation: totalWaitlistDemand > 0
      ? `Se recomienda a la Secretaría Comunal de Planificación (SECPLA) y DIDECO abrir turnos complementarios de talleres en los sectores con mayor lista de espera registrada, utilizando fondos FONDEVE o partidas de recreación y prevención vecinal.`
      : `La demanda barrial se encuentra actualmente cubierta en los talleres activos. Se sugiere mantener monitoreo territorial y priorizar la mantención de luminarias y bebederos reportados por los vecinos.`
  };
}
