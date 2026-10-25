/* ==========================================================================
   ARCHIVO: js/config.js
   Configuración Centralizada de la Aplicación ChispaPlay
   ========================================================================== */

export const APP_CONFIG = {
  appName: 'ChispaPlay',
  version: '2.0.0',
  institution: 'Universidad de Chile · FCFM (Beauchef)',
  walkingMetersPerMinute: 80, // Regla de los 15 minutos (80 m/min ritmo familiar)

  // Claves de Almacenamiento Local (LocalStorage)
  storageKeys: {
    activeCommune: 'chispaplay_active_commune',
    activeRefPoint: 'chispaplay_active_ref_point',
    trackedUser: 'chispaplay_tracked_user',
    reservedIds: 'chispaplay_reserved_ids',
    actionLogs: 'chispaplay_action_logs',
    customActivities: 'chispaplay_custom_activities',
    coordinators: 'chispaplay_coordinators',
    activeCoordinator: 'chispaplay_active_coordinator',
    virtualIp: 'chispaplay_virtual_ip',
    hasOnboarded: 'chispaplay_has_onboarded',
    waitlist: 'chispaplay_waitlist',
    activityViews: 'chispaplay_activity_views',
    radarSubscribers: 'chispaplay_radar_subscribers',
    parkReports: 'chispaplay_park_reports',
    sessionAnalytics: 'chispaplay_session_analytics',
    telemetry: 'chispaplay_telemetry',
    validatedAttendance: 'chispaplay_validated_attendance',
    reviews: 'chispaplay_reviews',
    liveNotices: 'chispaplay_live_notices'
  },
  groundValidationPin: '4120', // PIN oficial para validar asistencia en terreno y reportes de plaza

  // Endpoints & Rutas de la Aplicación
  endpoints: {
    workshops: '/api/workshops',
    scraper: '/api/scraper/sync',
    audit: '/api/audit/log'
  },

  // Comunas Oficiales Soportadas
  supportedCommunes: [
    {
      id: 'maipu',
      name: 'Maipú',
      region: 'Santiago Poniente · RM',
      centerCoords: { lat: -33.5112, lng: -70.7578 }
    },
    {
      id: 'valparaiso',
      name: 'Valparaíso',
      region: 'Costa Central · V Región',
      centerCoords: { lat: -33.0470, lng: -71.6190 }
    }
  ],

  // Direcciones IP Virtuales Chilenas para Auditoría
  chileanIps: [
    '190.161.42.88 (VTR Santiago)',
    '200.83.19.14 (Entel Valparaíso)',
    '181.42.105.72 (Movistar Maipú)',
    '186.104.22.19 (GTD Manquehue)'
  ]
};
