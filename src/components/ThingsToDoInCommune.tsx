import { useState, useMemo } from 'react';
import { Neighborhood, ReferencePoint } from '../types';
import { 
  MapPin, 
  Clock, 
  ArrowRight, 
  Check,
  CheckCircle2
} from 'lucide-react';
import { MAIPU_RANKED_ACTIVITIES, VALPARAISO_RANKED_ACTIVITIES } from '../data/communeWorkshops';

export interface RankedCarteleraItem {
  id: string;
  rank: number;
  title: string;
  organizerName: string;
  organizerHandle: string;
  categoryTag: string;
  highlightBadge: string;
  schedule: string;
  locationName: string;
  address: string;
  summary: string;
  imageUrl: string;
  participantsCount: number;
  isFree: boolean;
  timeframe?: 'hoy' | 'semana' | 'mes';
  availableSpots?: number;
  walkingMinutes?: number;
  distanceMeters?: number;
  coordinates?: { lat: number; lng: number };
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=900&auto=format&fit=crop&q=80';

const COMMUNE_RANKED_ACTIVITIES: Record<string, RankedCarteleraItem[]> = {
  maipu: MAIPU_RANKED_ACTIVITIES,
  valparaiso: VALPARAISO_RANKED_ACTIVITIES,
  santiago: [
    {
      id: 'ws-stg-1',
      rank: 1,
      title: 'Taller de Marionetas Gigantes y Títeres de Barrio',
      organizerName: 'Colectivo Barrio Yungay',
      organizerHandle: '@culturasantiago',
      categoryTag: 'TEATRO CALLEJERO',
      highlightBadge: 'FAMILIAS & INFANCIA',
      schedule: 'Hoy · 16:30 - 18:30',
      locationName: 'Plaza Brasil',
      address: 'Calle Huérfanos con Sotomayor',
      summary: 'Construcción de títeres de varilla con materiales reciclados y función final abierta al público.',
      imageUrl: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=900&auto=format&fit=crop&q=80',
      participantsCount: 42,
      isFree: true,
      timeframe: 'hoy',
      availableSpots: 18,
      walkingMinutes: 5,
      distanceMeters: 400
    },
    {
      id: 'ws-stg-2',
      rank: 2,
      title: 'Taller de Huerto y Plantas Medicinales en Herrera',
      organizerName: 'Huerto Urbano Barrio Yungay',
      organizerHandle: '@huertoyungay',
      categoryTag: 'AGROECOLOGÍA',
      highlightBadge: 'SEMILLAS NATIVAS',
      schedule: 'Sábado 16:00 - 18:00',
      locationName: 'Casona Comunitaria Herrera',
      address: 'Calle Herrera #650, Santiago Centro',
      summary: 'Propagación de hierbas medicinales, preparación de infusiones y botiquín natural de barrio.',
      // High-resolution verified gardening & nature image (Rule 2)
      imageUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=900&auto=format&fit=crop&q=80',
      participantsCount: 33,
      isFree: true,
      timeframe: 'semana',
      availableSpots: 14,
      walkingMinutes: 7,
      distanceMeters: 550
    },
    {
      id: 'ws-stg-3',
      rank: 3,
      title: 'Pintura al Óleo y Acuarela de Fachadas Históricas',
      organizerName: 'Taller de Arte Patrimonial',
      organizerHandle: '@artesantiago',
      categoryTag: 'ARTES VISUALES',
      highlightBadge: 'PINTURA AL AIRE LIBRE',
      schedule: 'Domingo 10:30 - 12:30',
      locationName: 'Frontis Museo de la Educación',
      address: 'Chacabuco #365, Barrio Yungay',
      summary: 'Aprende acuarela dibujando las coloridas casas neoclásicas del barrio con atriles en la vereda.',
      // High-resolution verified painting & art workshop image (Rule 2)
      imageUrl: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=900&auto=format&fit=crop&q=80',
      participantsCount: 28,
      isFree: true,
      timeframe: 'semana',
      availableSpots: 12,
      walkingMinutes: 6,
      distanceMeters: 480
    },
    {
      id: 'ws-stg-4',
      rank: 4,
      title: 'Taller de Organillo y Música Porteño-Capitalina',
      organizerName: 'Gremio de Organilleros de Chile',
      organizerHandle: '@organilleros_cl',
      categoryTag: 'PATRIMONIO SONORO',
      highlightBadge: 'TRADICIÓN CHILENA',
      schedule: 'Domingo 16:30 - 18:00',
      locationName: 'Paseo Huérfanos Poniente',
      address: 'Huérfanos con Libertad',
      summary: 'Conoce los cilindros musicales de estaño, el mecanismo del fuelle y cómo hacer remolinos de papel.',
      imageUrl: 'https://images.unsplash.com/photo-1472653431158-6364773b2a56?w=900&auto=format&fit=crop&q=80',
      participantsCount: 36,
      isFree: true,
      timeframe: 'mes',
      availableSpots: 20,
      walkingMinutes: 8,
      distanceMeters: 620
    }
  ],
  colina: [
    {
      id: 'ws-col-1',
      rank: 1,
      title: 'Taller Familiar de Huerto Urbano y Compostaje',
      organizerName: 'Huertos Comunitarios Colina',
      organizerHandle: '@muni_colina',
      categoryTag: 'ECOLOGÍA & FAMILIA',
      highlightBadge: 'TOP 1 MUNICIPAL',
      schedule: 'Hoy · 17:00 - 19:00',
      locationName: 'Parque San Miguel (Zona Huertos)',
      address: 'Av. Concepción #1240, Colina',
      summary: 'Siembra en bancales elevados, manejo de compost y lombricultura familiar para la infancia.',
      imageUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=900&auto=format&fit=crop&q=80',
      participantsCount: 48,
      isFree: true,
      timeframe: 'hoy',
      availableSpots: 15,
      walkingMinutes: 5,
      distanceMeters: 400
    },
    {
      id: 'ws-col-2',
      rank: 2,
      title: 'Torno de Cerámica y Escultura en Piedra Toba',
      organizerName: 'Artesanos Canteros de Colina',
      organizerHandle: '@culturacolina',
      categoryTag: 'PATRIMONIO VIVO',
      highlightBadge: 'TRADICIÓN HISTÓRICA',
      schedule: 'Sábado 15:30 - 17:30',
      locationName: 'Sede Patrimonial Las Canteras',
      address: 'Camino San Martín #450, Las Canteras',
      summary: 'Modelado en torno con greda local y tallado básico de cantería guiado por maestros artesanos.',
      imageUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=900&auto=format&fit=crop&q=80',
      participantsCount: 34,
      isFree: true,
      timeframe: 'semana',
      availableSpots: 8,
      walkingMinutes: 9,
      distanceMeters: 700
    },
    {
      id: 'ws-col-3',
      rank: 3,
      title: 'Escuela de Calistenia y Fuerza al Aire Libre',
      organizerName: 'Deportes Colina',
      organizerHandle: '@deportescolina',
      categoryTag: 'DEPORTE URBANO',
      highlightBadge: 'ALTO IMPACTO',
      schedule: 'Domingo 09:30 - 11:30',
      locationName: 'Parque Los Ingleses (Barras)',
      address: 'Calle Los Ingleses con Alba',
      summary: 'Entrenamiento progresivo en barras, dominadas, técnica postural y movilidad articular libre.',
      imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=900&auto=format&fit=crop&q=80',
      participantsCount: 56,
      isFree: true,
      timeframe: 'semana',
      availableSpots: 22,
      walkingMinutes: 6,
      distanceMeters: 450
    },
    {
      id: 'ws-col-4',
      rank: 4,
      title: 'Ensamble Juvenil de Cuerdas y Folclore de Zona Norte',
      organizerName: 'Corporación de Artes Colina',
      organizerHandle: '@artes_colina',
      categoryTag: 'MÚSICA & CULTURA',
      highlightBadge: 'CONVOCATORIA ABIERTA',
      schedule: 'Viernes 18:00 - 20:00',
      locationName: 'Teatro Municipal de Colina',
      address: 'Calle Alpatacal #052, Colina Centro',
      summary: 'Ensayos abiertos de violín, charango, guitarra y percusiones tradicionales chilenas.',
      imageUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=900&auto=format&fit=crop&q=80',
      participantsCount: 29,
      isFree: true,
      timeframe: 'mes',
      availableSpots: 16,
      walkingMinutes: 8,
      distanceMeters: 600
    }
  ],
  providencia: [
    {
      id: 'ws-pro-1',
      rank: 1,
      title: 'Yoga y Movilidad Matutina en Parque Inés de Suárez',
      organizerName: 'Deportes Providencia',
      organizerHandle: '@muniprovi',
      categoryTag: 'BIENESTAR',
      highlightBadge: 'CLASE MASIVA',
      schedule: 'Hoy · 09:00 - 10:15',
      locationName: 'Parque Inés de Suárez',
      address: 'Antonio Varas #1070',
      summary: 'Hatha yoga sobre el césped para todas las edades. Trae tu esterilla y botella reutilizable.',
      imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=900&auto=format&fit=crop&q=80',
      participantsCount: 65,
      isFree: true,
      timeframe: 'hoy',
      availableSpots: 25,
      walkingMinutes: 4,
      distanceMeters: 300
    },
    {
      id: 'ws-pro-2',
      rank: 2,
      title: 'Club de Astronomía Urbana y Observación Lunar',
      organizerName: 'Red Astronómica Vecinal',
      organizerHandle: '@astronomiaprovi',
      categoryTag: 'DIVULGACIÓN CIENTÍFICA',
      highlightBadge: 'TELESCOPIOS ABIERTOS',
      schedule: 'Sábado 20:30 - 22:30',
      locationName: 'Terraza Anfiteatro Parque de las Esculturas',
      address: 'Santa María #2205',
      summary: 'Observación con 4 telescopios Dobson de cráteres lunares y planetas del sistema solar.',
      imageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=900&auto=format&fit=crop&q=80',
      participantsCount: 78,
      isFree: true,
      timeframe: 'semana',
      availableSpots: 30,
      walkingMinutes: 8,
      distanceMeters: 650
    },
    {
      id: 'ws-pro-3',
      rank: 3,
      title: 'Taller de Encuadernación Artesanal Japonesa',
      organizerName: 'Biblioteca Bellavista',
      organizerHandle: '@bibliotecasprovi',
      categoryTag: 'OFICIOS DEL LIBRO',
      highlightBadge: 'MATERIALES INCLUIDOS',
      schedule: 'Sábado 11:00 - 13:00',
      locationName: 'Café Literario Parque Bustamante',
      address: 'Av. General Bustamante #050',
      summary: 'Costura expuesta en papel de algodón, confección de libretas de notas y plegado tradicional.',
      imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=900&auto=format&fit=crop&q=80',
      participantsCount: 22,
      isFree: true,
      timeframe: 'semana',
      availableSpots: 10,
      walkingMinutes: 5,
      distanceMeters: 400
    },
    {
      id: 'ws-pro-4',
      rank: 4,
      title: 'Taller de Teatro Espontáneo y Máscaras Expresivas',
      organizerName: 'Compañía Providencia Viva',
      organizerHandle: '@teatroprovi',
      categoryTag: 'ARTES ESCÉNICAS',
      highlightBadge: 'SIN EXPERIENCIA PREVIA',
      schedule: 'Domingo 17:00 - 19:00',
      locationName: 'Plaza Río de Janeiro',
      address: 'Pocuro con El Bosque',
      summary: 'Juegos de improvisación teatral al aire libre, creación de personajes y expresión corporal.',
      imageUrl: 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?w=900&auto=format&fit=crop&q=80',
      participantsCount: 31,
      isFree: true,
      timeframe: 'mes',
      availableSpots: 12,
      walkingMinutes: 7,
      distanceMeters: 520
    }
  ],
  rancagua: [
    {
      id: 'ws-ran-1',
      rank: 1,
      title: 'Patinaje y Hockey Recreativo en Parque Comunal',
      organizerName: 'Deportes Rancagua',
      organizerHandle: '@munirancagua',
      categoryTag: 'DEPORTE SOBRE RUEDAS',
      highlightBadge: 'TOP 1 RANCAGUA',
      schedule: 'Hoy · 17:00 - 19:00',
      locationName: 'Pista de Patinaje Parque Comunal',
      address: 'Av. Alameda con Chorrillos',
      summary: 'Clases gratuitas de patinaje de velocidad y hockey formativo sobre pista lisa cerrada.',
      imageUrl: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=900&auto=format&fit=crop&q=80',
      participantsCount: 52,
      isFree: true,
      timeframe: 'hoy',
      availableSpots: 20,
      walkingMinutes: 5,
      distanceMeters: 380
    },
    {
      id: 'ws-ran-2',
      rank: 2,
      title: 'Teatro Infantil y Cuentacuentos en Plaza República',
      organizerName: 'Compañía Teatral O’Higgins',
      organizerHandle: '@culturarancagua',
      categoryTag: 'TEATRO CALLEJERO',
      highlightBadge: 'PLAZA DE BOLSILLO',
      schedule: 'Sábado 17:00 - 18:30',
      locationName: 'Plaza de Bolsillo República',
      address: 'Av. República con Bombero Villalobos',
      summary: 'Historias tradicionales con música de acordeón, marionetas y cabritas gratuitas para la niñez.',
      imageUrl: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=900&auto=format&fit=crop&q=80',
      participantsCount: 45,
      isFree: true,
      timeframe: 'semana',
      availableSpots: 18,
      walkingMinutes: 6,
      distanceMeters: 490
    },
    {
      id: 'ws-ran-3',
      rank: 3,
      title: 'Taller de Cerámica en Greda de Pañul',
      organizerName: 'Alfarería Campesina',
      organizerHandle: '@artesanias_rancagua',
      categoryTag: 'ARTESANÍA REGIONAL',
      highlightBadge: 'ARCILLA NATURAL',
      schedule: 'Domingo 11:00 - 13:00',
      locationName: 'Centro Cultural San Martín',
      address: 'Calle San Martín #320',
      summary: 'Modelado manual y técnica del bruñido con piedra de río para crear ollas y pailas de greda.',
      imageUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=900&auto=format&fit=crop&q=80',
      participantsCount: 30,
      isFree: true,
      timeframe: 'semana',
      availableSpots: 10,
      walkingMinutes: 7,
      distanceMeters: 550
    },
    {
      id: 'ws-ran-4',
      rank: 4,
      title: 'Escuela Formativa de Rayuela y Juegos Criollos',
      organizerName: 'Club Tradiciones de Rancagua',
      organizerHandle: '@rayuelarancagua',
      categoryTag: 'JUEGOS POPULARES',
      highlightBadge: 'DEPORTE NACIONAL',
      schedule: 'Domingo 15:30 - 17:30',
      locationName: 'Canchas Tradicionales Alameda',
      address: 'Alameda Bernardo O’Higgins #890',
      summary: 'Taller formativo de lanzamiento de tejo en cajón de greda para familias y jóvenes.',
      imageUrl: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=900&auto=format&fit=crop&q=80',
      participantsCount: 38,
      isFree: true,
      timeframe: 'mes',
      availableSpots: 15,
      walkingMinutes: 9,
      distanceMeters: 720
    }
  ]
};

type TimeframeFilter = 'hoy' | 'semana' | 'mes';

interface ThingsToDoInCommuneProps {
  currentNeighborhood: Neighborhood;
  onOpenWorkshopDetails?: (workshopId: string) => void;
  onToggleRSVP?: (workshopId: string) => void;
  enrolledWorkshopIds?: string[];
  onOpenAiScrapperWithPrompt?: (prompt: string) => void;
  userReferencePoint?: ReferencePoint | null;
  customRankedItems?: RankedCarteleraItem[];
}

export function ThingsToDoInCommune({
  currentNeighborhood,
  onOpenWorkshopDetails,
  onToggleRSVP,
  enrolledWorkshopIds = [],
  userReferencePoint,
  customRankedItems = []
}: ThingsToDoInCommuneProps) {
  const [activeTimeframe, setActiveTimeframe] = useState<TimeframeFilter>('semana');
  const [localReservedIds, setLocalReservedIds] = useState<Set<string>>(new Set());
  const [carouselIndex, setCarouselIndex] = useState<number>(0);

  const communeKey = currentNeighborhood.id.toLowerCase();
  
  const allRankedItems = useMemo(() => {
    const base = COMMUNE_RANKED_ACTIVITIES[communeKey] || COMMUNE_RANKED_ACTIVITIES.maipu || COMMUNE_RANKED_ACTIVITIES.valparaiso || COMMUNE_RANKED_ACTIVITIES.santiago;
    if (customRankedItems && customRankedItems.length > 0) {
      const combined = [...customRankedItems, ...base.filter(b => !customRankedItems.some(c => c.id === b.id))];
      return combined.map((it, idx) => ({ ...it, rank: idx + 1 }));
    }
    return base;
  }, [communeKey, customRankedItems]);

  const displayItems = useMemo(() => {
    if (activeTimeframe === 'hoy') {
      return [...allRankedItems].sort((a, b) => {
        if (a.timeframe === 'hoy') return -1;
        if (b.timeframe === 'hoy') return 1;
        return a.rank - b.rank;
      });
    }
    if (activeTimeframe === 'mes') {
      return [...allRankedItems].sort((a, b) => {
        if (a.timeframe === 'mes') return -1;
        if (b.timeframe === 'mes') return 1;
        return a.rank - b.rank;
      });
    }
    return allRankedItems;
  }, [allRankedItems, activeTimeframe]);

  const handleToggleReserve = (itemId: string) => {
    setLocalReservedIds(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });

    if (onToggleRSVP) {
      onToggleRSVP(itemId);
    }
  };

  const handleTimeframeChange = (filter: TimeframeFilter) => {
    setActiveTimeframe(filter);
    setCarouselIndex(0);
  };

  const handlePrevSlide = () => {
    setCarouselIndex(prev => Math.max(0, prev - 1));
  };

  const handleNextSlide = () => {
    setCarouselIndex(prev => Math.min(displayItems.length - 1, prev + 1));
  };

  return (
    <section className="bg-white border-b-2 border-neutral-900 pb-8 pt-2">
      {/* Time Out London Editorial Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 bg-[#E11D48] inline-block" />
            <span className="text-[11px] font-black uppercase tracking-widest text-[#E11D48]">
              Talleres en tu barrio
            </span>
            <span className="text-neutral-300">/</span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 font-mono">
              {currentNeighborhood.displayName}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-950 uppercase leading-none">
            Talleres en tu barrio
          </h2>
          <p className="text-sm text-neutral-600 mt-1 font-normal">
            Actividades a pocos pasos de tu casa organizadas por la comunidad.
          </p>
        </div>

        {/* 3 Clean Timeframe Tabs & Slider Controls */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center border border-neutral-300 bg-neutral-100 p-0.5 rounded-none">
            <button
              onClick={() => handleTimeframeChange('hoy')}
              className={`px-3.5 py-1.5 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer rounded-none ${
                activeTimeframe === 'hoy'
                  ? 'bg-neutral-950 text-white shadow-2xs'
                  : 'bg-transparent hover:text-neutral-950 text-neutral-600'
              }`}
            >
              Hoy
            </button>

            <button
              onClick={() => handleTimeframeChange('semana')}
              className={`px-3.5 py-1.5 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer rounded-none ${
                activeTimeframe === 'semana'
                  ? 'bg-[#E11D48] text-white shadow-2xs'
                  : 'bg-transparent hover:text-neutral-950 text-neutral-600'
              }`}
            >
              Esta Semana
            </button>

            <button
              onClick={() => handleTimeframeChange('mes')}
              className={`px-3.5 py-1.5 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer rounded-none ${
                activeTimeframe === 'mes'
                  ? 'bg-neutral-950 text-white shadow-2xs'
                  : 'bg-transparent hover:text-neutral-950 text-neutral-600'
              }`}
            >
              Este Mes
            </button>
          </div>

          {/* Slider Prev / Next Arrows */}
          <div className="flex items-center gap-1 border border-neutral-300 bg-white p-0.5">
            <button
              onClick={handlePrevSlide}
              disabled={carouselIndex === 0}
              className="p-1.5 text-neutral-800 hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
              title="Tarjeta anterior"
            >
              ←
            </button>
            <span className="font-mono text-xs px-1 text-neutral-500">
              {carouselIndex + 1}/{displayItems.length}
            </span>
            <button
              onClick={handleNextSlide}
              disabled={carouselIndex >= displayItems.length - 1}
              className="p-1.5 text-neutral-800 hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
              title="Siguiente tarjeta"
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* Accordion / Foldable Display with Smooth Slide Transition */}
      <div className="pt-6">
        {/* 4 Cards Grid - Time Out London Editorial Format (Rule 3) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-500 ease-out">
          {displayItems.map((item, idx) => {
            const rankFormatted = String(idx + 1).padStart(2, '0');
            const isReserved = localReservedIds.has(item.id) || enrolledWorkshopIds.includes(item.id);
            const spotsText = `${item.availableSpots ?? 18} cupos libres`;
            
            // Dynamic realistic proximity (15-minute walking rule)
            let walkDistanceM = item.distanceMeters ?? 400;
            let walkTimeMin = item.walkingMinutes ?? 5;
            if (userReferencePoint && item.coordinates) {
              const dLat = (item.coordinates.lat - userReferencePoint.coordinates.lat) * 111139;
              const dLng = (item.coordinates.lng - userReferencePoint.coordinates.lng) * 111139 * Math.cos((userReferencePoint.coordinates.lat * Math.PI) / 180);
              walkDistanceM = Math.max(180, Math.round(Math.sqrt(dLat * dLat + dLng * dLng)));
              walkTimeMin = Math.max(2, Math.round(walkDistanceM / 80));
            }
            const walkText = `A ${walkTimeMin} min a pie · ${item.locationName}`;
            const kicker = `${item.categoryTag} · ${item.organizerHandle} · ${item.isFree ? 'GRATIS' : 'APORTE SOCIAL'}`;

            return (
              <article
                key={item.id}
                className="bg-white border border-neutral-200 flex flex-col justify-between group hover:border-neutral-900 transition-colors rounded-none overflow-hidden animate-fade-in"
              >
                <div>
                  {/* Clean Image with ONLY the Black Square Rank Stamp in Top-Left and verified onError fallback */}
                  <div className="relative aspect-[16/11] w-full bg-neutral-100 overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = FALLBACK_IMAGE;
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />

                    {/* Number Ranking Editorial: Solid Black Square */}
                    <div className="absolute top-0 left-0 bg-neutral-900 text-white font-black text-sm px-2.5 py-1 tracking-tight font-mono">
                      {rankFormatted}
                    </div>

                    {/* Clean Availability badge on photo */}
                    <div className="absolute top-2 right-2 bg-neutral-950/85 text-white font-mono text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide border border-white/20">
                      {spotsText}
                    </div>
                  </div>

                  {/* Editorial Text Hierarchy */}
                  <div className="p-4 space-y-2">
                    {/* 1. Kicker Superior in Red */}
                    <div className="text-[11px] font-bold uppercase tracking-widest text-[#E11D48] line-clamp-1">
                      {kicker}
                    </div>

                    {/* 2. Large Black Headline */}
                    <h3 className="font-extrabold text-lg leading-snug text-neutral-950 group-hover:text-[#E11D48] transition-colors line-clamp-2 tracking-tight">
                      {item.title}
                    </h3>

                    {/* 3. Brief 2-line Description */}
                    <p className="text-sm text-[#525252] line-clamp-2 leading-relaxed font-normal">
                      {item.summary}
                    </p>

                    {/* 4. Ultra-clear 15-min walking distance indicator */}
                    <div className="pt-1.5 space-y-1 text-xs text-neutral-700 font-mono">
                      <div className="flex items-center gap-1.5 truncate">
                        <Clock className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                        <span className="truncate">{item.schedule}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate font-semibold text-neutral-900">
                        <span className="text-[#E11D48] shrink-0">📍</span>
                        <span className="truncate">
                          {walkText}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. Minimalist Action Row: Direct RSVP + Ver Ficha (Rule 3) */}
                <div className="p-4 pt-3 border-t border-neutral-200 bg-white space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {/* Direct 1-Click RSVP Button */}
                    <button
                      onClick={() => handleToggleReserve(item.id)}
                      className={`py-2 px-2.5 text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1 cursor-pointer rounded-none border ${
                        isReserved
                          ? 'bg-[#059669] text-white border-[#059669]'
                          : 'bg-neutral-950 hover:bg-[#E11D48] text-white border-neutral-950 hover:border-[#E11D48]'
                      }`}
                    >
                      {isReserved ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>✓ Inscrito</span>
                        </>
                      ) : (
                        <span>Reservar Cupo</span>
                      )}
                    </button>

                    {/* View Details Button */}
                    <button
                      onClick={() => onOpenWorkshopDetails && onOpenWorkshopDetails(item.id)}
                      className="py-2 px-2.5 bg-white hover:bg-neutral-100 text-neutral-950 border border-neutral-300 hover:border-neutral-900 text-xs font-extrabold uppercase tracking-wider transition-colors flex items-center justify-center gap-1 cursor-pointer rounded-none"
                    >
                      <span>Ver Ficha</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
