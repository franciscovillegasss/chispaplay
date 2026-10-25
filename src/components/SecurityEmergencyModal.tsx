import React from 'react';
import { Shield, Phone, AlertTriangle, X, ArrowRight } from 'lucide-react';

interface SecurityEmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCommune?: string;
  onOpenReportPark: () => void;
}

export const SecurityEmergencyModal: React.FC<SecurityEmergencyModalProps> = ({
  isOpen,
  onClose,
  activeCommune = 'maipu',
  onOpenReportPark,
}) => {
  if (!isOpen) return null;

  const isMaipu = activeCommune === 'maipu';
  const localSeguridadNumber = isMaipu ? '1418' : '1433';
  const localSeguridadName = isMaipu ? 'Seguridad Municipal Maipú' : 'Seguridad Municipal Valparaíso';

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-soft"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-xl border-t-2 sm:border-2 border-black p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Grab bar para móvil */}
        <div className="w-10 h-1 bg-neutral-300 rounded-full mx-auto mb-4 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              <Shield className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-base text-neutral-900 leading-tight">Seguridad y Cuidados</h3>
              <p className="text-xs text-neutral-500 font-sans">Contactos rápidos y reporte de tu plaza</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="text-neutral-400 hover:text-black p-1.5 transition-colors cursor-pointer rounded-lg hover:bg-neutral-100"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* OPCIÓN 1: Reportar en Plaza */}
        <div className="mt-4 p-4 rounded-xl border border-neutral-200 hover:border-black transition-all bg-neutral-50/70">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4 stroke-[2]" />
            </div>
            <div className="flex-1">
              <div className="font-sans font-bold text-sm text-neutral-900">Avisar algo roto en la plaza</div>
              <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">
                Luminarias apagadas, máquinas deterioradas o basura acumulada. Se envía directo al catastro vecinal.
              </p>
              <button 
                type="button" 
                onClick={() => {
                  onClose();
                  onOpenReportPark();
                }}
                className="mt-3 w-full bg-black hover:bg-[#E11D48] text-white font-sans text-xs font-bold py-2.5 px-4 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>Abrir reporte vecinal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* OPCIÓN 2: Teléfonos de Emergencia (Solo Recordatorio) */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-neutral-500">
              Teléfonos de emergencia
            </span>
            <span className="text-[9px] font-mono bg-neutral-100 text-neutral-600 px-1.5 py-0.5 border border-neutral-300 font-bold uppercase">
              Solo recordatorio
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            
            {/* Seguridad Municipal / Ciudadana */}
            <div className="p-3 rounded-lg border border-neutral-200 bg-white">
              <div className="text-xs font-sans font-bold text-neutral-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <span className="font-mono text-sm">1418 · 1433</span>
              </div>
              <div className="text-[10px] text-neutral-500 font-sans mt-0.5 truncate">Seguridad Municipal</div>
            </div>

            {/* Carabineros */}
            <div className="p-3 rounded-lg border border-neutral-200 bg-white">
              <div className="text-xs font-sans font-bold text-neutral-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span className="font-mono text-sm">133</span>
              </div>
              <div className="text-[10px] text-neutral-500 font-sans mt-0.5">Carabineros de Chile</div>
            </div>

            {/* SAMU */}
            <div className="p-3 rounded-lg border border-neutral-200 bg-white">
              <div className="text-xs font-sans font-bold text-neutral-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-600" />
                <span className="font-mono text-sm">131</span>
              </div>
              <div className="text-[10px] text-neutral-500 font-sans mt-0.5">Ambulancia SAMU</div>
            </div>

            {/* Bomberos */}
            <div className="p-3 rounded-lg border border-neutral-200 bg-white">
              <div className="text-xs font-sans font-bold text-neutral-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-600" />
                <span className="font-mono text-sm">132</span>
              </div>
              <div className="text-[10px] text-neutral-500 font-sans mt-0.5">Bomberos</div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
          <span>Protocolo de cuidado barrial aplicable a todas las plazas</span>
          <button 
            type="button" 
            onClick={onClose}
            className="font-sans font-semibold text-neutral-700 hover:text-black cursor-pointer py-1 px-2"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
