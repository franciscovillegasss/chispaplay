import { useState, useMemo } from 'react';
import { 
  Neighborhood, 
  Workshop, 
  IncidentReport, 
  CommunityLandmark,
  NeighborGuardian
} from '../types';
import { 
  COMMUNITY_LANDMARKS, 
  CHILE_NEIGHBORHOODS,
  MOCK_NEIGHBOR_GUARDIANS
} from '../data/mockData';
import { 
  MapPin, 
  ShieldAlert, 
  CheckCircle2, 
  Users, 
  MessageCircle, 
  Compass, 
  Sparkles, 
  Layers, 
  X,
  Clock,
  Navigation2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  VolumeX,
  Flame,
  Search,
  Globe2,
  Share2
} from 'lucide-react';

interface NeighborhoodEcosystemMapProps {
  currentNeighborhood: Neighborhood;
  allNeighborhoods?: Neighborhood[];
  onSelectNeighborhood?: (neighborhood: Neighborhood) => void;
  workshops: Workshop[];
  incidents: IncidentReport[];
  onSelectWorkshop: (workshop: Workshop) => void;
  onOpenDirectChat: (workshop: Workshop) => void;
  onOpenAttendance: (workshop: Workshop) => void;
  onOpenNewIncident: () => void;
}

type MapFilterType = 'all' | 'workshops' | 'inclusive' | 'safety' | 'landmarks' | 'guardians';

interface CommuneGeoSpec {
  name: string;
  tagline: string;
  mainAvenueHorizontal: string;
  crossAvenueVertical: string;
  secondaryStreet1: string;
  secondaryStreet2: string;
  naturalFeature: {
    type: 'river' | 'hill' | 'park' | 'sea';
    label: string;
    description: string;
  };
  zones: {
    name: string;
    type: 'park' | 'civic' | 'residential' | 'cultural';
    x: number;
    y: number;
    w: number;
    h: number;
    color: string;
    textColor: string;
  }[];
  safeCorridors: {
    name: string;
    path: string; // SVG path
    color: string;
  }[];
}

// Real-life geographical specs for each Chilean commune
const COMMUNE_GEO_SPECS: Record<string, CommuneGeoSpec> = {
  colina: {
    name: 'Comuna de Colina',
    tagline: 'Valle de Chacabuco · Casco Histórico, Las Canteras & Chamisero',
    mainAvenueHorizontal: 'Av. Concepción (Eje Poniente-Oriente)',
    crossAvenueVertical: 'Calle Fontt / Carretera San Martín',
    secondaryStreet1: 'Calle Alpatacal / Esmeralda',
    secondaryStreet2: 'Camino Chicureo / Chamisero',
    naturalFeature: {
      type: 'river',
      label: 'Río Colina & Ribera Verde',
      description: 'Eje fluvial natural que cruza el sur del casco comunal'
    },
    zones: [
      { name: '🌳 Parque San Miguel', type: 'park', x: 80, y: 70, w: 220, h: 140, color: 'bg-emerald-100 border-emerald-300', textColor: 'text-emerald-800' },
      { name: '🏛️ Plaza de Armas & Municipalidad', type: 'civic', x: 420, y: 160, w: 180, h: 110, color: 'bg-amber-100 border-amber-300', textColor: 'text-amber-900' },
      { name: '🎨 Sector Canteras de Colina', type: 'cultural', x: 680, y: 80, w: 200, h: 130, color: 'bg-orange-100 border-orange-300', textColor: 'text-orange-900' },
      { name: '🏡 Valle Verde & Chamisero', type: 'residential', x: 640, y: 340, w: 240, h: 140, color: 'bg-stone-100 border-stone-300', textColor: 'text-stone-700' }
    ],
    safeCorridors: [
      { name: 'Ruta Segura Iluminada Plaza-Parque', path: 'M 190 140 L 420 215 L 680 145', color: '#10b981' },
      { name: 'Corredor Peatonal Escolar Calle Fontt', path: 'M 510 50 L 510 490', color: '#f59e0b' }
    ]
  },
  cerronavia: {
    name: 'Comuna de Cerro Navia',
    tagline: 'Poniente Metropolitano · Herminda de la Victoria & Salvador Gutiérrez',
    mainAvenueHorizontal: 'Av. Salvador Gutiérrez',
    crossAvenueVertical: 'Av. San Francisco / Las Torres',
    secondaryStreet1: 'Av. Mapocho (Ribera Sur)',
    secondaryStreet2: 'Av. Costanera Sur',
    naturalFeature: {
      type: 'river',
      label: 'Ribera Sur Río Mapocho',
      description: 'Borde ecológico y corredor intercomunal'
    },
    zones: [
      { name: '🌳 Parque Javiera Carrera', type: 'park', x: 90, y: 80, w: 230, h: 130, color: 'bg-emerald-100 border-emerald-300', textColor: 'text-emerald-800' },
      { name: '🏛️ Plaza Trementina & Sede Central', type: 'civic', x: 410, y: 150, w: 190, h: 120, color: 'bg-amber-100 border-amber-300', textColor: 'text-amber-900' },
      { name: '🌱 Huertos Familiares Herminda', type: 'cultural', x: 690, y: 70, w: 200, h: 140, color: 'bg-lime-100 border-lime-300', textColor: 'text-lime-900' },
      { name: '🏡 Pasajes Comunitarios Sur', type: 'residential', x: 620, y: 350, w: 260, h: 130, color: 'bg-stone-100 border-stone-300', textColor: 'text-stone-700' }
    ],
    safeCorridors: [
      { name: 'Eje Peatonal Seguro Salvador Gutiérrez', path: 'M 100 240 L 880 240', color: '#10b981' },
      { name: 'Ruta Segura Escolar San Francisco', path: 'M 500 60 L 500 480', color: '#f59e0b' }
    ]
  },
  santiago: {
    name: 'Comuna de Santiago (Barrio Yungay)',
    tagline: 'Casco Patrimonial · Plaza Yungay, Herrera & San Pablo',
    mainAvenueHorizontal: 'Calle San Pablo / Compañía de Jesús',
    crossAvenueVertical: 'Calle Herrera / Libertad',
    secondaryStreet1: 'Calle Huérfanos / Santo Domingo',
    secondaryStreet2: 'Av. Matucana (Eje Museos)',
    naturalFeature: {
      type: 'park',
      label: 'Parque Quinta Normal',
      description: 'Hito verde patrimonial con lagunas y museos'
    },
    zones: [
      { name: '🌳 Parque Quinta Normal', type: 'park', x: 70, y: 70, w: 240, h: 160, color: 'bg-emerald-100 border-emerald-300', textColor: 'text-emerald-800' },
      { name: '🏛️ Plaza Yungay (Roto Chileno)', type: 'civic', x: 420, y: 150, w: 190, h: 120, color: 'bg-amber-100 border-amber-300', textColor: 'text-amber-900' },
      { name: '🎨 Centro Cultural Herrera', type: 'cultural', x: 700, y: 90, w: 190, h: 130, color: 'bg-rose-100 border-rose-300', textColor: 'text-rose-900' },
      { name: '🏡 Cités & Casas Patrimoniales', type: 'residential', x: 630, y: 340, w: 250, h: 140, color: 'bg-stone-100 border-stone-300', textColor: 'text-stone-700' }
    ],
    safeCorridors: [
      { name: 'Paseo Huérfanos Peatonal Protegido', path: 'M 80 300 L 890 300', color: '#10b981' },
      { name: 'Corredor Seguro Escolar Herrera', path: 'M 520 60 L 520 480', color: '#f59e0b' }
    ]
  },
  puentealto: {
    name: 'Comuna de Puente Alto',
    tagline: 'Sur Metropolitano · Concha y Toro, Bajos de Mena & Plaza',
    mainAvenueHorizontal: 'Av. Concha y Toro (Eje Metro L4)',
    crossAvenueVertical: 'Av. Eyzaguirre / Av. San Carlos',
    secondaryStreet1: 'Av. Camilo Henríquez',
    secondaryStreet2: 'Acceso Bajos de Mena / Sta. Rosa',
    naturalFeature: {
      type: 'river',
      label: 'Río Maipo & Cordillera de la Costa',
      description: 'Límite hídrico y pulmón cordillerano'
    },
    zones: [
      { name: '🌳 Parque Nuestra Señora de Gabriela', type: 'park', x: 80, y: 70, w: 230, h: 140, color: 'bg-emerald-100 border-emerald-300', textColor: 'text-emerald-800' },
      { name: '🏛️ Plaza de Puente Alto & Metro', type: 'civic', x: 410, y: 160, w: 200, h: 110, color: 'bg-amber-100 border-amber-300', textColor: 'text-amber-900' },
      { name: '🎪 Centro de Extensión Municipal', type: 'cultural', x: 700, y: 80, w: 190, h: 130, color: 'bg-purple-100 border-purple-300', textColor: 'text-purple-900' },
      { name: '🏡 Bajos de Mena & Canchas', type: 'residential', x: 620, y: 340, w: 260, h: 140, color: 'bg-stone-100 border-stone-300', textColor: 'text-stone-700' }
    ],
    safeCorridors: [
      { name: 'Corredor Metro Concha y Toro Iluminado', path: 'M 90 230 L 890 230', color: '#10b981' },
      { name: 'Ruta Segura Gabriela a la Plaza', path: 'M 200 140 L 410 215 L 700 380', color: '#f59e0b' }
    ]
  },
  recoleta: {
    name: 'Comuna de Recoleta',
    tagline: 'Zona Norte · Cerro Blanco, Santos Dumont & Bellavista Norte',
    mainAvenueHorizontal: 'Av. Recoleta (Eje Metro L2)',
    crossAvenueVertical: 'Av. Santos Dumont / Einstein',
    secondaryStreet1: 'Av. Perú / Valdivieso',
    secondaryStreet2: 'Calle Unión / El Salto',
    naturalFeature: {
      type: 'hill',
      label: 'Cerro Blanco (Apu Sagrado)',
      description: 'Hito natural, parque y centro ceremonial indígena'
    },
    zones: [
      { name: '⛰️ Parque Cerro Blanco', type: 'park', x: 80, y: 60, w: 230, h: 150, color: 'bg-emerald-100 border-emerald-300', textColor: 'text-emerald-800' },
      { name: '🏛️ Metro Cerro Blanco & Ludoteca', type: 'civic', x: 420, y: 150, w: 190, h: 120, color: 'bg-amber-100 border-amber-300', textColor: 'text-amber-900' },
      { name: '📚 Escuela Abierta & Fomento Lector', type: 'cultural', x: 690, y: 80, w: 200, h: 130, color: 'bg-sky-100 border-sky-300', textColor: 'text-sky-900' },
      { name: '🏡 Población Santos Dumont', type: 'residential', x: 630, y: 340, w: 250, h: 140, color: 'bg-stone-100 border-stone-300', textColor: 'text-stone-700' }
    ],
    safeCorridors: [
      { name: 'Eje Peatonal Seguro Av. Recoleta', path: 'M 80 230 L 890 230', color: '#10b981' },
      { name: 'Ruta Cerro Blanco a Santos Dumont', path: 'M 200 135 L 420 210 L 690 145', color: '#f59e0b' }
    ]
  },
  valparaiso: {
    name: 'Comuna de Valparaíso',
    tagline: 'Valparaíso Patrimonial · Cerro Alegre, Cordillera & Playa Ancha',
    mainAvenueHorizontal: 'Av. Errázuriz / Borde Costero',
    crossAvenueVertical: 'Calle Prat / Paseo Yugoslavo',
    secondaryStreet1: 'Subida Cumming / San Juan de Dios',
    secondaryStreet2: 'Escalera Montealegre / Urriola',
    naturalFeature: {
      type: 'sea',
      label: 'Océano Pacífico & Bahía de Valparaíso',
      description: 'Frente marítimo natural y puerto patrimonial'
    },
    zones: [
      { name: '🌊 Bahía & Muelle Prat', type: 'park', x: 80, y: 60, w: 220, h: 120, color: 'bg-sky-100 border-sky-300', textColor: 'text-sky-900' },
      { name: '🏛️ Plaza Sotomayor & Ascensor El Peral', type: 'civic', x: 420, y: 140, w: 200, h: 120, color: 'bg-amber-100 border-amber-300', textColor: 'text-amber-900' },
      { name: '🎨 Paseo Yugoslavo & Palacio Baburizza', type: 'cultural', x: 690, y: 70, w: 200, h: 140, color: 'bg-rose-100 border-rose-300', textColor: 'text-rose-900' },
      { name: '🏡 Cerro Alegre & Miradores', type: 'residential', x: 630, y: 340, w: 250, h: 140, color: 'bg-stone-100 border-stone-300', textColor: 'text-stone-700' }
    ],
    safeCorridors: [
      { name: 'Sendero Patrimonial de Miradores', path: 'M 190 120 L 420 200 L 690 140', color: '#10b981' },
      { name: 'Escaleras Seguras a Plaza Sotomayor', path: 'M 520 60 L 520 480', color: '#f59e0b' }
    ]
  },
  maipu: {
    name: 'Comuna de Maipú',
    tagline: 'Sector Poniente · Plaza de Maipú, Templo Votivo, Pajaritos & Primo de Rivera',
    mainAvenueHorizontal: 'Av. 5 de Abril / Camino a Rinconada',
    crossAvenueVertical: 'Av. Los Pajaritos (Eje Metro Línea 5)',
    secondaryStreet1: 'Av. Sur / Av. Blanco Encalada',
    secondaryStreet2: 'Calle Carmen / Santa Rosa',
    naturalFeature: {
      type: 'hill',
      label: 'Cerro Primo de Rivera & Zanjón',
      description: 'Cerro isla patrimonial, áreas verdes y corredor biológico'
    },
    zones: [
      { name: '🌳 Parque Templo Votivo & Explanada', type: 'park', x: 80, y: 70, w: 260, h: 160, color: 'bg-emerald-100 border-emerald-300', textColor: 'text-emerald-800' },
      { name: '🏛️ Plaza de Maipú & Metro L5', type: 'civic', x: 440, y: 150, w: 220, h: 130, color: 'bg-amber-100 border-amber-300', textColor: 'text-amber-900' },
      { name: '⛰️ Parque Cerro Primo de Rivera', type: 'cultural', x: 740, y: 70, w: 220, h: 150, color: 'bg-lime-100 border-lime-300', textColor: 'text-lime-900' },
      { name: '🏡 Barrio Las Rosas & Pasajes', type: 'residential', x: 660, y: 350, w: 280, h: 150, color: 'bg-stone-100 border-stone-300', textColor: 'text-stone-700' }
    ],
    safeCorridors: [
      { name: 'Ruta Segura Peatonal Metro a Templo Votivo', path: 'M 190 150 L 460 215 L 750 145', color: '#10b981' },
      { name: 'Corredor Escolar Iluminado Av. Pajaritos', path: 'M 540 50 L 540 510', color: '#f59e0b' }
    ]
  },
  rancagua: {
    name: 'Comuna de Rancagua',
    tagline: 'Capital de O\'Higgins · Plazas de Bolsillo República, Plaza Los Héroes & Parque Comunal',
    mainAvenueHorizontal: 'Av. República / Av. Capitán Antonio Millán',
    crossAvenueVertical: 'Calle San Martín / Calle Estado / Independencia',
    secondaryStreet1: 'Av. Libertador Bernardo O\'Higgins (Alameda)',
    secondaryStreet2: 'Av. Bombero Villalobos / Freire',
    naturalFeature: {
      type: 'park',
      label: 'Parque Comunal & Río Cachapoal',
      description: 'Eje verde y deportivo intercomunal'
    },
    zones: [
      { name: '🚚 Plaza de Bolsillo República (Pablo Fuentes)', type: 'cultural', x: 80, y: 70, w: 260, h: 150, color: 'bg-teal-100 border-teal-300', textColor: 'text-teal-900' },
      { name: '🏛️ Plaza de Los Héroes & Centro Cívico', type: 'civic', x: 440, y: 150, w: 220, h: 130, color: 'bg-amber-100 border-amber-300', textColor: 'text-amber-900' },
      { name: '🎭 Teatro Regional Lucho Gatica', type: 'cultural', x: 740, y: 70, w: 220, h: 140, color: 'bg-purple-100 border-purple-300', textColor: 'text-purple-900' },
      { name: '🌳 Parque Comunal & Multicanchas', type: 'park', x: 660, y: 350, w: 280, h: 150, color: 'bg-emerald-100 border-emerald-300', textColor: 'text-emerald-800' }
    ],
    safeCorridors: [
      { name: 'Ruta Segura Plaza de Bolsillo a Plaza de Los Héroes', path: 'M 190 140 L 460 215 L 750 145', color: '#10b981' },
      { name: 'Corredor Cívico Iluminado Calle Estado', path: 'M 540 50 L 540 510', color: '#f59e0b' }
    ]
  }
};

export interface VisualLandmarkCard {
  id: string;
  name: string;
  category: 'plaza' | 'parque' | 'patrimonio' | 'seguridad' | 'salud' | 'bolsillo' | 'cultura';
  categoryLabel: string;
  address: string;
  photoUrl: string;
  icon: string;
  x: number;
  y: number;
  color: string;
  emergencyOrDetail: string;
}

export const COMMUNE_VISUAL_CARDS: Record<string, VisualLandmarkCard[]> = {
  colina: [
    {
      id: 'vis-col-1',
      name: 'Plaza de Armas de Colina',
      category: 'plaza',
      categoryLabel: 'Plaza Cívica Central',
      address: 'Av. Concepción con Calle Fontt',
      photoUrl: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=300&auto=format&fit=crop&q=80',
      icon: '🏛️',
      x: 480,
      y: 190,
      color: 'border-amber-400 bg-amber-50 text-amber-900',
      emergencyOrDetail: 'Centro Cívico y Municipalidad de Colina'
    },
    {
      id: 'vis-col-2',
      name: 'Parque San Miguel de Colina',
      category: 'parque',
      categoryLabel: 'Parque Urbano & Huertos',
      address: 'Av. Nueva Colina con Fontt',
      photoUrl: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=300&auto=format&fit=crop&q=80',
      icon: '🌳',
      x: 180,
      y: 120,
      color: 'border-emerald-400 bg-emerald-50 text-emerald-900',
      emergencyOrDetail: 'Zona de juegos infantiles y talleres'
    },
    {
      id: 'vis-col-3',
      name: 'Sector Canteras de Colina',
      category: 'patrimonio',
      categoryLabel: 'Patrimonio de Canteros',
      address: 'Carretera San Martín / Las Canteras',
      photoUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&auto=format&fit=crop&q=80',
      icon: '🗿',
      x: 820,
      y: 110,
      color: 'border-orange-400 bg-orange-50 text-orange-900',
      emergencyOrDetail: 'Escultura en piedra y talleres de oficios'
    },
    {
      id: 'vis-col-4',
      name: '8va Comisaría & Seguridad 1468',
      category: 'seguridad',
      categoryLabel: 'Seguridad Ciudadana Colina',
      address: 'Calle Alpatacal #120',
      photoUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=300&auto=format&fit=crop&q=80',
      icon: '🚓',
      x: 740,
      y: 430,
      color: 'border-blue-400 bg-blue-50 text-blue-900',
      emergencyOrDetail: 'Teléfono Urgencia: 1468'
    }
  ],
  maipu: [
    {
      id: 'vis-mai-1',
      name: 'Templo Votivo de Maipú & Explanada',
      category: 'patrimonio',
      categoryLabel: 'Monumento Nacional Histórico',
      address: 'Calle Carmen #1750, Maipú',
      photoUrl: 'https://images.unsplash.com/photo-1548625361-19597394d216?w=300&auto=format&fit=crop&q=80',
      icon: '⛪',
      x: 190,
      y: 140,
      color: 'border-amber-400 bg-amber-50 text-amber-900',
      emergencyOrDetail: 'Gran explanada cívica y ferias comunales'
    },
    {
      id: 'vis-mai-2',
      name: 'Plaza de Maipú & Metro Línea 5',
      category: 'plaza',
      categoryLabel: 'Plaza Central & Intermodal',
      address: 'Av. Los Pajaritos con Av. 5 de Abril',
      photoUrl: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=300&auto=format&fit=crop&q=80',
      icon: '🏛️',
      x: 520,
      y: 200,
      color: 'border-blue-400 bg-blue-50 text-blue-900',
      emergencyOrDetail: 'Estación terminal Metro L5 y centro comunal'
    },
    {
      id: 'vis-mai-3',
      name: 'Parque Cerro Primo de Rivera',
      category: 'parque',
      categoryLabel: 'Cerro Isla & Áreas Verdes',
      address: 'Av. Los Pajaritos con Ancud',
      photoUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&auto=format&fit=crop&q=80',
      icon: '⛰️',
      x: 840,
      y: 120,
      color: 'border-emerald-400 bg-emerald-50 text-emerald-900',
      emergencyOrDetail: 'Mirador histórico, multicanchas y juegos'
    },
    {
      id: 'vis-mai-4',
      name: '25ta Comisaría · Maipú Seguro 1418',
      category: 'seguridad',
      categoryLabel: 'Seguridad Ciudadana Maipú',
      address: 'Av. Rinconada #2000',
      photoUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=300&auto=format&fit=crop&q=80',
      icon: '🚓',
      x: 740,
      y: 430,
      color: 'border-blue-400 bg-blue-50 text-blue-900',
      emergencyOrDetail: 'Fono Emergencia: 1418'
    }
  ],
  rancagua: [
    {
      id: 'vis-ran-1',
      name: 'Plaza de Los Héroes de Rancagua',
      category: 'plaza',
      categoryLabel: 'Centro Cívico Histórico',
      address: 'Plaza Los Héroes s/n, Rancagua Centro',
      photoUrl: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=300&auto=format&fit=crop&q=80',
      icon: '🏛️',
      x: 520,
      y: 200,
      color: 'border-amber-400 bg-amber-50 text-amber-900',
      emergencyOrDetail: 'Hito histórico de la Batalla de Rancagua'
    },
    {
      id: 'vis-ran-2',
      name: 'Plaza de Bolsillo República',
      category: 'bolsillo',
      categoryLabel: 'Plaza de Bolsillo & Food Trucks',
      address: 'Av. República con Bombero Villalobos',
      photoUrl: 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=300&auto=format&fit=crop&q=80',
      icon: '🚚',
      x: 180,
      y: 130,
      color: 'border-teal-400 bg-teal-50 text-teal-900',
      emergencyOrDetail: 'Recuperación de terreno fiscal para la niñez'
    },
    {
      id: 'vis-ran-3',
      name: 'Teatro Regional Lucho Gatica',
      category: 'cultura',
      categoryLabel: 'Teatro & Centro Cultural',
      address: 'Av. Capitán Antonio Millán #342',
      photoUrl: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=300&auto=format&fit=crop&q=80',
      icon: '🎭',
      x: 840,
      y: 120,
      color: 'border-purple-400 bg-purple-50 text-purple-900',
      emergencyOrDetail: 'Cartelera infantil, teatro y orquesta juvenil'
    },
    {
      id: 'vis-ran-4',
      name: 'Parque Comunal de Rancagua',
      category: 'parque',
      categoryLabel: 'Parque Deportivo & Multicanchas',
      address: 'Av. Alameda con Chorrillos',
      photoUrl: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=300&auto=format&fit=crop&q=80',
      icon: '🌳',
      x: 760,
      y: 430,
      color: 'border-emerald-400 bg-emerald-50 text-emerald-900',
      emergencyOrDetail: 'Multicanchas, pista de patinaje y seguridad 1455'
    }
  ],
  santiago: [
    {
      id: 'vis-stg-1',
      name: 'Plaza Yungay (Roto Chileno)',
      category: 'plaza',
      categoryLabel: 'Plaza Patrimonial',
      address: 'Calle Huérfanos con Sotomayor',
      photoUrl: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=300&auto=format&fit=crop&q=80',
      icon: '🏛️',
      x: 520,
      y: 200,
      color: 'border-amber-400 bg-amber-50 text-amber-900',
      emergencyOrDetail: 'Centro del Barrio Yungay y asambleas'
    },
    {
      id: 'vis-stg-2',
      name: 'Parque Quinta Normal',
      category: 'parque',
      categoryLabel: 'Gran Parque & Museos',
      address: 'Av. Matucana #520',
      photoUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&auto=format&fit=crop&q=80',
      icon: '🌳',
      x: 180,
      y: 130,
      color: 'border-emerald-400 bg-emerald-50 text-emerald-900',
      emergencyOrDetail: 'Laguna infantil, museos y Metro Quinta Normal'
    }
  ],
  cerronavia: [
    {
      id: 'vis-cn-1',
      name: 'Parque Javiera Carrera',
      category: 'parque',
      categoryLabel: 'Parque Urbano',
      address: 'Av. Salvador Gutiérrez #7400',
      photoUrl: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=300&auto=format&fit=crop&q=80',
      icon: '🌳',
      x: 190,
      y: 140,
      color: 'border-emerald-400 bg-emerald-50 text-emerald-900',
      emergencyOrDetail: 'Canchas y juegos de pasaje'
    },
    {
      id: 'vis-cn-2',
      name: 'Huertos Herminda de la Victoria',
      category: 'bolsillo',
      categoryLabel: 'Huertos Familiares',
      address: 'Av. San Francisco con Mapocho',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      icon: '🌱',
      x: 750,
      y: 130,
      color: 'border-lime-400 bg-lime-50 text-lime-900',
      emergencyOrDetail: 'Agricultura urbana comunitaria'
    }
  ],
  puentealto: [
    {
      id: 'vis-pa-1',
      name: 'Plaza de Armas de Puente Alto',
      category: 'plaza',
      categoryLabel: 'Plaza Cívica & Metro L4',
      address: 'Av. Concha y Toro con Manuel Rodríguez',
      photoUrl: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=300&auto=format&fit=crop&q=80',
      icon: '🏛️',
      x: 520,
      y: 200,
      color: 'border-amber-400 bg-amber-50 text-amber-900',
      emergencyOrDetail: 'Estación terminal Metro L4'
    },
    {
      id: 'vis-pa-2',
      name: 'Parque Nuestra Señora de Gabriela',
      category: 'parque',
      categoryLabel: 'Parque Recreativo',
      address: 'Av. Concha y Toro con Gabriela',
      photoUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&auto=format&fit=crop&q=80',
      icon: '🌳',
      x: 180,
      y: 130,
      color: 'border-emerald-400 bg-emerald-50 text-emerald-900',
      emergencyOrDetail: 'Sede multiuso comunitaria'
    }
  ],
  recoleta: [
    {
      id: 'vis-rec-1',
      name: 'Parque Cerro Blanco',
      category: 'parque',
      categoryLabel: 'Parque Patrimonial & Apu',
      address: 'Av. Recoleta con Santos Dumont',
      photoUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&auto=format&fit=crop&q=80',
      icon: '⛰️',
      x: 200,
      y: 140,
      color: 'border-emerald-400 bg-emerald-50 text-emerald-900',
      emergencyOrDetail: 'Centro ceremonial y senderos seguros'
    },
    {
      id: 'vis-rec-2',
      name: 'Metro Cerro Blanco & Ludoteca',
      category: 'plaza',
      categoryLabel: 'Espacio Abierto Infancia',
      address: 'Av. Recoleta #850',
      photoUrl: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=300&auto=format&fit=crop&q=80',
      icon: '📚',
      x: 530,
      y: 200,
      color: 'border-blue-400 bg-blue-50 text-blue-900',
      emergencyOrDetail: 'Fomento lector y juegos populares'
    }
  ],
  valparaiso: [
    {
      id: 'vis-val-1',
      name: 'Borde Costero & Muelle Prat',
      category: 'patrimonio',
      categoryLabel: 'Puerto & Frente Marítimo',
      address: 'Plaza Sotomayor / Muelle Prat',
      photoUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&auto=format&fit=crop&q=80',
      icon: '🌊',
      x: 190,
      y: 120,
      color: 'border-sky-400 bg-sky-50 text-sky-900',
      emergencyOrDetail: 'Frente marítimo de Valparaíso'
    },
    {
      id: 'vis-val-2',
      name: 'Plaza Sotomayor & Ascensor El Peral',
      category: 'plaza',
      categoryLabel: 'Centro Cívico Patrimonial',
      address: 'Plaza Sotomayor con Calle Prat',
      photoUrl: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=300&auto=format&fit=crop&q=80',
      icon: '🏛️',
      x: 520,
      y: 190,
      color: 'border-amber-400 bg-amber-50 text-amber-900',
      emergencyOrDetail: 'Conexión a Cerro Alegre'
    }
  ]
};

export function NeighborhoodEcosystemMap({
  currentNeighborhood,
  allNeighborhoods = CHILE_NEIGHBORHOODS,
  onSelectNeighborhood,
  workshops,
  incidents,
  onSelectWorkshop,
  onOpenDirectChat,
  onOpenAttendance,
  onOpenNewIncident
}: NeighborhoodEcosystemMapProps) {
  // Active filters & selections
  const [filterType, setFilterType] = useState<MapFilterType>('all');
  const [selectedEntity, setSelectedEntity] = useState<{
    type: 'workshop' | 'incident' | 'landmark' | 'guardian';
    data: any;
  } | null>(null);

  // Search in map
  const [searchQuery, setSearchQuery] = useState('');

  // Zoom & View Scale
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activeCommuneId, setActiveCommuneId] = useState<string>(currentNeighborhood.id);
  const [isIntercommunalView, setIsIntercommunalView] = useState(false);
  const [mapVisualMode, setMapVisualMode] = useState<'cartografico' | 'vectorial'>('cartografico');

  // User Geolocation (Browser Native GPS, NO API needed)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoMsg, setGeoMsg] = useState<string | null>(null);

  // Active commune object
  const activeNeighborhood = useMemo(() => {
    return allNeighborhoods.find(n => n.id === activeCommuneId) || currentNeighborhood;
  }, [allNeighborhoods, activeCommuneId, currentNeighborhood]);

  const geoSpec = COMMUNE_GEO_SPECS[activeCommuneId] || COMMUNE_GEO_SPECS['colina'];

  // Data for active commune
  const communeWorkshops = workshops.filter(w => w.neighborhoodId === activeCommuneId);
  const communeIncidents = incidents.filter(i => i.neighborhoodId === activeCommuneId);
  const communeLandmarks = COMMUNITY_LANDMARKS.filter(l => l.neighborhoodId === activeCommuneId);
  const communeGuardians = MOCK_NEIGHBOR_GUARDIANS.filter(g => g.neighborhoodId === activeCommuneId);

  // Native Geolocation
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setGeoMsg('Geolocalización no disponible en este dispositivo');
      return;
    }
    setGeoLoading(true);
    setGeoMsg(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
        setGeoLoading(false);
        setGeoMsg('📍 GPS activo: calculando distancias a pie en tiempo real');
      },
      () => {
        setGeoLoading(false);
        setUserLocation(activeNeighborhood.coordinates);
        setGeoMsg(`📍 Posición fijada en el centro de ${activeNeighborhood.displayName}`);
      },
      { timeout: 7000 }
    );
  };

  // Distance calculator
  const calculateDistance = (targetLat: number, targetLng: number) => {
    if (!userLocation) return null;
    const dLat = (targetLat - userLocation.lat) * 111.32;
    const dLng = (targetLng - userLocation.lng) * 92.5;
    const km = Math.sqrt(dLat * dLat + dLng * dLng);
    const meters = Math.round(km * 1000);
    const walkingMinutes = Math.max(1, Math.round(meters / 80));
    return { meters, walkingMinutes };
  };

  // Coordinated item placement on SVG Canvas (Width: 960, Height: 520)
  const mapItems = useMemo(() => {
    const items: Array<{
      id: string;
      type: 'workshop' | 'incident' | 'landmark' | 'guardian';
      title: string;
      subtitle: string;
      x: number;
      y: number;
      icon: string;
      badgeColor: string;
      textColor: string;
      isInclusive?: boolean;
      data: any;
    }> = [];

    // Predefined balanced coordinate clusters for clean readability across wide commune canvas
    const wsCoords = [
      { x: 230, y: 150 },
      { x: 590, y: 230 },
      { x: 910, y: 150 },
      { x: 360, y: 440 },
      { x: 880, y: 440 },
      { x: 670, y: 480 }
    ];

    const incCoords = [
      { x: 310, y: 270 },
      { x: 770, y: 260 },
      { x: 500, y: 390 },
      { x: 990, y: 320 }
    ];

    const lmCoords = [
      { x: 150, y: 330 },
      { x: 1040, y: 190 },
      { x: 580, y: 100 },
      { x: 460, y: 530 }
    ];

    const gdCoords = [
      { x: 260, y: 210 },
      { x: 680, y: 170 },
      { x: 980, y: 400 },
      { x: 430, y: 470 }
    ];

    // Workshops
    communeWorkshops.forEach((ws, idx) => {
      const coord = wsCoords[idx % wsCoords.length];
      const isInclusive = ws.inclusivity.isInclusive && ws.inclusivity.neurodivergentFriendly;
      items.push({
        id: ws.id,
        type: 'workshop',
        title: ws.title.split(':')[0],
        subtitle: ws.locationName,
        x: coord.x,
        y: coord.y,
        icon: isInclusive ? '🧩' : (ws.category.includes('Huert') ? '🌱' : ws.category.includes('Arte') ? '🎨' : '🎪'),
        badgeColor: isInclusive ? 'bg-purple-600 text-white border-purple-400' : 'bg-orange-600 text-white border-orange-400',
        textColor: 'text-stone-900',
        isInclusive,
        data: ws
      });
    });

    // Incidents / Safety points
    communeIncidents.forEach((inc, idx) => {
      const coord = incCoords[idx % incCoords.length];
      items.push({
        id: inc.id,
        type: 'incident',
        title: inc.title,
        subtitle: inc.location,
        x: coord.x,
        y: coord.y,
        icon: inc.solved ? '🟢' : '🛡️',
        badgeColor: inc.solved ? 'bg-emerald-600 text-white border-emerald-400' : 'bg-amber-500 text-white border-amber-300',
        textColor: 'text-stone-900',
        data: inc
      });
    });

    // Landmarks
    communeLandmarks.forEach((lm, idx) => {
      const coord = lmCoords[idx % lmCoords.length];
      items.push({
        id: lm.id,
        type: 'landmark',
        title: lm.name,
        subtitle: lm.categoryLabel,
        x: coord.x,
        y: coord.y,
        icon: lm.iconEmoji || '🏛️',
        badgeColor: 'bg-blue-600 text-white border-blue-400',
        textColor: 'text-stone-900',
        data: lm
      });
    });

    // Neighbor Guardians with highest attendance streaks
    communeGuardians.forEach((gd, idx) => {
      const coord = gdCoords[idx % gdCoords.length];
      items.push({
        id: gd.id,
        type: 'guardian',
        title: gd.name,
        subtitle: `🔥 Racha ${gd.streakWeeks} sem · Guardián`,
        x: coord.x,
        y: coord.y,
        icon: '👥',
        badgeColor: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white border-amber-300',
        textColor: 'text-stone-900',
        data: gd
      });
    });

    return items;
  }, [communeWorkshops, communeIncidents, communeLandmarks, communeGuardians]);

  // Filtered Map Items
  const displayedItems = useMemo(() => {
    return mapItems.filter(item => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Filter
      if (filterType === 'all') return true;
      if (filterType === 'workshops') return item.type === 'workshop';
      if (filterType === 'inclusive') return item.type === 'workshop' && item.isInclusive;
      if (filterType === 'safety') return item.type === 'incident';
      if (filterType === 'landmarks') return item.type === 'landmark';
      if (filterType === 'guardians') return item.type === 'guardian';
      return true;
    });
  }, [mapItems, filterType, searchQuery]);

  return (
    <div id="mapa-comunal-section" className="space-y-4">
      {/* Top Map Header: Clean Modern Magazine Style Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 bg-[#dc2626] text-white flex items-center justify-center font-chunky font-black text-sm shrink-0 rounded-2xl shadow-xs">
            🗺️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-chunky font-black text-base sm:text-lg text-slate-900 tracking-tight">
                Plano Comunal Territorial
              </span>
              <span className="bg-[#1d4ed8] text-white text-[10px] font-chunky font-bold px-2.5 py-0.5 rounded-full uppercase">
                {activeNeighborhood.displayName}
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              Geografía interactiva con sedes sociales, rutas seguras y talleres activos.
            </p>
          </div>
        </div>

        {/* Action Tools */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            onClick={handleLocateMe}
            disabled={geoLoading}
            className="py-1.5 px-3.5 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-chunky font-bold transition-all border border-slate-200 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Navigation2 className={`w-3.5 h-3.5 text-[#dc2626] ${geoLoading ? 'animate-spin' : ''}`} />
            <span>{userLocation ? '📍 Mi Ubicación Activa' : '📍 ¿Dónde estoy yo?'}</span>
          </button>

          <button
            onClick={onOpenNewIncident}
            className="py-1.5 px-3.5 bg-[#dc2626] hover:bg-red-700 text-white text-xs font-chunky font-bold transition-all rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-white" />
            <span>Reportar Alerta</span>
          </button>
        </div>
      </div>

      {geoMsg && (
        <div className="text-xs bg-red-50 border border-red-200 text-red-900 px-3.5 py-2 rounded-xl font-chunky font-bold inline-block">
          {geoMsg}
        </div>
      )}

      {/* Commune Bar: Switch seamlessly between Chilean Communes */}
      <div className="bg-white rounded-3xl p-3 sm:p-4 border border-stone-200 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Communes Switcher */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold uppercase text-stone-400 tracking-wider mr-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-orange-600" />
              Comuna:
            </span>
            {allNeighborhoods.map((n) => (
              <button
                key={n.id}
                onClick={() => {
                  setActiveCommuneId(n.id);
                  if (onSelectNeighborhood) onSelectNeighborhood(n);
                  setSelectedEntity(null);
                  setIsIntercommunalView(false);
                }}
                className={`py-1.5 px-3 rounded-xl text-xs font-fun font-bold transition-all cursor-pointer ${
                  activeCommuneId === n.id && !isIntercommunalView
                    ? 'bg-orange-600 text-white shadow-2xs ring-2 ring-orange-300'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                {n.comuna}
              </button>
            ))}

            {/* Regional / Intercommunal Network Toggle */}
            <button
              onClick={() => setIsIntercommunalView(!isIntercommunalView)}
              className={`py-1.5 px-3.5 rounded-xl text-xs font-fun font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                isIntercommunalView
                  ? 'bg-purple-700 text-white shadow-xs ring-2 ring-purple-300'
                  : 'bg-purple-50 text-purple-950 border border-purple-200 hover:bg-purple-100'
              }`}
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>Red Intercomunal (Todas las comunas)</span>
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar taller, calle o punto..."
              className="w-full text-xs pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-orange-500 focus:outline-none"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Chips Bar */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-stone-100 text-xs">
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mr-1">
            Filtrar en el mapa:
          </span>

          <button
            onClick={() => setFilterType('all')}
            className={`py-1 px-3 rounded-xl font-bold transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-stone-900 text-white shadow-2xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Todos ({mapItems.length})
          </button>

          <button
            onClick={() => setFilterType('workshops')}
            className={`py-1 px-3 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
              filterType === 'workshops'
                ? 'bg-orange-600 text-white shadow-2xs'
                : 'bg-orange-50 text-orange-950 border border-orange-200 hover:bg-orange-100'
            }`}
          >
            <span>🎪 Talleres ({communeWorkshops.length})</span>
          </button>

          <button
            onClick={() => setFilterType('inclusive')}
            className={`py-1 px-3 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
              filterType === 'inclusive'
                ? 'bg-purple-600 text-white shadow-2xs'
                : 'bg-purple-50 text-purple-950 border border-purple-200 hover:bg-purple-100'
            }`}
          >
            <span>🧩 Solo Inclusivos / Neuro Friendly ({communeWorkshops.filter(w => w.inclusivity.neurodivergentFriendly).length})</span>
          </button>

          <button
            onClick={() => setFilterType('safety')}
            className={`py-1 px-3 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
              filterType === 'safety'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-emerald-50 text-emerald-950 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <span>🛡️ Seguridad Barrial ({communeIncidents.length})</span>
          </button>

          <button
            onClick={() => setFilterType('guardians')}
            className={`py-1 px-3 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
              filterType === 'guardians'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-amber-50 text-amber-950 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-orange-600 fill-orange-500" />
            <span>Guardianes con Racha ({communeGuardians.length})</span>
          </button>

          <button
            onClick={() => setFilterType('landmarks')}
            className={`py-1 px-3 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
              filterType === 'landmarks'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-blue-50 text-blue-950 border border-blue-200 hover:bg-blue-100'
            }`}
          >
            <span>🏛️ Hitos Cívicos ({communeLandmarks.length})</span>
          </button>
        </div>
      </div>

      {/* Intercommunal Regional Network Overview Mode */}
      {isIntercommunalView && (
        <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-stone-900 rounded-3xl p-5 text-white space-y-4 border border-purple-400/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs text-purple-200 font-bold bg-purple-500/30 px-3 py-1 rounded-full">
                <span>🇨🇱 Red Intercomunal ChispaPlay Chile</span>
              </div>
              <h3 className="font-fun font-bold text-xl text-white mt-1">
                Ecosistema Regional de Participación y Cuidado Vecinal
              </h3>
            </div>
            <button
              onClick={() => setIsIntercommunalView(false)}
              className="py-1 px-3 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold self-start cursor-pointer"
            >
              Volver al plano comunal
            </button>
          </div>

          {/* Communes Connected Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {allNeighborhoods.map((n) => {
              const wsCount = workshops.filter(w => w.neighborhoodId === n.id).length;
              const gCount = MOCK_NEIGHBOR_GUARDIANS.filter(g => g.neighborhoodId === n.id).length;
              const incCount = incidents.filter(i => i.neighborhoodId === n.id).length;

              return (
                <div
                  key={n.id}
                  onClick={() => {
                    setActiveCommuneId(n.id);
                    setIsIntercommunalView(false);
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    activeCommuneId === n.id
                      ? 'bg-purple-800/80 border-purple-400 ring-2 ring-purple-300'
                      : 'bg-white/10 border-white/20 hover:bg-white/15'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-fun font-bold text-sm text-white">
                      {n.displayName.replace('Comuna de ', '')}
                    </span>
                    <span className="text-xs bg-amber-400 text-stone-950 font-bold px-2 py-0.5 rounded-full">
                      {n.region.includes('Valparaíso') ? 'V Región' : 'RM'}
                    </span>
                  </div>
                  <div className="text-[11px] text-purple-200 mt-1 line-clamp-1">
                    {n.sectorOBarrio}
                  </div>
                  <div className="flex items-center gap-3 mt-3 pt-2 border-t border-white/15 text-xs text-amber-200 font-bold">
                    <span>🎪 {wsCount} talleres</span>
                    <span>👥 {gCount} guardianes</span>
                    <span>🛡️ {incCount} alertas</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Simplified Map Canvas */}
      <div className="relative bg-[#fcf9f2] rounded-3xl border-2 border-stone-200 shadow-sm overflow-hidden min-h-[560px] flex flex-col select-none">
        
        {/* Floating Canvas Header Controls */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-20 pointer-events-none">
          {/* Active Street & Geography Badge */}
          <div className="bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-stone-200 shadow-xs pointer-events-auto flex items-center gap-2">
            <Compass className="w-4 h-4 text-orange-600" />
            <div>
              <div className="text-xs font-bold text-stone-900 leading-tight">
                {geoSpec.name}
              </div>
              <div className="text-[10px] text-stone-500 font-medium">
                {geoSpec.mainAvenueHorizontal}
              </div>
            </div>
          </div>

          {/* Map Mode & Zoom controls */}
          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Visual mode switch */}
            <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-2xl border border-stone-200 shadow-xs">
              <button
                onClick={() => setMapVisualMode('cartografico')}
                className={`py-1 px-2.5 rounded-xl text-xs font-fun font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  mapVisualMode === 'cartografico'
                    ? 'bg-orange-600 text-white shadow-2xs'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <span>🗺️ Mapa Gráfico</span>
              </button>
              <button
                onClick={() => setMapVisualMode('vectorial')}
                className={`py-1 px-2.5 rounded-xl text-xs font-fun font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  mapVisualMode === 'vectorial'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <span>🧭 Esquema</span>
              </button>
            </div>

            {/* Zoom controls */}
            <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-2xl border border-stone-200 shadow-xs">
              <button
                onClick={() => setZoomLevel(prev => Math.min(prev + 0.15, 1.4))}
                title="Acercar plano"
                className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-700 cursor-pointer"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel(prev => Math.max(prev - 0.15, 0.85))}
                title="Alejar plano"
                className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-700 cursor-pointer"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                title="Restablecer vista"
                className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-700 cursor-pointer text-xs font-bold flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{Math.round(zoomLevel * 100)}%</span>
              </button>
            </div>
          </div>
        </div>

        {/* Interactive SVG Cartographic Canvas - Wide Panoramic View */}
        <div className="flex-1 w-full min-h-[580px] sm:min-h-[660px] overflow-auto relative">
          <div 
            style={{ 
              transform: `scale(${zoomLevel})`, 
              transformOrigin: 'center center',
              transition: 'transform 0.2s ease-out'
            }}
            className="w-[1180px] h-[600px] mx-auto relative my-2"
          >
            {/* SVG Background Layer: Streets, Zones, Natural Features */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none" 
              viewBox="0 0 1180 600"
            >
              <defs>
                {/* Patterns */}
                <pattern id="streetGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f1ece1" strokeWidth="1" />
                </pattern>
                <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.9" />
                </linearGradient>
              </defs>

              {/* Grid Background */}
              <rect width="1180" height="600" fill="url(#streetGrid)" />

              {/* Natural Feature (River / Sea / Hill) */}
              {geoSpec.naturalFeature.type === 'river' && (
                <path 
                  d="M -20 540 C 300 500, 600 570, 1200 540" 
                  stroke="url(#riverGrad)" 
                  strokeWidth="32" 
                  fill="none" 
                  strokeLinecap="round"
                />
              )}
              {geoSpec.naturalFeature.type === 'sea' && (
                <path 
                  d="M -20 20 C 380 10, 750 30, 1200 20 L 1200 130 L -20 130 Z" 
                  fill="#bae6fd" 
                  opacity="0.6"
                />
              )}
              {geoSpec.naturalFeature.type === 'hill' && (
                <ellipse cx="240" cy="150" rx="170" ry="90" fill="#dcfce7" stroke="#86efac" strokeWidth="2" opacity="0.7" />
              )}

              {/* Real Avenues (Horizontal & Vertical) */}
              {/* Main Horizontal Avenue */}
              <rect x="0" y="260" width="1180" height="28" fill="#e7e2d7" />
              <line x1="0" y1="274" x2="1180" y2="274" stroke="#ffffff" strokeWidth="2" strokeDasharray="12 8" />

              {/* Cross Vertical Avenue */}
              <rect x="610" y="0" width="28" height="600" fill="#e7e2d7" />
              <line x1="624" y1="0" x2="624" y2="600" stroke="#ffffff" strokeWidth="2" strokeDasharray="12 8" />

              {/* Secondary Street Grid */}
              <rect x="0" y="130" width="1180" height="14" fill="#eeeae0" />
              <rect x="0" y="420" width="1180" height="14" fill="#eeeae0" />
              <rect x="300" y="0" width="14" height="600" fill="#eeeae0" />
              <rect x="920" y="0" width="14" height="600" fill="#eeeae0" />

              {/* Safe Illuminated Pedestrian Corridors */}
              {geoSpec.safeCorridors.map((corridor, i) => (
                <g key={i}>
                  <path 
                    d={corridor.path} 
                    stroke={corridor.color} 
                    strokeWidth="7" 
                    fill="none" 
                    strokeDasharray="9 7" 
                    opacity="0.85" 
                  />
                  <path 
                    d={corridor.path} 
                    stroke="#ffffff" 
                    strokeWidth="2.5" 
                    fill="none" 
                    opacity="0.9" 
                  />
                </g>
              ))}
            </svg>

            {/* Street Names Labels in Canvas */}
            <div className="absolute top-[242px] left-8 text-[11px] font-bold text-stone-600 uppercase tracking-wider bg-white/80 px-2.5 py-0.5 rounded-md pointer-events-none shadow-2xs border border-stone-200">
              🛣️ {geoSpec.mainAvenueHorizontal}
            </div>
            <div className="absolute top-12 left-[645px] text-[11px] font-bold text-stone-600 uppercase tracking-wider bg-white/80 px-2.5 py-0.5 rounded-md pointer-events-none shadow-2xs border border-stone-200">
              🛣️ {geoSpec.crossAvenueVertical}
            </div>
            <div className="absolute bottom-4 left-8 text-[11px] font-bold text-blue-800 bg-blue-50/90 px-3 py-1 rounded-md border border-blue-200 pointer-events-none shadow-2xs">
              🌊 {geoSpec.naturalFeature.label}
            </div>

            {/* Urban Zones Polygons */}
            {geoSpec.zones.map((zone, i) => (
              <div
                key={i}
                style={{
                  left: `${zone.x}px`,
                  top: `${zone.y}px`,
                  width: `${zone.w}px`,
                  height: `${zone.h}px`
                }}
                className={`absolute rounded-3xl border-2 ${zone.color} p-2 flex flex-col justify-start pointer-events-none opacity-85 shadow-2xs`}
              >
                <span className={`text-[11px] font-bold ${zone.textColor} truncate`}>
                  {zone.name}
                </span>
              </div>
            ))}

            {/* Safe Corridor Labels */}
            <div className="absolute top-[345px] left-[320px] bg-emerald-50 text-emerald-900 border border-emerald-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-2xs pointer-events-none flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Ruta Peatonal Segura Iluminada</span>
            </div>

            {/* REAL-LIFE VISUAL LANDMARKS WITH PHOTOS (MAPA GRÁFICO EXPLÍCITO) */}
            {mapVisualMode === 'cartografico' && (COMMUNE_VISUAL_CARDS[activeCommuneId] || COMMUNE_VISUAL_CARDS['colina'])?.map((vis) => {
              const isSelected = selectedEntity?.data?.id === vis.id;
              return (
                <div
                  key={vis.id}
                  style={{
                    left: `${vis.x}px`,
                    top: `${vis.y}px`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  className="absolute z-20"
                >
                  <button
                    onClick={() => {
                      setSelectedEntity({
                        type: 'landmark',
                        data: {
                          id: vis.id,
                          name: vis.name,
                          categoryLabel: vis.categoryLabel,
                          address: vis.address,
                          description: vis.emergencyOrDetail,
                          photoUrl: vis.photoUrl,
                          iconEmoji: vis.icon
                        }
                      });
                    }}
                    className={`bg-white/95 hover:bg-white rounded-2xl p-1.5 sm:p-2 border-2 transition-all duration-200 flex items-center gap-2 max-w-[220px] text-left cursor-pointer group shadow-md hover:shadow-xl hover:scale-105 ${
                      isSelected ? 'border-orange-600 ring-4 ring-orange-300 scale-105' : `${vis.color}`
                    }`}
                  >
                    <img
                      src={vis.photoUrl}
                      alt={vis.name}
                      className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-cover border border-slate-200 shrink-0 shadow-2xs"
                    />
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-orange-600 truncate">
                        <span>{vis.icon}</span>
                        <span>{vis.categoryLabel}</span>
                      </div>
                      <div className="font-fun font-bold text-[11px] text-slate-900 leading-tight truncate group-hover:text-blue-600">
                        {vis.name}
                      </div>
                      <div className="text-[9px] text-slate-500 truncate">
                        {vis.address}
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}

            {/* Interactive Pins on Canvas */}
            {displayedItems.map((item) => {
              const isSelected = selectedEntity?.data?.id === item.id;

              return (
                <div
                  key={item.id}
                  style={{
                    left: `${item.x}px`,
                    top: `${item.y}px`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  className="absolute z-10"
                >
                  <button
                    onClick={() => {
                      setSelectedEntity({ type: item.type, data: item.data });
                    }}
                    className={`group transition-all duration-200 transform hover:scale-110 cursor-pointer flex flex-col items-center focus:outline-none ${
                      isSelected ? 'scale-115 z-30' : 'hover:z-20'
                    }`}
                  >
                    {/* Floating Pin Bubble */}
                    <div className={`px-2.5 py-1.5 rounded-2xl border shadow-sm flex items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'ring-4 ring-orange-300 shadow-md bg-stone-900 text-white border-white'
                        : `${item.badgeColor} hover:shadow-md`
                    }`}>
                      <span className="text-base leading-none">{item.icon}</span>
                      <div className="text-left max-w-[130px]">
                        <div className="font-fun font-bold text-[11px] leading-tight truncate">
                          {item.title}
                        </div>
                        <div className="text-[9px] opacity-90 truncate leading-tight">
                          {item.subtitle}
                        </div>
                      </div>
                    </div>

                    {/* Pin Anchor Arrow */}
                    <div className={`w-2 h-2 rotate-45 -mt-1 ${
                      isSelected ? 'bg-stone-900' : (item.badgeColor.split(' ')[0] || 'bg-orange-600')
                    }`} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Floating Map Legend Bar */}
        <div className="bg-white/95 backdrop-blur-md px-4 py-2.5 border-t border-stone-200 text-xs font-semibold flex items-center justify-between flex-wrap gap-3 z-10">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-orange-600 inline-block" />
              <span className="text-stone-700">🎪 Taller Infantil</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-purple-600 inline-block" />
              <span className="text-stone-700">🧩 Actividad Inclusiva / Neuro Friendly</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              <span className="text-stone-700">🛡️ Alerta de Seguridad</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 inline-block" />
              <span className="text-stone-700">👥 Guardián con Mayor Racha</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
              <span className="text-stone-700">🏛️ Hito Cívico / Plaza</span>
            </div>
          </div>

          <div className="text-[11px] text-stone-500 font-medium">
            Mostrando {displayedItems.length} puntos activos en {activeNeighborhood.comuna}
          </div>
        </div>
      </div>

      {/* Selected Entity Inspector Card */}
      {selectedEntity && (
        <div className="bg-white rounded-3xl p-5 border-2 border-orange-400 shadow-md animate-in slide-in-from-bottom-2 duration-200 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-orange-100 overflow-hidden flex items-center justify-center text-2xl shrink-0 border border-stone-200 shadow-2xs">
                {selectedEntity.data.photoUrl || selectedEntity.data.imageUrl ? (
                  <img
                    src={selectedEntity.data.photoUrl || selectedEntity.data.imageUrl}
                    alt={selectedEntity.data.name || selectedEntity.data.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>
                    {selectedEntity.type === 'workshop' ? '🎪' :
                     selectedEntity.type === 'incident' ? '🛡️' :
                     selectedEntity.type === 'guardian' ? '👥' : '🏛️'}
                  </span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-orange-100 text-orange-950 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                    {selectedEntity.type === 'workshop' ? 'Taller Comunitario' :
                     selectedEntity.type === 'incident' ? 'Punto de Seguridad' :
                     selectedEntity.type === 'guardian' ? 'Guardián Barrial Activo' : 'Hito Comunal'}
                  </span>
                  {selectedEntity.data.inclusivity?.neurodivergentFriendly && (
                    <span className="bg-purple-100 text-purple-950 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                      🧩 Actividad Inclusiva / Neuro Friendly
                    </span>
                  )}
                  {selectedEntity.data.streakWeeks && (
                    <span className="bg-amber-100 text-amber-950 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                      <Flame className="w-3 h-3 text-orange-600 fill-orange-500" />
                      Racha: {selectedEntity.data.streakWeeks} semanas seguidas
                    </span>
                  )}
                </div>

                <h3 className="font-fun font-bold text-lg text-stone-900 mt-1">
                  {selectedEntity.data.title || selectedEntity.data.name}
                </h3>
                <p className="text-xs text-stone-600 font-medium">
                  📍 {selectedEntity.data.locationName || selectedEntity.data.address || selectedEntity.data.location || selectedEntity.data.sector}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedEntity(null)}
              className="p-1 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Description or details */}
          <div className="text-xs text-stone-700 leading-relaxed bg-stone-50 p-3 rounded-2xl border border-stone-200">
            {selectedEntity.type === 'guardian' ? (
              <div className="space-y-1">
                <p className="font-medium">
                  <strong>{selectedEntity.data.name}</strong> es un vecino tutor que participa constantemente en las actividades de {activeNeighborhood.comuna}.
                </p>
                <p className="text-stone-500 text-[11px]">
                  ⚡ <em>Vinculación de seguridad:</em> Al reportarse una alerta comunitaria en este sector, este vecino recibe de forma automática una notificación push silenciosa para brindar apoyo preventivo sin causar alarma pública.
                </p>
              </div>
            ) : (
              selectedEntity.data.description || 'Punto de encuentro seguro y participación vecinal.'
            )}
          </div>

          {/* Bottom Actions for Selected Entity */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
            <div className="text-xs text-stone-500 font-medium">
              {userLocation && (
                <span>📍 Distancia estimada a pie: <strong>4 a 7 min</strong> desde tu posición</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {selectedEntity.type === 'workshop' && (
                <>
                  <button
                    onClick={() => onSelectWorkshop(selectedEntity.data)}
                    className="py-2 px-3.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    Ver Ficha Completa
                  </button>
                  <button
                    onClick={() => onOpenDirectChat(selectedEntity.data)}
                    className="py-2 px-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Chat con Monitor</span>
                  </button>
                </>
              )}

              {selectedEntity.type === 'incident' && (
                <div className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Alerta registrada en el ecosistema barrial</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
