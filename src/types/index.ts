export type NeighborhoodId = 'colina' | 'cerronavia' | 'santiago' | 'puentealto' | 'recoleta' | 'valparaiso' | 'maipu' | 'rancagua';

export type ActiveCommune = 'maipu' | 'valparaiso';

export interface ReferencePoint {
  id: string;
  name: string;
  commune: ActiveCommune;
  coordinates: { lat: number; lng: number };
  isCenter?: boolean;
}

export interface CoordinatorProfile {
  id: string;
  organizationName: string;
  legalEntityNumber: string; // PJ N°
  managerName: string;
  whatsappPhone: string;
  commune: ActiveCommune;
  verified: boolean;
  registeredAt: string;
}

export interface Neighborhood {
  id: NeighborhoodId;
  name: string;
  displayName: string;
  comuna: string;
  sectorOBarrio: string;
  region: string;
  description: string;
  communityCenterName: string;
  legalJjvvCode: string;
  emergencyPhone: string;
  coordinates: { lat: number; lng: number };
}

export type OrganizerType = 'JJVV' | 'FUNDACION' | 'COLECTIVO' | 'MUNICIPALIDAD_DIDECO' | 'CORPORACION_CULTURAL' | 'COLEGIO';

export interface Organizer {
  id: string;
  name: string;
  type: OrganizerType;
  verified: boolean;
  legalEntityNumber: string;
  registrationBody: string;
  phone: string;
  whatsapp: string;
  email: string;
  avatar: string;
  publisherIdentity?: {
    fullName: string;
    rutMasked?: string;
    isClaveUnicaVerified: boolean;
  };
}

export type VigenciaStatus = 'verde' | 'naranja' | 'rojo' | 'archivo';

export type WorkshopCategory = 
  | 'Infancia & Juegos'
  | 'Plazas de Bolsillo & Ferias'
  | 'Huertito & Naturaleza'
  | 'Arte & Creatividad'
  | 'Teatro, Circo & Cuentos'
  | 'Deporte & Juegos Tradicionales'
  | 'Cultura & Música'
  | 'Colegios & Kermeses'
  | 'Ciencia & Mini-Robótica'
  | 'Cocina Familiar';

export interface EnrolledUser {
  id: string;
  name: string;
  familyMembersCount: number;
  avatar: string;
  isMe?: boolean;
  attended: boolean;
  checkInTime?: string;
  role: 'familia' | 'infancia' | 'joven' | 'vecino_tutor';
  whatsapp?: string;
  isFriend?: boolean;
}

export interface InclusivityInfo {
  isInclusive: boolean; // Flag to filter inclusive activities
  neurodivergentFriendly: boolean; // "Actividad Inclusiva / Neuro Friendly"
  wheelchairAccessible: boolean; // Rampa universal
  signLanguageAvailable: boolean; // LSCh
  languages: string[]; // Ej: ['Español', 'Créole haitiano']
  familyRestrooms: boolean;
}

export interface DirectChatContact {
  instructorName: string;
  instructorPhone: string;
  whatsappDirectNumber: string;
  whatsappDirectLink: string;
  inAppChatAvailable: boolean;
}

export interface ChatMessage {
  id: string;
  workshopId: string;
  senderName: string;
  senderAvatar: string;
  isInstructor?: boolean;
  isMe?: boolean;
  text: string;
  timestamp: string;
}

export interface WorkshopReview {
  id: string;
  authorName: string;
  authorAvatar?: string;
  rating: number; // 1 to 5
  comment: string;
  date: string;
}

export interface Workshop {
  id: string;
  title: string;
  category: WorkshopCategory;
  neighborhoodId: NeighborhoodId;
  ageGroup: string;
  organizer: Organizer;
  instructorName: string;
  instructorRole: string;
  instructorWhatsapp: string;
  locationName: string;
  address: string;
  schedule: string;
  nextDate: string;
  timeSlot: string;
  duration: string;
  capacity: number;
  enrolledUsers: EnrolledUser[];
  description: string;
  materialsProvided: boolean;
  isFree: boolean;
  safetyAdvisory: string;
  safeRouteGuide: string;
  activeCheckIn: boolean;
  checkInPin: string;
  imageUrl: string;
  tags: string[];
  coordinates?: { lat: number; lng: number };
  
  // Pablo Fuentes recommendations
  vigencia?: VigenciaStatus; // verde: con tiempo, naranja: próximo <2h, rojo: en curso ahora, archivo: histórico
  spaceType?: 'hardware_plaza' | 'hardware_bolsillo' | 'hardware_multicancha' | 'hardware_sede' | 'centro_comercial';
  spaceHardwareDesc?: string; // Ej: "Plaza de bolsillo con food trucks y mobiliario urbano"
  rating?: number; // 1-5 rating (sistema ArkDaily de ranking)
  reviewsCount?: number;
  reviews?: WorkshopReview[];
  sourceType?: 'ia_scraper' | 'organizador_verificado' | 'comunitario_organico';
  sourceInstagramPost?: {
    account: string;
    url: string;
    extractedText: string;
    crawledAt: string;
  };
  verifiedLegalEntity?: boolean; // Sello de Personalidad Jurídica
  policePartnerDisclaimer?: boolean; // Vínculo con Carabineros de Chile
  interestedCount?: number;
  goingCount?: number;
  distanceMeters?: number; // e.g. 350m para narrativa anti-soledad
  
  inclusivity: InclusivityInfo;
  directChat: DirectChatContact;
}

export interface CommunityLandmark {
  id: string;
  neighborhoodId: NeighborhoodId;
  name: string;
  category: 'plaza' | 'salud' | 'seguridad' | 'transporte' | 'sede';
  categoryLabel: string;
  address: string;
  description: string;
  coordinates: { lat: number; lng: number };
  iconEmoji: string;
}

export interface IncidentReport {
  id: string;
  neighborhoodId: NeighborhoodId;
  workshopId?: string;
  workshopTitle?: string;
  category: string;
  isCustomCategory?: boolean;
  title: string;
  description: string;
  location: string;
  timestamp: string;
  reporterName: string;
  urgency: 'alta' | 'media' | 'preventiva';
  upvotes: number;
  hasUpvoted?: boolean;
  solved: boolean;
  commentsCount: number;
  iconType?: 'luz' | 'juegos' | 'calle' | 'seguridad' | 'mascota' | 'custom';
  mapCoord: { x: number; y: number };
  coordinates?: { lat: number; lng: number };
  silentPushSent?: boolean;
  notifiedGuardiansCount?: number;
  notifiedGuardians?: { name: string; streakWeeks: number; sector: string }[];
}

// Neighbor with high attendance streak who acts as community guardian
export interface NeighborGuardian {
  id: string;
  name: string;
  avatar: string;
  streakWeeks: number;
  streakDays: number;
  totalWorkshopsAttended: number;
  neighborhoodId: NeighborhoodId;
  sector: string;
  distanceMeters: number;
  isOnline: boolean;
  badgeTitle: string;
  phonePreview?: string;
}

// Facebook-style neighbor friend
export interface NeighborFriend {
  id: string;
  name: string;
  avatar: string;
  role: string;
  neighborhood: string;
  isFriend: boolean;
  mutualFriendsCount: number; // Estilo Facebook
  mutualWorkshopsCount: number;
}

export interface WeekDayStreak {
  dayName: string;
  shortDate: string;
  attended: boolean;
  isToday: boolean;
  workshopName?: string;
}

export interface UserStreakProfile {
  name: string;
  role: 'familia' | 'coordinador';
  avatar: string;
  streakWeeks: number;
  streakDaysCurrentWeek: number;
  totalWorkshopsAttended: number;
  levelTitle: string;
  levelNumber: number;
  xpCurrent: number;
  xpNextLevel: number;
  weekDays: WeekDayStreak[];
  badges: StreakBadge[];
}

export interface StreakBadge {
  id: string;
  name: string;
  description: string;
  iconEmoji: string;
  unlocked: boolean;
  unlockedDate?: string;
  rewardText: string;
}

export interface BigDataMetrics {
  totalRegisteredFamilies: number;
  weeklyActiveEngagementRate: number;
  physicalCheckInConversionRate: number;
  averageStreakWeeks: number;
  socialReturnOnInvestmentCLP: string;
  incidentMeanTimeToResolutionHours: number;
  topDemographicCohorts: { label: string; percentage: number }[];
  categoryDemandShare: { category: string; demandPercentage: number }[];
  communeComparison: {
    commune: string;
    familiesCount: number;
    attendanceRate: number;
    safetyIncidentsResolved: number;
  }[];
}
