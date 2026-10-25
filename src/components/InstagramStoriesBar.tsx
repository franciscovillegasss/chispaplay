import { useState, useRef } from 'react';
import { Workshop } from '../types';
import { 
  X, 
  ArrowRight, 
  ArrowLeft,
  MapPin, 
  ShieldCheck, 
  MessageCircle,
  Instagram,
  Clock,
  Users,
  ChevronLeft,
  ChevronRight,
  Heart,
  Flame,
  ThumbsUp
} from 'lucide-react';

interface InstagramStoriesBarProps {
  workshops: Workshop[];
  currentCommuneName: string;
  onSelectWorkshop: (workshop: Workshop) => void;
  onOpenAiCrawler: () => void;
}

interface ActivityStory {
  id: string;
  activityType: 'futbol' | 'cocina' | 'huerto' | 'alfareria' | 'titeres' | 'robotica';
  icon: string;
  title: string;
  shortLabel: string;
  organizerHandle: string;
  organizerName: string;
  avatarPhoto: string;
  actionPhoto: string;
  uploadedTimeAgo: string;
  participantsCount: number;
  caption: string;
  locationName: string;
  workshopRefId?: string;
}

const ACTION_STORIES: ActivityStory[] = [
  {
    id: 'story-futbol',
    activityType: 'futbol',
    icon: '⚽',
    title: 'Fútbol Formativo en Cancha',
    shortLabel: 'Fútbol',
    organizerHandle: '@deportes_colina',
    organizerName: 'Coordinación Deportiva Barrial',
    avatarPhoto: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=300&auto=format&fit=crop&q=80',
    actionPhoto: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=900&auto=format&fit=crop&q=80',
    uploadedTimeAgo: 'hace 1h',
    participantsCount: 42,
    caption: '¡En pleno partido en la multicancha comunal! Vecinas, vecinos y niños jugando fútbol formativo con arbitraje vecinal y pura energía.',
    locationName: 'Multicancha Parque San Miguel',
    workshopRefId: 'ws-col-3'
  },
  {
    id: 'story-cocina',
    activityType: 'cocina',
    icon: '🥖',
    title: 'Cocina & Panadería Barrial',
    shortLabel: 'Cocina',
    organizerHandle: '@cocina_comunitaria',
    organizerName: 'Taller de Soberanía Alimentaria',
    avatarPhoto: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=300&auto=format&fit=crop&q=80',
    actionPhoto: 'https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?w=900&auto=format&fit=crop&q=80',
    uploadedTimeAgo: 'hace 2h',
    participantsCount: 36,
    caption: '¡Amasando pan de campo y empanadas en el horno comunitario! Vecinos compartiendo recetas familiares, harina y fuego.',
    locationName: 'Sede Social Central Fontt',
    workshopRefId: 'ws-col-1'
  },
  {
    id: 'story-huerto',
    activityType: 'huerto',
    icon: '🌱',
    title: 'Cosecha & Siembra en Huerto',
    shortLabel: 'Huerto',
    organizerHandle: '@muni_colina',
    organizerName: 'Huertos Urbanos Colina',
    avatarPhoto: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb22659?w=300&auto=format&fit=crop&q=80',
    actionPhoto: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=900&auto=format&fit=crop&q=80',
    uploadedTimeAgo: 'hace 3h',
    participantsCount: 48,
    caption: '¡Jornada de cosecha de verduras y trasplante de almácigos! Más de 40 familias con las manos en la tierra aprendiendo compostaje.',
    locationName: 'Parque San Miguel, Zona Huertos',
    workshopRefId: 'ws-col-1'
  },
  {
    id: 'story-alfareria',
    activityType: 'alfareria',
    icon: '🏺',
    title: 'Torno de Greda & Cerámica',
    shortLabel: 'Cerámica',
    organizerHandle: '@cultura_canteras',
    organizerName: 'Artesanos de Las Canteras',
    avatarPhoto: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=300&auto=format&fit=crop&q=80',
    actionPhoto: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=900&auto=format&fit=crop&q=80',
    uploadedTimeAgo: 'hace 5h',
    participantsCount: 28,
    caption: '¡Torno en movimiento! Manos cubiertas de greda modelando platos y pocillos tradicionales con artesanos locales.',
    locationName: 'Sede Las Canteras #120',
    workshopRefId: 'ws-col-2'
  },
  {
    id: 'story-titeres',
    activityType: 'titeres',
    icon: '🎭',
    title: 'Títeres al Aire Libre',
    shortLabel: 'Títeres',
    organizerHandle: '@culturarancagua',
    organizerName: 'Compañía El Roto Titiritero',
    avatarPhoto: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=300&auto=format&fit=crop&q=80',
    actionPhoto: 'https://images.unsplash.com/photo-1472653431158-6364773b2a56?w=900&auto=format&fit=crop&q=80',
    uploadedTimeAgo: 'ayer',
    participantsCount: 54,
    caption: '¡La plaza llena de niñas y niños disfrutando la obra de títeres gigantes! Risas, música en vivo y aplausos comunitarios.',
    locationName: 'Frontis Teatro Cultural',
    workshopRefId: 'ws-ran-2'
  },
  {
    id: 'story-robotica',
    activityType: 'robotica',
    icon: '⚡',
    title: 'Mini-Robótica & Sensores',
    shortLabel: 'Robótica',
    organizerHandle: '@cienciacolina',
    organizerName: 'Laboratorio Infantil de Ciencia',
    avatarPhoto: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&auto=format&fit=crop&q=80',
    actionPhoto: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=900&auto=format&fit=crop&q=80',
    uploadedTimeAgo: 'hace 2 días',
    participantsCount: 24,
    caption: '¡Conectando cables, sensores y paneles solares! Chicos armando sus propios prototipos tecnológicos.',
    locationName: 'Centro Cultural Sala 2',
    workshopRefId: 'ws-col-4'
  }
];

export function InstagramStoriesBar({
  workshops,
  currentCommuneName,
  onSelectWorkshop,
  onOpenAiCrawler
}: InstagramStoriesBarProps) {
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [reactions, setReactions] = useState<Record<string, { likes: number; fires: number }>>({});
  const carouselRef = useRef<HTMLDivElement>(null);

  const currentStory = activeStoryIndex !== null ? ACTION_STORIES[activeStoryIndex] : null;

  const handleNextStory = () => {
    if (activeStoryIndex !== null && activeStoryIndex < ACTION_STORIES.length - 1) {
      setActiveStoryIndex(activeStoryIndex + 1);
    } else {
      setActiveStoryIndex(null);
    }
  };

  const handlePrevStory = () => {
    if (activeStoryIndex !== null && activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
    }
  };

  const scrollLeft = () => {
    carouselRef.current?.scrollBy({ left: -220, behavior: 'smooth' });
  };

  const scrollRight = () => {
    carouselRef.current?.scrollBy({ left: 220, behavior: 'smooth' });
  };

  const handleReact = (type: 'likes' | 'fires') => {
    if (!currentStory) return;
    const id = currentStory.id;
    setReactions(prev => {
      const cur = prev[id] || { likes: 38, fires: 24 };
      return {
        ...prev,
        [id]: {
          ...cur,
          [type]: cur[type] + 1
        }
      };
    });
  };

  return (
    <section className="bg-white border-b border-neutral-200 py-4 px-3 sm:px-4 space-y-3 rounded-none">
      
      {/* Time Out Magazine Style Section Header */}
      <div className="flex items-center justify-between gap-3 border-b border-neutral-200 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-[#DC2626] inline-block" />
          <h2 className="font-extrabold text-xs sm:text-sm uppercase tracking-wider text-neutral-950">
            Historias de la Semana
          </h2>
          <span className="text-neutral-300">/</span>
          <span className="text-[11px] font-mono font-bold text-neutral-500 uppercase">
            {currentCommuneName}
          </span>
        </div>

        {/* Carousel Scroll Navigation: Clean Minimalist Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={scrollLeft}
            className="w-6 h-6 border border-neutral-300 hover:border-neutral-900 bg-white hover:bg-neutral-100 text-neutral-800 flex items-center justify-center transition-colors cursor-pointer rounded-none text-xs"
            title="Desplazar hacia la izquierda"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={scrollRight}
            className="w-6 h-6 border border-neutral-300 hover:border-neutral-900 bg-white hover:bg-neutral-100 text-neutral-800 flex items-center justify-center transition-colors cursor-pointer rounded-none text-xs"
            title="Desplazar hacia la derecha"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Instagram Circular Stories Row (Fine Solid Black/Red Rings as requested) */}
      <div 
        ref={carouselRef}
        className="flex items-center gap-4 sm:gap-6 overflow-x-auto pb-2 pt-1 scrollbar-none scroll-smooth"
      >
        {ACTION_STORIES.map((story, idx) => (
          <button
            key={story.id}
            onClick={() => setActiveStoryIndex(idx)}
            className="group flex flex-col items-center shrink-0 cursor-pointer focus:outline-none transition-transform hover:-translate-y-0.5 duration-200"
          >
            {/* Circular Instagram Avatar with Fine Solid Black/Red Ring (No Multicolored Gradient) */}
            <div className="relative">
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full p-[2px] bg-neutral-900 group-hover:bg-[#DC2626] transition-colors">
                <div className="w-full h-full rounded-full overflow-hidden border border-white bg-neutral-100">
                  <img
                    src={story.avatarPhoto}
                    alt={story.title}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Activity Emoji Badge */}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border border-neutral-300 flex items-center justify-center text-[10px]">
                {story.icon}
              </div>
            </div>

            {/* Subtitles: Handle & Label */}
            <div className="mt-2 text-center max-w-[85px] sm:max-w-[95px]">
              <div className="font-bold text-xs text-neutral-950 truncate group-hover:text-[#DC2626] transition-colors leading-tight">
                {story.shortLabel}
              </div>
              <div className="text-[10px] text-neutral-500 font-mono truncate mt-0.5">
                {story.organizerHandle}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* FULL INSTAGRAM STORY VIEWER MODAL */}
      {currentStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-950 rounded-3xl max-w-sm w-full overflow-hidden text-white border border-slate-800 shadow-2xl relative flex flex-col max-h-[92vh]">
            
            {/* Top Multi-Segment Indicator */}
            <div className="p-3 pb-1 flex items-center gap-1 z-20">
              {ACTION_STORIES.map((_, idx) => (
                <div key={idx} className="h-1 flex-1 bg-white/25 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      idx === activeStoryIndex ? 'w-full bg-[#dc2626]' : activeStoryIndex !== null && idx < activeStoryIndex ? 'w-full bg-white/80' : 'w-0'
                    }`} 
                  />
                </div>
              ))}
            </div>

            {/* Story Top Author Header with Circular Logo */}
            <div className="px-3.5 py-2 flex items-center justify-between z-20 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full p-[2px] bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600">
                  <img
                    src={currentStory.avatarPhoto}
                    alt={currentStory.organizerName}
                    className="w-full h-full rounded-full object-cover border border-white"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 leading-none">
                    <span className="font-chunky font-black text-xs text-white">
                      {currentStory.organizerHandle}
                    </span>
                    <span className="text-[10px] text-white/70">· {currentStory.uploadedTimeAgo}</span>
                  </div>
                  <div className="text-[11px] text-white/80 truncate max-w-[190px] mt-0.5 font-medium">
                    {currentStory.locationName}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveStoryIndex(null)}
                className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Vertical Realistic Action Photo */}
            <div className="relative flex-1 min-h-[340px] max-h-[460px] bg-slate-900 overflow-hidden">
              <img
                src={currentStory.actionPhoto}
                alt={currentStory.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />

              {/* Story Navigation Tap Zones */}
              <div className="absolute inset-y-0 left-0 w-1/3 cursor-pointer z-10" onClick={handlePrevStory} />
              <div className="absolute inset-y-0 right-0 w-1/3 cursor-pointer z-10" onClick={handleNextStory} />

              {/* Story Overlay Caption */}
              <div className="absolute bottom-3 left-3 right-3 space-y-2 z-20">
                <div className="inline-flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] text-white font-chunky font-bold border border-white/20">
                  <span>{currentStory.icon}</span>
                  <span>{currentStory.title}</span>
                  <span className="text-white/60">·</span>
                  <span className="text-amber-300">👥 {currentStory.participantsCount} vecinos</span>
                </div>

                <p className="text-xs text-white/95 leading-relaxed font-medium bg-black/40 backdrop-blur-sm p-2.5 rounded-xl border border-white/10">
                  {currentStory.caption}
                </p>
              </div>
            </div>

            {/* Bottom Actions Row: Modern Reactions & WhatsApp */}
            <div className="p-3 bg-slate-950 border-t border-slate-900 flex items-center justify-between gap-2 z-20">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleReact('likes')}
                  className="py-1 px-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-xs font-chunky font-bold transition-all flex items-center gap-1 cursor-pointer border border-slate-800 text-rose-400"
                >
                  <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                  <span>{(reactions[currentStory.id]?.likes || 38)}</span>
                </button>

                <button
                  onClick={() => handleReact('fires')}
                  className="py-1 px-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-xs font-chunky font-bold transition-all flex items-center gap-1 cursor-pointer border border-slate-800 text-amber-400"
                >
                  <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{(reactions[currentStory.id]?.fires || 24)}</span>
                </button>
              </div>

              {/* Direct WhatsApp to organizer */}
              <a
                href={`https://wa.me/56976543210?text=${encodeURIComponent(`¡Hola! Vi la historia de ${currentStory.title} en ChispaPlay y me gustaría sumarme con mi familia.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-1.5 px-3 rounded-full bg-[#1d4ed8] hover:bg-blue-600 text-white text-xs font-chunky font-bold transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Hablar por WhatsApp</span>
              </a>
            </div>

          </div>
        </div>
      )}

    </section>
  );
}
