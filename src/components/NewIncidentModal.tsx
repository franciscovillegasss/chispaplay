import { useState, useEffect } from 'react';
import { IncidentReport, NeighborhoodId } from '../types';
import { MOCK_NEIGHBOR_GUARDIANS } from '../data/mockData';
import { X, Send, BellRing, Flame, Shield, CheckCircle2, VolumeX, Users } from 'lucide-react';

interface NewIncidentModalProps {
  neighborhoodId: NeighborhoodId;
  targetWorkshop?: { id: string; title: string } | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitIncident: (newIncident: Omit<IncidentReport, 'id' | 'timestamp' | 'upvotes' | 'commentsCount' | 'solved'>) => void;
}

export function NewIncidentModal({
  neighborhoodId,
  targetWorkshop,
  isOpen,
  onClose,
  onSubmitIncident
}: NewIncidentModalProps) {
  const [categoryType, setCategoryType] = useState<string>('Juegos Infantiles & Plaza');
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [urgency, setUrgency] = useState<'alta' | 'media' | 'preventiva'>('media');
  const [selectedIcon, setSelectedIcon] = useState<'juegos' | 'luz' | 'calle' | 'seguridad' | 'mascota' | 'custom'>('juegos');
  const [sendSilentPush, setSendSilentPush] = useState(true);

  // Top nearby neighbors with highest streaks
  const nearbyGuardians = MOCK_NEIGHBOR_GUARDIANS
    .filter(g => g.neighborhoodId === neighborhoodId)
    .sort((a, b) => b.streakWeeks - a.streakWeeks);

  // Pre-fill location if target workshop is provided
  useEffect(() => {
    if (targetWorkshop) {
      setTitle(`Alerta en entorno de: ${targetWorkshop.title}`);
    } else {
      setTitle('');
    }
  }, [targetWorkshop]);

  if (!isOpen) return null;

  const quickCategories = [
    { label: '🎠 Juegos & Plaza de la Sede', icon: 'juegos' as const, desc: 'Juegos rotos, astillas o perno suelto' },
    { label: '💡 Iluminación de Salida', icon: 'luz' as const, desc: 'Foco apagado al salir de la actividad' },
    { label: '🚸 Cruce Peatonal de Niños', icon: 'calle' as const, desc: 'Paso de cebra o velocidad de vehículos' },
    { label: '🛡️ Seguridad del Evento', icon: 'seguridad' as const, desc: 'Portón, cerradura o resguardo vecinal' },
    { label: '🐾 Mascotas del Entorno', icon: 'mascota' as const, desc: 'Animalitos perdidos o hidratación' },
    { label: '✨ Personalizado', icon: 'custom' as const, desc: 'Escribe tu propio reporte de seguridad' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !location.trim()) return;

    const finalCategory = isCustomMode && customCategoryInput.trim() 
      ? customCategoryInput.trim() 
      : categoryType;

    const randomX = Math.floor(Math.random() * 50) + 25;
    const randomY = Math.floor(Math.random() * 50) + 25;

    onSubmitIncident({
      neighborhoodId,
      workshopId: targetWorkshop?.id,
      workshopTitle: targetWorkshop?.title,
      category: finalCategory,
      isCustomCategory: isCustomMode,
      title: title.trim(),
      description: description.trim() || 'Reporte de seguridad vinculado a la actividad comunitaria.',
      location: location.trim(),
      reporterName: 'Familia Vecina',
      urgency,
      iconType: selectedIcon,
      mapCoord: { x: randomX, y: randomY },
      silentPushSent: sendSilentPush,
      notifiedGuardiansCount: sendSilentPush ? nearbyGuardians.length : 0,
      notifiedGuardians: sendSilentPush ? nearbyGuardians.map(g => ({
        name: g.name,
        streakWeeks: g.streakWeeks,
        sector: g.sector
      })) : []
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#fffdfa] rounded-3xl max-w-lg w-full border-2 border-amber-300 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl">
              🛡️
            </div>
            <div>
              <h3 className="font-fun font-bold text-lg text-white">
                {targetWorkshop ? 'Reporte de Seguridad del Evento' : 'Reporte de Seguridad Barrial'}
              </h3>
              <p className="text-xs text-amber-100 font-medium">
                {targetWorkshop ? targetWorkshop.title : 'Cuidado del entorno de las sedes comunitarias'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[80vh]">
          {/* Target workshop confirmation banner */}
          {targetWorkshop && (
            <div className="p-3 bg-amber-100/70 border border-amber-300 rounded-2xl text-xs flex items-center gap-2 text-amber-950 font-medium">
              <span>🎯</span>
              <span>Este reporte quedará visible en la ficha de: <strong>{targetWorkshop.title}</strong></span>
            </div>
          )}

          {/* Category selection */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-2 block">
              1. Tipo de Alerta o Reporte
            </label>
            <div className="grid grid-cols-2 gap-2">
              {quickCategories.map((cat, idx) => {
                const isSelected = (!isCustomMode && categoryType === cat.label) || (isCustomMode && cat.icon === 'custom');
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (cat.icon === 'custom') {
                        setIsCustomMode(true);
                        setSelectedIcon('custom');
                      } else {
                        setIsCustomMode(false);
                        setCategoryType(cat.label);
                        setSelectedIcon(cat.icon);
                      }
                    }}
                    className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-100/80 border-orange-500 text-stone-900 font-bold shadow-2xs'
                        : 'bg-white border-stone-200 text-stone-600 hover:bg-amber-50/50'
                    }`}
                  >
                    <div className="text-xs font-bold leading-tight">{cat.label}</div>
                    <div className="text-[10px] text-stone-500 line-clamp-1 mt-0.5">{cat.desc}</div>
                  </button>
                );
              })}
            </div>

            {isCustomMode && (
              <div className="mt-2.5">
                <input
                  type="text"
                  required
                  value={customCategoryInput}
                  onChange={(e) => setCustomCategoryInput(e.target.value)}
                  placeholder="Escribe tu categoría personalizada (Ej: Chapa trabada, Vereda trizada)"
                  className="w-full text-xs py-2 px-3 bg-amber-50 border-2 border-orange-400 rounded-xl focus:outline-none font-medium"
                />
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-1 block">
              2. ¿Qué ocurre? (Título)
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Foco parpadeante en el pasaje de acceso"
              className="w-full text-xs py-2.5 px-3 bg-white border border-stone-300 rounded-xl focus:border-orange-500 focus:outline-none"
            />
          </div>

          {/* Location */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-1 block">
              3. Lugar o Punto exacto
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ej: Portón de acceso por calle Fontt"
              className="w-full text-xs py-2.5 px-3 bg-white border border-stone-300 rounded-xl focus:border-orange-500 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-1 block">
              4. Detalle y Precaución para los Asistentes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explica qué tener en cuenta al llegar o salir del evento."
              className="w-full text-xs py-2.5 px-3 bg-white border border-stone-300 rounded-xl focus:border-orange-500 focus:outline-none resize-none"
            />
          </div>

          {/* Urgency */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-1 block">
              5. Prioridad
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setUrgency('alta')}
                className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  urgency === 'alta'
                    ? 'bg-rose-100 border-rose-500 text-rose-800'
                    : 'bg-white border-stone-200 text-stone-600'
                }`}
              >
                🔴 Urgente
              </button>
              <button
                type="button"
                onClick={() => setUrgency('media')}
                className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  urgency === 'media'
                    ? 'bg-amber-100 border-amber-500 text-amber-800'
                    : 'bg-white border-stone-200 text-stone-600'
                }`}
              >
                🟡 Atención
              </button>
              <button
                type="button"
                onClick={() => setUrgency('preventiva')}
                className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  urgency === 'preventiva'
                    ? 'bg-emerald-100 border-emerald-500 text-emerald-800'
                    : 'bg-white border-stone-200 text-stone-600'
                }`}
              >
                🟢 Preventiva
              </button>
            </div>
          </div>

          {/* SILENT PUSH NOTIFICATION TO HIGHEST STREAK NEIGHBORS */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50/60 p-3.5 rounded-2xl border-2 border-amber-300 space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <VolumeX className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-fun font-bold text-xs text-stone-900">
                      Notificación Push Silenciosa
                    </span>
                    <span className="bg-orange-200/80 text-orange-950 px-2 py-0.2 rounded-full text-[10px] font-bold inline-flex items-center gap-0.5">
                      <Flame className="w-3 h-3 text-orange-600 fill-orange-500" />
                      Mayor Racha de Asistencia
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 font-medium leading-tight mt-0.5">
                    Vincula la seguridad barrial a la participación constante: alerta sin pánico a los vecinos con mayor presencia física en el barrio.
                  </p>
                </div>
              </div>

              {/* Toggle switch */}
              <label className="flex items-center gap-1 cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={sendSilentPush}
                  onChange={(e) => setSendSilentPush(e.target.checked)}
                  className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4"
                />
                <span className="text-[11px] font-bold text-stone-700">Activo</span>
              </label>
            </div>

            {sendSilentPush && (
              <div className="pt-2 border-t border-amber-200/80 space-y-2">
                <div className="text-[11px] font-bold text-stone-700 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-orange-900">
                    <Users className="w-3.5 h-3.5 text-orange-600" />
                    Vecinos guardianes que recibirán la notificación silenciosa ({nearbyGuardians.length}):
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    ● En línea en el sector
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {nearbyGuardians.map((g) => (
                    <div 
                      key={g.id} 
                      className="bg-white p-2 rounded-xl border border-amber-200 flex items-center gap-2 shadow-2xs"
                    >
                      <img 
                        src={g.avatar} 
                        alt={g.name} 
                        className="w-8 h-8 rounded-full object-cover border border-amber-300 shrink-0" 
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-bold text-stone-900 truncate">
                          {g.name}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-stone-500">
                          <span className="text-orange-700 font-bold flex items-center gap-0.5">
                            🔥 {g.streakWeeks} sem
                          </span>
                          <span>·</span>
                          <span className="truncate">{g.distanceMeters}m</span>
                        </div>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Activo" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-xl border border-stone-300 text-stone-600 text-xs font-bold hover:bg-stone-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="py-2.5 px-5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Publicar Alerta del Evento</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
