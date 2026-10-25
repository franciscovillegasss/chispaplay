import React, { useState } from 'react';
import { ActiveCommune, CoordinatorProfile } from '../types';
import { 
  X, 
  ShieldCheck, 
  Building2, 
  User, 
  Phone, 
  Check, 
  Sparkles,
  MapPin
} from 'lucide-react';

interface CoordinatorRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: CoordinatorProfile;
  onSaveProfile: (profile: CoordinatorProfile) => void;
  activeCommune: ActiveCommune;
}

export function CoordinatorRegistrationModal({
  isOpen,
  onClose,
  currentProfile,
  onSaveProfile,
  activeCommune
}: CoordinatorRegistrationModalProps) {
  const [organizationName, setOrganizationName] = useState(currentProfile.organizationName || '');
  const [legalEntityNumber, setLegalEntityNumber] = useState(currentProfile.legalEntityNumber || '');
  const [managerName, setManagerName] = useState(currentProfile.managerName || '');
  const [whatsappPhone, setWhatsappPhone] = useState(currentProfile.whatsappPhone || '');
  const [commune, setCommune] = useState<ActiveCommune>(currentProfile.commune || activeCommune || 'maipu');

  if (!isOpen) return null;

  const handleAutocompleteQuickDemo = (presetCommune: ActiveCommune) => {
    if (presetCommune === 'maipu') {
      setOrganizationName('JJVV Parque Tres Poniente N° 34');
      setLegalEntityNumber('PJ N° 389-Maipú');
      setManagerName('Claudio Morales Soto');
      setWhatsappPhone('+56 9 7891 0001');
      setCommune('maipu');
    } else {
      setOrganizationName('Coordinación Barrial Cerro Alegre & Cárcel');
      setLegalEntityNumber('PJ N° 120-Valparaíso');
      setManagerName('Paulina Avaria Vergara');
      setWhatsappPhone('+56 9 8891 0002');
      setCommune('valparaiso');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizationName.trim() || !legalEntityNumber.trim() || !managerName.trim()) return;

    const updatedProfile: CoordinatorProfile = {
      id: `coord-${Date.now()}`,
      organizationName: organizationName.trim(),
      legalEntityNumber: legalEntityNumber.trim(),
      managerName: managerName.trim(),
      whatsappPhone: whatsappPhone.trim() || '+56 9 8451 9201',
      commune,
      verified: true,
      registeredAt: new Date().toISOString().split('T')[0]
    };

    onSaveProfile(updatedProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white max-w-lg w-full border-2 border-neutral-900 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] rounded-none"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Institucional de Alto Contraste */}
        <div className="bg-[#0F2942] text-white p-4 sm:p-5 flex items-center justify-between border-b-2 border-neutral-900">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#10B981] text-white flex items-center justify-center font-bold text-base">
              ✓
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#10B981] block">
                Acreditación Comunitaria
              </span>
              <h3 className="font-black text-lg text-white uppercase tracking-tight leading-none mt-0.5">
                Registro de Coordinador / Organización
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Demo Autocomplete Helpers */}
        <div className="bg-neutral-100 border-b border-neutral-200 px-4 py-2 flex items-center justify-between gap-2 flex-wrap text-xs">
          <span className="text-neutral-600 font-mono text-[11px]">
            Carga rápida de demostración:
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleAutocompleteQuickDemo('maipu')}
              className="px-2 py-0.5 bg-white hover:bg-neutral-200 border border-neutral-300 font-mono text-[10px] font-bold uppercase cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="w-2.5 h-2.5 text-[#E11D48]" />
              <span>Ejemplo Maipú</span>
            </button>
            <button
              type="button"
              onClick={() => handleAutocompleteQuickDemo('valparaiso')}
              className="px-2 py-0.5 bg-white hover:bg-neutral-200 border border-neutral-300 font-mono text-[10px] font-bold uppercase cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="w-2.5 h-2.5 text-[#E11D48]" />
              <span>Ejemplo Valparaíso</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto text-xs text-neutral-800">
          
          {/* Nombre de la Organización */}
          <div>
            <label className="font-extrabold text-neutral-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 mb-1">
              <Building2 className="w-3.5 h-3.5 text-neutral-500" />
              <span>Nombre de la Organización / Junta de Vecinos *</span>
            </label>
            <input
              type="text"
              required
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              placeholder="Ej: JJVV Parque Tres Poniente N° 34"
              className="w-full py-2.5 px-3 bg-white border border-neutral-300 focus:border-neutral-900 focus:outline-none text-xs font-mono text-neutral-900 rounded-none"
            />
          </div>

          {/* RUT o N° de Personalidad Jurídica (PJ) */}
          <div>
            <label className="font-extrabold text-neutral-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
              <span>RUT o N° de Personalidad Jurídica (PJ) *</span>
            </label>
            <input
              type="text"
              required
              value={legalEntityNumber}
              onChange={(e) => setLegalEntityNumber(e.target.value)}
              placeholder="Ej: PJ N° 389-Maipú o 65.123.456-7"
              className="w-full py-2.5 px-3 bg-white border border-neutral-300 focus:border-neutral-900 focus:outline-none text-xs font-mono text-neutral-900 rounded-none"
            />
            <span className="text-[10px] text-neutral-500 font-mono mt-0.5 block">
              Acreditación ante el Registro Civil o Dirección de Desarrollo Comunitario (DIDECO).
            </span>
          </div>

          {/* Nombre del Encargado / Monitor */}
          <div>
            <label className="font-extrabold text-neutral-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 mb-1">
              <User className="w-3.5 h-3.5 text-neutral-500" />
              <span>Nombre del Monitor / Encargado Territorial *</span>
            </label>
            <input
              type="text"
              required
              value={managerName}
              onChange={(e) => setManagerName(e.target.value)}
              placeholder="Ej: Claudio Morales Soto"
              className="w-full py-2.5 px-3 bg-white border border-neutral-300 focus:border-neutral-900 focus:outline-none text-xs font-mono text-neutral-900 rounded-none"
            />
          </div>

          {/* Teléfono de WhatsApp para Consultas */}
          <div>
            <label className="font-extrabold text-neutral-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 mb-1">
              <Phone className="w-3.5 h-3.5 text-[#059669]" />
              <span>Teléfono de WhatsApp para Consultas de Vecinos</span>
            </label>
            <input
              type="tel"
              value={whatsappPhone}
              onChange={(e) => setWhatsappPhone(e.target.value)}
              placeholder="+56 9 7891 0001"
              className="w-full py-2.5 px-3 bg-white border border-neutral-300 focus:border-neutral-900 focus:outline-none text-xs font-mono text-neutral-900 rounded-none"
            />
          </div>

          {/* Comuna */}
          <div>
            <label className="font-extrabold text-neutral-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 mb-1">
              <MapPin className="w-3.5 h-3.5 text-[#E11D48]" />
              <span>Comuna de Acreditación</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCommune('maipu')}
                className={`py-2 px-3 border text-xs font-bold uppercase transition-colors cursor-pointer ${
                  commune === 'maipu'
                    ? 'bg-neutral-950 text-white border-neutral-950 shadow-xs'
                    : 'bg-white hover:bg-neutral-100 text-neutral-800 border-neutral-300'
                }`}
              >
                Maipú (RM)
              </button>
              <button
                type="button"
                onClick={() => setCommune('valparaiso')}
                className={`py-2 px-3 border text-xs font-bold uppercase transition-colors cursor-pointer ${
                  commune === 'valparaiso'
                    ? 'bg-neutral-950 text-white border-neutral-950 shadow-xs'
                    : 'bg-white hover:bg-neutral-100 text-neutral-800 border-neutral-300'
                }`}
              >
                Valparaíso (Costa)
              </button>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="pt-4 border-t border-neutral-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300 text-xs font-extrabold uppercase tracking-wider cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="py-2.5 px-5 bg-[#0F2942] hover:bg-[#163B5C] text-white border border-[#0F2942] text-xs font-extrabold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
            >
              <Check className="w-4 h-4 text-[#10B981]" />
              <span>Guardar y Activar Perfil</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
