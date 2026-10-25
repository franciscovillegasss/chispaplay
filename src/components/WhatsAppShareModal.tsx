import { useState } from 'react';
import { Workshop, IncidentReport } from '../types';
import { MessageCircle, Copy, Check, ExternalLink, X, ShieldAlert, Users, Send } from 'lucide-react';

interface WhatsAppShareModalProps {
  workshop?: Workshop | null;
  incident?: IncidentReport | null;
  isOpen: boolean;
  onClose: () => void;
  onShareCompleted?: () => void;
}

export function WhatsAppShareModal({
  workshop,
  incident,
  isOpen,
  onClose,
  onShareCompleted
}: WhatsAppShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [shareType, setShareType] = useState<'pasaje' | 'monitor' | 'seguridad'>('pasaje');

  if (!isOpen) return null;

  let messageText = '';
  let directWhatsappNumber = '';

  if (workshop) {
    directWhatsappNumber = workshop.instructorWhatsapp || workshop.organizer.whatsapp;
    if (shareType === 'pasaje') {
      messageText = `📢 *TALLER FAMILIAR EN NUESTRO BARRIO - CHISPAPLAY*\n\n` +
        `¡Hola vecinas y vecinos! Les comparto esta linda actividad para niñas, niños y familias:\n\n` +
        `🎨 *${workshop.title}*\n` +
        `👶 *Público:* ${workshop.ageGroup}\n` +
        `🏛️ *Organiza:* ${workshop.organizer.name} (${workshop.organizer.legalEntityNumber})\n` +
        `📅 *Fecha:* ${workshop.nextDate} (${workshop.timeSlot})\n` +
        `📍 *Lugar:* ${workshop.locationName} (${workshop.address})\n` +
        `🎟️ *Cupos libres:* ${workshop.capacity - workshop.enrolledUsers.length} familias\n` +
        `🚶‍♀️ *Cuidado y Ruta:* ${workshop.safetyAdvisory}\n\n` +
        `🔗 Inscribe a tu familia en ChispaPlay:\n` +
        `https://chispaplay.cl/taller/${workshop.id}`;
    } else if (shareType === 'monitor') {
      messageText = `¡Hola ${workshop.instructorName}! 👋 Les escribo desde ChispaPlay por el taller familiar *${workshop.title}*. Queremos ir con mis hijos este ${workshop.nextDate} y consultar si quedan cupos disponibles en la sede. ¡Muchas gracias!`;
    } else {
      messageText = `🚶‍♀️ *CARAVANA FAMILIAR DE REGRESO - CHISPAPLAY*\n\n` +
        `Familias que asistan al *${workshop.title}*:\n` +
        `Nos reunimos al terminar en el portón de ${workshop.locationName} para volver caminando juntos y acompañados por la vereda protegida.\n` +
        `¡Barrio activo, plaza segura!`;
    }
  } else if (incident) {
    directWhatsappNumber = '';
    messageText = `🛡️ *REPORTE DE BARRIO CHISPAPLAY - ${incident.category}*\n\n` +
      `Vecinas y vecinos del sector, comparto reporte para la seguridad de niños y familias:\n` +
      `📍 *Ubicación:* ${incident.location}\n` +
      `🕒 *Hora:* ${incident.timestamp}\n` +
      `⚠️ *Detalle:* ${incident.title}. ${incident.description}\n` +
      `🚨 *Prioridad:* ${incident.urgency.toUpperCase()}\n\n` +
      `Apoya este reporte en ChispaPlay para coordinar arreglo vecinal: https://chispaplay.cl/reporte/${incident.id}`;
  }

  const encodedUrl = `https://wa.me/${directWhatsappNumber}?text=${encodeURIComponent(messageText)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    if (onShareCompleted) onShareCompleted();
  };

  const handleOpenWhatsApp = () => {
    window.open(encodedUrl, '_blank', 'noopener,noreferrer');
    if (onShareCompleted) onShareCompleted();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#fffdfa] rounded-3xl max-w-lg w-full border-2 border-amber-300 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-emerald-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl">
              💬
            </div>
            <div>
              <h3 className="font-fun font-bold text-lg text-white">
                Compartir en WhatsApp Vecinal
              </h3>
              <p className="text-xs text-emerald-100 font-medium">
                Difusión al grupo del pasaje, familias y monitor
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {workshop && (
            <div className="flex items-center gap-1.5 p-1 bg-amber-100/60 rounded-2xl text-xs font-bold">
              <button
                onClick={() => setShareType('pasaje')}
                className={`flex-1 py-2 px-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  shareType === 'pasaje'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-orange-600" />
                <span>Grupo Familias / JJVV</span>
              </button>
              <button
                onClick={() => setShareType('monitor')}
                className={`flex-1 py-2 px-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  shareType === 'monitor'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Send className="w-3.5 h-3.5 text-orange-600" />
                <span>Hablar con Monitor</span>
              </button>
              <button
                onClick={() => setShareType('seguridad')}
                className={`flex-1 py-2 px-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  shareType === 'seguridad'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5 text-orange-600" />
                <span>Caravana de Regreso</span>
              </button>
            </div>
          )}

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5 block">
              Mensaje listo para enviar:
            </label>
            <div className="bg-white border-2 border-amber-200 rounded-2xl p-4 font-mono text-xs text-stone-800 whitespace-pre-wrap max-h-56 overflow-y-auto leading-relaxed select-all">
              {messageText}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-amber-50/70 border-t border-amber-200 flex items-center justify-between gap-3">
          <button
            onClick={handleCopy}
            className="flex-1 py-2.5 px-4 rounded-2xl border border-stone-300 text-stone-700 font-bold text-xs hover:bg-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-stone-600" />
                <span>Copiar Texto</span>
              </>
            )}
          </button>

          <button
            onClick={handleOpenWhatsApp}
            className="flex-1 py-2.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Abrir WhatsApp</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </button>
        </div>
      </div>
    </div>
  );
}
