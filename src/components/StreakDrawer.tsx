import { UserStreakProfile } from '../types';
import { Flame, X, Sparkles, Share2, Zap } from 'lucide-react';

interface StreakDrawerProps {
  streakProfile: UserStreakProfile;
  isOpen: boolean;
  onClose: () => void;
  onShareStreakOnWhatsApp: (streakWeeks: number) => void;
}

export function StreakDrawer({
  streakProfile,
  isOpen,
  onClose,
  onShareStreakOnWhatsApp
}: StreakDrawerProps) {
  if (!isOpen) return null;

  const xpPercentage = Math.round((streakProfile.xpCurrent / streakProfile.xpNextLevel) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-neutral-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col border-l-2 border-neutral-900 overflow-hidden animate-in slide-in-from-right duration-300 rounded-none">
        
        {/* Header: Time Out Red Masthead Style */}
        <div className="bg-[#DC2626] px-6 py-4 text-white flex items-center justify-between border-b-2 border-neutral-900">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-neutral-950 text-white flex items-center justify-center font-black text-lg">
              🔥
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-red-100 font-bold">
                Métrica de Participación
              </div>
              <h3 className="font-extrabold text-lg text-white uppercase tracking-tight leading-none mt-0.5">
                Racha Territorial
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-black/20 hover:bg-black/50 flex items-center justify-center text-white transition-colors cursor-pointer rounded-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content: Editorial Paper Gray Background */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 bg-[#F8F8F6]">
          {/* Main Streak Card: Time Out Solid Red Box */}
          <div className="bg-[#DC2626] p-6 text-white border-2 border-neutral-900 rounded-none relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold bg-neutral-950 px-2.5 py-0.5 text-white uppercase tracking-wider">
                Chispa Activa
              </span>
              <span className="text-xs text-white/90 font-mono font-bold">
                {streakProfile.totalWorkshopsAttended} talleres asistidos
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-extrabold text-6xl tracking-tight text-white leading-none">
                {streakProfile.streakWeeks}
              </span>
              <div>
                <div className="font-extrabold text-xl text-white uppercase tracking-tight">Semanas Seguidas</div>
                <div className="text-xs text-red-100 font-normal mt-0.5">
                  Participación constante en el territorio
                </div>
              </div>
            </div>

            {/* Weekly Tracker: Sharp editorial blocks */}
            <div className="mt-5 pt-4 border-t border-red-500/50">
              <div className="text-xs font-mono uppercase tracking-wider text-red-100 mb-2.5 flex items-center justify-between">
                <span>Esta semana:</span>
                <span className="text-white font-bold bg-neutral-950 px-2 py-0.5">{streakProfile.streakDaysCurrentWeek} de 7 días</span>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center font-mono">
                {streakProfile.weekDays.map((day, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col items-center p-2 rounded-none transition-all border ${
                      day.attended
                        ? 'bg-white text-neutral-950 border-neutral-900 font-bold'
                        : day.isToday
                        ? 'bg-neutral-950 text-white border-white font-bold'
                        : 'bg-red-700/60 text-white/70 border-red-600/40'
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase">{day.dayName}</span>
                    <div className="mt-1 text-xs font-bold">
                      {day.attended ? '✓' : '·'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* WhatsApp Share Button */}
            <button
              onClick={() => onShareStreakOnWhatsApp(streakProfile.streakWeeks)}
              className="mt-5 w-full py-2.5 px-4 bg-neutral-950 hover:bg-neutral-900 text-white text-xs font-extrabold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer border border-neutral-900 rounded-none"
            >
              <Share2 className="w-4 h-4 text-[#DC2626]" />
              <span>Compartir Racha en WhatsApp</span>
            </button>
          </div>

          {/* Level Progress: Clean White Editorial Box */}
          <div className="bg-white border border-neutral-200 p-5 rounded-none space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <div className="text-[11px] text-[#DC2626] font-bold uppercase tracking-widest">
                  Nivel de Compromiso
                </div>
                <div className="font-extrabold text-neutral-950 text-base uppercase tracking-tight mt-0.5">
                  {streakProfile.levelTitle}
                </div>
              </div>
              <div className="px-3 py-1 bg-neutral-950 text-white font-mono font-black text-sm">
                N°{streakProfile.levelNumber}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-neutral-600 mb-1.5 font-mono">
                <span>{streakProfile.xpCurrent} Puntos Chispa</span>
                <span>{streakProfile.xpNextLevel} para Nivel {streakProfile.levelNumber + 1}</span>
              </div>
              <div className="w-full h-2 bg-neutral-100 overflow-hidden border border-neutral-200">
                <div
                  className="h-full bg-neutral-950 transition-all duration-500"
                  style={{ width: `${xpPercentage}%` }}
                />
              </div>
            </div>

            <div className="text-xs text-neutral-600 font-mono flex items-center gap-1.5 pt-1">
              <Zap className="w-3.5 h-3.5 text-[#DC2626] shrink-0" />
              <span>+50 Puntos Chispa por cada taller validado con PIN.</span>
            </div>
          </div>

          {/* Badges / Stickers */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-neutral-950">
                Insignias & Reconocimientos
              </h4>
              <span className="text-xs text-neutral-500 font-mono">
                {streakProfile.badges.filter(b => b.unlocked).length} de {streakProfile.badges.length} activas
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {streakProfile.badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`p-3 border text-left rounded-none ${
                    badge.unlocked
                      ? 'bg-white border-neutral-300'
                      : 'bg-neutral-100 border-neutral-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xl">{badge.iconEmoji}</span>
                    {badge.unlocked && (
                      <span className="text-[9px] font-mono font-bold text-[#059669] bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 uppercase">
                        Activo
                      </span>
                    )}
                  </div>
                  <div className="font-extrabold text-xs text-neutral-950 uppercase tracking-tight">
                    {badge.name}
                  </div>
                  <div className="text-[11px] text-[#525252] mt-1 line-clamp-2 leading-snug">
                    {badge.description}
                  </div>

                  {badge.unlocked && (
                    <div className="mt-2 pt-2 border-t border-neutral-100 text-[10px] font-mono text-[#DC2626] flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#DC2626] shrink-0" />
                      <span className="truncate font-bold">{badge.rewardText}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-white border-t border-neutral-200 flex justify-end">
          <button
            onClick={onClose}
            className="py-1.5 px-4 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-extrabold uppercase tracking-wider cursor-pointer transition-colors rounded-none"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
