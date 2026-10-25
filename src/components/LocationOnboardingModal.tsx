import React, { useState, useEffect } from 'react';
import { ActiveCommune, ReferencePoint } from '../types';
import { 
  MapPin, 
  Check, 
  ArrowRight, 
  X as CloseIcon,
  Search
} from 'lucide-react';

export interface LocationOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCommune: ActiveCommune;
  currentReferencePoint: ReferencePoint;
  onSelectLocation: (commune: ActiveCommune, refPoint: ReferencePoint) => void;
  isFirstTime?: boolean;
}

export const COMMUNE_PRESETS: Record<ActiveCommune, {
  name: string;
  region: string;
  centerReference: ReferencePoint;
  suggestions: ReferencePoint[];
}> = {
  maipu: {
    name: 'Maipú',
    region: 'Santiago Poniente · RM',
    centerReference: {
      id: 'ref-mai-center',
      name: 'Plaza Mayor de Maipú',
      commune: 'maipu',
      coordinates: { lat: -33.5112, lng: -70.7578 },
      isCenter: true
    },
    suggestions: [
      { id: 'ref-mai-center', name: 'Metro Plaza de Maipú', commune: 'maipu', coordinates: { lat: -33.5112, lng: -70.7578 }, isCenter: true },
      { id: 'ref-mai-longitudinal', name: 'Barrio Longitudinal', commune: 'maipu', coordinates: { lat: -33.4980, lng: -70.7420 } },
      { id: 'ref-mai-satelite', name: 'Ciudad Satélite', commune: 'maipu', coordinates: { lat: -33.5420, lng: -70.7920 } },
      { id: 'ref-mai-tresponiente', name: 'Pajaritos / Parque Tres Poniente', commune: 'maipu', coordinates: { lat: -33.5220, lng: -70.7710 } },
      { id: 'ref-mai-abrazo', name: 'El Abrazo', commune: 'maipu', coordinates: { lat: -33.5350, lng: -70.7780 } }
    ]
  },
  valparaiso: {
    name: 'Valparaíso',
    region: 'Costa Central · V Región',
    centerReference: {
      id: 'ref-val-center',
      name: 'Plaza Victoria',
      commune: 'valparaiso',
      coordinates: { lat: -33.0470, lng: -71.6190 },
      isCenter: true
    },
    suggestions: [
      { id: 'ref-val-alegre', name: 'Cerro Alegre', commune: 'valparaiso', coordinates: { lat: -33.0425, lng: -71.6289 } },
      { id: 'ref-val-center', name: 'Plaza Victoria', commune: 'valparaiso', coordinates: { lat: -33.0470, lng: -71.6190 }, isCenter: true },
      { id: 'ref-val-baron', name: 'Cerro Barón', commune: 'valparaiso', coordinates: { lat: -33.0390, lng: -71.5990 } },
      { id: 'ref-val-playaancha', name: 'Playa Ancha', commune: 'valparaiso', coordinates: { lat: -33.0310, lng: -71.6420 } },
      { id: 'ref-val-polanco', name: 'Cerro Polanco', commune: 'valparaiso', coordinates: { lat: -33.0490, lng: -71.6080 } }
    ]
  }
};

export function LocationOnboardingModal({
  isOpen,
  onClose,
  currentCommune = 'maipu',
  currentReferencePoint,
  onSelectLocation,
  isFirstTime = false
}: LocationOnboardingModalProps) {
  const [selectedCommune, setSelectedCommune] = useState<ActiveCommune>(currentCommune || 'maipu');
  const [selectedRef, setSelectedRef] = useState<ReferencePoint>(
    currentReferencePoint || COMMUNE_PRESETS.maipu.centerReference
  );
  const [customInput, setCustomInput] = useState<string>('');
  const [hasAnimated, setHasAnimated] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedCommune(currentCommune);
      setSelectedRef(currentReferencePoint || COMMUNE_PRESETS[currentCommune]?.centerReference);
      // Trigger the slide-up animation effect after brief initial impact
      const timer = setTimeout(() => setHasAnimated(true), 350);
      return () => clearTimeout(timer);
    } else {
      setHasAnimated(false);
    }
  }, [isOpen, currentCommune, currentReferencePoint]);

  if (!isOpen) return null;

  const currentPreset = COMMUNE_PRESETS[selectedCommune];

  const handleCommuneChange = (commune: ActiveCommune) => {
    setSelectedCommune(commune);
    setSelectedRef(COMMUNE_PRESETS[commune].centerReference);
    setCustomInput('');
  };

  const handleSelectSuggestion = (point: ReferencePoint) => {
    setSelectedRef(point);
    setCustomInput('');
  };

  const handleOmitToCenter = () => {
    const center = COMMUNE_PRESETS[selectedCommune].centerReference;
    setSelectedRef(center);
    setCustomInput('');
    onSelectLocation(selectedCommune, center);
    onClose();
  };

  const handleConfirm = () => {
    if (customInput.trim().length > 0) {
      const customPoint: ReferencePoint = {
        id: `ref-custom-${Date.now()}`,
        name: customInput.trim(),
        commune: selectedCommune,
        coordinates: {
          lat: currentPreset.centerReference.coordinates.lat + (Math.random() - 0.5) * 0.008,
          lng: currentPreset.centerReference.coordinates.lng + (Math.random() - 0.5) * 0.008
        }
      };
      onSelectLocation(selectedCommune, customPoint);
    } else {
      onSelectLocation(selectedCommune, selectedRef);
    }
    onClose();
  };

  const communeTitle = selectedCommune === 'maipu' ? 'Maipú' : 'Valparaíso';
  const centerName = selectedCommune === 'maipu' ? 'Plaza Mayor de Maipú' : 'Plaza Victoria';

  return (
    <div 
      className="fixed inset-0 z-50 bg-white text-neutral-950 flex flex-col justify-between overflow-y-auto selection:bg-[#E11D48] selection:text-white"
      role="dialog"
      aria-modal="true"
    >
      {/* Top Editorial Masthead (Time Out London Style) */}
      <header className="w-full border-b-2 border-neutral-900 bg-white py-3 px-4 sm:px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center tracking-tighter">
            <span className="bg-[#111111] text-white px-2.5 py-1 font-black text-sm uppercase tracking-tight font-mono">
              CHISPA
            </span>
            <span className="bg-[#E11D48] text-white px-2 py-1 font-black text-sm uppercase tracking-tight font-mono">
              PLAY.
            </span>
          </div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-400 hidden sm:inline">
            Edición Hiperlocal · Regla de los 15 Minutos
          </span>
        </div>

        {!isFirstTime && (
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-500 hover:text-neutral-950 hover:bg-neutral-100 transition-colors cursor-pointer border border-transparent hover:border-neutral-300"
            title="Cerrar"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        )}
      </header>

      {/* Main Fullscreen Magazine Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-8 py-8 sm:py-12 flex flex-col justify-center">
        
        {/* Animated Question: Primero pregunta "¿Qué hacemos en [comuna]?", luego sube ligeramente */}
        <div 
          className={`transition-all duration-700 ease-out transform ${
            hasAnimated 
              ? '-translate-y-2 opacity-100' 
              : 'translate-y-4 opacity-90'
          }`}
        >
          <div className="flex items-center gap-2 mb-2 font-mono text-xs uppercase tracking-widest text-[#E11D48] font-bold">
            <span className="w-2 h-2 bg-[#E11D48] inline-block" />
            <span>Guía de Barrio</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tighter text-neutral-950 leading-[0.95]">
            ¿Qué hacemos en {communeTitle}?
          </h1>

          <p className="text-sm sm:text-base text-neutral-500 mt-2 max-w-xl font-normal">
            Encuentra talleres y actividades a menos de 15 minutos caminando de tu punto.
          </p>
        </div>

        {/* Content Section: Paso 1 & Paso 2 with Minimalist Presentation */}
        <div 
          className={`mt-8 sm:mt-10 space-y-8 transition-all duration-700 delay-150 ease-out transform ${
            hasAnimated 
              ? 'translate-y-0 opacity-100' 
              : 'translate-y-6 opacity-0'
          }`}
        >
          {/* PASO 1: SELECCIÓN HIPERFOCALIZADA DE COMUNA (MAIPÚ O VALPARAÍSO) */}
          <section className="space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-1.5">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-500">
                01 · Elige tu comuna
              </span>
              <span className="text-[11px] font-mono text-[#059669] font-bold">
                ● 2 Comunas Activas
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {/* Opción 1: Maipú */}
              <button
                type="button"
                onClick={() => handleCommuneChange('maipu')}
                className={`p-4 sm:p-5 text-left border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  selectedCommune === 'maipu'
                    ? 'border-neutral-950 bg-neutral-950 text-white shadow-md'
                    : 'border-neutral-200 bg-white text-neutral-900 hover:border-neutral-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl sm:text-2xl font-black uppercase tracking-tight">
                    Maipú
                  </span>
                  {selectedCommune === 'maipu' && (
                    <span className="w-5 h-5 bg-[#E11D48] text-white flex items-center justify-center text-xs font-bold">
                      ✓
                    </span>
                  )}
                </div>
                <div className={`text-xs font-mono mt-2 ${selectedCommune === 'maipu' ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  10 Actividades · RM
                </div>
              </button>

              {/* Opción 2: Valparaíso */}
              <button
                type="button"
                onClick={() => handleCommuneChange('valparaiso')}
                className={`p-4 sm:p-5 text-left border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  selectedCommune === 'valparaiso'
                    ? 'border-neutral-950 bg-neutral-950 text-white shadow-md'
                    : 'border-neutral-200 bg-white text-neutral-900 hover:border-neutral-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl sm:text-2xl font-black uppercase tracking-tight">
                    Valparaíso
                  </span>
                  {selectedCommune === 'valparaiso' && (
                    <span className="w-5 h-5 bg-[#E11D48] text-white flex items-center justify-center text-xs font-bold">
                      ✓
                    </span>
                  )}
                </div>
                <div className={`text-xs font-mono mt-2 ${selectedCommune === 'valparaiso' ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  10 Actividades · Costa
                </div>
              </button>
            </div>
          </section>

          {/* PASO 2: PUNTO DE REFERENCIA (REGLA DE LOS 15 MINUTOS) */}
          <section className="space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-1.5">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-500">
                02 · ¿Cerca de dónde estás?
              </span>
              <span className="text-[11px] font-mono text-neutral-400 hidden sm:inline">
                Cálculo a paso peatonal (80m/min)
              </span>
            </div>

            {/* Chips de sugerencias rápidas reales */}
            <div className="flex flex-wrap gap-2 pt-1">
              {currentPreset.suggestions.map((point) => {
                const isSelected = selectedRef.id === point.id && customInput.trim().length === 0;
                return (
                  <button
                    key={point.id}
                    type="button"
                    onClick={() => handleSelectSuggestion(point)}
                    className={`py-2 px-3 text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-neutral-950 text-white border-neutral-950 shadow-xs'
                        : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border-neutral-300'
                    }`}
                  >
                    <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-[#E11D48]' : 'text-neutral-500'}`} />
                    <span>{point.name}</span>
                    {isSelected && <Check className="w-3 h-3 text-white ml-0.5" />}
                  </button>
                );
              })}
            </div>

            {/* Input opcional directo para calle o plaza libre */}
            <div className="relative pt-1">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder={`O escribe tu calle o sector en ${communeTitle}...`}
                className="w-full text-xs py-2.5 pl-8 pr-3 bg-white border border-neutral-300 focus:border-neutral-900 focus:outline-none text-neutral-900 font-mono placeholder:text-neutral-400 rounded-none transition-colors"
              />
            </div>
          </section>

          {/* BOTONES DE ACCIÓN: OMITIR AL CENTRO & CONFIRMAR */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-neutral-200">
            {/* Botón claro: Omitir */}
            <button
              type="button"
              onClick={handleOmitToCenter}
              className="py-2.5 px-3 text-xs font-mono text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 border border-transparent hover:border-neutral-300 transition-colors cursor-pointer text-center"
              title={`Omitir y usar ${centerName} como referencia`}
            >
              Omitir (Usar centro de {communeTitle} como referencia)
            </button>

            {/* Botón Principal: Ver actividades */}
            <button
              type="button"
              onClick={handleConfirm}
              className="py-3 px-6 bg-[#E11D48] hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Explorar 10 Actividades en {communeTitle}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>

      {/* Footer Minimalista */}
      <footer className="w-full border-t border-neutral-200 py-3 px-4 sm:px-8 text-center text-[11px] font-mono text-neutral-400 shrink-0">
        ChispaPlay · Cartelera Territorial Abierta de Chile
      </footer>
    </div>
  );
}
