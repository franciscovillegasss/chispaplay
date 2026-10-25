import React from 'react';
import { 
  BellRing, 
  Radio, 
  MapPin, 
  ShieldCheck, 
  X, 
  AlertTriangle,
  ArrowRight,
  Info
} from 'lucide-react';

interface SecurityGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCommune?: string;
  onOpenReportPark?: () => void;
}

export const SecurityGuideModal: React.FC<SecurityGuideModalProps> = ({
  isOpen,
  onClose,
  activeCommune = 'maipu',
  onOpenReportPark
}) => {
  if (!isOpen) return null;

  const isMaipu = activeCommune === 'maipu';
  const localSeguridadNumber = isMaipu ? '1418' : '1433';
  const localSeguridadName = isMaipu ? 'Seguridad Municipal Maipú' : 'Seguridad Municipal Valparaíso';

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Contenedor del Modal con animación suave slide-in */}
      <div 
        className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl border-t-2 sm:border-2 border-black p-5 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto animate-slide-in-up transform transition-transform"
      >
        {/* Grab bar ergonómica para celulares */}
        <div className="w-12 h-1.5 bg-neutral-300 rounded-full mx-auto mb-4 sm:hidden" />

        {/* Cabecera Principal */}
        <div className="flex items-center justify-between pb-3.5 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
              <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider bg-black text-white px-2 py-0.5 font-bold">
                  Guía Oficial
                </span>
                <span className="text-xs text-neutral-500 font-medium font-mono">
                  Cuidado Barrial
                </span>
              </div>
              <h3 className="font-sans font-black text-lg text-neutral-900 leading-tight mt-0.5">
                Seguridad y Emergencia Barrial
              </h3>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="text-neutral-400 hover:text-black p-2 transition-colors cursor-pointer rounded-lg hover:bg-neutral-100"
            aria-label="Cerrar guía de seguridad"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subtítulo informativo */}
        <p className="text-xs text-neutral-600 mt-3 leading-relaxed">
          Protocolo ilustrado paso a paso sobre cómo actuar de forma segura y coordinada ante cualquier situación de riesgo o descompensación en la plaza.
        </p>

        {/* GUÍA ILUSTRADA EN 3 PASOS CON ICONOS GRANDES */}
        <div className="mt-4 space-y-3">
          
          {/* PASO 1: BOTÓN DE ALERTA */}
          <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/70 hover:border-black transition-all">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#E11D48] text-white flex items-center justify-center shrink-0 shadow-xs">
                <BellRing className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold bg-neutral-900 text-white px-1.5 py-0.2 uppercase">
                    Paso 1
                  </span>
                  <h4 className="font-sans font-bold text-sm text-neutral-900">
                    Botón de Alerta Silenciosa
                  </h4>
                </div>
                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  Si presencias una situación sospechosa, peligro o corte de luz, activa la alerta vecinal en ChispaPlay. Avisa discretamente a los guardianes en un radio de 500 metros sin generar pánico.
                </p>
              </div>
            </div>
          </div>

          {/* PASO 2: VIGILANTES Y MONITORES */}
          <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/70 hover:border-black transition-all">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Radio className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold bg-neutral-900 text-white px-1.5 py-0.2 uppercase">
                    Paso 2
                  </span>
                  <h4 className="font-sans font-bold text-sm text-neutral-900">
                    Contacto con Monitores y Vigilantes
                  </h4>
                </div>
                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  Acércate con calma al monitor identificado del taller o al patrullero de Seguridad Municipal de tu cuadrante. Disponen de radiocomunicación directa con la central comunal y ambulancia.
                </p>
              </div>
            </div>
          </div>

          {/* PASO 3: PUNTOS DE ENCUENTRO SEGUROS */}
          <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/70 hover:border-black transition-all">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <MapPin className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold bg-neutral-900 text-white px-1.5 py-0.2 uppercase">
                    Paso 3
                  </span>
                  <h4 className="font-sans font-bold text-sm text-neutral-900">
                    Puntos de Encuentro Protegidos
                  </h4>
                </div>
                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  En emergencias mayores, congrega a tu familia frente a la sede social o junto al tótem central iluminado de la plaza. Son zonas visibles, despejadas y con acceso prioritario de vehículos de auxilio.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* NÚMEROS DE EMERGENCIA: SOLO RECORDATORIO (SIN ENLACES TEL:) */}
        <div className="mt-5 pt-4 border-t border-neutral-200">
          <div className="flex items-center justify-between mb-2.5">
            <div className="text-[11px] font-sans font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-neutral-400" />
              <span>Teléfonos Oficiales de Emergencia</span>
            </div>
            <span className="text-[9px] font-mono bg-neutral-100 text-neutral-600 border border-neutral-300 px-1.5 py-0.5 uppercase font-semibold">
              Solo Recordatorio
            </span>
          </div>

          <p className="text-[11px] text-neutral-500 mb-3">
            Para evitar marcaciones involuntarias, anota o digita estos números directamente en el teclado de tu celular:
          </p>

          <div className="grid grid-cols-2 gap-2">
            
            {/* Seguridad Municipal / Ciudadana */}
            <div className="p-2.5 rounded-lg border border-neutral-200 bg-white">
              <div className="flex items-center justify-between">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <span className="text-[9px] font-mono text-neutral-400 uppercase">Seguridad</span>
              </div>
              <div className="font-mono font-black text-base text-neutral-900 mt-1 leading-none">
                1418 · 1433
              </div>
              <div className="text-[10px] text-neutral-600 font-medium truncate mt-0.5">
                Seguridad Municipal
              </div>
            </div>

            {/* Carabineros */}
            <div className="p-2.5 rounded-lg border border-neutral-200 bg-white">
              <div className="flex items-center justify-between">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span className="text-[9px] font-mono text-neutral-400 uppercase">Policial</span>
              </div>
              <div className="font-mono font-black text-base text-neutral-900 mt-1 leading-none">
                133
              </div>
              <div className="text-[10px] text-neutral-600 font-medium truncate mt-0.5">
                Carabineros de Chile
              </div>
            </div>

            {/* SAMU */}
            <div className="p-2.5 rounded-lg border border-neutral-200 bg-white">
              <div className="flex items-center justify-between">
                <span className="w-2 h-2 rounded-full bg-red-600" />
                <span className="text-[9px] font-mono text-neutral-400 uppercase">Salud</span>
              </div>
              <div className="font-mono font-black text-base text-neutral-900 mt-1 leading-none">
                131
              </div>
              <div className="text-[10px] text-neutral-600 font-medium truncate mt-0.5">
                Ambulancia SAMU
              </div>
            </div>

            {/* Bomberos */}
            <div className="p-2.5 rounded-lg border border-neutral-200 bg-white">
              <div className="flex items-center justify-between">
                <span className="w-2 h-2 rounded-full bg-amber-600" />
                <span className="text-[9px] font-mono text-neutral-400 uppercase">Rescate</span>
              </div>
              <div className="font-mono font-black text-base text-neutral-900 mt-1 leading-none">
                132
              </div>
              <div className="text-[10px] text-neutral-600 font-medium truncate mt-0.5">
                Bomberos
              </div>
            </div>

          </div>
        </div>

        {/* ACCESO RÁPIDO A REPORTE DE PLAZA */}
        {onOpenReportPark && (
          <div className="mt-4 p-3.5 rounded-xl border border-neutral-200 bg-neutral-50 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-neutral-900">¿Hay algo roto en la plaza?</div>
                <div className="text-[11px] text-neutral-500">Luminarias, máquinas o juegos deteriorados</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenReportPark();
              }}
              className="px-3 py-2 bg-black hover:bg-[#E11D48] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0 flex items-center gap-1 shadow-xs"
            >
              <span>Avisar</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Botón de Cierre al Pie */}
        <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between">
          <span className="text-[11px] text-neutral-500 font-medium">
            Protocolo de cuidado vecinal aplicable a todas las plazas.
          </span>
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0"
          >
            Entendido, cerrar guía
          </button>
        </div>

      </div>
    </div>
  );
};
