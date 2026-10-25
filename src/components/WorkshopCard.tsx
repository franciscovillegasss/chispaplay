import { useState } from 'react';
import { 
  Workshop, 
  IncidentReport, 
  VigenciaStatus 
} from '../types';
import { 
  MapPin, 
  Clock, 
  ShieldCheck, 
  ThumbsUp, 
  MessageCircle, 
  VolumeX, 
  Lock, 
  Check, 
  ArrowRight,
  Navigation
} from 'lucide-react';

interface WorkshopCardProps {
  workshop: Workshop;
  isMonitor: boolean;
  eventIncidents?: IncidentReport[];
  onOpenDetails: (workshop: Workshop) => void;
  onOpenAttendance: (workshop: Workshop) => void;
  onOpenDirectChat: (workshop: Workshop) => void;
  onToggleRSVP: (workshopId: string) => void;
  onOpenEventSafetyReport: (workshop: Workshop) => void;
  isNewCoordinatorWorkshop?: boolean;
  calculatedDistanceText?: string;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=900&auto=format&fit=crop&q=80';

export function WorkshopCard({
  workshop,
  isMonitor,
  onOpenDetails,
  onOpenAttendance,
  onOpenDirectChat,
  onToggleRSVP,
  onOpenEventSafetyReport,
  isNewCoordinatorWorkshop = false,
  calculatedDistanceText
}: WorkshopCardProps) {
  const isEnrolled = workshop.enrolledUsers.some(u => u.isMe);
  const isTestWorkshop = workshop.id === 'ws-prueba-denuncia';

  // Interactive states
  const [isGoing, setIsGoing] = useState<boolean>(isEnrolled);
  const [goingCount, setGoingCount] = useState<number>(workshop.goingCount ?? workshop.enrolledUsers.length ?? 14);

  const handleToggleGoing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsGoing(!isGoing);
    setGoingCount(prev => isGoing ? prev - 1 : prev + 1);
    onToggleRSVP(workshop.id);
  };

  const vigencia: VigenciaStatus = workshop.vigencia ?? 'verde';
  const isArchive = vigencia === 'archivo';

  // 15-minute walking distance calculation (standard pace: ~80 meters per minute)
  const distanceM = workshop.distanceMeters ?? 400;
  const walkingMinutes = Math.max(3, Math.round(distanceM / 80));

  // Availability text
  const availabilityBadge = `${workshop.capacity} CUPOS · ${workshop.isFree ? 'GRATIS' : 'APORTE'}`;

  // Organization verified stamp text
  const verifiedOrgName = workshop.organizer.name.length > 24 
    ? workshop.organizer.name.slice(0, 22) + '...'
    : workshop.organizer.name;

  return (
    <article 
      onClick={() => onOpenDetails(workshop)}
      className={`animate-fade-in bg-white border transition-all flex flex-col justify-between overflow-hidden cursor-pointer group rounded-none ${
        isTestWorkshop 
          ? 'border-[#DC2626] bg-red-50/10' 
          : isNewCoordinatorWorkshop
          ? 'border-[#0F2942] ring-2 ring-[#0F2942]/10'
          : 'border-neutral-200 hover:border-neutral-900'
      } ${
        isArchive ? 'opacity-70 grayscale-[25%]' : ''
      }`}
    >
      <div>
        {/* Special Coordinator or Test Workshop Badge */}
        {isNewCoordinatorWorkshop && (
          <div className="bg-[#0F2942] text-white px-3 py-1 text-[10px] font-mono font-bold flex items-center justify-between uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#10B981] inline-block animate-pulse" />
              <span>NUEVO · PUBLICADO POR COORDINADOR</span>
            </span>
            <span>Acreditado JJVV</span>
          </div>
        )}

        {isTestWorkshop && (
          <div className="bg-[#DC2626] text-white px-3 py-1 text-[10px] font-mono font-bold flex items-center justify-between uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-white inline-block animate-pulse" />
              <span>Taller de Demostración · Asistencia Validada</span>
            </span>
            <span>Verificado</span>
          </div>
        )}

        {/* NIVEL 1: FOTO CON INSIGNIA DE CUPOS Y SELLO VERIFICADO (RULE 4) */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-100">
          <img
            src={workshop.imageUrl}
            alt={workshop.title}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = FALLBACK_IMAGE;
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Sello de Organizador Verificado (Top Left) */}
          <div className="absolute top-2 left-2 bg-neutral-950/90 text-white font-mono text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide border border-white/20 flex items-center gap-1">
            <span className="text-[#10B981]">✓</span>
            <span className="truncate max-w-[170px]">{verifiedOrgName}</span>
          </div>

          {/* Insignia Superior de Cupos (Top Right) */}
          <div className="absolute top-2 right-2 bg-neutral-950/90 text-white font-mono text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider border border-white/20">
            {availabilityBadge}
          </div>
        </div>

        {/* NIVEL 2: CATEGORÍA + TÍTULO EN NEGRITA + HORARIO Y PLAZA CON DISTANCIA EN MINUTOS */}
        <div className="p-4 space-y-2">
          {/* Categoría superior en rojo editorial */}
          <div className="text-[11px] font-extrabold uppercase tracking-widest text-[#DC2626]">
            {workshop.category} · {workshop.ageGroup}
          </div>

          {/* Título en negrita */}
          <h3 className="font-extrabold text-lg leading-snug text-neutral-950 group-hover:text-[#DC2626] transition-colors line-clamp-2 tracking-tight">
            {workshop.title}
          </h3>

          {/* Horario y Plaza con distancia en minutos */}
          <div className="space-y-1 text-xs text-neutral-700 font-medium pt-0.5">
            <div className="flex items-center gap-1.5 truncate">
              <Clock className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
              <span className="font-mono text-neutral-800">{workshop.schedule}</span>
            </div>
            <div className="flex items-center gap-1.5 truncate font-sans text-neutral-900 font-semibold">
              <span className="text-[#DC2626] shrink-0">📍</span>
              <span className="truncate">
                {calculatedDistanceText ? `${calculatedDistanceText} · ${workshop.locationName}` : `A ${walkingMinutes} min a pie · ${workshop.locationName}`}
              </span>
            </div>
          </div>

          {/* NIVEL 3: PRUEBA SOCIAL EN 1 LÍNEA LIMPIA CON AVATARES PEQUEÑOS (RULE 4) */}
          <div className="pt-1.5 flex items-center gap-2 text-xs font-mono text-neutral-600">
            <div className="flex -space-x-1.5 overflow-hidden shrink-0">
              <div className="w-5 h-5 rounded-full bg-neutral-800 text-white text-[9px] font-bold flex items-center justify-center border border-white">
                C
              </div>
              <div className="w-5 h-5 rounded-full bg-[#163B5C] text-white text-[9px] font-bold flex items-center justify-center border border-white">
                M
              </div>
              <div className="w-5 h-5 rounded-full bg-[#DC2626] text-white text-[9px] font-bold flex items-center justify-center border border-white">
                V
              </div>
            </div>
            <span className="truncate text-[11px]">
              {goingCount} vecinos confirmados
            </span>
          </div>
        </div>
      </div>

      {/* NIVEL 4: BARRA DE ACCIÓN LIMPIA (ASISTIRÉ + FICHA) */}
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="p-4 pt-3 border-t border-neutral-200 bg-white space-y-2"
      >
        <div className="grid grid-cols-2 gap-2">
          {/* Botón Principal: Asistiré / Confirmado */}
          <button
            onClick={handleToggleGoing}
            className={`py-2 px-3 text-xs font-extrabold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer rounded-none border ${
              isGoing
                ? 'bg-[#059669] text-white border-[#059669]'
                : 'bg-neutral-950 hover:bg-[#DC2626] text-white border-neutral-950 hover:border-[#DC2626]'
            }`}
          >
            {isGoing ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>✓ Confirmado</span>
              </>
            ) : (
              <span>Asistiré</span>
            )}
          </button>

          {/* Botón Ficha y Detalles */}
          <button
            onClick={() => onOpenDetails(workshop)}
            className="py-2 px-3 bg-white hover:bg-neutral-100 text-neutral-950 border border-neutral-300 hover:border-neutral-900 text-xs font-extrabold uppercase tracking-wider transition-colors flex items-center justify-center gap-1 cursor-pointer rounded-none"
          >
            <span>Ficha & Detalles</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* FRANJA DISCRETA DE HERRAMIENTAS EN PLAZA: SOLO VISIBLE CUANDO ESTÁ CONFIRMADO O ES DE PRUEBA (RULE 4) */}
        {(isGoing || isTestWorkshop) && (
          <div className="pt-2 border-t border-dashed border-neutral-200 animate-in fade-in duration-200">
            <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-bold mb-1.5">
              Herramientas en Plaza (Asistencia Verificada):
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono">
              <button
                onClick={() => onOpenAttendance(workshop)}
                title="Validar asistencia presencial con el PIN del monitor"
                className="py-1 px-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300 font-bold flex items-center justify-center gap-1 cursor-pointer truncate"
              >
                <Lock className="w-3 h-3 text-neutral-600 shrink-0" />
                <span className="truncate">Validar PIN</span>
              </button>

              <button
                onClick={() => onOpenEventSafetyReport(workshop)}
                title="Reportar problema de seguridad o descarte"
                className="py-1 px-1.5 bg-red-50 hover:bg-[#DC2626] hover:text-white text-[#DC2626] border border-red-200 font-bold flex items-center justify-center gap-1 cursor-pointer truncate transition-colors"
              >
                <VolumeX className="w-3 h-3 shrink-0" />
                <span className="truncate">Reportar</span>
              </button>

              <a
                href={`https://wa.me/${workshop.directChat.whatsappDirectNumber}?text=${encodeURIComponent(`Hola ${workshop.instructorName}! 👋 Te escribo por la actividad "${workshop.title}" en ChispaPlay.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-1 px-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300 font-bold flex items-center justify-center gap-1 cursor-pointer truncate text-center"
              >
                <MessageCircle className="w-3 h-3 text-[#059669] shrink-0" />
                <span className="truncate">WhatsApp</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
