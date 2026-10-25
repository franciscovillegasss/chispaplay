import { UserStreakProfile, ActiveCommune, ReferencePoint } from '../types';
import { 
  Flame, 
  Activity,
  ArrowRight,
  MapPin,
  ChevronDown,
  BookmarkCheck
} from 'lucide-react';

interface HeaderProps {
  isMonitor: boolean;
  onToggleRole: () => void;
  streakProfile: UserStreakProfile;
  onOpenStreakDrawer: () => void;
  onOpenNewWorkshopModal: () => void;
  onOpenAiCrawler?: () => void;
  currentCommune?: ActiveCommune;
  referencePoint?: ReferencePoint | null;
  onOpenLocationModal?: () => void;
  enrolledCount?: number;
  onOpenReservations?: () => void;
}

export function Header({
  isMonitor,
  onToggleRole,
  streakProfile,
  onOpenStreakDrawer,
  onOpenAiCrawler,
  currentCommune = 'maipu',
  referencePoint,
  onOpenLocationModal,
  enrolledCount = 1,
  onOpenReservations
}: HeaderProps) {
  const communeLabel = currentCommune === 'maipu' ? 'Maipú' : 'Valparaíso';
  const refLabel = referencePoint?.name ? referencePoint.name.split('(')[0].trim() : 'Centro';

  return (
    <header className="sticky top-0 z-40 bg-white border-b-2 border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3 sm:gap-4">
        
        {/* Brand: Time Out London Editorial Masthead */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center tracking-tighter select-none">
            <span className="bg-[#111111] text-white px-2.5 py-1 font-black text-lg uppercase tracking-tight">
              CHISPA
            </span>
            <span className="bg-[#E11D48] text-white px-2 py-1 font-black text-lg uppercase tracking-tight">
              PLAY.
            </span>
          </div>

          {/* Quick Location Switcher (Oculto en móvil para dar espacio y evitar desbordes) */}
          {onOpenLocationModal && (
            <button
              onClick={onOpenLocationModal}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 hover:border-neutral-900 text-neutral-900 text-xs font-bold transition-colors cursor-pointer rounded-none group"
              title="Cambiar comuna y punto de referencia de 15 minutos"
            >
              <MapPin className="w-3.5 h-3.5 text-[#E11D48] shrink-0" />
              <span className="font-extrabold text-neutral-950">
                {communeLabel}
              </span>
              <span className="text-neutral-400 hidden sm:inline">·</span>
              <span className="text-[11px] font-mono text-neutral-600 truncate max-w-[130px] hidden sm:inline">
                Cerca de {refLabel}
              </span>
              <span className="text-[10px] text-[#E11D48] font-bold uppercase tracking-wider underline ml-0.5">
                Cambiar
              </span>
              <ChevronDown className="w-3 h-3 text-neutral-500 group-hover:text-neutral-900 transition-colors" />
            </button>
          )}
        </div>

        {/* Center: GovTech Sincronizador de Cartelera */}
        <div className="flex-1 max-w-sm mx-1 sm:mx-3 hidden md:flex justify-center">
          {onOpenAiCrawler && (
            <button
              onClick={onOpenAiCrawler}
              className="w-full h-[40px] px-3 bg-white hover:bg-neutral-50 text-neutral-900 border border-neutral-300 hover:border-neutral-900 transition-colors cursor-pointer flex items-center justify-between group rounded-none"
              title="Abrir Sincronizador Territorial de Talleres y Convocatorias"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 bg-neutral-900 text-white flex items-center justify-center shrink-0">
                  <Activity className="w-3 h-3 text-white" />
                </div>
                <div className="text-left min-w-0">
                  <span className="font-bold text-xs text-neutral-900 truncate block group-hover:text-[#E11D48] transition-colors leading-tight">
                    Sincronizador Territorial
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono block leading-tight">
                    Rastrear convocatorias
                  </span>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#E11D48] group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>
          )}
        </div>

        {/* Right Actions: Mis Reservas, Amigos, Racha & Selector de Rol */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Mis Reservas Button */}
          <button
            onClick={onOpenReservations || onOpenStreakDrawer}
            title="Mis Reservas e Inscripciones"
            className="flex items-center gap-1.5 py-1.5 px-2.5 sm:px-3 bg-white hover:bg-neutral-50 border border-neutral-300 hover:border-neutral-900 text-neutral-900 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer rounded-none"
          >
            <BookmarkCheck className="w-3.5 h-3.5 text-[#059669]" />
            <span className="hidden sm:inline">Mis Reservas</span>
            <span className="px-1.5 py-0.2 bg-[#059669] text-white text-[10px] font-mono font-bold">
              {enrolledCount}
            </span>
          </button>

          {/* Racha */}
          <button
            onClick={onOpenStreakDrawer}
            title="Ver Racha Comunitaria"
            className="flex items-center gap-1.5 py-1.5 px-2.5 sm:px-3 bg-white hover:bg-red-50 text-[#E11D48] border border-[#E11D48] text-xs font-extrabold uppercase tracking-wider transition-colors cursor-pointer rounded-none"
          >
            <Flame className="w-3.5 h-3.5 text-[#E11D48] fill-[#E11D48]" />
            <span className="text-xs">
              {streakProfile.streakWeeks} Sem
            </span>
          </button>

          {/* Segmented Control: [ Modo Vecino | Modo Coordinador ] */}
          <div className="flex items-center border border-neutral-300 bg-neutral-100 p-0.5 rounded-none">
            <button
              onClick={() => { if (isMonitor) onToggleRole(); }}
              className={`py-1 px-2 sm:px-2.5 text-[11px] font-extrabold uppercase tracking-wider transition-colors cursor-pointer rounded-none ${
                !isMonitor
                  ? 'bg-neutral-950 text-white shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200/60'
              }`}
              title="Activar vista para familias y vecinos"
            >
              Modo Vecino
            </button>

            <button
              onClick={() => { if (!isMonitor) onToggleRole(); }}
              className={`py-1 px-2 sm:px-2.5 text-[11px] font-extrabold uppercase tracking-wider transition-colors cursor-pointer rounded-none flex items-center gap-1 ${
                isMonitor
                  ? 'bg-[#0F2942] text-white shadow-2xs border border-[#163B5C]'
                  : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200/60'
              }`}
              title="Activar panel de coordinación y publicación"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] inline-block shrink-0" />
              Modo Coordinador
            </button>
          </div>
        </div>

      </div>
    </header>
  );
}
