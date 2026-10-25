export interface TrackedUser {
  token: string;
  ip: string;
  name: string;
  emailOrPhone: string;
  whatsapp?: string;
  contact?: string;
  registeredAt: string;
  totalActionsCount: number;
  lastActive: string;
  communeOrigin?: string;
}

export type ActionEventType =
  | 'BUSQUEDA'
  | 'FILTRO_CATEGORIA'
  | 'FILTRO_TIEMPO'
  | 'APERTURA_TARJETA'
  | 'RESERVA_CUPO'
  | 'CANCELACION_RESERVA'
  | 'CAMBIO_COMUNA'
  | 'CAMBIO_REFERENCIA'
  | 'VER_HISTORIA'
  | 'REGISTRO_USUARIO';

export interface UserActionLog {
  id: string;
  token: string;
  userName: string;
  userIp: string;
  eventType: ActionEventType;
  title: string;
  details: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

const STORAGE_KEY_USER = 'chispaplay_tracked_user';
const STORAGE_KEY_IP = 'chispaplay_virtual_ip';
const STORAGE_KEY_LOGS = 'chispaplay_action_logs';
const STORAGE_KEY_ALL_USERS = 'chispaplay_all_tracked_users';

// Chilean IP pool to simulate authentic ISP IPs (VTR, Entel, Movistar, GTD)
const CHILEAN_IPS = [
  '190.161.42.88 (VTR Santiago)',
  '200.83.19.14 (Entel Valparaíso)',
  '181.42.105.72 (Movistar Maipú)',
  '186.104.22.19 (GTD Manquehue)',
  '190.110.155.43 (Mundo Pacífico)'
];

// Seed realistic previous user sessions for CEO mode analytics
const SEED_TRACKED_USERS: TrackedUser[] = [
  {
    token: 'TOK-CHI-88214',
    ip: '190.161.42.88 (VTR Santiago)',
    name: 'Camila Pizarro Valdés',
    emailOrPhone: 'camila.pizarro@gmail.com',
    registeredAt: '2026-10-21 14:22',
    totalActionsCount: 9,
    lastActive: 'Hace 12 min',
    communeOrigin: 'Maipú'
  },
  {
    token: 'TOK-CHI-54109',
    ip: '200.83.19.14 (Entel Valparaíso)',
    name: 'Gonzalo Arévalo M.',
    emailOrPhone: '+56 9 8451 9201',
    registeredAt: '2026-10-21 15:40',
    totalActionsCount: 6,
    lastActive: 'Hace 28 min',
    communeOrigin: 'Valparaíso'
  },
  {
    token: 'TOK-CHI-31902',
    ip: '181.42.105.72 (Movistar Maipú)',
    name: 'Valeria Riquelme Soto',
    emailOrPhone: 'valeria.riquelme@outlook.cl',
    registeredAt: '2026-10-22 09:15',
    totalActionsCount: 14,
    lastActive: 'Hace 45 min',
    communeOrigin: 'Maipú'
  },
  {
    token: 'TOK-CHI-77412',
    ip: '186.104.22.19 (GTD Manquehue)',
    name: 'Nicolás Henríquez P.',
    emailOrPhone: '+56 9 7891 0003',
    registeredAt: '2026-10-22 11:30',
    totalActionsCount: 8,
    lastActive: 'Hace 1 hora',
    communeOrigin: 'Valparaíso'
  }
];

const SEED_ACTION_LOGS: UserActionLog[] = [
  {
    id: 'log-seed-1',
    token: 'TOK-CHI-88214',
    userName: 'Camila Pizarro Valdés',
    userIp: '190.161.42.88 (VTR Santiago)',
    eventType: 'CAMBIO_COMUNA',
    title: 'Selección de Comuna',
    details: 'Eligió Maipú · Referencia: Metro Plaza de Maipú',
    timestamp: '2026-10-21 14:23:10'
  },
  {
    id: 'log-seed-2',
    token: 'TOK-CHI-88214',
    userName: 'Camila Pizarro Valdés',
    userIp: '190.161.42.88 (VTR Santiago)',
    eventType: 'BUSQUEDA',
    title: 'Búsqueda en Vitrina',
    details: 'Término buscado: "skate infantil"',
    timestamp: '2026-10-21 14:24:02'
  },
  {
    id: 'log-seed-3',
    token: 'TOK-CHI-88214',
    userName: 'Camila Pizarro Valdés',
    userIp: '190.161.42.88 (VTR Santiago)',
    eventType: 'APERTURA_TARJETA',
    title: 'Apertura de Ficha Técnica',
    details: 'Abrió tarjeta: "Clínica de Skate Infantil & Robótica Urbana" (Parque Tres Poniente)',
    timestamp: '2026-10-21 14:24:45'
  },
  {
    id: 'log-seed-4',
    token: 'TOK-CHI-88214',
    userName: 'Camila Pizarro Valdés',
    userIp: '190.161.42.88 (VTR Santiago)',
    eventType: 'RESERVA_CUPO',
    title: 'Reserva Confirmada de Cupo',
    details: 'Reservó cupo en: "Clínica de Skate Infantil & Robótica Urbana"',
    timestamp: '2026-10-21 14:26:12'
  },
  {
    id: 'log-seed-5',
    token: 'TOK-CHI-54109',
    userName: 'Gonzalo Arévalo M.',
    userIp: '200.83.19.14 (Entel Valparaíso)',
    eventType: 'CAMBIO_COMUNA',
    title: 'Selección de Comuna',
    details: 'Eligió Valparaíso · Referencia: Cerro Alegre',
    timestamp: '2026-10-21 15:41:05'
  },
  {
    id: 'log-seed-6',
    token: 'TOK-CHI-54109',
    userName: 'Gonzalo Arévalo M.',
    userIp: '200.83.19.14 (Entel Valparaíso)',
    eventType: 'FILTRO_TIEMPO',
    title: 'Filtro Temporal',
    details: 'Filtro aplicado: "Hoy"',
    timestamp: '2026-10-21 15:42:19'
  },
  {
    id: 'log-seed-7',
    token: 'TOK-CHI-54109',
    userName: 'Gonzalo Arévalo M.',
    userIp: '200.83.19.14 (Entel Valparaíso)',
    eventType: 'APERTURA_TARJETA',
    title: 'Apertura de Ficha Técnica',
    details: 'Abrió tarjeta: "Pintura al Óleo y Paisajismo" (Paseo Yugoslavo)',
    timestamp: '2026-10-21 15:43:08'
  },
  {
    id: 'log-seed-8',
    token: 'TOK-CHI-31902',
    userName: 'Valeria Riquelme Soto',
    userIp: '181.42.105.72 (Movistar Maipú)',
    eventType: 'BUSQUEDA',
    title: 'Búsqueda en Vitrina',
    details: 'Término buscado: "astronomia templo votivo"',
    timestamp: '2026-10-22 09:16:30'
  },
  {
    id: 'log-seed-9',
    token: 'TOK-CHI-31902',
    userName: 'Valeria Riquelme Soto',
    userIp: '181.42.105.72 (Movistar Maipú)',
    eventType: 'RESERVA_CUPO',
    title: 'Reserva Confirmada de Cupo',
    details: 'Reservó cupo en: "Huerto Agroecológico & Semillas Nativas" (Explanada Templo Votivo)',
    timestamp: '2026-10-22 09:18:04'
  }
];

export function getVisitorVirtualIp(): string {
  try {
    const existing = localStorage.getItem(STORAGE_KEY_IP);
    if (existing) return existing;
    const randomIp = CHILEAN_IPS[Math.floor(Math.random() * CHILEAN_IPS.length)];
    localStorage.setItem(STORAGE_KEY_IP, randomIp);
    return randomIp;
  } catch {
    return CHILEAN_IPS[0];
  }
}

export function getCurrentTrackedUser(): TrackedUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function registerTrackedUser(name: string, emailOrPhone: string, communeOrigin = 'Maipú'): TrackedUser {
  const token = `TOK-CHI-${Math.floor(10000 + Math.random() * 90000)}`;
  const ip = getVisitorVirtualIp();
  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

  const newUser: TrackedUser = {
    token,
    ip,
    name: name.trim(),
    emailOrPhone: emailOrPhone.trim(),
    registeredAt: now,
    totalActionsCount: 1,
    lastActive: 'En línea ahora',
    communeOrigin
  };

  try {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));

    // Save to users list
    const all = getAllTrackedUsers();
    localStorage.setItem(STORAGE_KEY_ALL_USERS, JSON.stringify([newUser, ...all.filter(u => u.token !== newUser.token)]));
  } catch (err) {
    console.error('Error saving tracked user:', err);
  }

  // Log registration event
  logUserAction('REGISTRO_USUARIO', 'Registro de Vecino / Pase Digital', `Vecino: ${name} (${emailOrPhone}) · Token: ${token} asignado a IP: ${ip}`, { user: newUser });

  return newUser;
}

export function getAllTrackedUsers(): TrackedUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ALL_USERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_ALL_USERS, JSON.stringify(SEED_TRACKED_USERS));
      return SEED_TRACKED_USERS;
    }
    const parsed = JSON.parse(raw);
    return parsed.length > 0 ? parsed : SEED_TRACKED_USERS;
  } catch {
    return SEED_TRACKED_USERS;
  }
}

export function getAllActionLogs(): UserActionLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(SEED_ACTION_LOGS));
      return SEED_ACTION_LOGS;
    }
    const parsed = JSON.parse(raw);
    return parsed.length > 0 ? parsed : SEED_ACTION_LOGS;
  } catch {
    return SEED_ACTION_LOGS;
  }
}

export function logUserAction(
  eventType: ActionEventType,
  title: string,
  details: string,
  metadata?: Record<string, any>
): UserActionLog {
  const currentUser = getCurrentTrackedUser();
  const token = currentUser ? currentUser.token : 'VISITANTE-VITRINA';
  const userName = currentUser ? currentUser.name : 'Visitante Vitrina Libre';
  const userIp = getVisitorVirtualIp();
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

  const logEntry: UserActionLog = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    token,
    userName,
    userIp,
    eventType,
    title,
    details,
    timestamp,
    metadata
  };

  try {
    const existingLogs = getAllActionLogs();
    const updatedLogs = [logEntry, ...existingLogs].slice(0, 100); // keep last 100 logs
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(updatedLogs));

    // Update current user total actions count
    if (currentUser) {
      currentUser.totalActionsCount = (currentUser.totalActionsCount || 1) + 1;
      currentUser.lastActive = 'En línea ahora';
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));

      const allUsers = getAllTrackedUsers();
      const updatedUsers = allUsers.map(u => u.token === currentUser.token ? currentUser : u);
      localStorage.setItem(STORAGE_KEY_ALL_USERS, JSON.stringify(updatedUsers));
    }
  } catch (err) {
    console.error('Error logging user action:', err);
  }

  return logEntry;
}

export function clearTrackingAudit(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_LOGS);
    localStorage.removeItem(STORAGE_KEY_ALL_USERS);
    localStorage.setItem(STORAGE_KEY_ALL_USERS, JSON.stringify(SEED_TRACKED_USERS));
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(SEED_ACTION_LOGS));
  } catch (err) {
    console.error('Error resetting logs:', err);
  }
}
