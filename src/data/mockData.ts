import { Neighborhood, Workshop, IncidentReport, UserStreakProfile, BigDataMetrics, NeighborFriend, CommunityLandmark, NeighborGuardian, ReferencePoint, CoordinatorProfile, ActiveCommune } from '../types';
import { MAIPU_REAL_WORKSHOPS, VALPARAISO_REAL_WORKSHOPS } from './communeWorkshops';

export const CHILE_NEIGHBORHOODS: Neighborhood[] = [
  {
    id: 'colina',
    name: 'Comuna de Colina',
    displayName: 'Comuna de Colina',
    comuna: 'Colina',
    sectorOBarrio: 'Colina Centro, Las Canteras & Chamisero',
    region: 'Región Metropolitana',
    description: 'Comuna rural y urbana con gran vida comunitaria de familias, canteras patrimoniales y amplias plazas verdes.',
    communityCenterName: 'Centro Comunitario y Cultural de Colina',
    legalJjvvCode: 'PJ N° 204-Colina',
    emergencyPhone: 'Seguridad Vecinal Colina: 1468 / 8va Comisaría',
    coordinates: { lat: -33.2045, lng: -70.6756 }
  },
  {
    id: 'cerronavia',
    name: 'Comuna de Cerro Navia',
    displayName: 'Comuna de Cerro Navia',
    comuna: 'Cerro Navia',
    sectorOBarrio: 'Herminda de la Victoria & Salvador Gutiérrez',
    region: 'Región Metropolitana',
    description: 'Comuna con activo tejido vecinal, huertos familiares de pasaje y plazas vivas para la niñez.',
    communityCenterName: 'Sede Social y Cultural Las Estrellas (Herminda de la Victoria)',
    legalJjvvCode: 'PJ N° 1240-Cerro Navia',
    emergencyPhone: 'Seguridad Cerro Navia: 1412',
    coordinates: { lat: -33.4258, lng: -70.7302 }
  },
  {
    id: 'santiago',
    name: 'Comuna de Santiago (Barrio Yungay)',
    displayName: 'Comuna de Santiago (Barrio Yungay)',
    comuna: 'Santiago Centro',
    sectorOBarrio: 'Plaza Yungay, Calle Herrera & San Pablo',
    region: 'Región Metropolitana',
    description: 'Barrio patrimonial con asambleas de familias, centros culturales infantiles y plazas arboladas.',
    communityCenterName: 'Sede Comunitaria y Familiar San Pablo #2841',
    legalJjvvCode: 'PJ N° 3418-S (Registro Civil)',
    emergencyPhone: 'Plan Cuadrante Yungay: 3ra Comisaría',
    coordinates: { lat: -33.4385, lng: -70.6755 }
  },
  {
    id: 'puentealto',
    name: 'Comuna de Puente Alto',
    displayName: 'Comuna de Puente Alto',
    comuna: 'Puente Alto',
    sectorOBarrio: 'Bajos de Mena & Plaza de Puente Alto',
    region: 'Región Metropolitana',
    description: 'Comuna más poblada de Chile con gran demanda de actividades extracurriculares y canchas comunitarias.',
    communityCenterName: 'Sede Multiuso Parque Nuestra Señora de Gabriela',
    legalJjvvCode: 'PJ N° 890-Puente Alto',
    emergencyPhone: 'Seguridad Municipal Puente Alto: 1487',
    coordinates: { lat: -33.6117, lng: -70.5758 }
  },
  {
    id: 'recoleta',
    name: 'Comuna de Recoleta',
    displayName: 'Comuna de Recoleta',
    comuna: 'Recoleta',
    sectorOBarrio: 'Sector Cerro Blanco & Santos Dumont',
    region: 'Región Metropolitana',
    description: 'Red comunitaria de fomento lector, ludotecas populares y escuelas abiertas para la infancia.',
    communityCenterName: 'Espacio Abierto Infancia y Familia Recoleta',
    legalJjvvCode: 'PJ N° 512-R Municipal',
    emergencyPhone: 'Seguridad Recoleta: 1461',
    coordinates: { lat: -33.4182, lng: -70.6432 }
  },
  {
    id: 'valparaiso',
    name: 'Comuna de Valparaíso',
    displayName: 'Comuna de Valparaíso',
    comuna: 'Valparaíso',
    sectorOBarrio: 'Cerro Alegre, Cordillera & Playa Ancha',
    region: 'Región de Valparaíso',
    description: 'Plazas en miradores, talleres de volantines, títeres porteños y música comunitaria.',
    communityCenterName: 'Sede Comunitaria Escalera Montealegre',
    legalJjvvCode: 'PJ N° 1892-Valparaíso',
    emergencyPhone: 'Seguridad Valparaíso: 1432',
    coordinates: { lat: -33.0425, lng: -71.6289 }
  },
  {
    id: 'maipu',
    name: 'Comuna de Maipú',
    displayName: 'Comuna de Maipú',
    comuna: 'Maipú',
    sectorOBarrio: 'Plaza de Maipú, Templo Votivo & Barrio Las Rosas',
    region: 'Región Metropolitana',
    description: 'Segunda comuna más grande de Chile con gran identidad histórica, ejes comerciales y plazas familiares activas.',
    communityCenterName: 'Centro Comunitario y Familiar Plaza de Maipú',
    legalJjvvCode: 'PJ N° 742-Maipú',
    emergencyPhone: 'Maipú Seguro: 1418 / 25ta Comisaría',
    coordinates: { lat: -33.5112, lng: -70.7578 }
  },
  {
    id: 'rancagua',
    name: 'Comuna de Rancagua',
    displayName: 'Comuna de Rancagua',
    comuna: 'Rancagua',
    sectorOBarrio: 'Plaza de Los Héroes, Plazas de Bolsillo República & Parque Comunal',
    region: "Región del Libertador Bernardo O'Higgins",
    description: 'Comuna pionera en Plazas de Bolsillo (recuperación de terrenos baldíos con food trucks y mobiliario urbano), teatros y gran vida comunitaria.',
    communityCenterName: 'Centro Cívico y Plaza de Bolsillo República',
    legalJjvvCode: 'PJ N° 315-Rancagua',
    emergencyPhone: 'Seguridad Pública Rancagua: 1455 / 1ra Comisaría',
    coordinates: { lat: -34.1708, lng: -70.7444 }
  }
];

// Facebook style neighbor friends
export const MOCK_NEIGHBOR_FRIENDS: NeighborFriend[] = [
  {
    id: 'fr-1',
    name: 'Camila Pizarro',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
    role: 'Vecina de Colina',
    neighborhood: 'Colina Centro',
    isFriend: true,
    mutualFriendsCount: 4,
    mutualWorkshopsCount: 2
  },
  {
    id: 'fr-2',
    name: 'Don Hernán Sepúlveda',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    role: 'Vecino del pasaje',
    neighborhood: 'Las Canteras',
    isFriend: true,
    mutualFriendsCount: 2,
    mutualWorkshopsCount: 1
  },
  {
    id: 'fr-3',
    name: 'Familia Contreras',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    role: 'Apoderados colegio',
    neighborhood: 'Chamisero',
    isFriend: true,
    mutualFriendsCount: 6,
    mutualWorkshopsCount: 1
  },
  {
    id: 'fr-4',
    name: 'Tía Marisol',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
    role: 'Monitora comunitaria',
    neighborhood: 'Cerro Navia',
    isFriend: false,
    mutualFriendsCount: 1,
    mutualWorkshopsCount: 2
  }
];

// Guardian Neighbors with high attendance streak (Vinculación de seguridad a participación constante)
export const MOCK_NEIGHBOR_GUARDIANS: NeighborGuardian[] = [
  // Colina
  {
    id: 'gd-col-1',
    name: 'Familia Valenzuela',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    streakWeeks: 6,
    streakDays: 4,
    totalWorkshopsAttended: 18,
    neighborhoodId: 'colina',
    sector: 'Colina Centro (Fontt / Concepción)',
    distanceMeters: 85,
    isOnline: true,
    badgeTitle: 'Guardián Chispa de Oro',
    phonePreview: '+56 9 8412 ••••'
  },
  {
    id: 'gd-col-2',
    name: 'Camila Pizarro & Vicente',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    streakWeeks: 5,
    streakDays: 3,
    totalWorkshopsAttended: 14,
    neighborhoodId: 'colina',
    sector: 'Parque San Miguel & Plaza',
    distanceMeters: 140,
    isOnline: true,
    badgeTitle: 'Guardián Chispa Activa',
    phonePreview: '+56 9 7321 ••••'
  },
  {
    id: 'gd-col-3',
    name: 'Don Hernán Sepúlveda',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    streakWeeks: 4,
    streakDays: 2,
    totalWorkshopsAttended: 11,
    neighborhoodId: 'colina',
    sector: 'Las Canteras Norte',
    distanceMeters: 210,
    isOnline: true,
    badgeTitle: 'Tutor de Trayecto Seguro',
    phonePreview: '+56 9 6554 ••••'
  },
  {
    id: 'gd-col-4',
    name: 'Familia Contreras Chamisero',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    streakWeeks: 4,
    streakDays: 3,
    totalWorkshopsAttended: 10,
    neighborhoodId: 'colina',
    sector: 'Chamisero / San José',
    distanceMeters: 290,
    isOnline: false,
    badgeTitle: 'Familia Protectora',
    phonePreview: '+56 9 9123 ••••'
  },

  // Cerro Navia
  {
    id: 'gd-cn-1',
    name: 'Tía Rosa Paredes',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    streakWeeks: 7,
    streakDays: 5,
    totalWorkshopsAttended: 21,
    neighborhoodId: 'cerronavia',
    sector: 'Herminda de la Victoria',
    distanceMeters: 90,
    isOnline: true,
    badgeTitle: 'Decana de la Plaza',
    phonePreview: '+56 9 5431 ••••'
  },
  {
    id: 'gd-cn-2',
    name: 'Colectivo Huerto Pasaje 4',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    streakWeeks: 5,
    streakDays: 3,
    totalWorkshopsAttended: 15,
    neighborhoodId: 'cerronavia',
    sector: 'Salvador Gutiérrez',
    distanceMeters: 175,
    isOnline: true,
    badgeTitle: 'Vigilancia Comunitaria Activa',
    phonePreview: '+56 9 7891 ••••'
  },

  // Santiago (Yungay)
  {
    id: 'gd-st-1',
    name: 'Familia Araya - Barrio Yungay',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
    streakWeeks: 6,
    streakDays: 4,
    totalWorkshopsAttended: 19,
    neighborhoodId: 'santiago',
    sector: 'Plaza Yungay / San Pablo',
    distanceMeters: 110,
    isOnline: true,
    badgeTitle: 'Guardián Patrimonial',
    phonePreview: '+56 9 8234 ••••'
  },
  {
    id: 'gd-st-2',
    name: 'Lorena Fuentes (Monitora LSCh)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    streakWeeks: 5,
    streakDays: 4,
    totalWorkshopsAttended: 16,
    neighborhoodId: 'santiago',
    sector: 'Herrera / Compañía',
    distanceMeters: 160,
    isOnline: true,
    badgeTitle: 'Guardián Inclusivo',
    phonePreview: '+56 9 7654 ••••'
  },

  // Puente Alto
  {
    id: 'gd-pa-1',
    name: 'Don Manuel & Vecinos Cancha',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
    streakWeeks: 8,
    streakDays: 5,
    totalWorkshopsAttended: 24,
    neighborhoodId: 'puentealto',
    sector: 'Parque Ntra Sra de Gabriela',
    distanceMeters: 95,
    isOnline: true,
    badgeTitle: 'Centinela Barrial de Oro',
    phonePreview: '+56 9 9345 ••••'
  },
  {
    id: 'gd-pa-2',
    name: 'Carolina Tapia (Taller Malabares)',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    streakWeeks: 6,
    streakDays: 3,
    totalWorkshopsAttended: 17,
    neighborhoodId: 'puentealto',
    sector: 'Bajos de Mena Central',
    distanceMeters: 180,
    isOnline: true,
    badgeTitle: 'Guardián Recreativo',
    phonePreview: '+56 9 8112 ••••'
  },

  // Recoleta
  {
    id: 'gd-rec-1',
    name: 'Familia Morales - Cerro Blanco',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80',
    streakWeeks: 6,
    streakDays: 4,
    totalWorkshopsAttended: 18,
    neighborhoodId: 'recoleta',
    sector: 'Santos Dumont / Av. Recoleta',
    distanceMeters: 120,
    isOnline: true,
    badgeTitle: 'Guardián de Fomento Lector',
    phonePreview: '+56 9 6342 ••••'
  },

  // Valparaíso
  {
    id: 'gd-val-1',
    name: 'Colectivo Mirador Montealegre',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
    streakWeeks: 7,
    streakDays: 4,
    totalWorkshopsAttended: 20,
    neighborhoodId: 'valparaiso',
    sector: 'Cerro Alegre / Paseo Yugoslavo',
    distanceMeters: 105,
    isOnline: true,
    badgeTitle: 'Vigilante Porteño Activo',
    phonePreview: '+56 9 9876 ••••'
  },

  // Maipú
  {
    id: 'gd-mai-1',
    name: 'Familia Morales - Templo Votivo',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    streakWeeks: 7,
    streakDays: 4,
    totalWorkshopsAttended: 22,
    neighborhoodId: 'maipu',
    sector: 'Entorno Templo Votivo / 5 de Abril',
    distanceMeters: 75,
    isOnline: true,
    badgeTitle: 'Guardián Histórico de Maipú',
    phonePreview: '+56 9 8456 ••••'
  },
  {
    id: 'gd-mai-2',
    name: 'Javier Orellana & Sofía',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    streakWeeks: 5,
    streakDays: 3,
    totalWorkshopsAttended: 15,
    neighborhoodId: 'maipu',
    sector: 'Plaza de Maipú / Pajaritos',
    distanceMeters: 130,
    isOnline: true,
    badgeTitle: 'Centinela de Plaza',
    phonePreview: '+56 9 7112 ••••'
  },
  {
    id: 'gd-mai-3',
    name: 'Tía Marcela (JJ.VV. Las Rosas)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    streakWeeks: 4,
    streakDays: 2,
    totalWorkshopsAttended: 12,
    neighborhoodId: 'maipu',
    sector: 'Barrio Las Rosas / Primo de Rivera',
    distanceMeters: 190,
    isOnline: true,
    badgeTitle: 'Tutor de Trayecto Escolar',
    phonePreview: '+56 9 6445 ••••'
  },

  // Rancagua
  {
    id: 'gd-ran-1',
    name: 'Pablo Fuentes (Arquitecto Urbanista)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    streakWeeks: 9,
    streakDays: 5,
    totalWorkshopsAttended: 34,
    neighborhoodId: 'rancagua',
    sector: 'Plaza de Bolsillo República / Bombero Villalobos',
    distanceMeters: 120,
    isOnline: true,
    badgeTitle: 'Pionero Plazas de Bolsillo & CPTED',
    phonePreview: '+56 9 8891 ••••'
  },
  {
    id: 'gd-ran-2',
    name: 'Familia Carreño - Parque Comunal',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    streakWeeks: 6,
    streakDays: 4,
    totalWorkshopsAttended: 19,
    neighborhoodId: 'rancagua',
    sector: 'Entorno Parque Comunal Rancagua',
    distanceMeters: 250,
    isOnline: true,
    badgeTitle: 'Guardián Parque & Niñez',
    phonePreview: '+56 9 7311 ••••'
  }
];

export const INITIAL_WORKSHOPS: Workshop[] = [
  // 10 ACTIVIDADES EN MAIPÚ (LUGARES REALES) & 10 EN VALPARAÍSO
  ...MAIPU_REAL_WORKSHOPS,
  ...VALPARAISO_REAL_WORKSHOPS,

  // 1. COLINA - MINI-GRANJEROS (INCLUSIVO)
  {
    id: 'ws-col-1',
    title: 'Mini-Granjeros & Huerto de Primavera en Colina',
    category: 'Huertito & Naturaleza',
    neighborhoodId: 'colina',
    ageGroup: 'Para toda la familia (3 a 12 años)',
    organizer: {
      id: 'org-col-1',
      name: 'Unidad Vecinal Colina Centro & Familias',
      type: 'JJVV',
      verified: true,
      legalEntityNumber: 'PJ N° 204-Colina',
      registrationBody: 'Municipalidad de Colina / DIDECO',
      phone: '+56 9 8123 4567',
      whatsapp: '56981234567',
      email: 'huerto.colina@chispaplay.cl',
      avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80'
    },
    instructorName: 'Tía Carolina',
    instructorRole: 'Monitora de Agricultura Familiar',
    instructorWhatsapp: '56981234567',
    locationName: 'Parque San Miguel de Colina',
    address: 'Av. Nueva Colina con Fontt, Colina Centro',
    schedule: 'Sábados · 10:30 a 12:00 hrs',
    nextDate: 'Sábado 10 de Octubre',
    timeSlot: '10:30 - 12:00 hrs',
    duration: '1h 30m',
    capacity: 25,
    enrolledUsers: [
      { id: 'usr-1', name: 'Familia Valenzuela', familyMembersCount: 2, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', isMe: true, attended: false, role: 'familia' },
      { id: 'fr-1', name: 'Camila Pizarro', familyMembersCount: 2, avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80', attended: false, role: 'familia', isFriend: true },
      { id: 'fr-3', name: 'Familia Contreras', familyMembersCount: 3, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', attended: false, role: 'familia', isFriend: true }
    ],
    description: 'Los niños cosechan almácigos de frutillas y tomates cherry en maceteros de greda y aprenden compostaje.',
    materialsProvided: true,
    isFree: true,
    safetyAdvisory: 'Parque cerrado sin acceso de vehículos. Punto de sombra e hidratación permanente.',
    safeRouteGuide: 'Salida con monitores hacia el paradero de colectivos de Av. Concepción.',
    activeCheckIn: true,
    checkInPin: '4120',
    imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb22659?w=800&auto=format&fit=crop&q=80',
    tags: ['Naturaleza', 'Infancia', 'Colina', 'Huerto'],
    coordinates: { lat: -33.2062, lng: -70.6742 },
    
    inclusivity: {
      isInclusive: true,
      neurodivergentFriendly: true, // "Actividad Inclusiva / Neuro Friendly"
      wheelchairAccessible: true,
      signLanguageAvailable: false,
      languages: ['Español', 'Créole haitiano'],
      familyRestrooms: true
    },
    
    directChat: {
      instructorName: 'Tía Carolina',
      instructorPhone: '+56 9 8123 4567',
      whatsappDirectNumber: '56981234567',
      whatsappDirectLink: 'https://wa.me/56981234567',
      inAppChatAvailable: true
    }
  },

  // 2. COLINA - ALFARERÍA EN GREDA (INCLUSIVO)
  {
    id: 'ws-col-2',
    title: 'Alfarería y Modelado en Greda de Las Canteras',
    category: 'Arte & Creatividad',
    neighborhoodId: 'colina',
    ageGroup: 'Niñas, niños y apoderados (5 a 14 años)',
    organizer: {
      id: 'org-col-2',
      name: 'Colectivo Artesanos Canteros de Colina',
      type: 'COLECTIVO',
      verified: true,
      legalEntityNumber: 'Registro de Cultura N° 311-Colina',
      registrationBody: 'Corporación de Artes y Cultura de Colina',
      phone: '+56 9 7321 9900',
      whatsapp: '56973219900',
      email: 'alfareria.colina@chispaplay.cl',
      avatar: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=150&auto=format&fit=crop&q=80'
    },
    instructorName: 'Maestro Patricio',
    instructorRole: 'Escultor Tradicional',
    instructorWhatsapp: '56973219900',
    locationName: 'Sede Comunitaria Las Canteras',
    address: 'Camino Las Canteras #120, Colina',
    schedule: 'Miércoles · 16:30 a 18:00 hrs',
    nextDate: 'Miércoles 7 de Octubre',
    timeSlot: '16:30 - 18:00 hrs',
    duration: '1h 30m',
    capacity: 20,
    enrolledUsers: [
      { id: 'usr-1', name: 'Familia Valenzuela', familyMembersCount: 2, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', isMe: true, attended: false, role: 'familia' },
      { id: 'fr-2', name: 'Don Hernán Sepúlveda', familyMembersCount: 1, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', attended: false, role: 'vecino_tutor', isFriend: true }
    ],
    description: 'Modelado manual de platos y figuras con greda local.',
    materialsProvided: true,
    isFree: true,
    safetyAdvisory: 'Sector tranquilo y familiar. Mesas de trabajo acondicionadas.',
    safeRouteGuide: 'Coordinación de autos compartidos entre familias de regreso a Colina Centro.',
    activeCheckIn: false,
    checkInPin: '2040',
    imageUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&auto=format&fit=crop&q=80',
    tags: ['Arte', 'Greda', 'Oficio'],
    coordinates: { lat: -33.2110, lng: -70.6695 },
    
    inclusivity: {
      isInclusive: true,
      neurodivergentFriendly: true,
      wheelchairAccessible: true,
      signLanguageAvailable: true,
      languages: ['Español', 'Lengua de Señas (LSCh)'],
      familyRestrooms: true
    },
    
    directChat: {
      instructorName: 'Maestro Patricio',
      instructorPhone: '+56 9 7321 9900',
      whatsappDirectNumber: '56973219900',
      whatsappDirectLink: 'https://wa.me/56973219900',
      inAppChatAvailable: true
    }
  },

  // 3. COLINA - CIRCO Y VOLANTINES (NO INCLUSIVO - ESTÁNDAR)
  {
    id: 'ws-col-3',
    title: 'Circo de Barrio, Volantines & Trompo en la Plaza',
    category: 'Infancia & Juegos',
    neighborhoodId: 'colina',
    ageGroup: 'Familias con niños (4 a 14 años)',
    organizer: {
      id: 'org-col-1',
      name: 'Unidad Vecinal Colina Centro & Familias',
      type: 'JJVV',
      verified: true,
      legalEntityNumber: 'PJ N° 204-Colina',
      registrationBody: 'Municipalidad de Colina / DIDECO',
      phone: '+56 9 8123 4567',
      whatsapp: '56981234567',
      email: 'circo.colina@chispaplay.cl',
      avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80'
    },
    instructorName: 'Profe Matías',
    instructorRole: 'Monitor Recreativo',
    instructorWhatsapp: '56981234567',
    locationName: 'Plaza de Armas de Colina (Zona Árboles)',
    address: 'Plaza de Armas de Colina',
    schedule: 'Jueves · 17:00 a 18:30 hrs',
    nextDate: 'Jueves 8 de Octubre',
    timeSlot: '17:00 - 18:30 hrs',
    duration: '1h 30m',
    capacity: 28,
    enrolledUsers: [],
    description: 'Juegos tradicionales chilenos: trompo, saltar la cuerda gigante y malabares básicos.',
    materialsProvided: true,
    isFree: true,
    safetyAdvisory: 'Espacio despejado en pasto sin cables eléctricos.',
    safeRouteGuide: 'Salida directa por paso peatonal de la Plaza de Armas.',
    activeCheckIn: false,
    checkInPin: '9910',
    imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80',
    tags: ['Juegos', 'Plaza', 'Trompo'],
    coordinates: { lat: -33.2038, lng: -70.6760 },
    
    inclusivity: {
      isInclusive: false,
      neurodivergentFriendly: false,
      wheelchairAccessible: true,
      signLanguageAvailable: false,
      languages: ['Español'],
      familyRestrooms: true
    },
    
    directChat: {
      instructorName: 'Profe Matías',
      instructorPhone: '+56 9 8123 4567',
      whatsappDirectNumber: '56981234567',
      whatsappDirectLink: 'https://wa.me/56981234567',
      inAppChatAvailable: true
    }
  },

  // 4. COLINA - MINI ROBÓTICA Y CIENCIA (NO INCLUSIVO - ESTÁNDAR)
  {
    id: 'ws-col-4',
    title: 'Mini-Robótica & Sensores Solares para Familias',
    category: 'Ciencia & Mini-Robótica',
    neighborhoodId: 'colina',
    ageGroup: 'Niñas y niños (8 a 15 años)',
    organizer: {
      id: 'org-col-1',
      name: 'Unidad Vecinal Colina Centro & Familias',
      type: 'JJVV',
      verified: true,
      legalEntityNumber: 'PJ N° 204-Colina',
      registrationBody: 'Municipalidad de Colina / DIDECO',
      phone: '+56 9 8123 4567',
      whatsapp: '56981234567',
      email: 'robotica.colina@chispaplay.cl',
      avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80'
    },
    instructorName: 'Ing. Rodrigo Lara',
    instructorRole: 'Monitor Tecnológico',
    instructorWhatsapp: '56981234567',
    locationName: 'Centro Cultural de Colina - Sala 2',
    address: 'Av. Concepción #398, Colina',
    schedule: 'Viernes · 17:00 a 18:30 hrs',
    nextDate: 'Viernes 9 de Octubre',
    timeSlot: '17:00 - 18:30 hrs',
    duration: '1h 30m',
    capacity: 18,
    enrolledUsers: [
      { id: 'fr-3', name: 'Familia Contreras', familyMembersCount: 2, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', attended: false, role: 'familia', isFriend: true }
    ],
    description: 'Armado de autitos solares y circuitos simples con luces led.',
    materialsProvided: true,
    isFree: true,
    safetyAdvisory: 'Materiales con bajo voltaje sin ningún riesgo para menores.',
    safeRouteGuide: 'Salida con iluminación sobre vereda de Av. Concepción.',
    activeCheckIn: false,
    checkInPin: '5540',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
    tags: ['Robótica', 'Ciencia'],
    coordinates: { lat: -33.2025, lng: -70.6775 },
    
    inclusivity: {
      isInclusive: false,
      neurodivergentFriendly: false,
      wheelchairAccessible: true,
      signLanguageAvailable: false,
      languages: ['Español'],
      familyRestrooms: true
    },
    
    directChat: {
      instructorName: 'Ing. Rodrigo Lara',
      instructorPhone: '+56 9 8123 4567',
      whatsappDirectNumber: '56981234567',
      whatsappDirectLink: 'https://wa.me/56981234567',
      inAppChatAvailable: true
    }
  },

  // 5. CERRO NAVIA - SEMILLITAS (INCLUSIVO)
  {
    id: 'ws-cn-1',
    title: 'Semillitas de Cerro Navia: Huerto Infantil',
    category: 'Huertito & Naturaleza',
    neighborhoodId: 'cerronavia',
    ageGroup: 'Familias con niños (4 a 12 años)',
    organizer: {
      id: 'org-cn-1',
      name: 'Comité de Familias y JJVV Las Estrellas',
      type: 'JJVV',
      verified: true,
      legalEntityNumber: 'PJ N° 1240-Cerro Navia',
      registrationBody: 'Municipalidad de Cerro Navia',
      phone: '+56 9 7812 3456',
      whatsapp: '56978123456',
      email: 'familias.cerronavia@chispaplay.cl',
      avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80'
    },
    instructorName: 'Tía Marisol',
    instructorRole: 'Monitora de Huertos',
    instructorWhatsapp: '56978123456',
    locationName: 'Sede Social Las Estrellas',
    address: 'Calle Mapocho #7420, Cerro Navia',
    schedule: 'Sábados · 10:30 a 12:00 hrs',
    nextDate: 'Sábado 10 de Octubre',
    timeSlot: '10:30 - 12:00 hrs',
    duration: '1h 30m',
    capacity: 22,
    enrolledUsers: [
      { id: 'usr-1', name: 'Familia Valenzuela', familyMembersCount: 2, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', isMe: true, attended: false, role: 'familia' },
      { id: 'fr-4', name: 'Tía Marisol', familyMembersCount: 2, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80', attended: true, checkInTime: '10:25 hrs', role: 'vecino_tutor', isFriend: true }
    ],
    description: 'Siembra y reciclaje de maceteros para niños.',
    materialsProvided: true,
    isFree: true,
    safetyAdvisory: 'Plaza con reja perimetral cerrada.',
    safeRouteGuide: 'Salida con monitores hacia Mapocho.',
    activeCheckIn: true,
    checkInPin: '3024',
    imageUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&auto=format&fit=crop&q=80',
    tags: ['Naturaleza', 'Infancia'],
    coordinates: { lat: -33.4245, lng: -70.7285 },
    
    inclusivity: {
      isInclusive: true,
      neurodivergentFriendly: true,
      wheelchairAccessible: true,
      signLanguageAvailable: false,
      languages: ['Español', 'Créole haitiano'],
      familyRestrooms: true
    },
    
    directChat: {
      instructorName: 'Tía Marisol',
      instructorPhone: '+56 9 7812 3456',
      whatsappDirectNumber: '56978123456',
      whatsappDirectLink: 'https://wa.me/56978123456',
      inAppChatAvailable: true
    }
  },

  // 6. CERRO NAVIA - CIRCO (NO INCLUSIVO - ESTÁNDAR)
  {
    id: 'ws-cn-2',
    title: 'Circo de Barrio & Juegos en la Multicancha',
    category: 'Infancia & Juegos',
    neighborhoodId: 'cerronavia',
    ageGroup: 'Niñas, niños y jóvenes (6 a 15 años)',
    organizer: {
      id: 'org-cn-1',
      name: 'Comité de Familias y JJVV Las Estrellas',
      type: 'JJVV',
      verified: true,
      legalEntityNumber: 'PJ N° 1240-Cerro Navia',
      registrationBody: 'Municipalidad de Cerro Navia',
      phone: '+56 9 7812 3456',
      whatsapp: '56978123456',
      email: 'circocerronavia@chispaplay.cl',
      avatar: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=150&auto=format&fit=crop&q=80'
    },
    instructorName: 'Payaso Remolino',
    instructorRole: 'Artista Circense',
    instructorWhatsapp: '56978123456',
    locationName: 'Multicancha Salvador Gutiérrez',
    address: 'Salvador Gutiérrez #7110, Cerro Navia',
    schedule: 'Miércoles · 17:00 a 18:30 hrs',
    nextDate: 'Miércoles 7 de Octubre',
    timeSlot: '17:00 - 18:30 hrs',
    duration: '1h 30m',
    capacity: 25,
    enrolledUsers: [],
    description: 'Malabares con pelotas y equilibrio en zancos seguros.',
    materialsProvided: true,
    isFree: true,
    safetyAdvisory: 'Cancha techada con piso de goma protectora.',
    safeRouteGuide: 'Monitores acompañan hasta el semáforo.',
    activeCheckIn: false,
    checkInPin: '7110',
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80',
    tags: ['Circo', 'Juegos'],
    coordinates: { lat: -33.4270, lng: -70.7320 },
    
    inclusivity: {
      isInclusive: false,
      neurodivergentFriendly: false,
      wheelchairAccessible: true,
      signLanguageAvailable: false,
      languages: ['Español'],
      familyRestrooms: true
    },
    
    directChat: {
      instructorName: 'Payaso Remolino',
      instructorPhone: '+56 9 7812 3456',
      whatsappDirectNumber: '56978123456',
      whatsappDirectLink: 'https://wa.me/56978123456',
      inAppChatAvailable: true
    }
  },

  // 7. SANTIAGO (YUNGAY) - CUENTOS Y TÍTERES (INCLUSIVO)
  {
    id: 'ws-yn-1',
    title: 'Cuentacuentos & Títeres de Barrio en Yungay',
    category: 'Teatro, Circo & Cuentos',
    neighborhoodId: 'santiago',
    ageGroup: 'Primera infancia y familias (3 a 10 años)',
    organizer: {
      id: 'org-yn-1',
      name: 'JJVV N° 28 Barrio Yungay',
      type: 'JJVV',
      verified: true,
      legalEntityNumber: 'PJ N° 3418-S',
      registrationBody: 'Municipalidad de Santiago',
      phone: '+56 9 8451 9201',
      whatsapp: '56984519201',
      email: 'infancia.yungay@chispaplay.cl',
      avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80'
    },
    instructorName: 'Camila Pizarro',
    instructorRole: 'Narradora Oral',
    instructorWhatsapp: '56984519201',
    locationName: 'Sede Social Herrera #650',
    address: 'Herrera #650 con Huérfanos, Barrio Yungay',
    schedule: 'Jueves · 17:30 a 19:00 hrs',
    nextDate: 'Jueves 8 de Octubre',
    timeSlot: '17:30 - 19:00 hrs',
    duration: '1h 30m',
    capacity: 20,
    enrolledUsers: [
      { id: 'usr-1', name: 'Familia Valenzuela', familyMembersCount: 2, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', isMe: true, attended: false, role: 'familia' },
      { id: 'fr-1', name: 'Camila Pizarro', familyMembersCount: 2, avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80', attended: true, checkInTime: '17:30 hrs', role: 'familia', isFriend: true }
    ],
    description: 'Títeres de calcetín y relatos tradicionales con música en vivo.',
    materialsProvided: true,
    isFree: true,
    safetyAdvisory: 'Espacio cerrado con alfombras limpias.',
    safeRouteGuide: 'Salida iluminada por calle Huérfanos hacia Plaza Yungay.',
    activeCheckIn: true,
    checkInPin: '4291',
    imageUrl: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=600&auto=format&fit=crop&q=80',
    tags: ['Títeres', 'Cuentos'],
    coordinates: { lat: -33.4392, lng: -70.6768 },
    
    inclusivity: {
      isInclusive: true,
      neurodivergentFriendly: true,
      wheelchairAccessible: true,
      signLanguageAvailable: true,
      languages: ['Español', 'Lengua de Señas Chilena (LSCh)'],
      familyRestrooms: true
    },
    
    directChat: {
      instructorName: 'Camila Pizarro',
      instructorPhone: '+56 9 8451 9201',
      whatsappDirectNumber: '56984519201',
      whatsappDirectLink: 'https://wa.me/56984519201',
      inAppChatAvailable: true
    }
  },

  // 8. SANTIAGO (YUNGAY) - CUECA Y JUEGOS (NO INCLUSIVO - ESTÁNDAR)
  {
    id: 'ws-yn-2',
    title: 'Cueca Brava & Percusión Familiar en Plaza Yungay',
    category: 'Deporte & Juegos Tradicionales',
    neighborhoodId: 'santiago',
    ageGroup: 'Para toda la familia',
    organizer: {
      id: 'org-yn-1',
      name: 'JJVV N° 28 Barrio Yungay',
      type: 'JJVV',
      verified: true,
      legalEntityNumber: 'PJ N° 3418-S',
      registrationBody: 'Municipalidad de Santiago',
      phone: '+56 9 8451 9201',
      whatsapp: '56984519201',
      email: 'cueca.yungay@chispaplay.cl',
      avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80'
    },
    instructorName: 'Don Mario González',
    instructorRole: 'Cultor Tradicional',
    instructorWhatsapp: '56984519201',
    locationName: 'Gárgola / Plaza Yungay',
    address: 'Plaza Yungay, Santiago Centro',
    schedule: 'Sábados · 16:00 a 17:30 hrs',
    nextDate: 'Sábado 10 de Octubre',
    timeSlot: '16:00 - 17:30 hrs',
    duration: '1h 30m',
    capacity: 35,
    enrolledUsers: [],
    description: 'Pasos básicos de cueca tradicional y toque de pandero para todas las edades.',
    materialsProvided: true,
    isFree: true,
    safetyAdvisory: 'Plaza abierta vigilada por cuadrilla vecinal.',
    safeRouteGuide: 'Regreso colectivo por calle Santo Domingo.',
    activeCheckIn: false,
    checkInPin: '1888',
    imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80',
    tags: ['Cueca', 'Música'],
    coordinates: { lat: -33.4385, lng: -70.6755 },
    
    inclusivity: {
      isInclusive: false,
      neurodivergentFriendly: false,
      wheelchairAccessible: true,
      signLanguageAvailable: false,
      languages: ['Español'],
      familyRestrooms: true
    },
    
    directChat: {
      instructorName: 'Don Mario González',
      instructorPhone: '+56 9 8451 9201',
      whatsappDirectNumber: '56984519201',
      whatsappDirectLink: 'https://wa.me/56984519201',
      inAppChatAvailable: true
    }
  },

  // 9. PUENTE ALTO - HUERTO FAMILIAR (INCLUSIVO)
  {
    id: 'ws-pa-1',
    title: 'Huerto Urbano & Tierra Viva en Bajos de Mena',
    category: 'Huertito & Naturaleza',
    neighborhoodId: 'puentealto',
    ageGroup: 'Familias y niños (5 a 12 años)',
    organizer: {
      id: 'org-pa-1',
      name: 'Comité Vecinal Bajos de Mena',
      type: 'JJVV',
      verified: true,
      legalEntityNumber: 'PJ N° 890-Puente Alto',
      registrationBody: 'Municipalidad de Puente Alto',
      phone: '+56 9 6123 9876',
      whatsapp: '56961239876',
      email: 'huerto.puentealto@chispaplay.cl',
      avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80'
    },
    instructorName: 'Tía Claudia',
    instructorRole: 'Monitora Agrícola',
    instructorWhatsapp: '56961239876',
    locationName: 'Sede Parque Gabriela',
    address: 'Av. Concha y Toro #3420, Puente Alto',
    schedule: 'Sábados · 11:00 a 12:30 hrs',
    nextDate: 'Sábado 10 de Octubre',
    timeSlot: '11:00 - 12:30 hrs',
    duration: '1h 30m',
    capacity: 25,
    enrolledUsers: [
      { id: 'fr-1', name: 'Camila Pizarro', familyMembersCount: 2, avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80', attended: true, checkInTime: '11:05 hrs', role: 'familia', isFriend: true }
    ],
    description: 'Plantación de aromáticas y semillas para huertos en balcones y patios.',
    materialsProvided: true,
    isFree: true,
    safetyAdvisory: 'Parque con vigilancia y reja.',
    safeRouteGuide: 'Salida con monitores hacia el Metro.',
    activeCheckIn: true,
    checkInPin: '8901',
    imageUrl: 'https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?w=800&auto=format&fit=crop&q=80',
    tags: ['Huerto', 'Puente Alto'],
    coordinates: { lat: -33.6080, lng: -70.5780 },
    
    inclusivity: {
      isInclusive: true,
      neurodivergentFriendly: true,
      wheelchairAccessible: true,
      signLanguageAvailable: false,
      languages: ['Español'],
      familyRestrooms: true
    },
    
    directChat: {
      instructorName: 'Tía Claudia',
      instructorPhone: '+56 9 6123 9876',
      whatsappDirectNumber: '56961239876',
      whatsappDirectLink: 'https://wa.me/56961239876',
      inAppChatAvailable: true
    }
  },

  // 10. PUENTE ALTO - DEPORTE Y JUEGOS (NO INCLUSIVO - ESTÁNDAR)
  {
    id: 'ws-pa-2',
    title: 'Fútbol Comunitario & Juegos de Calle en Cancha Gabriela',
    category: 'Deporte & Juegos Tradicionales',
    neighborhoodId: 'puentealto',
    ageGroup: 'Niñas y niños (7 a 14 años)',
    organizer: {
      id: 'org-pa-1',
      name: 'Comité Vecinal Bajos de Mena',
      type: 'JJVV',
      verified: true,
      legalEntityNumber: 'PJ N° 890-Puente Alto',
      registrationBody: 'Municipalidad de Puente Alto',
      phone: '+56 9 6123 9876',
      whatsapp: '56961239876',
      email: 'futbol.puentealto@chispaplay.cl',
      avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80'
    },
    instructorName: 'Prof. Cristián Vera',
    instructorRole: 'Entrenador Formativo',
    instructorWhatsapp: '56961239876',
    locationName: 'Cancha Multiuso Gabriela',
    address: 'Av. Concha y Toro #3420, Puente Alto',
    schedule: 'Miércoles · 17:30 a 19:00 hrs',
    nextDate: 'Miércoles 7 de Octubre',
    timeSlot: '17:30 - 19:00 hrs',
    duration: '1h 30m',
    capacity: 30,
    enrolledUsers: [],
    description: 'Entrenamiento lúdico sin competencia y juegos de agilidad.',
    materialsProvided: true,
    isFree: true,
    safetyAdvisory: 'Cancha cercada e iluminación led nueva.',
    safeRouteGuide: 'Caravana de apoderados hacia paraderos.',
    activeCheckIn: false,
    checkInPin: '8902',
    imageUrl: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=800&auto=format&fit=crop&q=80',
    tags: ['Deporte', 'Juegos'],
    coordinates: { lat: -33.6095, lng: -70.5795 },
    
    inclusivity: {
      isInclusive: false,
      neurodivergentFriendly: false,
      wheelchairAccessible: true,
      signLanguageAvailable: false,
      languages: ['Español'],
      familyRestrooms: true
    },
    
    directChat: {
      instructorName: 'Prof. Cristián Vera',
      instructorPhone: '+56 9 6123 9876',
      whatsappDirectNumber: '56961239876',
      whatsappDirectLink: 'https://wa.me/56961239876',
      inAppChatAvailable: true
    }
  },

  // 11. VALPARAÍSO - VOLANTINES PORTEÑOS (INCLUSIVO)
  {
    id: 'ws-valp-1',
    title: 'Volantines Porteños & Mosaico en Cerro Alegre',
    category: 'Arte & Creatividad',
    neighborhoodId: 'valparaiso',
    ageGroup: 'Familias con niñas y niños (4 a 14 años)',
    organizer: {
      id: 'org-valp-1',
      name: 'Junta Vecinal Montealegre & Colectivo Cerros',
      type: 'JJVV',
      verified: true,
      legalEntityNumber: 'PJ N° 1892-Valparaíso',
      registrationBody: 'Municipalidad de Valparaíso',
      phone: '+56 9 5544 3322',
      whatsapp: '56955443322',
      email: 'volantines@chispaplay.cl',
      avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80'
    },
    instructorName: 'Tío Pancho',
    instructorRole: 'Volantinero Tradicional',
    instructorWhatsapp: '56955443322',
    locationName: 'Paseo Mirador Montealegre',
    address: 'Escalera Montealegre, Cerro Alegre, Valparaíso',
    schedule: 'Sábados · 15:30 a 17:30 hrs',
    nextDate: 'Sábado 10 de Octubre',
    timeSlot: '15:30 - 17:30 hrs',
    duration: '2 hrs',
    capacity: 20,
    enrolledUsers: [
      { id: 'usr-1', name: 'Familia Valenzuela', familyMembersCount: 2, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', isMe: true, attended: false, role: 'familia' },
      { id: 'fr-2', name: 'Don Hernán Sepúlveda', familyMembersCount: 1, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', attended: false, role: 'vecino_tutor', isFriend: true }
    ],
    description: 'Armado de volantines con palillo de coligüe, papel volantín y sin hilo curado.',
    materialsProvided: true,
    isFree: true,
    safetyAdvisory: '100% hilo de algodón sano. Mirador con barandas de seguridad.',
    safeRouteGuide: 'Bajada en grupo hacia el ascensor El Peral.',
    activeCheckIn: true,
    checkInPin: '1892',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
    tags: ['Volantines', 'Valparaíso'],
    coordinates: { lat: -33.0420, lng: -71.6295 },
    
    inclusivity: {
      isInclusive: true,
      neurodivergentFriendly: true,
      wheelchairAccessible: true,
      signLanguageAvailable: true,
      languages: ['Español', 'Inglés'],
      familyRestrooms: true
    },
    
    directChat: {
      instructorName: 'Tío Pancho',
      instructorPhone: '+56 9 5544 3322',
      whatsappDirectNumber: '56955443322',
      whatsappDirectLink: 'https://wa.me/56955443322',
      inAppChatAvailable: true
    }
  },

  // 12. RECOLETA - CIENCIA Y RECICLAJE (INCLUSIVO)
  {
    id: 'ws-rec-1',
    title: 'Pequeños Científicos & Reciclaje en Cerro Blanco',
    category: 'Ciencia & Mini-Robótica',
    neighborhoodId: 'recoleta',
    ageGroup: 'Niñas y niños (5 a 12 años)',
    organizer: {
      id: 'org-rec-1',
      name: 'Espacio Abierto Infancia Recoleta',
      type: 'JJVV',
      verified: true,
      legalEntityNumber: 'PJ N° 512-R',
      registrationBody: 'Municipalidad de Recoleta',
      phone: '+56 9 4433 2211',
      whatsapp: '56944332211',
      email: 'ciencia.recoleta@chispaplay.cl',
      avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80'
    },
    instructorName: 'Profe Valeria',
    instructorRole: 'Bióloga Educativa',
    instructorWhatsapp: '56944332211',
    locationName: 'Centro Comunitario Cerro Blanco',
    address: 'Santos Dumont #350, Recoleta',
    schedule: 'Viernes · 16:30 a 18:00 hrs',
    nextDate: 'Viernes 9 de Octubre',
    timeSlot: '16:30 - 18:00 hrs',
    duration: '1h 30m',
    capacity: 22,
    enrolledUsers: [
      { id: 'fr-1', name: 'Camila Pizarro', familyMembersCount: 2, avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80', attended: true, checkInTime: '16:35 hrs', role: 'familia', isFriend: true }
    ],
    description: 'Microscopios sencillos, hojas de árboles y experimentos con agua y colores.',
    materialsProvided: true,
    isFree: true,
    safetyAdvisory: 'Materiales no tóxicos. Sala climatizada.',
    safeRouteGuide: 'Salida directa a Metro Cerro Blanco.',
    activeCheckIn: true,
    checkInPin: '5120',
    imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop&q=80',
    tags: ['Ciencia', 'Recoleta'],
    coordinates: { lat: -33.4190, lng: -70.6445 },
    
    inclusivity: {
      isInclusive: true,
      neurodivergentFriendly: true,
      wheelchairAccessible: true,
      signLanguageAvailable: false,
      languages: ['Español', 'Créole haitiano'],
      familyRestrooms: true
    },
    
    directChat: {
      instructorName: 'Profe Valeria',
      instructorPhone: '+56 9 4433 2211',
      whatsappDirectNumber: '56944332211',
      whatsappDirectLink: 'https://wa.me/56944332211',
      inAppChatAvailable: true
    }
  },

  // MAIPÚ WORKSHOPS
  {
    id: 'ws-mai-1',
    title: 'Mini-Astrónomos & Cohetería Infantil en Plaza de Maipú',
    category: 'Ciencia & Mini-Robótica',
    neighborhoodId: 'maipu',
    ageGroup: 'Para toda la familia (4 a 14 años)',
    organizer: {
      id: 'org-mai-1',
      name: 'Unidad Vecinal Plaza de Maipú & Colectivo Robótica',
      type: 'JJVV',
      verified: true,
      legalEntityNumber: 'PJ N° 742-Maipú',
      registrationBody: 'Municipalidad de Maipú',
      phone: '+56 9 7890 1234',
      whatsapp: '56978901234',
      email: 'astronomia.maipu@chispaplay.cl',
      avatar: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=120&auto=format&fit=crop&q=80'
    },
    instructorName: 'Prof. Gabriel Valdés',
    instructorRole: 'Divulgador Científico y Vecino de Maipú',
    instructorWhatsapp: '+56 9 7890 1234',
    locationName: 'Explanada Metro Plaza de Maipú',
    address: 'Av. Pajaritos con Av. 5 de Abril, Maipú',
    schedule: 'Sábados 10:30 a 12:30 hrs',
    nextDate: 'Sábado 17 de Octubre, 2026',
    timeSlot: '10:30 - 12:30 hrs',
    duration: '2 horas',
    capacity: 25,
    enrolledUsers: [
      { id: 'usr-m1', name: 'Familia Morales', familyMembersCount: 3, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&auto=format&fit=crop&q=80', isMe: true, attended: false, role: 'familia', isFriend: true },
      { id: 'usr-m2', name: 'Javier & Sofía', familyMembersCount: 2, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80', isMe: false, attended: false, role: 'familia', isFriend: true }
    ],
    description: 'Fabricación de cohetes de agua, observación solar con telescopios seguros y constelaciones.',
    materialsProvided: true,
    isFree: true,
    safetyAdvisory: 'Espacio peatonal despejado, resguardo de monitores en perímetro de calle.',
    safeRouteGuide: 'Acceso directo desde salida oriente de Metro Plaza de Maipú.',
    activeCheckIn: true,
    checkInPin: '1418',
    imageUrl: 'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?w=600&auto=format&fit=crop&q=80',
    tags: ['Ciencia', 'Maipú', 'Astronomía'],
    coordinates: { lat: -33.5112, lng: -70.7578 },
    inclusivity: {
      isInclusive: true,
      neurodivergentFriendly: true,
      wheelchairAccessible: true,
      signLanguageAvailable: false,
      languages: ['Español', 'Créole haitiano'],
      familyRestrooms: true
    },
    directChat: {
      instructorName: 'Gabriel Valdés',
      instructorPhone: '+56 9 7890 1234',
      whatsappDirectNumber: '56978901234',
      whatsappDirectLink: 'https://wa.me/56978901234',
      inAppChatAvailable: true
    }
  },
  {
    id: 'ws-mai-2',
    title: 'Huerto Urbano & Semillas Nativas en Templo Votivo',
    category: 'Huertito & Naturaleza',
    neighborhoodId: 'maipu',
    ageGroup: 'Familias, niñas, niños y abuelos (3 a 12 años)',
    organizer: {
      id: 'org-mai-2',
      name: 'Colectivo Verde Maipú & JJ.VV. Las Rosas',
      type: 'COLECTIVO',
      verified: true,
      legalEntityNumber: 'PJ N° 389-Maipú',
      registrationBody: 'Municipalidad de Maipú',
      phone: '+56 9 6554 4332',
      whatsapp: '56965544332',
      email: 'huerto.votivo@chispaplay.cl',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
    },
    instructorName: 'Tía Marcela Riquelme',
    instructorRole: 'Monitora Agroecológica Comunitaria',
    instructorWhatsapp: '+56 9 6554 4332',
    locationName: 'Parque del Templo Votivo de Maipú',
    address: 'Carmen #1750, Maipú',
    schedule: 'Domingos 11:00 a 13:00 hrs',
    nextDate: 'Domingo 18 de Octubre, 2026',
    timeSlot: '11:00 - 13:00 hrs',
    duration: '2 horas',
    capacity: 20,
    enrolledUsers: [
      { id: 'usr-m3', name: 'Familia Valenzuela', familyMembersCount: 2, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80', isMe: true, attended: false, role: 'familia', isFriend: true }
    ],
    description: 'Aprende a germinar hortalizas familiares, compostaje de residuos orgánicos y cuidado de plantas polinizadoras.',
    materialsProvided: true,
    isFree: true,
    safetyAdvisory: 'Parque cerrado al tránsito vehicular. Punto de hidratación y primeros auxilios disponible.',
    safeRouteGuide: 'Ingreso por portón norte del Templo Votivo con iluminación led reforzada.',
    activeCheckIn: true,
    checkInPin: '7420',
    imageUrl: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&auto=format&fit=crop&q=80',
    tags: ['Huerto', 'Naturaleza', 'Maipú'],
    coordinates: { lat: -33.5135, lng: -70.7620 },
    inclusivity: {
      isInclusive: true,
      neurodivergentFriendly: true,
      wheelchairAccessible: true,
      signLanguageAvailable: false,
      languages: ['Español'],
      familyRestrooms: true
    },
    directChat: {
      instructorName: 'Tía Marcela',
      instructorPhone: '+56 9 6554 4332',
      whatsappDirectNumber: '56965544332',
      whatsappDirectLink: 'https://wa.me/56965544332',
      inAppChatAvailable: true
    }
  },

  // 13. RANCAGUA - PLAZA DE BOLSILLO REPÚBLICA (Concepto Creado por Pablo Fuentes)
  {
    id: 'ws-ran-1',
    title: 'Festival Infantil & Food Trucks en Plaza de Bolsillo República',
    category: 'Plazas de Bolsillo & Ferias',
    neighborhoodId: 'rancagua',
    ageGroup: 'Toda la familia (0 a 99 años)',
    organizer: {
      id: 'org-ran-1',
      name: 'Dirección de Planificación y Urbanismo SECPLAC Rancagua',
      type: 'MUNICIPALIDAD_DIDECO',
      verified: true,
      legalEntityNumber: 'SECPLAC-RANCAGUA PJ 01',
      registrationBody: 'Municipalidad de Rancagua / Pablo Fuentes',
      phone: '+56 9 8891 2233',
      whatsapp: '56988912233',
      email: 'plazasdebolsillo@rancagua.cl',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      publisherIdentity: {
        fullName: 'Pablo Fuentes (Director SECPLAC)',
        rutMasked: '12.458.***-*',
        isClaveUnicaVerified: true
      }
    },
    instructorName: 'Pablo Fuentes & Monitores Urbanos',
    instructorRole: 'Arquitecto Urbanista / Creador Plazas de Bolsillo',
    instructorWhatsapp: '56988912233',
    locationName: 'Plaza de Bolsillo Av. República con Bombero Villalobos',
    address: 'Av. República con Bombero Villalobos, Rancagua',
    schedule: 'Hoy · 16:30 a 19:30 hrs',
    nextDate: 'Hoy en Vivo',
    timeSlot: '16:30 - 19:30 hrs',
    duration: '3 horas',
    capacity: 60,
    enrolledUsers: [
      { id: 'usr-r1', name: 'Familia Valenzuela', familyMembersCount: 3, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80', isMe: true, attended: false, role: 'familia' },
      { id: 'fr-r1', name: 'Familia Carreño', familyMembersCount: 4, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&auto=format&fit=crop&q=80', attended: false, role: 'familia', isFriend: true }
    ],
    description: 'Recuperación transitoria de sitio eriazo público: food trucks locales, mesas picnic, vegetación en maceteros móviles, arte urbano en vivo y juegos infantiles.',
    materialsProvided: true,
    isFree: true,
    safetyAdvisory: 'Espacio perimetrado seguro, monitoreo por Seguridad Pública 1455 y cámaras municipales.',
    safeRouteGuide: 'Paso de cebra demarcado en Av. República y paradero de microbuses a 30 metros.',
    activeCheckIn: true,
    checkInPin: '3150',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
    tags: ['Plaza de Bolsillo', 'Rancagua', 'Food Trucks', 'Familia', 'Urbanismo'],
    coordinates: { lat: -34.1720, lng: -70.7380 },
    
    vigencia: 'rojo', // ¡En curso ahora!
    spaceType: 'hardware_bolsillo',
    spaceHardwareDesc: 'Terreno baldío recuperado con food trucks, bancas de madera, macetones verdes y arte urbano',
    rating: 4.9,
    reviewsCount: 54,
    reviews: [
      { id: 'rev-1', authorName: 'Catalina M.', rating: 5, comment: 'Excelente iniciativa, antes era un peladero peligroso y ahora venimos con los niños a tomar helado y jugar seguros.', date: 'Ayer' },
      { id: 'rev-2', authorName: 'Rodrigo S.', rating: 5, comment: 'La comida rica y los juegos para niños muy entretenidos.', date: 'Hace 2 días' }
    ],
    sourceType: 'ia_scraper',
    sourceInstagramPost: {
      account: '@munirancagua',
      url: 'https://instagram.com/p/munirancagua_bolsillo',
      extractedText: '¡Hoy nos vemos en la Plaza de Bolsillo de Av. República! Trae a tus hijas e hijos a disfrutar de la activación comunitaria.',
      crawledAt: 'Hoy 14:10 hrs'
    },
    verifiedLegalEntity: true,
    policePartnerDisclaimer: true,
    interestedCount: 88,
    goingCount: 45,
    distanceMeters: 380,

    inclusivity: {
      isInclusive: true,
      neurodivergentFriendly: true,
      wheelchairAccessible: true,
      signLanguageAvailable: false,
      languages: ['Español'],
      familyRestrooms: true
    },
    directChat: {
      instructorName: 'Pablo Fuentes',
      instructorPhone: '+56 9 8891 2233',
      whatsappDirectNumber: '56988912233',
      whatsappDirectLink: 'https://wa.me/56988912233',
      inAppChatAvailable: true
    }
  },

  // 14. RANCAGUA - TEATRO LUCHO GATICA (CULTURA)
  {
    id: 'ws-ran-2',
    title: 'Festival de Títeres & Marionetas en Explanada Teatro Lucho Gatica',
    category: 'Teatro, Circo & Cuentos',
    neighborhoodId: 'rancagua',
    ageGroup: 'Para toda la familia (2 a 12 años)',
    organizer: {
      id: 'org-ran-2',
      name: 'Corporación de la Cultura y las Artes de Rancagua',
      type: 'CORPORACION_CULTURAL',
      verified: true,
      legalEntityNumber: 'PJ N° 102-CulturaRancagua',
      registrationBody: 'Ministerio de las Culturas / Municipalidad de Rancagua',
      phone: '+56 9 7788 9900',
      whatsapp: '56977889900',
      email: 'contacto@teatroluchogatica.cl',
      avatar: 'https://images.unsplash.com/photo-1469488865564-c2de10f69f96?w=150&auto=format&fit=crop&q=80',
      publisherIdentity: {
        fullName: 'Francisca Valenzuela (Programadora Cultural)',
        rutMasked: '15.892.***-*',
        isClaveUnicaVerified: true
      }
    },
    instructorName: 'Compañía El Roto Titiritero',
    instructorRole: 'Elenco Teatral Municipal',
    instructorWhatsapp: '56977889900',
    locationName: 'Frontis y Explanada Teatro Regional Lucho Gatica',
    address: 'Av. Capitán Antonio Millán #342, Rancagua',
    schedule: 'Hoy · 18:00 a 19:30 hrs',
    nextDate: 'Hoy Próximo',
    timeSlot: '18:00 - 19:30 hrs',
    duration: '1h 30m',
    capacity: 70,
    enrolledUsers: [],
    description: 'Espectáculo al aire libre de títeres gigantes y cuentos populares chilenos con música en vivo. Entrada liberada.',
    materialsProvided: true,
    isFree: true,
    safetyAdvisory: 'Plaza dura cerrada, iluminación LED de alta potencia y personal municipal en los accesos.',
    safeRouteGuide: 'Corredor seguro por calle Millán hacia Plaza de Los Héroes y estación de trenes EFE.',
    activeCheckIn: true,
    checkInPin: '3151',
    imageUrl: 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?w=800&auto=format&fit=crop&q=80',
    tags: ['Teatro', 'Títeres', 'Cultura', 'Rancagua'],
    coordinates: { lat: -34.1740, lng: -70.7420 },
    
    vigencia: 'naranja', // Comienza en menos de 2 horas
    spaceType: 'hardware_plaza',
    spaceHardwareDesc: 'Explanada cívica del teatro regional con bancas de hormigón y rampa universal',
    rating: 5.0,
    reviewsCount: 38,
    reviews: [
      { id: 'rev-3', authorName: 'María José G.', rating: 5, comment: 'Hermosa obra para los niños, los títeres son de nivel internacional.', date: 'Semana pasada' }
    ],
    sourceType: 'ia_scraper',
    sourceInstagramPost: {
      account: '@culturarancagua',
      url: 'https://instagram.com/p/culturarancagua_titeres',
      extractedText: 'Cartelera Cultural: Este sábado marionetas y títeres para toda la familia en el exterior de nuestro Teatro Lucho Gatica.',
      crawledAt: 'Hoy 12:00 hrs'
    },
    verifiedLegalEntity: true,
    policePartnerDisclaimer: true,
    interestedCount: 112,
    goingCount: 58,
    distanceMeters: 490,

    inclusivity: {
      isInclusive: true,
      neurodivergentFriendly: true,
      wheelchairAccessible: true,
      signLanguageAvailable: true,
      languages: ['Español', 'Lengua de Señas Chilena (LSCh)'],
      familyRestrooms: true
    },
    directChat: {
      instructorName: 'Compañía El Roto Titiritero',
      instructorPhone: '+56 9 7788 9900',
      whatsappDirectNumber: '56977889900',
      whatsappDirectLink: 'https://wa.me/56977889900',
      inAppChatAvailable: true
    }
  },

  // 15. RANCAGUA - PARQUE COMUNAL (DEPORTE & NATURALEZA)
  {
    id: 'ws-ran-3',
    title: 'Clínica de Futsal Infantil & Patinaje en Parque Comunal',
    category: 'Deporte & Juegos Tradicionales',
    neighborhoodId: 'rancagua',
    ageGroup: 'Niñas y niños (6 a 15 años)',
    organizer: {
      id: 'org-ran-3',
      name: 'Corporación Municipal de Deportes Rancagua',
      type: 'MUNICIPALIDAD_DIDECO',
      verified: true,
      legalEntityNumber: 'PJ N° 45-DeportesRancagua',
      registrationBody: 'Municipalidad de Rancagua / IND',
      phone: '+56 9 6677 8899',
      whatsapp: '56966778899',
      email: 'deportes@rancagua.cl',
      avatar: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=150&auto=format&fit=crop&q=80',
      publisherIdentity: {
        fullName: 'Prof. Mario Garrido',
        rutMasked: '11.340.***-*',
        isClaveUnicaVerified: true
      }
    },
    instructorName: 'Prof. Mario Garrido',
    instructorRole: 'Entrenador Formativo Comunal',
    instructorWhatsapp: '56966778899',
    locationName: 'Multicanchas & Pista de Patinaje Parque Comunal Rancagua',
    address: 'Av. Alameda con Chorrillos, Rancagua',
    schedule: 'Domingo · 10:00 a 12:30 hrs',
    nextDate: 'Domingo 18 de Octubre',
    timeSlot: '10:00 - 12:30 hrs',
    duration: '2h 30m',
    capacity: 45,
    enrolledUsers: [],
    description: 'Entrenamiento lúdico de futsal, postas atléticas y patinaje guiado para activar las multicanchas del parque.',
    materialsProvided: true,
    isFree: true,
    safetyAdvisory: 'Recinto cerrado con control de entrada, primeros auxilios y enfermería del parque.',
    safeRouteGuide: 'Circuito perimetral de ciclovía y veredas amplias con luminaria renovada.',
    activeCheckIn: true,
    checkInPin: '3152',
    imageUrl: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=600&auto=format&fit=crop&q=80',
    tags: ['Deporte', 'Futsal', 'Parque Comunal', 'Rancagua'],
    coordinates: { lat: -34.1680, lng: -70.7350 },
    
    vigencia: 'verde', // Con tiempo suficiente para llegar
    spaceType: 'hardware_multicancha',
    spaceHardwareDesc: 'Complejo de multicanchas con reja perimetral, bancas techadas y graderías',
    rating: 4.8,
    reviewsCount: 31,
    sourceType: 'organizador_verificado',
    verifiedLegalEntity: true,
    policePartnerDisclaimer: true,
    interestedCount: 65,
    goingCount: 32,
    distanceMeters: 620,

    inclusivity: {
      isInclusive: true,
      neurodivergentFriendly: true,
      wheelchairAccessible: true,
      signLanguageAvailable: false,
      languages: ['Español'],
      familyRestrooms: true
    },
    directChat: {
      instructorName: 'Prof. Mario Garrido',
      instructorPhone: '+56 9 6677 8899',
      whatsappDirectNumber: '56966778899',
      whatsappDirectLink: 'https://wa.me/56966778899',
      inAppChatAvailable: true
    }
  },

  // 16. RANCAGUA - ARCHIVO HISTÓRICO KERMESSE
  {
    id: 'ws-ran-4',
    title: 'Kermesse Familiar & Rifa Comunitaria en Colegio O\'Higgins',
    category: 'Colegios & Kermeses',
    neighborhoodId: 'rancagua',
    ageGroup: 'Toda la comunidad escolar y barrial',
    organizer: {
      id: 'org-ran-4',
      name: 'Centro General de Padres Colegio Bernardo O\'Higgins',
      type: 'COLEGIO',
      verified: true,
      legalEntityNumber: 'PJ Escolar N° 881-Rancagua',
      registrationBody: 'Colegios Municipales / CORMUN Rancagua',
      phone: '+56 9 5544 3322',
      whatsapp: '56955443322',
      email: 'padres.ohiggins@rancagua.cl',
      avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
      publisherIdentity: {
        fullName: 'Lorena Silva (Presidenta CGPA)',
        rutMasked: '14.231.***-*',
        isClaveUnicaVerified: true
      }
    },
    instructorName: 'Equipo de Apoderados & Docentes',
    instructorRole: 'Comisión Barrial del Colegio',
    instructorWhatsapp: '56955443322',
    locationName: 'Gimnasio & Patio Central Colegio O\'Higgins',
    address: 'Calle Estado #240, Rancagua Centro',
    schedule: 'Sábado pasado · 12:00 a 18:00 hrs',
    nextDate: 'Finalizado (Histórico)',
    timeSlot: '12:00 - 18:00 hrs',
    duration: '6 horas',
    capacity: 150,
    enrolledUsers: [],
    description: 'Juegos de kermesse, pesca milagrosa, ruleta solidaria y muestra de talleres de alumnos para fondos del patio inclusivo.',
    materialsProvided: true,
    isFree: true,
    safetyAdvisory: 'Actividad realizada con guardias y supervisión comunitaria.',
    safeRouteGuide: 'Salida directa a Calle Estado.',
    activeCheckIn: false,
    checkInPin: '3153',
    imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=600&auto=format&fit=crop&q=80',
    tags: ['Kermesse', 'Colegio', 'Archivo', 'Rancagua'],
    coordinates: { lat: -34.1710, lng: -70.7410 },
    
    vigencia: 'archivo', // Blanco y negro / archivo histórico
    spaceType: 'hardware_sede',
    spaceHardwareDesc: 'Patio techado escolar abierto al vecindario',
    rating: 4.9,
    reviewsCount: 46,
    sourceType: 'comunitario_organico',
    verifiedLegalEntity: true,
    policePartnerDisclaimer: true,
    interestedCount: 140,
    goingCount: 98,
    distanceMeters: 410,

    inclusivity: {
      isInclusive: true,
      neurodivergentFriendly: true,
      wheelchairAccessible: true,
      signLanguageAvailable: false,
      languages: ['Español'],
      familyRestrooms: true
    },
    directChat: {
      instructorName: 'Lorena Silva',
      instructorPhone: '+56 9 5544 3322',
      whatsappDirectNumber: '56955443322',
      whatsappDirectLink: 'https://wa.me/56955443322',
      inAppChatAvailable: true
    }
  }
];

export const INITIAL_INCIDENTS: IncidentReport[] = [
  {
    id: 'inc-col-1',
    neighborhoodId: 'colina',
    workshopId: 'ws-col-1',
    workshopTitle: 'Mini-Granjeros & Huerto de Primavera en Colina',
    category: 'Juegos Infantiles & Plaza',
    isCustomCategory: true,
    title: 'Hamaca de niños en Parque San Miguel necesita ajuste de cadena',
    description: 'Una de las hamacas del parque frente a la zona de huerto tiene la cadena suelta.',
    location: 'Parque San Miguel, zona de huerto infantil, Colina Centro',
    timestamp: 'Hace 25 min',
    reporterName: 'Tía Carolina (Monitora)',
    urgency: 'media',
    upvotes: 18,
    hasUpvoted: true,
    solved: false,
    commentsCount: 3,
    iconType: 'juegos',
    mapCoord: { x: 35, y: 44 },
    coordinates: { lat: -33.2060, lng: -70.6740 }
  },
  {
    id: 'inc-col-2',
    neighborhoodId: 'colina',
    workshopId: 'ws-col-1',
    workshopTitle: 'Mini-Granjeros & Huerto de Primavera en Colina',
    category: 'Iluminación & Pasaje',
    isCustomCategory: true,
    title: 'Foco led frente al cruce peatonal de Fontt reparado y funcionando',
    description: 'Cuadrilla de Colina reparó la luminaria del cruce.',
    location: 'Calle Fontt con Nueva Colina',
    timestamp: 'Hace 2 horas',
    reporterName: 'Vecino Don Ramón',
    urgency: 'preventiva',
    upvotes: 29,
    hasUpvoted: false,
    solved: true,
    commentsCount: 2,
    iconType: 'luz',
    mapCoord: { x: 50, y: 32 },
    coordinates: { lat: -33.2052, lng: -70.6751 }
  },
  {
    id: 'inc-cn-1',
    neighborhoodId: 'cerronavia',
    workshopId: 'ws-cn-1',
    workshopTitle: 'Semillitas de Cerro Navia: Huerto Infantil',
    category: 'Cruce Escolar Seguro',
    isCustomCategory: true,
    title: 'Demarcación de paso cebra y lomo de toro visible en Mapocho',
    description: 'Paso peatonal seguro para niñas y niños que asisten a la sede Las Estrellas.',
    location: 'Av. Mapocho #7420, Cerro Navia',
    timestamp: 'Hoy, 09:15 hrs',
    reporterName: 'Tía Marisol (JJVV)',
    urgency: 'preventiva',
    upvotes: 21,
    hasUpvoted: true,
    solved: true,
    commentsCount: 4,
    iconType: 'calle',
    mapCoord: { x: 42, y: 55 },
    coordinates: { lat: -33.4248, lng: -70.7288 }
  },
  {
    id: 'inc-yn-1',
    neighborhoodId: 'santiago',
    workshopId: 'ws-yn-1',
    workshopTitle: 'Cuentacuentos & Títeres de Barrio en Yungay',
    category: 'Iluminación & Pasaje',
    isCustomCategory: true,
    title: 'Luminaria patrimonial de calle Herrera reparada',
    description: 'Excelente visibilidad nocturna en la salida hacia Plaza Yungay.',
    location: 'Calle Herrera esquina Huérfanos',
    timestamp: 'Ayer',
    reporterName: 'Vecina Carmen',
    urgency: 'preventiva',
    upvotes: 34,
    hasUpvoted: false,
    solved: true,
    commentsCount: 5,
    iconType: 'luz',
    mapCoord: { x: 48, y: 38 },
    coordinates: { lat: -33.4390, lng: -70.6765 }
  },
  {
    id: 'inc-pa-1',
    neighborhoodId: 'puentealto',
    workshopId: 'ws-pa-1',
    workshopTitle: 'Huerto Urbano & Tierra Viva en Bajos de Mena',
    category: 'Juegos Infantiles & Plaza',
    isCustomCategory: true,
    title: 'Reja perimetral de Parque Gabriela reforzada',
    description: 'Acceso seguro sin paso de motos hacia la zona del huerto y juegos.',
    location: 'Parque Gabriela, Puente Alto',
    timestamp: 'Hace 3 horas',
    reporterName: 'Don Carlos (Comité)',
    urgency: 'preventiva',
    upvotes: 42,
    hasUpvoted: true,
    solved: true,
    commentsCount: 6,
    iconType: 'juegos',
    mapCoord: { x: 30, y: 45 },
    coordinates: { lat: -33.6085, lng: -70.5782 }
  }
];

export const COMMUNITY_LANDMARKS: CommunityLandmark[] = [
  // COLINA
  {
    id: 'lm-col-1',
    neighborhoodId: 'colina',
    name: 'Plaza de Armas de Colina',
    category: 'plaza',
    categoryLabel: 'Plaza Central & Juegos',
    address: 'Plaza de Armas de Colina',
    description: 'Centro cívico con zona de juegos infantiles arbolada y vigilancia permanente.',
    coordinates: { lat: -33.2038, lng: -70.6760 },
    iconEmoji: '🌳'
  },
  {
    id: 'lm-col-2',
    neighborhoodId: 'colina',
    name: 'Centro Comunitario y Cultural de Colina',
    category: 'sede',
    categoryLabel: 'Centro Cultural & Sede',
    address: 'Av. Concepción #398, Colina',
    description: 'Salas de arte, teatro y registro de organizaciones comunitarias DIDECO.',
    coordinates: { lat: -33.2025, lng: -70.6775 },
    iconEmoji: '🏛️'
  },
  {
    id: 'lm-col-3',
    neighborhoodId: 'colina',
    name: 'CESFAM Colina Centro',
    category: 'salud',
    categoryLabel: 'Salud Familiar',
    address: 'Alpatacal #090, Colina',
    description: 'Centro de salud con atención primaria y vacunatorio infantil.',
    coordinates: { lat: -33.2051, lng: -70.6782 },
    iconEmoji: '🏥'
  },
  {
    id: 'lm-col-4',
    neighborhoodId: 'colina',
    name: 'Base Seguridad Vecinal Colina (1468)',
    category: 'seguridad',
    categoryLabel: 'Seguridad Ciudadana',
    address: 'Av. Nueva Colina #400, Colina',
    description: 'Móviles de patrullaje preventivo y coordinación con Carabineros.',
    coordinates: { lat: -33.2015, lng: -70.6730 },
    iconEmoji: '🛡️'
  },
  {
    id: 'lm-col-5',
    neighborhoodId: 'colina',
    name: 'Parada Colectivos Las Canteras - Fontt',
    category: 'transporte',
    categoryLabel: 'Conectividad Barrial',
    address: 'Calle Fontt con Av. Concepción',
    description: 'Punto de encuentro y salida iluminada para retorno seguro a casa.',
    coordinates: { lat: -33.2070, lng: -70.6750 },
    iconEmoji: '🚏'
  },

  // CERRO NAVIA
  {
    id: 'lm-cn-1',
    neighborhoodId: 'cerronavia',
    name: 'Plaza y Sede Herminda de la Victoria',
    category: 'plaza',
    categoryLabel: 'Plaza Histórica & Juegos',
    address: 'Calle Mapocho #7420, Cerro Navia',
    description: 'Espacio verde con juegos infantiles y punto de encuentro vecinal.',
    coordinates: { lat: -33.4250, lng: -70.7290 },
    iconEmoji: '🌳'
  },
  {
    id: 'lm-cn-2',
    neighborhoodId: 'cerronavia',
    name: 'CESFAM Dr. Adalberto Steeger',
    category: 'salud',
    categoryLabel: 'Centro de Salud',
    address: 'Huelén #1629, Cerro Navia',
    description: 'Servicio de urgencia y control del niño sano.',
    coordinates: { lat: -33.4285, lng: -70.7260 },
    iconEmoji: '🏥'
  },
  {
    id: 'lm-cn-3',
    neighborhoodId: 'cerronavia',
    name: 'Módulo Seguridad Cerro Navia (1412)',
    category: 'seguridad',
    categoryLabel: 'Seguridad Vecinal',
    address: 'Salvador Gutiérrez #7200',
    description: 'Base de patrullaje preventivo barrial.',
    coordinates: { lat: -33.4230, lng: -70.7340 },
    iconEmoji: '🛡️'
  },

  // SANTIAGO (YUNGAY)
  {
    id: 'lm-yn-1',
    neighborhoodId: 'santiago',
    name: 'Plaza Yungay & Monumento al Roto Chileno',
    category: 'plaza',
    categoryLabel: 'Plaza Patrimonial',
    address: 'Santo Domingo con Sotomayor, Santiago',
    description: 'Plaza con sombra de plátanos orientales, ferias y actividades comunitarias.',
    coordinates: { lat: -33.4385, lng: -70.6755 },
    iconEmoji: '🌳'
  },
  {
    id: 'lm-yn-2',
    neighborhoodId: 'santiago',
    name: 'Metro Quinta Normal (L5)',
    category: 'transporte',
    categoryLabel: 'Metro de Santiago',
    address: 'Matucana con Catedral',
    description: 'Acceso conectado con Parque Quinta Normal y museos infantiles.',
    coordinates: { lat: -33.4402, lng: -70.6812 },
    iconEmoji: '🚇'
  },
  {
    id: 'lm-yn-3',
    neighborhoodId: 'santiago',
    name: 'CESFAM Ignacio Domeyko',
    category: 'salud',
    categoryLabel: 'Salud Familiar',
    address: 'Cueto #543, Santiago',
    description: 'Atención primaria y programas de desarrollo infantil.',
    coordinates: { lat: -33.4360, lng: -70.6725 },
    iconEmoji: '🏥'
  },

  // PUENTE ALTO
  {
    id: 'lm-pa-1',
    neighborhoodId: 'puentealto',
    name: 'Plaza de Armas de Puente Alto',
    category: 'plaza',
    categoryLabel: 'Plaza Comunal',
    address: 'Manuel Rodríguez con Concha y Toro',
    description: 'Plaza cívica conectada a Metro Plaza de Puente Alto.',
    coordinates: { lat: -33.6117, lng: -70.5758 },
    iconEmoji: '🌳'
  },
  {
    id: 'lm-pa-2',
    neighborhoodId: 'puentealto',
    name: 'Estación Metro Las Mercedes',
    category: 'transporte',
    categoryLabel: 'Metro L4',
    address: 'Av. Concha y Toro con San Carlos',
    description: 'Intermodal de transporte hacia Bajos de Mena.',
    coordinates: { lat: -33.6020, lng: -70.5820 },
    iconEmoji: '🚇'
  },

  // RECOLETA
  {
    id: 'lm-rec-1',
    neighborhoodId: 'recoleta',
    name: 'Parque Cerro Blanco',
    category: 'plaza',
    categoryLabel: 'Parque Patrimonial',
    address: 'Santos Dumont con Av. Recoleta',
    description: 'Área verde con senderos seguros, juegos y centro cultural.',
    coordinates: { lat: -33.4182, lng: -70.6432 },
    iconEmoji: '🌳'
  },
  {
    id: 'lm-rec-2',
    neighborhoodId: 'recoleta',
    name: 'Metro Cerro Blanco (L2)',
    category: 'transporte',
    categoryLabel: 'Metro L2',
    address: 'Av. Recoleta con Santos Dumont',
    description: 'Conexión directa con escuelas y sedes vecinales.',
    coordinates: { lat: -33.4170, lng: -70.6450 },
    iconEmoji: '🚇'
  },

  // VALPARAÍSO
  {
    id: 'lm-valp-1',
    neighborhoodId: 'valparaiso',
    name: 'Paseo Yugoslavo & Palacio Baburizza',
    category: 'plaza',
    categoryLabel: 'Mirador & Plaza',
    address: 'Paseo Yugoslavo, Cerro Alegre',
    description: 'Mirador histórico con juegos de niños y barandas seguras.',
    coordinates: { lat: -33.0410, lng: -71.6288 },
    iconEmoji: '🚢'
  },
  {
    id: 'lm-valp-2',
    neighborhoodId: 'valparaiso',
    name: 'Ascensor El Peral',
    category: 'transporte',
    categoryLabel: 'Ascensor Típico Porteño',
    address: 'Plaza Sotomayor con Paseo Yugoslavo',
    description: 'Conexión patrimonial entre el plan y cerro alegre.',
    coordinates: { lat: -33.0395, lng: -71.6280 },
    iconEmoji: '🚠'
  },

  // MAIPÚ LANDMARKS
  {
    id: 'lm-mai-1',
    neighborhoodId: 'maipu',
    name: 'Plaza de Maipú & Estación Intermodal Metro L5',
    category: 'plaza',
    categoryLabel: 'Plaza Central & Transporte',
    address: 'Av. Pajaritos con Av. 5 de Abril',
    description: 'Corazón cívico de la comuna con juegos infantiles y conectividad.',
    coordinates: { lat: -33.5112, lng: -70.7578 },
    iconEmoji: '🚇'
  },
  {
    id: 'lm-mai-2',
    neighborhoodId: 'maipu',
    name: 'Santuario Nacional Templo Votivo de Maipú',
    category: 'sede',
    categoryLabel: 'Monumento Histórico & Parque',
    address: 'Carmen #1750, Maipú',
    description: 'Extenso parque arbolado, mirador y explanada para talleres familiares.',
    coordinates: { lat: -33.5135, lng: -70.7620 },
    iconEmoji: '🏛️'
  },
  {
    id: 'lm-mai-3',
    neighborhoodId: 'maipu',
    name: 'Parque Cerro Primo de Rivera',
    category: 'plaza',
    categoryLabel: 'Parque Natural & Juegos',
    address: 'Av. Pajaritos con Anker Nielsen',
    description: 'Cerro isla con senderos infantiles, mirador y canchas deportivas.',
    coordinates: { lat: -33.5020, lng: -70.7530 },
    iconEmoji: '🌳'
  },

  // RANCAGUA
  {
    id: 'lm-ran-1',
    neighborhoodId: 'rancagua',
    name: 'Plaza de Los Héroes de Rancagua',
    category: 'plaza',
    categoryLabel: 'Plaza Histórica Central',
    address: 'Plaza de Los Héroes s/n, Rancagua Centro',
    description: 'Plaza mayor histórica con bancas, fuentes y custodia de Carabineros 1ra Comisaría.',
    coordinates: { lat: -34.1705, lng: -70.7405 },
    iconEmoji: '🏛️'
  },
  {
    id: 'lm-ran-2',
    neighborhoodId: 'rancagua',
    name: 'Plaza de Bolsillo República & Bombero Villalobos',
    category: 'plaza',
    categoryLabel: 'Plaza de Bolsillo Recuperada',
    address: 'Av. República con Bombero Villalobos',
    description: 'Terreno baldío recuperado transitoriamente con food trucks, mobiliario y arte urbano (modelo Pablo Fuentes).',
    coordinates: { lat: -34.1720, lng: -70.7380 },
    iconEmoji: '🚚'
  },
  {
    id: 'lm-ran-3',
    neighborhoodId: 'rancagua',
    name: 'Teatro Regional Lucho Gatica',
    category: 'sede',
    categoryLabel: 'Teatro Regional & Foyer Cívico',
    address: 'Av. Capitán Antonio Millán #342',
    description: 'Espacio cultural principal con explanada exterior para artes escénicas de barrio.',
    coordinates: { lat: -34.1740, lng: -70.7420 },
    iconEmoji: '🎭'
  },
  {
    id: 'lm-ran-4',
    neighborhoodId: 'rancagua',
    name: 'Parque Comunal de Rancagua',
    category: 'plaza',
    categoryLabel: 'Gran Parque Urbano & Multicanchas',
    address: 'Av. Alameda con Chorrillos',
    description: 'Parque con circuito de trote, multicanchas perimetradas y zonas de picnic familiar.',
    coordinates: { lat: -34.1680, lng: -70.7350 },
    iconEmoji: '🌳'
  },
  {
    id: 'lm-ran-5',
    neighborhoodId: 'rancagua',
    name: 'Central Seguridad Pública Rancagua (1455)',
    category: 'seguridad',
    categoryLabel: 'Seguridad Ciudadana',
    address: 'O\'Carrol #530, Rancagua',
    description: 'Central de televigilancia municipal y patrullaje preventivo.',
    coordinates: { lat: -34.1695, lng: -70.7430 },
    iconEmoji: '🛡️'
  }
];

export const INITIAL_USER_STREAK: UserStreakProfile = {
  name: 'Familia Valenzuela',
  role: 'familia',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  streakWeeks: 4,
  streakDaysCurrentWeek: 3,
  totalWorkshopsAttended: 12,
  levelTitle: 'Familia Chispa de Oro · Nivel 3',
  levelNumber: 3,
  xpCurrent: 450,
  xpNextLevel: 600,
  weekDays: [
    { dayName: 'Lun', shortDate: '05 Oct', attended: false, isToday: false },
    { dayName: 'Mar', shortDate: '06 Oct', attended: true, isToday: true, workshopName: 'Huertito & Semillitas' },
    { dayName: 'Mié', shortDate: '07 Oct', attended: true, isToday: false, workshopName: 'Circo de Barrio' },
    { dayName: 'Jue', shortDate: '08 Oct', attended: true, isToday: false, workshopName: 'Cuentacuentos & Títeres' },
    { dayName: 'Vie', shortDate: '09 Oct', attended: false, isToday: false },
    { dayName: 'Sáb', shortDate: '10 Oct', attended: false, isToday: false },
    { dayName: 'Dom', shortDate: '11 Oct', attended: false, isToday: false }
  ],
  badges: [
    {
      id: 'bdg-1',
      name: 'Semillita Chispa',
      description: 'Asististe a tu primer taller familiar en la sede.',
      iconEmoji: '🌱',
      unlocked: true,
      unlockedDate: '12 Sep 2026',
      rewardText: 'Set de stickers y macetero para llevar a casa'
    },
    {
      id: 'bdg-2',
      name: 'Racha Chispeante x4 Semanas',
      description: '4 semanas consecutivas llenando de vida tu plaza o sede.',
      iconEmoji: '🔥',
      unlocked: true,
      unlockedDate: '06 Oct 2026',
      rewardText: 'Kit de témperas y semillas libres de regalo'
    }
  ]
};

export const BIG_DATA_TELEMETRY: BigDataMetrics = {
  totalRegisteredFamilies: 4280,
  weeklyActiveEngagementRate: 78.4,
  physicalCheckInConversionRate: 89.2,
  averageStreakWeeks: 3.6,
  socialReturnOnInvestmentCLP: '$4.200.000 CLP / sede mensual',
  incidentMeanTimeToResolutionHours: 19.5,
  topDemographicCohorts: [
    { label: 'Familias con niños (3 a 10 años)', percentage: 48 },
    { label: 'Niñas y niños en edad escolar (11 a 15 años)', percentage: 24 },
    { label: 'Madres y cuidadoras principales', percentage: 16 },
    { label: 'Adultos mayores tutores', percentage: 12 }
  ],
  categoryDemandShare: [
    { category: 'Huertos & Naturaleza', demandPercentage: 34 },
    { category: 'Circo & Juegos Tradicionales', demandPercentage: 28 },
    { category: 'Arte & Oficios Patrimoniales', demandPercentage: 20 },
    { category: 'Ciencia & Robótica', demandPercentage: 18 }
  ],
  communeComparison: [
    { commune: 'Comuna de Colina', familiesCount: 1140, attendanceRate: 91.4, safetyIncidentsResolved: 34 },
    { commune: 'Comuna de Cerro Navia', familiesCount: 980, attendanceRate: 88.2, safetyIncidentsResolved: 42 },
    { commune: 'Comuna de Santiago (Yungay)', familiesCount: 820, attendanceRate: 86.5, safetyIncidentsResolved: 29 },
    { commune: 'Comuna de Puente Alto', familiesCount: 1340, attendanceRate: 90.1, safetyIncidentsResolved: 51 },
    { commune: 'Comuna de Maipú', familiesCount: 1210, attendanceRate: 89.7, safetyIncidentsResolved: 38 },
    { commune: 'Comuna de Rancagua', familiesCount: 1050, attendanceRate: 92.5, safetyIncidentsResolved: 36 }
  ]
};

export const COMMUNE_REFERENCE_POINTS: Record<ActiveCommune, ReferencePoint[]> = {
  maipu: [
    { id: 'ref-mai-center', name: 'Metro Plaza de Maipú (Centro)', commune: 'maipu', coordinates: { lat: -33.5112, lng: -70.7578 }, isCenter: true },
    { id: 'ref-mai-longitudinal', name: 'Barrio Longitudinal', commune: 'maipu', coordinates: { lat: -33.4980, lng: -70.7420 } },
    { id: 'ref-mai-satelite', name: 'Ciudad Satélite', commune: 'maipu', coordinates: { lat: -33.5420, lng: -70.7920 } },
    { id: 'ref-mai-tresponiente', name: 'Pajaritos / Parque Tres Poniente', commune: 'maipu', coordinates: { lat: -33.5220, lng: -70.7710 } },
    { id: 'ref-mai-abrazo', name: 'El Abrazo', commune: 'maipu', coordinates: { lat: -33.5350, lng: -70.7780 } }
  ],
  valparaiso: [
    { id: 'ref-val-center', name: 'Plaza Victoria (Centro)', commune: 'valparaiso', coordinates: { lat: -33.0470, lng: -71.6190 }, isCenter: true },
    { id: 'ref-val-alegre', name: 'Cerro Alegre', commune: 'valparaiso', coordinates: { lat: -33.0425, lng: -71.6289 } },
    { id: 'ref-val-baron', name: 'Cerro Barón', commune: 'valparaiso', coordinates: { lat: -33.0390, lng: -71.5990 } },
    { id: 'ref-val-playaancha', name: 'Playa Ancha', commune: 'valparaiso', coordinates: { lat: -33.0310, lng: -71.6420 } },
    { id: 'ref-val-polanco', name: 'Cerro Polanco', commune: 'valparaiso', coordinates: { lat: -33.0490, lng: -71.6080 } }
  ]
};

export function calculateProximity(
  refCoord: { lat: number; lng: number },
  destCoord?: { lat: number; lng: number }
): { distanceMeters: number; walkingMinutes: number; text: string } {
  if (!destCoord) {
    return { distanceMeters: 450, walkingMinutes: 6, text: 'A 6 min de tu ubicación (450m)' };
  }
  const dLat = (destCoord.lat - refCoord.lat) * 111139;
  const dLng = (destCoord.lng - refCoord.lng) * 111139 * Math.cos((refCoord.lat * Math.PI) / 180);
  const distM = Math.max(120, Math.round(Math.sqrt(dLat * dLat + dLng * dLng)));
  const walkMin = Math.max(2, Math.round(distM / 80));
  return {
    distanceMeters: distM,
    walkingMinutes: walkMin,
    text: `A ${walkMin} min de tu ubicación (${distM}m)`
  };
}

