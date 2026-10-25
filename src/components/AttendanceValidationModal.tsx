import { useState } from 'react';
import { Workshop } from '../types';
import { CheckCircle2, KeyRound, Copy, Check, X, Users, AlertCircle } from 'lucide-react';

interface AttendanceValidationModalProps {
  workshop: Workshop;
  isMonitor: boolean;
  isOpen: boolean;
  onClose: () => void;
  onConfirmAttendance: (workshopId: string) => void;
  onToggleAttendeeStatus: (workshopId: string, attendeeId: string) => void;
}

export function AttendanceValidationModal({
  workshop,
  isMonitor,
  isOpen,
  onClose,
  onConfirmAttendance,
  onToggleAttendeeStatus
}: AttendanceValidationModalProps) {
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [justValidated, setJustValidated] = useState(false);
  const [activeTab, setActiveTab] = useState<'pin' | 'lista'>('pin');

  if (!isOpen) return null;

  const myAttendee = workshop.enrolledUsers.find(u => u.isMe);
  const alreadyAttended = myAttendee?.attended ?? false;

  const handleValidatePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === workshop.checkInPin) {
      setPinError('');
      setJustValidated(true);
      onConfirmAttendance(workshop.id);
      setTimeout(() => {
        setJustValidated(false);
      }, 3000);
    } else {
      setPinError('PIN incorrecto');
    }
  };

  const handleQuickValidate = () => {
    setPinInput(workshop.checkInPin);
    setJustValidated(true);
    onConfirmAttendance(workshop.id);
    setTimeout(() => {
      setJustValidated(false);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#fffdfa] rounded-3xl max-w-md w-full border-2 border-amber-300 shadow-2xl overflow-hidden flex flex-col">
        {/* Rappi Style Header */}
        <div className="bg-stone-900 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center text-sm font-bold">
              🔑
            </div>
            <div>
              <h3 className="font-fun font-bold text-base text-white leading-tight">
                Verificación de Asistencia
              </h3>
              <p className="text-[11px] text-stone-400 truncate max-w-[220px]">
                {workshop.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab if monitor */}
        {isMonitor && (
          <div className="flex border-b border-stone-200 bg-stone-50 text-xs font-bold">
            <button
              onClick={() => setActiveTab('pin')}
              className={`flex-1 py-2.5 text-center transition-colors ${
                activeTab === 'pin' ? 'bg-white text-orange-700 border-b-2 border-orange-600' : 'text-stone-500'
              }`}
            >
              PIN
            </button>
            <button
              onClick={() => setActiveTab('lista')}
              className={`flex-1 py-2.5 text-center transition-colors ${
                activeTab === 'lista' ? 'bg-white text-orange-700 border-b-2 border-orange-600' : 'text-stone-500'
              }`}
            >
              Lista ({workshop.enrolledUsers.filter(u => u.attended).length}/{workshop.enrolledUsers.length})
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-6 space-y-4">
          {justValidated && (
            <div className="p-3 bg-emerald-100 border border-emerald-400 rounded-2xl flex items-center gap-2.5 text-emerald-950 text-xs font-bold animate-in zoom-in-95 duration-150">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>✓ ¡Asistencia verificada! Botón de seguridad del evento desbloqueado.</span>
            </div>
          )}

          {activeTab === 'pin' ? (
            <div className="space-y-4 text-center">
              {alreadyAttended ? (
                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-emerald-800 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Asistencia Verificada</span>
                  </div>
                  <p className="text-xs text-stone-500 font-medium">
                    Registrado a las {myAttendee?.checkInTime || '10:35 hrs'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Clean Rappi style prompt */}
                  <div className="space-y-1">
                    <div className="font-fun font-bold text-stone-900 text-base">
                      Anota el PIN que te dan en el taller
                    </div>
                    <div className="text-xs text-stone-500">
                      O entrega este PIN para verificarte
                    </div>
                  </div>

                  {/* Clean 4-digit Rappi code display */}
                  <div className="p-3 bg-amber-50 rounded-2xl border-2 border-dashed border-amber-300 inline-block px-7">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800 mb-0.5">
                      PIN del Taller
                    </div>
                    <div className="font-mono font-black text-3xl tracking-[0.25em] text-orange-700">
                      {workshop.checkInPin}
                    </div>
                  </div>

                  <form onSubmit={handleValidatePin} className="space-y-3 max-w-xs mx-auto">
                    <input
                      type="text"
                      maxLength={4}
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="Ingresar PIN"
                      className="w-full text-center tracking-[0.3em] font-mono text-xl font-bold py-2.5 px-3 bg-white border-2 border-stone-300 rounded-2xl focus:border-orange-500 focus:outline-none"
                    />

                    {pinError && (
                      <div className="text-xs text-rose-600 font-bold flex items-center justify-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {pinError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={pinInput.length < 4}
                      className="w-full py-2.5 px-4 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-xs font-bold rounded-2xl transition-all cursor-pointer shadow-xs"
                    >
                      Verificar Asistencia
                    </button>

                    <button
                      type="button"
                      onClick={handleQuickValidate}
                      className="text-xs text-stone-400 hover:text-stone-600 underline cursor-pointer block mx-auto font-medium"
                    >
                      (Auto-rellenar {workshop.checkInPin})
                    </button>
                  </form>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {workshop.enrolledUsers.map((u) => (
                <div key={u.id} className="p-2.5 bg-white border border-stone-200 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover" />
                    <span className="font-bold text-stone-900">{u.name}</span>
                  </div>
                  <button
                    onClick={() => onToggleAttendeeStatus(workshop.id, u.id)}
                    className={`py-1 px-2.5 rounded-lg font-bold text-[11px] ${
                      u.attended ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {u.attended ? '✓ Presente' : 'Pendiente'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
