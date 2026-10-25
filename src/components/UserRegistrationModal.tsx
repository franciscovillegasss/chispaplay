import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  User, 
  Mail, 
  Phone, 
  ArrowRight, 
  Sparkles,
  Ticket
} from 'lucide-react';
import { registerTrackedUser, getVisitorVirtualIp, TrackedUser } from '../utils/userTracker';

interface UserRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: TrackedUser) => void;
  targetActivityTitle?: string;
  communeName?: string;
}

export function UserRegistrationModal({
  isOpen,
  onClose,
  onSuccess,
  targetActivityTitle,
  communeName = 'Maipú'
}: UserRegistrationModalProps) {
  const [name, setName] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const virtualIp = getVisitorVirtualIp();

  if (!isOpen) return null;

  const handleAutocompleteDemo = () => {
    setName('Camila Valenzuela P.');
    setEmailOrPhone('camila.valenzuela@gmail.com');
    setErrorMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Por favor ingresa tu nombre y apellido.');
      return;
    }
    if (!emailOrPhone.trim()) {
      setErrorMessage('Ingresa un correo electrónico o teléfono de WhatsApp.');
      return;
    }

    const newUser = registerTrackedUser(name.trim(), emailOrPhone.trim(), communeName);
    onSuccess(newUser);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/80 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white max-w-md w-full border-2 border-neutral-900 shadow-2xl overflow-hidden flex flex-col rounded-none animate-in zoom-in-95 duration-200">
        
        {/* Header Time Out London Style */}
        <div className="bg-neutral-950 text-white p-4 sm:p-5 flex items-center justify-between border-b-2 border-neutral-900">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#E11D48] text-white flex items-center justify-center font-bold text-sm shrink-0">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#E11D48] block">
                Pase Vecinal · Inscripción Rápida
              </span>
              <h3 className="font-black text-base sm:text-lg text-white uppercase tracking-tight leading-none mt-0.5">
                Guardar mi lugar
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

        {/* Target Activity Banner if invoked from a card */}
        {targetActivityTitle && (
          <div className="bg-neutral-100 border-b border-neutral-200 px-4 py-2.5 text-xs">
            <span className="text-neutral-500 font-sans text-[10px] uppercase block font-bold">
              Taller Seleccionado:
            </span>
            <span className="font-extrabold text-neutral-900 line-clamp-1 mt-0.5">
              {targetActivityTitle}
            </span>
          </div>
        )}

        {/* Demo Helper Banner */}
        <div className="bg-neutral-50 border-b border-neutral-200 px-4 py-2 flex items-center justify-between gap-2 text-xs">
          <span className="text-neutral-500 font-sans text-[10px]">
            Demostración rápida:
          </span>
          <button
            type="button"
            onClick={handleAutocompleteDemo}
            className="px-2 py-0.5 bg-white hover:bg-neutral-200 border border-neutral-300 font-sans text-[10px] font-bold uppercase cursor-pointer flex items-center gap-1 text-neutral-800"
          >
            <Sparkles className="w-2.5 h-2.5 text-[#E11D48]" />
            <span>Completar datos de prueba</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs text-neutral-800">
          
          <p className="text-neutral-600 text-xs leading-relaxed font-sans">
            Los talleres son 100% gratuitos y comunitarios. Ingresa tus datos para guardar tu cupo y recordarte la fecha:
          </p>

          {errorMessage && (
            <div className="p-2.5 bg-red-50 border border-red-300 text-red-700 font-semibold text-xs">
              {errorMessage}
            </div>
          )}

          {/* Nombre y Apellido */}
          <div>
            <label className="font-extrabold text-neutral-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 mb-1">
              <User className="w-3.5 h-3.5 text-neutral-500" />
              <span>Nombre y Apellido *</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Camila Valenzuela P."
              className="w-full py-2.5 px-3 bg-white border border-neutral-300 focus:border-neutral-900 focus:outline-none text-xs font-sans text-neutral-900 rounded-none"
            />
          </div>

          {/* Correo y/o Teléfono */}
          <div>
            <label className="font-extrabold text-neutral-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 mb-1">
              <Mail className="w-3.5 h-3.5 text-neutral-500" />
              <span>Correo Electrónico o WhatsApp *</span>
            </label>
            <input
              type="text"
              required
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              placeholder="ejemplo@correo.cl o +56 9 1234 5678"
              className="w-full py-2.5 px-3 bg-white border border-neutral-300 focus:border-neutral-900 focus:outline-none text-xs font-sans text-neutral-900 rounded-none"
            />
            <span className="text-[10px] text-neutral-500 font-sans mt-0.5 block">
              Te avisaremos cualquier cambio de horario por esta vía.
            </span>
          </div>

          {/* Resumen Vecinal */}
          <div className="bg-neutral-100 p-2.5 border border-neutral-200 text-[11px] font-sans text-neutral-600 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#059669]" />
              <span>Pase comunitario para:</span>
            </div>
            <span className="font-bold text-neutral-900">{communeName}</span>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-neutral-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300 text-xs font-extrabold uppercase tracking-wider cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="py-2.5 px-5 bg-[#059669] hover:bg-emerald-700 text-white border border-[#059669] text-xs font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <span>Guardar mi cupo →</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
