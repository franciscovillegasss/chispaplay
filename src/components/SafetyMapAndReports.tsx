import { useState } from 'react';
import { IncidentReport, Neighborhood, Workshop } from '../types';
import { 
  Plus, 
  ThumbsUp, 
  Share2, 
  MapPin, 
  CheckCircle2, 
  Users, 
  Sparkles,
  Heart,
  AlertCircle
} from 'lucide-react';

interface SafetyMapAndReportsProps {
  neighborhood: Neighborhood;
  incidents: IncidentReport[];
  workshops: Workshop[];
  onUpvoteIncident: (incidentId: string) => void;
  onOpenNewIncidentModal: () => void;
  onOpenWhatsAppShare: (incident: IncidentReport) => void;
  onSelectWorkshop: (workshop: Workshop) => void;
}

export function SafetyMapAndReports({
  neighborhood,
  incidents,
  workshops,
  onUpvoteIncident,
  onOpenNewIncidentModal,
  onOpenWhatsAppShare,
  onSelectWorkshop
}: SafetyMapAndReportsProps) {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(incidents[0]?.id || null);

  // Extract all categories dynamically (including custom ones)
  const categoriesList = ['all', ...Array.from(new Set(incidents.map(i => i.category)))];

  const filteredIncidents = incidents.filter(inc => {
    if (activeFilter === 'all') return true;
    return inc.category === activeFilter;
  });

  const selectedIncident = incidents.find(i => i.id === selectedIncidentId);

  const getEmojiForCategory = (cat: string, iconType?: string) => {
    if (iconType === 'juegos' || cat.toLowerCase().includes('juego') || cat.toLowerCase().includes('plaza')) return '🎠';
    if (iconType === 'luz' || cat.toLowerCase().includes('ilumin') || cat.toLowerCase().includes('foco')) return '💡';
    if (iconType === 'calle' || cat.toLowerCase().includes('tránsito') || cat.toLowerCase().includes('cebra')) return '🚸';
    if (iconType === 'mascota' || cat.toLowerCase().includes('mascota') || cat.toLowerCase().includes('perr')) return '🐾';
    if (iconType === 'seguridad' || cat.toLowerCase().includes('caravana') || cat.toLowerCase().includes('proteg')) return '🛡️';
    return '✨';
  };

  return (
    <div className="space-y-6">
      {/* Proprietary Section Banner: ChispaSeguridad */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 sm:p-7 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-bold text-white">
              <span>🛡️ ChispaSeguridad</span>
              <span>·</span>
              <span>Red Propia de Cuidado Familiar</span>
            </div>
            <h2 className="font-fun font-bold text-2xl sm:text-3xl text-white">
              Reportes Personalizados del Entorno: {neighborhood.displayName}
            </h2>
            <p className="text-xs sm:text-sm text-amber-100 leading-relaxed font-medium">
              Espacio comunitario propio para advertir juegos de plaza sueltos, postes sin luz, pasos peatonales escolares y coordinar caravanas seguras de familias.
            </p>
          </div>

          <button
            onClick={onOpenNewIncidentModal}
            className="py-3 px-5 bg-white hover:bg-amber-50 text-orange-700 rounded-2xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 shrink-0 cursor-pointer transform hover:scale-102"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Crear Reporte Personalizado</span>
          </button>
        </div>
      </div>

      {/* Grid: Interactive Neighborhood Canvas + Incident Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* INTERACTIVE NEIGHBORHOOD MAP (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border-2 border-amber-200/90 shadow-2xs overflow-hidden flex flex-col">
          {/* Map Top Bar */}
          <div className="p-4 bg-amber-50 border-b border-amber-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-base">📍</span>
              <span className="font-fun font-bold text-sm text-amber-950">
                Plano Barrial de {neighborhood.name}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-semibold text-stone-600">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                Sedes Infantiles
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
                Reportes Activos
              </span>
            </div>
          </div>

          {/* Friendly Visual Map Canvas */}
          <div className="relative w-full aspect-[16/11] bg-[#fbf8f2] overflow-hidden select-none border-b border-amber-200">
            {/* Street Grid Illustration (Warm and friendly block layout) */}
            <svg className="absolute inset-0 w-full h-full opacity-70 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="street-grid-friendly" width="130" height="95" patternUnits="userSpaceOnUse">
                  <rect width="130" height="95" fill="#fcf9f2" />
                  <rect x="5" y="5" width="115" height="78" fill="#f5ede0" rx="10" stroke="#ebdcc7" strokeWidth="2" />
                  <circle cx="20" cy="20" r="4" fill="#a7f3d0" />
                  <circle cx="105" cy="65" r="5" fill="#fde68a" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#street-grid-friendly)" />
            </svg>

            {/* Safe family corridor line */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M 100,190 Q 220,150 320,230 T 470,180"
                fill="none"
                stroke="#f97316"
                strokeWidth="4"
                strokeDasharray="6,6"
              />
            </svg>

            {/* Map Corner labels */}
            <div className="absolute top-3 left-4 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-xl text-[10px] font-bold text-amber-900 shadow-2xs border border-amber-200">
              🏡 {neighborhood.communityCenterName}
            </div>

            <div className="absolute top-3 right-4 bg-orange-100 text-orange-950 font-bold px-2.5 py-1 rounded-xl text-[10px] shadow-2xs border border-orange-300 flex items-center gap-1">
              <span>🚶‍♀️ Ruta Familiar Protegida</span>
            </div>

            {/* WORKSHOP PINS */}
            {workshops.map((ws, idx) => {
              const xPos = [26, 50, 72][idx % 3];
              const yPos = [62, 36, 70][idx % 3];
              return (
                <div
                  key={ws.id}
                  style={{ left: `${xPos}%`, top: `${yPos}%` }}
                  onClick={() => onSelectWorkshop(ws)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
                >
                  <div className="relative flex items-center justify-center">
                    <span className="w-8 h-8 rounded-full bg-emerald-400/40 animate-ping absolute" />
                    <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md border-2 border-white group-hover:scale-110 transition-transform text-sm font-bold">
                      🎨
                    </div>
                  </div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-44 bg-stone-900 text-white p-2 rounded-xl text-[11px] shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-30">
                    <div className="font-bold text-amber-300 truncate">{ws.title}</div>
                    <div className="text-[10px] text-emerald-400 mt-0.5">Clic para ver taller familiar</div>
                  </div>
                </div>
              );
            })}

            {/* PROPRIETARY INCIDENT PINS */}
            {incidents.map((incident) => {
              const isSelected = selectedIncidentId === incident.id;
              const emoji = getEmojiForCategory(incident.category, incident.iconType);

              return (
                <div
                  key={incident.id}
                  style={{ left: `${incident.mapCoord.x}%`, top: `${incident.mapCoord.y}%` }}
                  onClick={() => setSelectedIncidentId(incident.id)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 group"
                >
                  <div className="relative flex items-center justify-center">
                    {incident.urgency === 'alta' && (
                      <span className="w-8 h-8 rounded-full bg-rose-400/50 animate-ping absolute" />
                    )}
                    <div
                      className={`w-8 h-8 rounded-2xl bg-white flex items-center justify-center shadow-md text-sm border-2 ${
                        isSelected 
                          ? 'border-orange-600 ring-4 ring-orange-200 scale-125' 
                          : 'border-amber-300'
                      } transition-all`}
                    >
                      {emoji}
                    </div>
                  </div>

                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-1.5 py-0.5 rounded-lg bg-stone-900/90 text-white text-[9px] font-bold whitespace-nowrap shadow pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                    {incident.category}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Incident Preview Card */}
          {selectedIncident && (
            <div className="p-4 bg-amber-50/70 border-t border-amber-200">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white border border-amber-300 flex items-center justify-center text-xl shrink-0 shadow-2xs">
                    {getEmojiForCategory(selectedIncident.category, selectedIncident.iconType)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-orange-800 bg-orange-100 px-2 py-0.5 rounded-full">
                        {selectedIncident.category}
                      </span>
                      <span className="text-stone-400 text-xs">·</span>
                      <span className="text-xs text-stone-500 font-medium">{selectedIncident.timestamp}</span>
                      {selectedIncident.solved && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                          ✓ Resuelto por vecinos
                        </span>
                      )}
                    </div>
                    <h4 className="font-fun font-bold text-base text-stone-900 mt-1">
                      {selectedIncident.title}
                    </h4>
                    <p className="text-xs text-stone-600 mt-0.5 leading-relaxed font-medium">
                      {selectedIncident.description}
                    </p>
                    <div className="text-[11px] text-stone-500 mt-1 flex items-center gap-1 font-semibold">
                      <MapPin className="w-3 h-3 text-orange-600" />
                      <span>{selectedIncident.location}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => onUpvoteIncident(selectedIncident.id)}
                    className={`py-1.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                      selectedIncident.hasUpvoted
                        ? 'bg-orange-100 border-orange-400 text-orange-900'
                        : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5 text-orange-600" />
                    <span>{selectedIncident.upvotes} vecinos</span>
                  </button>

                  <button
                    onClick={() => onOpenWhatsAppShare(selectedIncident)}
                    className="py-1.5 px-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* INCIDENT FEED & CUSTOM FILTERS (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {/* Custom Category Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1.5 bg-white rounded-2xl border border-amber-200 overflow-x-auto">
            {categoriesList.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setActiveFilter(cat)}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeFilter === cat
                    ? 'bg-amber-100 text-amber-950 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {cat === 'all' ? `Todos (${incidents.length})` : cat}
              </button>
            ))}
          </div>

          {/* List of Custom Reports */}
          <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
            {filteredIncidents.map((inc) => {
              const isSelected = selectedIncidentId === inc.id;
              const emoji = getEmojiForCategory(inc.category, inc.iconType);

              return (
                <div
                  key={inc.id}
                  onClick={() => setSelectedIncidentId(inc.id)}
                  className={`p-4 rounded-2xl border-2 transition-all text-left cursor-pointer ${
                    isSelected
                      ? 'bg-amber-50/80 border-orange-500 shadow-xs'
                      : 'bg-white border-stone-200 hover:border-amber-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{emoji}</span>
                      <span className="text-xs font-bold text-orange-900 bg-orange-50 px-2 py-0.5 rounded-md">
                        {inc.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-stone-500">
                      <span>{inc.timestamp}</span>
                      {inc.urgency === 'alta' && (
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500" title="Urgente" />
                      )}
                    </div>
                  </div>

                  <h4 className="font-fun font-bold text-sm text-stone-900 mt-2 leading-snug">
                    {inc.title}
                  </h4>

                  <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed font-medium">
                    {inc.description}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs">
                    <span className="text-stone-500 font-medium truncate max-w-[180px]">
                      📍 {inc.location}
                    </span>

                    <div className="flex items-center gap-2.5">
                      <span className="text-stone-600 font-bold flex items-center gap-1">
                        <ThumbsUp className="w-3.5 h-3.5 text-orange-600" />
                        {inc.upvotes}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenWhatsAppShare(inc);
                        }}
                        className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        Avisar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
