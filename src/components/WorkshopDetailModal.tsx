import { Workshop, IncidentReport } from '../types';
import { 
  X, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Users, 
  MessageCircle, 
  CheckCircle2, 
  FileCheck,
  ShieldAlert,
  Plus,
  Lock,
  ExternalLink
} from 'lucide-react';

interface WorkshopDetailModalProps {
  workshop: Workshop | null;
  isMonitor: boolean;
  eventIncidents: IncidentReport[];
  isOpen: boolean;
  onClose: () => void;
  onOpenAttendance: (workshop: Workshop) => void;
  onOpenDirectChat: (workshop: Workshop) => void;
  onToggleRSVP: (workshopId: string) => void;
  onOpenEventSafetyReport: (workshop: Workshop) => void;
}

export function WorkshopDetailModal({
  workshop,
  isMonitor,
  eventIncidents = [],
  isOpen,
  onClose,
  onOpenAttendance,
  onOpenDirectChat,
  onToggleRSVP,
  onOpenEventSafetyReport
}: WorkshopDetailModalProps) {
  if (!isOpen || !workshop) return null;

  const isEnrolled = workshop.enrolledUsers.some(u => u.isMe);
  const myRecord = workshop.enrolledUsers.find(u => u.isMe);
  const hasAttended = myRecord?.attended ?? false;
  const enrolledCount = workshop.enrolledUsers.length;
  const spotsLeft = Math.max(0, workshop.capacity - enrolledCount);

  const handleOpenDirectWhatsApp = () => {
    const text = `Hola ${workshop.instructorName}! 👋 Te escribo directamente desde ChispaPlay por el taller "${workshop.title}".`;
    const url = `https://wa.me/${workshop.directChat.whatsappDirectNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Image Header */}
        <div className="relative aspect-[21/9] w-full bg-slate-900 overflow-hidden shrink-0">
          <img
            src={workshop.imageUrl}
            alt={workshop.title}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=900&auto=format&fit=crop&q=80';
            }}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-950/80 text-white hover:bg-slate-950 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="absolute bottom-4 left-6 right-6 text-white">
            <div className="flex items-center gap-2 text-xs font-chunky font-bold mb-1">
              <span className="bg-[#dc2626] text-white px-2.5 py-0.5 rounded-md uppercase text-[10px] tracking-wider">
                {workshop.category}
              </span>
              <span className="text-white/60">·</span>
              <span className="text-blue-200">👶 {workshop.ageGroup}</span>
            </div>
            <h2 className="font-chunky font-black text-xl md:text-2xl text-white leading-tight">
              {workshop.title}
            </h2>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 bg-white">
          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium">
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-[#dc2626] shrink-0" />
              <div>
                <span className="text-slate-500 block text-[11px] font-chunky">Horario</span>
                <strong className="text-slate-900 font-chunky font-bold">{workshop.schedule}</strong>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-[#1d4ed8] shrink-0" />
              <div>
                <span className="text-slate-500 block text-[11px] font-chunky">Lugar</span>
                <strong className="text-slate-900 font-chunky font-bold truncate block">{workshop.locationName}</strong>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-[#1d4ed8] shrink-0" />
              <div>
                <span className="text-slate-500 block text-[11px] font-chunky">Cupos</span>
                <strong className="text-slate-900 font-chunky font-bold">{enrolledCount}/{workshop.capacity} ({spotsLeft} libres)</strong>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="text-slate-500 block text-[11px] font-chunky">Acreditación Legal</span>
                <strong className="text-emerald-800 font-mono font-bold">{workshop.organizer.legalEntityNumber}</strong>
              </div>
            </div>
          </div>



          {/* DIRECT CHAT OPTIONS */}
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <img src={workshop.organizer.avatar} alt={workshop.instructorName} className="w-9 h-9 rounded-full object-cover" />
              <div>
                <div className="font-fun font-bold text-xs text-stone-900">
                  {workshop.instructorName}
                </div>
                <div className="text-[11px] text-stone-500 font-medium">
                  Chat directo con el monitor
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenDirectChat(workshop)}
                className="py-1.5 px-3 rounded-xl bg-white border border-emerald-300 text-emerald-800 text-xs font-bold hover:bg-emerald-50 transition-colors cursor-pointer"
              >
                Chat en la App
              </button>
              <button
                onClick={handleOpenDirectWhatsApp}
                className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-white" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>

          {/* INCLUSIVITY: Actividad Inclusiva / Neuro Friendly */}
          <div className="p-3.5 bg-purple-50/60 border border-purple-200 rounded-2xl space-y-2">
            <div className="font-fun font-bold text-xs text-purple-950 flex items-center gap-1.5">
              <span>♿</span>
              <span>Inclusión y Accesibilidad</span>
            </div>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {workshop.inclusivity.neurodivergentFriendly && (
                <span className="bg-white border border-purple-200 px-2.5 py-1 rounded-xl text-purple-900 font-bold text-[11px]">
                  🧩 Actividad Inclusiva / Neuro Friendly
                </span>
              )}
              {workshop.inclusivity.wheelchairAccessible && (
                <span className="bg-white border border-purple-200 px-2.5 py-1 rounded-xl text-stone-700 text-[11px]">
                  ♿ Rampa de acceso
                </span>
              )}
              {workshop.inclusivity.languages.map((lang, i) => (
                <span key={i} className="bg-white border border-purple-200 px-2.5 py-1 rounded-xl text-stone-700 text-[11px]">
                  🌐 {lang}
                </span>
              ))}
            </div>
          </div>

          {/* EVENT-SPECIFIC SAFETY (ACTIVATES ONLY POST-ATTENDANCE) */}
          <div className="p-4 bg-red-50/60 border border-red-200 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-chunky font-bold text-xs text-red-950 flex items-center gap-1.5">
                  <span>🛡️</span>
                  <span>Seguridad de este Evento ({eventIncidents.length})</span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  Envía notificación push silenciosa a vecinos con mayor racha de asistencia
                </div>
              </div>

              {hasAttended ? (
                <button
                  onClick={() => onOpenEventSafetyReport(workshop)}
                  className="py-1.5 px-3 rounded-xl bg-[#dc2626] hover:bg-red-700 text-white text-xs font-chunky font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Reportar Alerta</span>
                </button>
              ) : (
                <span className="text-[11px] text-slate-400 font-chunky font-medium flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Se activa tras marcar asistencia</span>
                </span>
              )}
            </div>

            {eventIncidents.length > 0 ? (
              <div className="space-y-1.5">
                {eventIncidents.map((inc) => (
                  <div key={inc.id} className="bg-white p-3 rounded-xl border border-red-200 text-xs shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="font-chunky font-bold text-slate-900">{inc.title}</div>
                      {inc.silentPushSent && (
                        <span className="bg-red-100 text-[#dc2626] px-2 py-0.5 rounded-full text-[10px] font-chunky font-bold">
                          ⚡ Push silenciosa activa
                        </span>
                      )}
                    </div>
                    <div className="text-slate-600 text-[11px] mt-0.5">{inc.description}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-500 font-medium">
                Sin alertas activas para este evento.
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <div className="text-xs font-chunky font-bold uppercase tracking-wider text-slate-400 mb-1">
              Descripción de la Convocatoria
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              {workshop.description}
            </p>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            onClick={() => onOpenAttendance(workshop)}
            className="py-2.5 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-chunky font-bold hover:bg-slate-100 transition-colors cursor-pointer shadow-2xs"
          >
            {hasAttended ? '✓ Asistencia Verificada' : 'Ingresar PIN'}
          </button>

          <button
            onClick={() => onToggleRSVP(workshop.id)}
            className={`py-2.5 px-5 rounded-xl text-xs font-chunky font-bold transition-all cursor-pointer shadow-xs ${
              isEnrolled
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-[#dc2626] hover:bg-[#1d4ed8] text-white'
            }`}
          >
            {isEnrolled ? '✓ Inscrito (Cancelar)' : 'Inscribir a mi Familia'}
          </button>
        </div>
      </div>
    </div>
  );
}
