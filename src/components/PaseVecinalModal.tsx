import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  Ticket, 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  Clock, 
  Share2, 
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { getCurrentTrackedUser, TrackedUser } from '../utils/userTracker';
import { Workshop } from '../types';

interface PaseVecinalModalProps {
  isOpen: boolean;
  onClose: () => void;
  workshops: Workshop[];
  enrolledWorkshopIds: string[];
  activeCommune?: string;
  onOpenRegister?: () => void;
}

export const PaseVecinalModal: React.FC<PaseVecinalModalProps> = ({
  isOpen,
  onClose,
  workshops,
  enrolledWorkshopIds,
  activeCommune = 'maipu',
  onOpenRegister
}) => {
  const [user, setUser] = useState<TrackedUser | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      const currentUser = getCurrentTrackedUser();
      setUser(currentUser);
      
      const qrPayload = JSON.stringify({
        token: currentUser?.token || 'PASE-CHISPA-INVITADO',
        name: currentUser?.name || 'Vecino ChispaPlay',
        commune: activeCommune,
        timestamp: new Date().toISOString()
      });

      QRCode.toDataURL(qrPayload, {
        width: 220,
        margin: 1,
        color: {
          dark: '#111111',
          light: '#FFFFFF'
        }
      }).then(url => {
        setQrDataUrl(url);
      }).catch(err => {
        console.error('Error generando QR offline:', err);
      });
    }
  }, [isOpen, activeCommune]);

  if (!isOpen) return null;

  const reservedWorkshops = workshops.filter(w => enrolledWorkshopIds.includes(w.id));
  const isMaipu = activeCommune === 'maipu';

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Contenedor tipo bolsillo físico con animación de extracción */}
      <div className="w-full sm:max-w-md relative animate-pocket-extract">
        
        {/* Pestaña superior del bolsillo (efecto estuche digital) */}
        <div className="bg-neutral-900 text-white px-4 py-2 rounded-t-2xl sm:rounded-t-xl flex items-center justify-between border-t-2 border-x-2 border-black">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-widest font-black text-white">
              Bolsillo Digital · Credencial Física
            </span>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors cursor-pointer p-1 rounded-md"
            aria-label="Guardar credencial"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tarjeta de la Credencial (Physical Pass Aesthetic) */}
        <div className="bg-white border-2 border-black p-5 sm:p-6 shadow-2xl max-h-[88vh] overflow-y-auto rounded-b-none sm:rounded-b-xl border-t-0">
          
          {/* Header de la Credencial */}
          <div className="flex items-start justify-between pb-3.5 border-b-2 border-black">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="bg-[#111111] text-white px-2 py-0.5 font-mono font-black text-xs uppercase tracking-tight">
                  CHISPA
                </span>
                <span className="bg-[#E11D48] text-white px-1.5 py-0.5 font-mono font-black text-xs uppercase tracking-tight">
                  PLAY
                </span>
                <span className="text-[10px] font-mono font-bold text-neutral-500 ml-1 uppercase">
                  Acreditación Barrial
                </span>
              </div>
              <h3 className="font-sans font-black text-xl text-neutral-900 uppercase tracking-tight mt-1">
                Pase Vecinal Oficial
              </h3>
            </div>
            
            <div className="text-right">
              <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold px-2 py-0.5 border border-emerald-300">
                100% OFFLINE
              </span>
            </div>
          </div>

          {/* Tarjeta Física del Vecino */}
          <div className="mt-4 p-4 bg-[#F8F8F6] border-2 border-neutral-900 relative shadow-[4px_4px_0px_0px_#111111]">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <div className="text-[9px] font-mono uppercase font-bold text-neutral-500">
                  Titular Acreditado
                </div>
                <div className="font-sans font-black text-lg text-neutral-900 leading-tight mt-0.5">
                  {user?.name || 'Vecino Sin Registrar'}
                </div>
                <div className="text-xs font-mono text-neutral-600 mt-1 flex items-center gap-1">
                  <span className="text-neutral-400">ID:</span>
                  <strong className="text-[#E11D48] font-bold">{user?.token || 'INVITADO-PLAZA'}</strong>
                </div>
                <div className="text-[11px] text-neutral-700 font-mono mt-0.5 font-bold">
                  CONTACTO: {user?.whatsapp || user?.contact || user?.emailOrPhone || '+56 9 8765 4321'}
                </div>
              </div>

              {/* QR Code Offline */}
              <div className="bg-white p-2 border border-black shrink-0 flex flex-col items-center">
                {qrDataUrl ? (
                  <img 
                    src={qrDataUrl} 
                    alt="Código QR de Pase Vecinal Offline" 
                    className="w-24 h-24 object-contain"
                  />
                ) : (
                  <div className="w-24 h-24 bg-neutral-100 flex items-center justify-center text-[10px] text-neutral-400 font-mono">
                    Generando...
                  </div>
                )}
                <span className="text-[8px] font-mono font-bold uppercase text-neutral-500 mt-1">
                  Muestra al Monitor
                </span>
              </div>
            </div>
          </div>

          {/* Estado de Registro si es invitado */}
          {!user && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between gap-2">
              <div className="text-xs text-red-900">
                <strong>¿Aún no tienes tu token propio?</strong> Regístrate gratis en 10 segundos.
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenRegister?.();
                }}
                className="px-3 py-1.5 bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-bold shrink-0 rounded transition-colors cursor-pointer"
              >
                Registrarme
              </button>
            </div>
          )}

          {/* Talleres Guardados en tu Pase */}
          <div className="mt-5">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
              <div className="flex items-center gap-1.5 font-sans font-bold text-xs uppercase tracking-wider text-neutral-800">
                <Ticket className="w-4 h-4 text-[#E11D48]" />
                <span>Mis Cupos en Plazas ({reservedWorkshops.length})</span>
              </div>
              <span className="text-[10px] font-mono text-neutral-500">
                Guardados en tu celular
              </span>
            </div>

            {reservedWorkshops.length === 0 ? (
              <div className="py-6 text-center text-neutral-500 text-xs">
                <p>No tienes talleres reservados actualmente.</p>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Explora la cartelera y presiona &quot;Guardar cupo&quot; para agregarlos a tu credencial.
                </p>
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                {reservedWorkshops.map((ws) => (
                  <div 
                    key={ws.id}
                    className="p-3 border border-neutral-200 bg-white hover:border-black transition-all flex items-start justify-between gap-3"
                  >
                    <div className="flex-1">
                      <div className="font-sans font-bold text-xs text-neutral-900 leading-tight">
                        {ws.title}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-neutral-500 mt-1 font-sans">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#E11D48]" />
                          <span className="truncate max-w-[140px]">{ws.locationName}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-neutral-400" />
                          <span>{ws.schedule}</span>
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 shrink-0">
                      Cupo Activo ✓
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Guía Rápida para el Vecino */}
          <div className="mt-5 p-3.5 bg-neutral-50 border border-neutral-200 text-xs text-neutral-600 space-y-1.5 font-sans">
            <div className="font-bold text-neutral-900 flex items-center gap-1.5 text-xs">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>¿Cómo funciona tu Pase en la plaza?</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              1. Llega al taller y muestra esta pantalla al monitor comunitario.
            </p>
            <p className="text-[11px] leading-relaxed">
              2. El código QR funciona aunque no tengas señal o datos móviles activos.
            </p>
            <p className="text-[11px] leading-relaxed">
              3. Al validar tu asistencia acumulas semanas continuas para tu racha vecinal.
            </p>
          </div>

          {/* Botón de Guardado al Bolsillo */}
          <div className="mt-5 pt-3 border-t border-neutral-200 flex items-center justify-between">
            <span className="text-[11px] text-neutral-500 font-medium">
              Vigencia permanente en todas las plazas comunitarias
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-neutral-900 hover:bg-[#E11D48] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Guardar en Bolsillo
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
