/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { 
  CHILE_NEIGHBORHOODS, 
  INITIAL_WORKSHOPS, 
  INITIAL_INCIDENTS, 
  INITIAL_USER_STREAK,
  COMMUNE_REFERENCE_POINTS,
  calculateProximity
} from './data/mockData';
import { 
  MAIPU_REAL_WORKSHOPS, 
  VALPARAISO_REAL_WORKSHOPS 
} from './data/communeWorkshops';
import { 
  Neighborhood, 
  Workshop, 
  IncidentReport, 
  UserStreakProfile,
  ActiveCommune,
  ReferencePoint,
  CoordinatorProfile
} from './types';
import { Header } from './components/Header';
import { WorkshopCard } from './components/WorkshopCard';
import { WorkshopDetailModal } from './components/WorkshopDetailModal';
import { AttendanceValidationModal } from './components/AttendanceValidationModal';
import { DirectEventChatModal } from './components/DirectEventChatModal';
import { StreakDrawer } from './components/StreakDrawer';
import { NewIncidentModal } from './components/NewIncidentModal';
import { NewWorkshopModal } from './components/NewWorkshopModal';
import { CoordinatorRegistrationModal } from './components/CoordinatorRegistrationModal';
import { UserRegistrationModal } from './components/UserRegistrationModal';
import { InstagramStoriesBar } from './components/InstagramStoriesBar';
import { AiInstagramCrawlerModal } from './components/AiInstagramCrawlerModal';
import { AdminModeModal } from './components/AdminModeModal';
import { ThingsToDoInCommune, RankedCarteleraItem } from './components/ThingsToDoInCommune';
import { LocationOnboardingModal } from './components/LocationOnboardingModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { SecurityEmergencyModal } from './components/SecurityEmergencyModal';
import { SecurityGuideModal } from './components/SecurityGuideModal';
import { PaseVecinalModal } from './components/PaseVecinalModal';
import { 
  getCurrentTrackedUser, 
  logUserAction, 
  TrackedUser 
} from './utils/userTracker';
import { 
  Search, 
  Check, 
  MapPin, 
  VolumeX, 
  Flame, 
  X as CloseIcon, 
  Sparkles, 
  Clock, 
  Navigation, 
  Lock,
  ShieldCheck,
  Building2,
  Trash2
} from 'lucide-react';

export default function App() {
  // Hyper-localized pilot communes: Maipú and Valparaíso (Rule 1)
  const [activeCommune, setActiveCommune] = useState<ActiveCommune>('maipu');
  const [referencePoint, setReferencePoint] = useState<ReferencePoint>(COMMUNE_REFERENCE_POINTS.maipu[0]);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(() => {
    return !sessionStorage.getItem('chispaplay_onboarded');
  });

  // Current neighborhood synced with active commune
  const maipuDefault = CHILE_NEIGHBORHOODS.find(n => n.id === 'maipu') || CHILE_NEIGHBORHOODS[0];
  const [currentNeighborhood, setCurrentNeighborhood] = useState<Neighborhood>(maipuDefault);
  const [isMonitor, setIsMonitor] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [isAiCrawlerModalOpen, setIsAiCrawlerModalOpen] = useState<boolean>(false);
  const [aiScrapperInitialQuery, setAiScrapperInitialQuery] = useState<string>('');
  const [coordinatorPublishedIds, setCoordinatorPublishedIds] = useState<string[]>([]);

  // Coordinator Profile State (Editable and Switchable)
  const [isCoordinatorRegModalOpen, setIsCoordinatorRegModalOpen] = useState(false);
  const [coordinatorProfile, setCoordinatorProfile] = useState<CoordinatorProfile>({
    id: 'coord-active',
    organizationName: 'Junta de Vecinos N° 24 Parque Tres Poniente',
    legalEntityNumber: 'PJ N° 389-Maipú',
    managerName: 'Claudio Morales Soto',
    whatsappPhone: '+56 9 7891 0001',
    commune: 'maipu',
    verified: true,
    registeredAt: '2026-10-15'
  });

  // Custom live published activities in Ranking
  const [customRankedActivities, setCustomRankedActivities] = useState<RankedCarteleraItem[]>([]);

  // User Registration Modal State (Virtual tracking token by IP)
  const [isUserRegModalOpen, setIsUserRegModalOpen] = useState(false);
  const [pendingTargetWorkshop, setPendingTargetWorkshop] = useState<Workshop | null>(null);

  // Entities state: combine 10 Maipú + 10 Valparaíso real workshops with initial dataset
  const initialAllWorkshops = useMemo(() => {
    const combined = [...MAIPU_REAL_WORKSHOPS, ...VALPARAISO_REAL_WORKSHOPS, ...INITIAL_WORKSHOPS];
    const seen = new Set<string>();
    return combined.filter(w => {
      if (seen.has(w.id)) return false;
      seen.add(w.id);
      return true;
    });
  }, []);

  const [workshops, setWorkshops] = useState<Workshop[]>(initialAllWorkshops);
  const [incidents, setIncidents] = useState<IncidentReport[]>(INITIAL_INCIDENTS);
  const [streakProfile, setStreakProfile] = useState<UserStreakProfile>(INITIAL_USER_STREAK);

  // Filter States: Cleaned up as requested (no amigos, no plazas de bolsillo, no archivo)
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [timeFilter, setTimeFilter] = useState<'todos' | 'proximos' | 'hoy'>('todos');
  const [only500mFilter, setOnly500mFilter] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyInclusiveFilter, setOnlyInclusiveFilter] = useState<boolean>(false);

  // Modals State
  const [selectedWorkshopForDetail, setSelectedWorkshopForDetail] = useState<Workshop | null>(null);
  const [selectedWorkshopForAttendance, setSelectedWorkshopForAttendance] = useState<Workshop | null>(null);
  const [selectedWorkshopForChat, setSelectedWorkshopForChat] = useState<Workshop | null>(null);
  const [targetWorkshopForSafety, setTargetWorkshopForSafety] = useState<{ id: string; title: string } | null>(null);
  const [isStreakDrawerOpen, setIsStreakDrawerOpen] = useState(false);
  const [isNewIncidentModalOpen, setIsNewIncidentModalOpen] = useState(false);
  const [isNewWorkshopModalOpen, setIsNewWorkshopModalOpen] = useState(false);
  const [isSecurityEmergencyModalOpen, setIsSecurityEmergencyModalOpen] = useState(false);
  const [isSecurityGuideModalOpen, setIsSecurityGuideModalOpen] = useState(false);
  const [isPaseVecinalModalOpen, setIsPaseVecinalModalOpen] = useState(false);
  const [mobileActiveTab, setMobileActiveTab] = useState('inicio');
  const [hasNewWorkshops, setHasNewWorkshops] = useState<boolean>(() => {
    return localStorage.getItem('chispaplay_cartelera_seen') !== 'true';
  });

  // DEDICATED TEST WORKSHOP WITH CONFIRMED ATTENDANCE FOR IMMEDIATE SAFETY COMPLAINT TESTING
  const testAttendedWorkshop: Workshop = useMemo(() => ({
    id: 'ws-prueba-denuncia',
    title: 'Taller de Prueba Comunitaria (Asistencia Ya Confirmada)',
    category: 'Deporte & Juegos Tradicionales',
    neighborhoodId: currentNeighborhood.id,
    ageGroup: 'Para toda la familia y vecinos',
    organizer: {
      id: 'org-test',
      name: 'Coordinación Barrial de Seguridad & Familias',
      type: 'JJVV',
      verified: true,
      legalEntityNumber: currentNeighborhood.legalJjvvCode,
      registrationBody: 'Municipalidad Acreditada',
      phone: '+56 9 7654 3210',
      whatsapp: '56976543210',
      email: 'seguridad.prueba@chispaplay.cl',
      avatar: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=150&auto=format&fit=crop&q=80'
    },
    instructorName: 'Monitor Comunitario Oficial',
    instructorRole: 'Facilitador Territorial Acreditado',
    instructorWhatsapp: '56976543210',
    locationName: `Sede Social Central (${currentNeighborhood.displayName})`,
    address: `${currentNeighborhood.sectorOBarrio}, Plaza Central`,
    schedule: 'En Curso · Asistencia Presencial Registrada',
    nextDate: 'Hoy',
    timeSlot: '10:00 - 12:00 hrs',
    duration: '2h',
    capacity: 30,
    enrolledUsers: [
      {
        id: 'me-test-user',
        name: streakProfile.name,
        familyMembersCount: 2,
        avatar: streakProfile.avatar,
        isMe: true,
        attended: true,
        checkInTime: '10:15 hrs (Validado ✓)',
        role: 'familia'
      },
      {
        id: 'fr-test-1',
        name: 'Camila Pizarro',
        familyMembersCount: 2,
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
        attended: true,
        checkInTime: '10:12 hrs',
        role: 'familia',
        isFriend: true
      }
    ],
    description: 'Cartelera de demostración oficial en la que tu asistencia ya se encuentra validada. Úsala para probar el Botón de Seguridad y despacho silencioso de alertas a vecinos guardianes.',
    materialsProvided: true,
    isFree: true,
    safetyAdvisory: 'Espacio protegido con monitores vecinales y protocolo de alerta preventiva.',
    safeRouteGuide: 'Ruta iluminada con vigilancia de guardianes.',
    directChat: {
      instructorName: 'Monitor Comunitario',
      instructorPhone: '+56 9 7654 3210',
      whatsappDirectNumber: '56976543210',
      whatsappDirectLink: 'https://wa.me/56976543210',
      inAppChatAvailable: true
    },
    activeCheckIn: true,
    checkInPin: '5678',
    tags: ['Prueba', 'Seguridad', 'Comunidad'],
    imageUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&auto=format&fit=crop&q=80',
    inclusivity: {
      isInclusive: true,
      neurodivergentFriendly: true,
      wheelchairAccessible: true,
      signLanguageAvailable: false,
      languages: ['Español'],
      familyRestrooms: true
    },
    vigencia: 'verde',
    spaceType: 'hardware_plaza',
    rating: 5.0,
    reviewsCount: 19,
    sourceType: 'organizador_verificado',
    verifiedLegalEntity: true,
    interestedCount: 42,
    goingCount: 24,
    distanceMeters: 180
  }), [currentNeighborhood, streakProfile]);

  // Toast feedback state for silent push
  const [silentPushToast, setSilentPushToast] = useState<{
    title: string;
    location: string;
    guardiansCount: number;
    guardians: { name: string; streakWeeks: number }[];
  } | null>(null);

  // Available workshops in current commune
  const neighborhoodWorkshops = useMemo(() => {
    return [
      testAttendedWorkshop,
      ...workshops.filter(w => w.neighborhoodId === currentNeighborhood.id)
    ];
  }, [workshops, currentNeighborhood.id, testAttendedWorkshop]);

  // Filtered workshops based on cleaned up real-time filters (no amigos, no archivo)
  const filteredWorkshops = neighborhoodWorkshops.filter((w) => {
    // Category filter
    if (selectedCategory !== 'todos' && w.category !== selectedCategory) {
      return false;
    }

    // Search query filter
    const matchesSearch = 
      w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.ageGroup.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.inclusivity.languages.some(l => l.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Inclusive filter
    const matchesInclusive = !onlyInclusiveFilter || (
      w.inclusivity.isInclusive && w.inclusivity.neurodivergentFriendly
    );

    // Time filter (Cleaned: no vivo, no bolsillo, no archivo)
    const matchesTime = (() => {
      if (timeFilter === 'todos') return true;
      if (timeFilter === 'proximos') return w.vigencia === 'naranja';
      if (timeFilter === 'hoy') return w.vigencia === 'verde' || w.vigencia === 'naranja' || w.vigencia === 'rojo';
      return true;
    })();

    // Proximity 500m filter
    const matches500m = !only500mFilter || (
      (w.distanceMeters ?? 400) <= 500
    );

    return matchesSearch && matchesInclusive && matchesTime && matches500m;
  });

  // Location & Reference Point selection handler (Rule 1)
  const handleSelectLocation = (commune: ActiveCommune, refPoint: ReferencePoint) => {
    setActiveCommune(commune);
    setReferencePoint(refPoint);
    sessionStorage.setItem('chispaplay_onboarded', 'true');
    const matched = CHILE_NEIGHBORHOODS.find(n => n.id === commune);
    if (matched) {
      setCurrentNeighborhood(matched);
    }
    logUserAction(
      'CAMBIO_COMUNA',
      'Selección de Comuna y Punto de Referencia',
      `Comuna: ${commune === 'maipu' ? 'Maipú' : 'Valparaíso'} · Referencia: ${refPoint.name}`
    );
  };

  // Execute actual toggle RSVP
  const executeRSVP = (workshopId: string, userName?: string) => {
    const isCurrentlyEnrolled = enrolledWorkshopIds.includes(workshopId);

    setWorkshops((prev) =>
      prev.map((ws) => {
        if (ws.id !== workshopId) return ws;
        const isEnrolled = ws.enrolledUsers.some((u) => u.isMe);
        if (isEnrolled) {
          return {
            ...ws,
            enrolledUsers: ws.enrolledUsers.filter((u) => !u.isMe)
          };
        } else {
          const newEnrollment = {
            id: `me-${Date.now()}`,
            name: userName || streakProfile.name,
            familyMembersCount: 2,
            avatar: streakProfile.avatar,
            isMe: true,
            attended: false,
            role: 'familia' as const
          };
          return {
            ...ws,
            enrolledUsers: [...ws.enrolledUsers, newEnrollment]
          };
        }
      })
    );

    if (isCurrentlyEnrolled) {
      setStreakProfile(prev => ({
        ...prev,
        weekDays: prev.weekDays.map(d => d.isToday ? { ...d, attended: false } : d)
      }));
      logUserAction('CANCELACION_RESERVA', 'Cancelación de Reserva', `Usuario liberó su cupo en taller ID ${workshopId}`);
    } else {
      setStreakProfile(prev => ({
        ...prev,
        weekDays: prev.weekDays.map(d => d.isToday ? { ...d, attended: true, workshopName: 'Taller Confirmado' } : d)
      }));
      logUserAction('RESERVA_CUPO', 'Reserva Confirmada de Cupo', `Vecino ${userName || 'registrado'} confirmó cupo en taller ID ${workshopId}`);
    }
  };

  // Handlers: Vitrina libre -> requiere registro al reservar cupo
  const handleToggleRSVP = (workshopId: string) => {
    const currentUser = getCurrentTrackedUser();
    const targetWs = workshops.find(w => w.id === workshopId) || testAttendedWorkshop;

    if (!currentUser) {
      setPendingTargetWorkshop(targetWs);
      setIsUserRegModalOpen(true);
      logUserAction('BUSQUEDA', 'Intento de Reserva Sin Registro en Vitrina', `Visitante intentó reservar cupo en "${targetWs?.title || workshopId}"`, { workshopId });
      return;
    }

    executeRSVP(workshopId, currentUser.name);
  };

  // Called after successful user registration modal
  const handleUserRegisteredSuccess = (user: TrackedUser) => {
    if (pendingTargetWorkshop) {
      executeRSVP(pendingTargetWorkshop.id, user.name);
      setPendingTargetWorkshop(null);
    }
  };

  const handleConfirmAttendance = (workshopId: string) => {
    setWorkshops((prev) =>
      prev.map((ws) => {
        if (ws.id !== workshopId) return ws;
        return {
          ...ws,
          enrolledUsers: ws.enrolledUsers.map((u) => {
            if (u.isMe) {
              return {
                ...u,
                attended: true,
                checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              };
            }
            return u;
          })
        };
      })
    );

    setStreakProfile((prev) => ({
      ...prev,
      totalWorkshopsAttended: prev.totalWorkshopsAttended + 1,
      streakDaysCurrentWeek: prev.streakDaysCurrentWeek + 1
    }));
  };

  const handleToggleAttendeeStatus = (workshopId: string, attendeeId: string) => {
    setWorkshops((prev) =>
      prev.map((ws) => {
        if (ws.id !== workshopId) return ws;
        return {
          ...ws,
          enrolledUsers: ws.enrolledUsers.map((u) => {
            if (u.id === attendeeId) {
              return {
                ...u,
                attended: !u.attended,
                checkInTime: !u.attended
                  ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : undefined
              };
            }
            return u;
          })
        };
      })
    );
  };

  const handleCreateIncident = (
    newIncidentData: Omit<IncidentReport, 'id' | 'timestamp' | 'upvotes' | 'commentsCount' | 'solved'>
  ) => {
    const newIncident: IncidentReport = {
      ...newIncidentData,
      id: `inc-${Date.now()}`,
      timestamp: 'Recién reportado',
      upvotes: 1,
      hasUpvoted: true,
      commentsCount: 0,
      solved: false
    };
    setIncidents([newIncident, ...incidents]);

    if (newIncidentData.silentPushSent && newIncidentData.notifiedGuardians && newIncidentData.notifiedGuardians.length > 0) {
      setSilentPushToast({
        title: newIncidentData.title,
        location: newIncidentData.location,
        guardiansCount: newIncidentData.notifiedGuardiansCount || newIncidentData.notifiedGuardians.length,
        guardians: newIncidentData.notifiedGuardians
      });
      setTimeout(() => {
        setSilentPushToast(null);
      }, 9000);
    }
  };

  // Publicar Nueva Actividad (100% Funcional en Grilla y en Ranking)
  const handleCreateWorkshop = (newWs: Workshop, timeframe: 'hoy' | 'semana' | 'mes' = 'hoy') => {
    setWorkshops(prev => [newWs, ...prev]);
    setCoordinatorPublishedIds(prev => [newWs.id, ...prev]);

    // Insert into ranking
    const rankedItem: RankedCarteleraItem = {
      id: newWs.id,
      rank: 1,
      title: newWs.title,
      organizerName: newWs.organizer.name,
      organizerHandle: `@${newWs.organizer.name.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 16)}`,
      categoryTag: newWs.category.toUpperCase(),
      highlightBadge: 'NUEVA CONVOCATORIA',
      schedule: newWs.schedule,
      locationName: newWs.locationName,
      address: newWs.address,
      summary: newWs.description,
      imageUrl: newWs.imageUrl,
      participantsCount: 1,
      isFree: newWs.isFree,
      timeframe,
      availableSpots: newWs.capacity,
      walkingMinutes: 5,
      distanceMeters: 400,
      coordinates: newWs.coordinates
    };

    setCustomRankedActivities(prev => [rankedItem, ...prev]);

    logUserAction(
      'REGISTRO_USUARIO',
      'Publicación de Nueva Actividad en Vivo',
      `Taller: "${newWs.title}" en ${newWs.locationName} (${newWs.schedule}) · Publicado por: ${newWs.organizer.name}`,
      { workshopId: newWs.id }
    );
  };

  // Eliminar actividad desde panel coordinador
  const handleDeleteWorkshop = (workshopId: string) => {
    setWorkshops(prev => prev.filter(w => w.id !== workshopId));
    setCustomRankedActivities(prev => prev.filter(r => r.id !== workshopId));
    setCoordinatorPublishedIds(prev => prev.filter(id => id !== workshopId));
    logUserAction(
      'CANCELACION_RESERVA',
      'Eliminación de Actividad por Coordinador',
      `Taller eliminado: ID ${workshopId}`,
      { workshopId }
    );
  };

  // Guardar perfil de coordinador actualizado
  const handleSaveCoordinatorProfile = (profile: CoordinatorProfile) => {
    setCoordinatorProfile(profile);
    if (profile.commune !== activeCommune) {
      setActiveCommune(profile.commune);
      const matched = CHILE_NEIGHBORHOODS.find(n => n.id === profile.commune);
      if (matched) {
        setCurrentNeighborhood(matched);
      }
    }
  };

  // Track search changes
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query.trim().length >= 3) {
      logUserAction('BUSQUEDA', 'Búsqueda en Vitrina Comunitaria', `Término buscado: "${query.trim()}" en ${currentNeighborhood.displayName}`);
    }
  };

  // Track card opens
  const handleOpenWorkshopDetails = (ws: Workshop) => {
    setSelectedWorkshopForDetail(ws);
    logUserAction('APERTURA_TARJETA', 'Apertura de Ficha Técnica de Taller', `Tarjeta abierta: "${ws.title}" (${ws.locationName})`);
  };

  const coordinatorWorkshopsCount = useMemo(() => {
    return workshops.filter(w => w.organizer.type === 'JJVV' || coordinatorPublishedIds.includes(w.id)).length;
  }, [workshops, coordinatorPublishedIds]);

  const enrolledWorkshopIds = useMemo(() => {
    return workshops.filter(w => w.enrolledUsers.some(u => u.isMe)).map(w => w.id);
  }, [workshops]);

  const handleOpenEventSafety = (workshop: Workshop) => {
    const isEnrolledAndAttended = workshop.enrolledUsers.some(u => u.isMe && u.attended);
    if (!isEnrolledAndAttended && !isMonitor && workshop.id !== 'ws-prueba-denuncia') {
      setSelectedWorkshopForAttendance(workshop);
      return;
    }
    setTargetWorkshopForSafety({ id: workshop.id, title: workshop.title });
    setIsNewIncidentModalOpen(true);
  };

  const handleShareStreakWhatsApp = (weeks: number) => {
    const text = `🔥 ¡Vecinos! Llevamos una racha de *${weeks} semanas seguidas* participando en los talleres de ${currentNeighborhood.displayName} en ChispaPlay.\nhttps://chispaplay.cl`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  const handleOpenAiCrawlerWithQuery = (prompt: string) => {
    setAiScrapperInitialQuery(prompt);
    setIsAiCrawlerModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8F8F6] text-neutral-900 flex flex-col font-sans pb-16 selection:bg-[#DC2626] selection:text-white">
      
      {/* Header: Time Out London Editorial Masthead */}
      <Header
        isMonitor={isMonitor}
        onToggleRole={() => setIsMonitor(!isMonitor)}
        streakProfile={streakProfile}
        onOpenStreakDrawer={() => setIsStreakDrawerOpen(true)}
        onOpenNewWorkshopModal={() => setIsNewWorkshopModalOpen(true)}
        onOpenAiCrawler={() => {
          setAiScrapperInitialQuery('');
          setIsAiCrawlerModalOpen(true);
        }}
        currentCommune={activeCommune}
        referencePoint={referencePoint}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        enrolledCount={enrolledWorkshopIds.length}
        onOpenReservations={() => setIsStreakDrawerOpen(true)}
      />

      {/* 1. BANNER DE CONTROL DE COORDINADOR DE ALTO CONTRASTE */}
      {isMonitor && (
        <aside aria-label="Panel de Coordinador" className="bg-[#0F2942] text-white border-b-2 border-neutral-900 py-3.5 px-4 sm:px-6 shadow-sm">
          <div className="max-w-7xl mx-auto space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#10B981] text-white flex items-center justify-center font-bold text-sm shrink-0">
                  ✓
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-extrabold uppercase tracking-tight text-white flex items-center gap-2 flex-wrap">
                    <span>Modo Coordinador Activo</span>
                    <span className="text-white/40">·</span>
                    <span className="text-[#10B981] font-mono">
                      {coordinatorProfile.organizationName} ({coordinatorProfile.legalEntityNumber})
                    </span>
                  </div>
                  <div className="text-[11px] text-blue-200 font-mono mt-0.5">
                    Monitor Encargado: <strong>{coordinatorProfile.managerName}</strong> · WhatsApp: <strong>{coordinatorProfile.whatsappPhone}</strong> · Comuna: <strong>{coordinatorProfile.commune === 'maipu' ? 'Maipú' : 'Valparaíso'}</strong>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-start md:self-auto flex-wrap">
                {/* Botón para cambiar o registrarse por primera vez como nuevo coordinador */}
                <button
                  onClick={() => setIsCoordinatorRegModalOpen(true)}
                  className="py-1.5 px-3 bg-white/10 hover:bg-white/20 text-white font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer border border-white/20 flex items-center gap-1.5"
                  title="Editar o registrar una nueva organización / JJVV"
                >
                  <Building2 className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>+ Registrarme como Nuevo Coordinador</span>
                </button>

                <div className="px-3 py-1.5 bg-white/10 border border-white/20 font-mono text-xs text-white flex items-center gap-2">
                  <span className="text-[#10B981] font-bold">●</span>
                  <span>Publicados: <strong>{coordinatorWorkshopsCount}</strong></span>
                </div>

                {/* Botón Principal: Publicar Nueva Actividad */}
                <button
                  onClick={() => setIsNewWorkshopModalOpen(true)}
                  className="py-1.5 px-4 bg-[#E11D48] hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider transition-colors cursor-pointer border border-white/20 flex items-center gap-1.5 shadow-xs"
                >
                  <span>+ Publicar Nueva Actividad en {currentNeighborhood.displayName}</span>
                </button>
              </div>
            </div>

            {/* Listado en vivo de actividades publicadas por este coordinador con opción Eliminar */}
            {coordinatorPublishedIds.length > 0 && (
              <div className="pt-2 border-t border-white/10 text-xs font-mono space-y-1.5">
                <span className="text-blue-200 uppercase font-bold text-[10px] tracking-wider block">
                  Mis Actividades Publicadas en Vivo (Visibles en Grilla y Ranking):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {workshops.filter(w => coordinatorPublishedIds.includes(w.id)).map((ws) => (
                    <div key={ws.id} className="bg-white/10 p-2.5 border border-white/15 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="font-sans font-bold text-white truncate block text-xs">{ws.title}</span>
                        <span className="text-[10px] text-blue-200 truncate block mt-0.5">📍 {ws.locationName} · {ws.schedule}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteWorkshop(ws.id)}
                        className="py-1 px-2.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                        title="Eliminar actividad en tiempo real de la cartelera y el ranking"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Eliminar</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-8">
        
        {/* SECCIÓN 1 (ARRIBA): RANKING EDITORIAL CON CARRUSEL ANIMADO ("Qué hacer en [Comuna]") */}
        <ThingsToDoInCommune
          currentNeighborhood={currentNeighborhood}
          onOpenWorkshopDetails={(id) => {
            const found = workshops.find(w => w.id === id);
            if (found) handleOpenWorkshopDetails(found);
          }}
          onToggleRSVP={(id) => handleToggleRSVP(id)}
          enrolledWorkshopIds={enrolledWorkshopIds}
          onOpenAiScrapperWithPrompt={handleOpenAiCrawlerWithQuery}
          userReferencePoint={referencePoint}
          customRankedItems={customRankedActivities}
        />

        {/* SECCIÓN 2 (CENTRO): HISTORIAS DE LA SEMANA */}
        <InstagramStoriesBar
          workshops={neighborhoodWorkshops}
          currentCommuneName={currentNeighborhood.displayName}
          onSelectWorkshop={(ws) => handleOpenWorkshopDetails(ws)}
          onOpenAiCrawler={() => {
            setAiScrapperInitialQuery('');
            setIsAiCrawlerModalOpen(true);
          }}
        />

        {/* SECCIÓN 3 (ABAJO): GRILLA COMPLETA DE ACTIVIDADES COMUNALES */}
        <div className="space-y-4 pt-2">
          <div className="bg-white p-4 sm:p-5 border border-neutral-200 space-y-4 rounded-none">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-neutral-900 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#E11D48] inline-block" />
                <h2 className="font-extrabold text-lg sm:text-xl uppercase tracking-tight text-neutral-950">
                  Cartelera de Actividades & Convocatorias
                </h2>
                <span className="text-xs text-neutral-500 font-mono hidden md:inline">
                  / {currentNeighborhood.displayName}
                </span>
              </div>

              {/* Reference point pill */}
              <div className="text-xs font-mono text-neutral-600 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#E11D48]" />
                <span>Referencia: <strong className="text-neutral-950">{referencePoint.name}</strong></span>
                <button
                  onClick={() => setIsLocationModalOpen(true)}
                  className="text-[#E11D48] underline font-bold uppercase text-[10px] cursor-pointer hover:text-neutral-900 transition-colors"
                >
                  Cambiar
                </button>
              </div>
            </div>

            {/* Filter Options & Search Row (No amigos, solo filtros útiles) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setTimeFilter('todos')}
                  className={`py-1.5 px-3 text-xs font-extrabold uppercase tracking-wider transition-colors cursor-pointer rounded-none border ${
                    timeFilter === 'todos'
                      ? 'bg-neutral-950 text-white border-neutral-950'
                      : 'bg-white hover:bg-neutral-100 text-neutral-800 border-neutral-300'
                  }`}
                >
                  <span>Todos ({neighborhoodWorkshops.length})</span>
                </button>

                <button
                  onClick={() => setTimeFilter('hoy')}
                  className={`py-1.5 px-3 text-xs font-extrabold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer rounded-none border ${
                    timeFilter === 'hoy'
                      ? 'bg-neutral-950 text-white border-neutral-950'
                      : 'bg-white hover:bg-neutral-100 text-neutral-800 border-neutral-300'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Hoy</span>
                </button>

                {/* Proximity <500m toggle */}
                <button
                  onClick={() => setOnly500mFilter(!only500mFilter)}
                  className={`py-1.5 px-3 text-xs font-extrabold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer rounded-none border ${
                    only500mFilter
                      ? 'bg-neutral-950 text-white border-neutral-950'
                      : 'bg-white text-neutral-800 border-neutral-300 hover:bg-neutral-100'
                  }`}
                  title="Filtro de proximidad: actividades a menos de 500 metros"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>&lt; 500m</span>
                  {only500mFilter && <Check className="w-3.5 h-3.5" />}
                </button>

                {/* Only Inclusive Filter */}
                <button
                  onClick={() => setOnlyInclusiveFilter(!onlyInclusiveFilter)}
                  className={`py-1.5 px-3 text-xs font-extrabold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 rounded-none border ${
                    onlyInclusiveFilter
                      ? 'bg-[#E11D48] text-white border-[#E11D48]'
                      : 'bg-white border-neutral-300 text-neutral-800 hover:bg-neutral-100'
                  }`}
                >
                  <span>🧩 Inclusivo</span>
                  {onlyInclusiveFilter && <Check className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Search input with live tracking */}
              <div className="relative w-full md:w-72 shrink-0">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Buscar actividad o plaza..."
                  className="w-full text-xs py-2 pl-8 pr-3 bg-white border border-neutral-300 focus:border-neutral-900 focus:outline-none text-neutral-900 font-mono placeholder:text-neutral-400 rounded-none transition-colors"
                />
              </div>
            </div>

            {/* WORKSHOP CARDS GRID: 4 CLEAN LEVELS WITH ANIMATE-FADE-IN */}
            {filteredWorkshops.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                {filteredWorkshops.map((workshop) => {
                  const proximity = calculateProximity(referencePoint.coordinates, workshop.coordinates);
                  return (
                    <WorkshopCard
                      key={workshop.id}
                      workshop={workshop}
                      isMonitor={isMonitor}
                      eventIncidents={incidents.filter(i => i.workshopId === workshop.id)}
                      onOpenDetails={(ws) => handleOpenWorkshopDetails(ws)}
                      onOpenAttendance={(ws) => setSelectedWorkshopForAttendance(ws)}
                      onOpenDirectChat={(ws) => setSelectedWorkshopForChat(ws)}
                      onToggleRSVP={(id) => handleToggleRSVP(id)}
                      onOpenEventSafetyReport={(ws) => handleOpenEventSafety(ws)}
                      isNewCoordinatorWorkshop={coordinatorPublishedIds.includes(workshop.id)}
                      calculatedDistanceText={proximity.text}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="bg-white border border-neutral-200 p-12 text-center space-y-3 rounded-none">
                <div className="text-xl font-extrabold uppercase text-neutral-400">0 ACTIVIDADES</div>
                <h3 className="font-extrabold text-neutral-900 text-base uppercase">
                  No se encontraron actividades con estos filtros en {currentNeighborhood.displayName}
                </h3>
                <p className="text-xs text-neutral-500 max-w-md mx-auto">
                  Prueba restableciendo los filtros para ver la oferta comunal completa de {neighborhoodWorkshops.length} actividades.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setOnlyInclusiveFilter(false);
                    setTimeFilter('todos');
                    setOnly500mFilter(false);
                  }}
                  className="py-2 px-4 bg-neutral-950 text-white text-xs font-extrabold uppercase tracking-wider hover:bg-[#E11D48] transition-colors cursor-pointer rounded-none"
                >
                  Restablecer filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* SECCIÓN INFERIOR FIJADA: MODO CEO / ADMINISTRADOR (AUDITORÍA & TELEMETRÍA EN VIVO) */}
      <section className="max-w-7xl mx-auto px-4 mt-12 mb-2 w-full">
        <div className="bg-neutral-900 rounded-none p-4 sm:p-5 text-white border-2 border-neutral-900 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-10 h-10 bg-neutral-800 border border-neutral-700 text-white flex items-center justify-center shrink-0 font-mono">
              <Lock className="w-4 h-4 text-[#E11D48]" />
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="font-extrabold text-sm text-white uppercase tracking-tight">
                  Panel de Modo CEO & Telemetría de Usuarios
                </span>
                <span className="bg-neutral-800 text-amber-300 border border-neutral-700 px-2 py-0.2 font-mono font-bold text-xs">
                  CÓDIGO: 5678
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-normal mt-0.5">
                Seguimiento en tiempo real por Token e IP: qué busca el usuario, qué escribe, qué tarjetas abre y reportes de conversión.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAdminModalOpen(true)}
            className="py-2 px-4 bg-white hover:bg-neutral-100 text-neutral-950 font-black uppercase text-xs tracking-wider transition-colors cursor-pointer flex items-center gap-2 shrink-0 border border-neutral-300 rounded-none"
          >
            <ShieldCheck className="w-4 h-4 text-[#059669]" />
            <span>Ingresar a Modo CEO (5678)</span>
          </button>
        </div>
      </section>

      {/* FOOTER: EDITORIAL ARCHITECTURE */}
      <footer className="mt-8 border-t border-neutral-300 bg-white py-6 text-xs text-neutral-600">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left font-mono text-[11px]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-950">CHISPAPLAY</span>
            <span className="text-neutral-300">/</span>
            <span className="text-neutral-500">
              Cartelera Territorial Abierta · Maipú & Valparaíso
            </span>
          </div>

          <div className="flex items-center gap-3 text-neutral-500">
            <span>{currentNeighborhood.displayName}</span>
            <span>·</span>
            <span>Acreditación JJVV Legal</span>
            <span>·</span>
            <button
              onClick={() => setIsAdminModalOpen(true)}
              className="text-neutral-900 hover:underline font-semibold cursor-pointer"
            >
              Modo CEO (5678)
            </button>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {/* 1. Workshop Details Modal */}
      <WorkshopDetailModal
        workshop={selectedWorkshopForDetail}
        isMonitor={isMonitor}
        eventIncidents={incidents.filter(i => i.workshopId === selectedWorkshopForDetail?.id)}
        isOpen={Boolean(selectedWorkshopForDetail)}
        onClose={() => setSelectedWorkshopForDetail(null)}
        onOpenAttendance={(ws) => setSelectedWorkshopForAttendance(ws)}
        onOpenDirectChat={(ws) => setSelectedWorkshopForChat(ws)}
        onToggleRSVP={(id) => handleToggleRSVP(id)}
        onOpenEventSafetyReport={(ws) => handleOpenEventSafety(ws)}
      />

      {/* 2. Attendance PIN Verification Modal */}
      {selectedWorkshopForAttendance && (
        <AttendanceValidationModal
          workshop={selectedWorkshopForAttendance}
          isMonitor={isMonitor}
          isOpen={Boolean(selectedWorkshopForAttendance)}
          onClose={() => setSelectedWorkshopForAttendance(null)}
          onConfirmAttendance={handleConfirmAttendance}
          onToggleAttendeeStatus={handleToggleAttendeeStatus}
        />
      )}

      {/* 3. Direct In-App Chat Modal */}
      <DirectEventChatModal
        workshop={selectedWorkshopForChat}
        isOpen={Boolean(selectedWorkshopForChat)}
        onClose={() => setSelectedWorkshopForChat(null)}
      />

      {/* 4. Weekly Streak Drawer */}
      <StreakDrawer
        streakProfile={streakProfile}
        isOpen={isStreakDrawerOpen}
        onClose={() => setIsStreakDrawerOpen(false)}
        onShareStreakOnWhatsApp={handleShareStreakWhatsApp}
      />

      {/* 5. Safety Report Incident Modal */}
      <NewIncidentModal
        neighborhoodId={currentNeighborhood.id}
        targetWorkshop={targetWorkshopForSafety}
        isOpen={isNewIncidentModalOpen}
        onClose={() => {
          setIsNewIncidentModalOpen(false);
          setTargetWorkshopForSafety(null);
        }}
        onSubmitIncident={handleCreateIncident}
      />

      {/* 6. New Workshop Modal (Publicación 100% Funcional con lugares reales y temporalidad) */}
      <NewWorkshopModal
        neighborhoodId={currentNeighborhood.id}
        isOpen={isNewWorkshopModalOpen}
        onClose={() => setIsNewWorkshopModalOpen(false)}
        onCreateWorkshop={(ws, tf) => handleCreateWorkshop(ws, tf)}
        communeName={currentNeighborhood.displayName}
        coordinatorProfile={coordinatorProfile}
      />

      {/* 7. Registro de Nuevo Coordinador (Onboarding + Alternar perfil) */}
      <CoordinatorRegistrationModal
        isOpen={isCoordinatorRegModalOpen}
        onClose={() => setIsCoordinatorRegModalOpen(false)}
        currentProfile={coordinatorProfile}
        onSaveProfile={handleSaveCoordinatorProfile}
        activeCommune={activeCommune}
      />

      {/* 8. Registro de Usuario Rápido (Token asignado a IP virtual para reservas) */}
      <UserRegistrationModal
        isOpen={isUserRegModalOpen}
        onClose={() => {
          setIsUserRegModalOpen(false);
          setPendingTargetWorkshop(null);
        }}
        onSuccess={handleUserRegisteredSuccess}
        targetActivityTitle={pendingTargetWorkshop?.title}
        communeName={currentNeighborhood.displayName}
      />

      {/* 9. SILENT PUSH NOTIFICATION SIMULATION BANNER */}
      {silentPushToast && (
        <div className="fixed top-4 right-4 left-4 sm:left-auto sm:max-w-md z-50 animate-in fade-in duration-200">
          <div className="bg-neutral-900 text-white rounded-none p-4 shadow-xl border border-neutral-700 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-none bg-neutral-800 text-white flex items-center justify-center shrink-0 border border-neutral-700">
                  <VolumeX className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 font-mono text-[10px] text-amber-300">
                    <span>Notificación Silenciosa Despachada</span>
                    <span>·</span>
                    <span>Discreta</span>
                  </div>
                  <div className="text-xs font-semibold text-white leading-tight mt-0.5">
                    {silentPushToast.title}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSilentPushToast(null)}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                <CloseIcon className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-neutral-950 p-2.5 rounded-none text-[11px] font-mono space-y-1 border border-neutral-800">
              <div className="text-neutral-300">
                📍 {silentPushToast.location}
              </div>
              <div className="text-neutral-400">
                Alerta enviada a <strong>{silentPushToast.guardiansCount} guardianes</strong>:
              </div>
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                {silentPushToast.guardians.map((g, idx) => (
                  <span key={idx} className="bg-neutral-800 border border-neutral-700 text-neutral-200 px-2 py-0.5 text-[10px]">
                    {g.name} ({g.streakWeeks} sem)
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 10. AI Instagram Assistant Chat Modal */}
      <AiInstagramCrawlerModal
        isOpen={isAiCrawlerModalOpen}
        onClose={() => setIsAiCrawlerModalOpen(false)}
        currentCommuneName={currentNeighborhood.displayName}
        onAutoAddWorkshop={handleCreateWorkshop}
        allWorkshops={workshops}
        initialQuery={aiScrapperInitialQuery}
      />

      {/* 11. MODO CEO / ADMINISTRADOR MODAL (Código 5678 · Seguimiento de Usuarios en Vivo & Reportería) */}
      <AdminModeModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        currentNeighborhood={currentNeighborhood}
        allNeighborhoods={CHILE_NEIGHBORHOODS}
      />

      {/* 12. LOCATION ONBOARDING & 15-MINUTE PROXIMITY MODAL (STEP 1 & STEP 2) */}
      <LocationOnboardingModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentCommune={activeCommune}
        currentReferencePoint={referencePoint}
        onSelectLocation={handleSelectLocation}
        isFirstTime={!sessionStorage.getItem('chispaplay_onboarded')}
      />

      {/* 13. Mobile Bottom Navigation & Security Modals */}
      <MobileBottomNav
        activeTab={mobileActiveTab}
        hasNewWorkshops={hasNewWorkshops}
        onTabChange={(tab) => {
          setMobileActiveTab(tab);
          if (tab === 'inicio') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else if (tab === 'cartelera') {
            setHasNewWorkshops(false);
            localStorage.setItem('chispaplay_cartelera_seen', 'true');
            const feedEl = document.querySelector('section');
            feedEl?.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        reservedCount={enrolledWorkshopIds.length}
        onOpenPase={() => setIsPaseVecinalModalOpen(true)}
        onOpenSecurity={() => setIsSecurityGuideModalOpen(true)}
      />

      {/* Guía Ilustrada de Seguridad (Acceso directo desde barra móvil) */}
      <SecurityGuideModal
        isOpen={isSecurityGuideModalOpen}
        onClose={() => setIsSecurityGuideModalOpen(false)}
        activeCommune={activeCommune}
        onOpenReportPark={() => setIsNewIncidentModalOpen(true)}
      />

      {/* Credencial Oficial Pase Vecinal (Animación de extracción de bolsillo digital) */}
      <PaseVecinalModal
        isOpen={isPaseVecinalModalOpen}
        onClose={() => setIsPaseVecinalModalOpen(false)}
        workshops={workshops}
        enrolledWorkshopIds={enrolledWorkshopIds}
        activeCommune={activeCommune}
        onOpenRegister={() => setIsUserRegModalOpen(true)}
      />

      <SecurityEmergencyModal
        isOpen={isSecurityEmergencyModalOpen}
        onClose={() => setIsSecurityEmergencyModalOpen(false)}
        activeCommune={activeCommune}
        onOpenReportPark={() => setIsNewIncidentModalOpen(true)}
      />
    </div>
  );
}
