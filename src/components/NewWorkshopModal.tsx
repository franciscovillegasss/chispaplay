import { useState } from 'react';
import { NeighborhoodId, Workshop, WorkshopCategory, VigenciaStatus, ActiveCommune, CoordinatorProfile } from '../types';
import { 
  X, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  Clock, 
  MapPin, 
  Tag, 
  Calendar,
  Image as ImageIcon
} from 'lucide-react';

interface NewWorkshopModalProps {
  neighborhoodId: NeighborhoodId;
  isOpen: boolean;
  onClose: () => void;
  onCreateWorkshop: (newWorkshop: Workshop, timeframe: 'hoy' | 'semana' | 'mes') => void;
  communeName?: string;
  coordinatorProfile?: CoordinatorProfile;
}

const REAL_PLACES_BY_COMMUNE: Record<ActiveCommune, { name: string; address: string; coords: { lat: number; lng: number } }[]> = {
  maipu: [
    { name: 'Parque Tres Poniente', address: 'Av. Tres Poniente con Nueva San Martín', coords: { lat: -33.5220, lng: -70.7710 } },
    { name: 'Cerro Primo de Rivera', address: 'Av. Pajaritos con Anker Keim', coords: { lat: -33.5042, lng: -70.7515 } },
    { name: 'Explanada Templo Votivo', address: 'Carmen #1750, Maipú', coords: { lat: -33.5135, lng: -70.7620 } },
    { name: 'Plaza Mayor de Maipú', address: 'Av. 5 de Abril con Av. Pajaritos', coords: { lat: -33.5112, lng: -70.7578 } },
    { name: 'Parque Municipal de Maipú', address: 'Av. 5 de Abril #0700', coords: { lat: -33.5180, lng: -70.7780 } },
    { name: 'Sede JJVV Barrio Longitudinal', address: 'Calle Las Torres con Longitudinal', coords: { lat: -33.4980, lng: -70.7420 } },
    { name: 'Parque El Rosal', address: 'Av. El Rosal con La Farfana', coords: { lat: -33.4920, lng: -70.7490 } },
    { name: 'Plaza Ciudad Satélite', address: 'Av. Parque Central Oriente s/n', coords: { lat: -33.5420, lng: -70.7920 } },
    { name: 'Pueblito La Farfana', address: 'Camino a La Farfana #540', coords: { lat: -33.4790, lng: -70.7650 } },
    { name: 'Anfiteatro CAM', address: 'Alberto Llona #1899 (Junto a Plaza Mayor)', coords: { lat: -33.5105, lng: -70.7592 } }
  ],
  valparaiso: [
    { name: 'Parque Cultural de Valparaíso (Ex Cárcel)', address: 'Calle Cárcel #471, Cerro Cárcel', coords: { lat: -33.0448, lng: -71.6265 } },
    { name: 'Paseo Yugoslavo (Cerro Alegre)', address: 'Paseo Yugoslavo s/n (Palacio Baburizza)', coords: { lat: -33.0405, lng: -71.6285 } },
    { name: 'Plaza Bismarck', address: 'Av. Alemania con Cumming', coords: { lat: -33.0490, lng: -71.6290 } },
    { name: 'Mirador Cerro Barón', address: 'Diego Portales con E. O’Brien', coords: { lat: -33.0390, lng: -71.5990 } },
    { name: 'Plaza Victoria', address: 'Av. Pedro Montt con Edwards', coords: { lat: -33.0470, lng: -71.6190 } },
    { name: 'Parque Quebrada Verde', address: 'Camino a Laguna Verde s/n', coords: { lat: -33.0850, lng: -71.6620 } },
    { name: 'Auditorio Cerro Polanco', address: 'Calle El Maule con Simpson', coords: { lat: -33.0490, lng: -71.6080 } },
    { name: 'Plaza Waddington (Playa Ancha)', address: 'Av. Gran Bretaña con Waddington', coords: { lat: -33.0310, lng: -71.6420 } },
    { name: 'Muelle Barón', address: 'Av. Errázuriz con Muelle Barón', coords: { lat: -33.0410, lng: -71.6080 } },
    { name: 'Sede Vecinal Cerro Cordillera', address: 'Castillo #340, Cerro Cordillera', coords: { lat: -33.0460, lng: -71.6310 } }
  ]
};

const PHOTO_PRESETS = [
  { label: 'Arte & Creatividad', url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=900&auto=format&fit=crop&q=80' },
  { label: 'Deporte & Skate', url: 'https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?w=900&auto=format&fit=crop&q=80' },
  { label: 'Ciencia & Astronomía', url: 'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?w=900&auto=format&fit=crop&q=80' },
  { label: 'Huerto & Naturaleza', url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=900&auto=format&fit=crop&q=80' },
  { label: 'Circo & Teatro', url: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=900&auto=format&fit=crop&q=80' },
  { label: 'Música & Danza', url: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=900&auto=format&fit=crop&q=80' }
];

export function NewWorkshopModal({
  neighborhoodId,
  isOpen,
  onClose,
  onCreateWorkshop,
  communeName = 'Maipú',
  coordinatorProfile
}: NewWorkshopModalProps) {
  const activeCommuneKey: ActiveCommune = neighborhoodId === 'valparaiso' ? 'valparaiso' : 'maipu';
  const realPlaces = REAL_PLACES_BY_COMMUNE[activeCommuneKey] || REAL_PLACES_BY_COMMUNE.maipu;

  // Form Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<WorkshopCategory>('Arte & Creatividad');
  const [timeframe, setTimeframe] = useState<'hoy' | 'semana' | 'mes'>('hoy');
  const [selectedPlaceIndex, setSelectedPlaceIndex] = useState<number>(0);
  const [customLocationName, setCustomLocationName] = useState('');
  const [schedule, setSchedule] = useState('Hoy · 17:00 a 18:30 hrs');
  const [capacity, setCapacity] = useState(25);
  const [ageGroup, setAgeGroup] = useState('Para toda la familia (todas las edades)');
  const [photoUrl, setPhotoUrl] = useState(PHOTO_PRESETS[0].url);

  // Inclusivity Seals
  const [neuroFriendly, setNeuroFriendly] = useState(true);
  const [wheelchairAccess, setWheelchairAccess] = useState(true);

  if (!isOpen) return null;

  // Autocomplete quick sample for live demonstrations
  const handleAutocompleteDemo = () => {
    if (activeCommuneKey === 'maipu') {
      setTitle('Taller Comunitario de Mosaicos & Robótica Escolar');
      setCategory('Arte & Creatividad');
      setTimeframe('hoy');
      setSelectedPlaceIndex(0); // Parque Tres Poniente
      setCustomLocationName('');
      setSchedule('Hoy · 17:00 a 18:30 hrs');
      setCapacity(30);
      setAgeGroup('Niñez, jóvenes y personas mayores (5 a 70 años)');
      setPhotoUrl('https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=900&auto=format&fit=crop&q=80');
      setNeuroFriendly(true);
      setWheelchairAccess(true);
    } else {
      setTitle('Escuela Abierta de Danza & Expresión Porteña');
      setCategory('Cultura & Música');
      setTimeframe('semana');
      setSelectedPlaceIndex(1); // Paseo Yugoslavo
      setCustomLocationName('');
      setSchedule('Sábado · 11:30 a 13:30 hrs');
      setCapacity(25);
      setAgeGroup('Para toda la familia y vecinos');
      setPhotoUrl('https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=900&auto=format&fit=crop&q=80');
      setNeuroFriendly(true);
      setWheelchairAccess(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const chosenPlace = realPlaces[selectedPlaceIndex] || realPlaces[0];
    const finalLocationName = customLocationName.trim() || chosenPlace.name;
    const finalAddress = chosenPlace.address;
    const coords = chosenPlace.coords;

    const orgName = coordinatorProfile?.organizationName || `JJVV ${communeName}`;
    const pjNumber = coordinatorProfile?.legalEntityNumber || 'PJ N° Oficial';
    const monitorName = coordinatorProfile?.managerName || 'Equipo de Monitores JJVV';
    const whatsappNum = coordinatorProfile?.whatsappPhone || '+56 9 8451 9201';

    const newWorkshop: Workshop = {
      id: `ws-coord-${Date.now()}`,
      title: title.trim(),
      category,
      neighborhoodId,
      ageGroup: ageGroup.trim() || 'Para toda la familia',
      organizer: {
        id: `org-coord-${Date.now()}`,
        name: orgName,
        type: 'JJVV',
        verified: true,
        legalEntityNumber: pjNumber,
        registrationBody: 'Municipalidad / Registro Civil',
        phone: whatsappNum,
        whatsapp: whatsappNum.replace(/\D/g, ''),
        email: 'coordinacion@chispaplay.cl',
        avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
        publisherIdentity: {
          fullName: `${monitorName} (Encargado)`,
          rutMasked: '16.482.***-*',
          isClaveUnicaVerified: true
        }
      },
      instructorName: monitorName,
      instructorRole: 'Monitor Comunitario Acreditado',
      instructorWhatsapp: whatsappNum.replace(/\D/g, ''),
      locationName: finalLocationName,
      address: finalAddress,
      schedule: schedule.trim() || 'Hoy · 17:00 hrs',
      nextDate: timeframe === 'hoy' ? 'Hoy' : timeframe === 'semana' ? 'Esta Semana' : 'Este Mes',
      timeSlot: schedule.split('·')[1]?.trim() || '17:00 - 18:30 hrs',
      duration: '1h 30m',
      capacity: Number(capacity) || 25,
      enrolledUsers: [],
      description: `Actividad vecinal abierta organizada por ${orgName}. Participación 100% gratuita para fortalecer la vida de barrio.`,
      materialsProvided: true,
      isFree: true,
      safetyAdvisory: 'Espacio público con monitores acreditados, punto de hidratación y botiquín de primeros auxilios.',
      safeRouteGuide: 'Ruta peatonal iluminada con conexión expedita a paraderos y transporte público.',
      activeCheckIn: true,
      checkInPin: '4120',
      imageUrl: photoUrl.trim() || PHOTO_PRESETS[0].url,
      tags: ['Actividad Comunitaria', communeName, 'JJVV', '100% Gratuito'],
      coordinates: coords,
      vigencia: timeframe === 'hoy' ? 'verde' : ('naranja' as VigenciaStatus),
      spaceType: 'hardware_plaza',
      spaceHardwareDesc: 'Espacio público recuperado para la comunidad',
      rating: 5.0,
      reviewsCount: 0,
      sourceType: 'organizador_verificado',
      verifiedLegalEntity: true,
      policePartnerDisclaimer: true,
      interestedCount: 15,
      goingCount: 0,
      distanceMeters: 380,
      inclusivity: {
        isInclusive: true,
        neurodivergentFriendly: neuroFriendly,
        wheelchairAccessible: wheelchairAccess,
        signLanguageAvailable: false,
        languages: ['Español'],
        familyRestrooms: true
      },
      directChat: {
        instructorName: monitorName,
        instructorPhone: whatsappNum,
        whatsappDirectNumber: whatsappNum.replace(/\D/g, ''),
        whatsappDirectLink: `https://wa.me/${whatsappNum.replace(/\D/g, '')}`,
        inAppChatAvailable: true
      }
    };

    onCreateWorkshop(newWorkshop, timeframe);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/80 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white max-w-2xl w-full border-2 border-neutral-900 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] rounded-none">
        
        {/* Header Time Out London Dark Style */}
        <div className="bg-neutral-950 text-white p-4 sm:p-5 flex items-center justify-between border-b-2 border-neutral-900">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#E11D48] text-white flex items-center justify-center font-bold text-sm shrink-0">
              +
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#E11D48] block">
                Panel de Coordinador · Publicación en Vivo
              </span>
              <h3 className="font-black text-base sm:text-lg text-white uppercase tracking-tight leading-none mt-0.5">
                Publicar Nueva Actividad en {communeName}
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

        {/* Quick Autocomplete Helper Banner */}
        <div className="bg-neutral-100 border-b border-neutral-200 px-4 py-2 flex items-center justify-between gap-2 text-xs">
          <span className="text-neutral-600 font-mono text-[10px]">
            Demostración rápida de publicación:
          </span>
          <button
            type="button"
            onClick={handleAutocompleteDemo}
            className="px-2 py-0.5 bg-white hover:bg-neutral-200 border border-neutral-300 font-mono text-[10px] font-bold uppercase cursor-pointer flex items-center gap-1 text-neutral-800"
          >
            <Sparkles className="w-2.5 h-2.5 text-[#E11D48]" />
            <span>Autocompletar datos de prueba ({communeName})</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto text-xs text-neutral-800 flex-1">
          
          {/* 1. TÍTULO DE LA ACTIVIDAD */}
          <div>
            <label className="font-extrabold text-neutral-900 uppercase tracking-wider text-[11px] block mb-1">
              Título de la Actividad *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Clínica de Skate Infantil & Robótica Urbana"
              className="w-full py-2.5 px-3 bg-white border border-neutral-300 focus:border-neutral-900 focus:outline-none text-xs font-mono text-neutral-900 rounded-none font-bold"
            />
          </div>

          {/* 2. CATEGORÍA & TEMPORALIDAD */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-extrabold text-neutral-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 mb-1">
                <Tag className="w-3.5 h-3.5 text-neutral-500" />
                <span>Categoría *</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as WorkshopCategory)}
                className="w-full py-2.5 px-3 bg-white border border-neutral-300 focus:border-neutral-900 focus:outline-none text-xs font-mono text-neutral-900 rounded-none cursor-pointer"
              >
                <option value="Arte & Creatividad">Arte & Creatividad</option>
                <option value="Deporte & Juegos Tradicionales">Deporte & Juegos Tradicionales</option>
                <option value="Ciencia & Mini-Robótica">Ciencia & Mini-Robótica</option>
                <option value="Huertito & Naturaleza">Huertito & Naturaleza</option>
                <option value="Teatro, Circo & Cuentos">Teatro, Circo & Cuentos</option>
                <option value="Cultura & Música">Cultura & Música</option>
                <option value="Infancia & Juegos">Infancia & Juegos</option>
                <option value="Cocina Familiar">Cocina Familiar</option>
              </select>
            </div>

            {/* Temporalidad: Hoy / Esta Semana / Este Mes */}
            <div>
              <label className="font-extrabold text-neutral-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-[#E11D48]" />
                <span>Temporalidad *</span>
              </label>
              <div className="grid grid-cols-3 gap-1">
                {(['hoy', 'semana', 'mes'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTimeframe(t)}
                    className={`py-2 text-[11px] font-black uppercase transition-colors cursor-pointer border rounded-none text-center ${
                      timeframe === t
                        ? 'bg-neutral-950 text-white border-neutral-950 shadow-xs'
                        : 'bg-white hover:bg-neutral-100 text-neutral-700 border-neutral-300'
                    }`}
                  >
                    {t === 'hoy' ? 'Hoy' : t === 'semana' ? 'Esta Semana' : 'Este Mes'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. LUGAR / PLAZA REAL DE LA COMUNA */}
          <div>
            <label className="font-extrabold text-neutral-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 mb-1">
              <MapPin className="w-3.5 h-3.5 text-[#E11D48]" />
              <span>Lugar / Plaza Real de {communeName} *</span>
            </label>
            <select
              value={selectedPlaceIndex}
              onChange={(e) => setSelectedPlaceIndex(Number(e.target.value))}
              className="w-full py-2.5 px-3 bg-white border border-neutral-300 focus:border-neutral-900 focus:outline-none text-xs font-mono text-neutral-900 rounded-none cursor-pointer"
            >
              {realPlaces.map((place, idx) => (
                <option key={place.name} value={idx}>
                  {place.name} ({place.address})
                </option>
              ))}
            </select>
          </div>

          {/* 4. HORARIO, CUPOS & EDAD */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-extrabold text-neutral-900 uppercase tracking-wider text-[11px] flex items-center gap-1 mb-1">
                <Clock className="w-3 h-3 text-neutral-500" />
                <span>Horario *</span>
              </label>
              <input
                type="text"
                required
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                placeholder="Hoy · 17:00 a 18:30"
                className="w-full py-2 px-2.5 bg-white border border-neutral-300 focus:border-neutral-900 focus:outline-none text-xs font-mono text-neutral-900 rounded-none"
              />
            </div>

            <div>
              <label className="font-extrabold text-neutral-900 uppercase tracking-wider text-[11px] block mb-1">
                Cupos Totales *
              </label>
              <input
                type="number"
                min={5}
                max={200}
                required
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full py-2 px-2.5 bg-white border border-neutral-300 focus:border-neutral-900 focus:outline-none text-xs font-mono text-neutral-900 rounded-none"
              />
            </div>

            <div>
              <label className="font-extrabold text-neutral-900 uppercase tracking-wider text-[11px] block mb-1">
                Rango de Edad
              </label>
              <input
                type="text"
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
                placeholder="Toda la familia (4 a 70 años)"
                className="w-full py-2 px-2.5 bg-white border border-neutral-300 focus:border-neutral-900 focus:outline-none text-xs font-mono text-neutral-900 rounded-none"
              />
            </div>
          </div>

          {/* 5. SELECTOR DE FOTOS PREDEFINIDAS SEGURAS O URL */}
          <div>
            <label className="font-extrabold text-neutral-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 mb-1">
              <ImageIcon className="w-3.5 h-3.5 text-neutral-500" />
              <span>Fotografía de la Actividad (Selecciona una foto segura o ingresa URL)</span>
            </label>

            {/* Quick Chips */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-2">
              {PHOTO_PRESETS.map((p) => {
                const isSelected = photoUrl === p.url;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setPhotoUrl(p.url)}
                    className={`relative aspect-[4/3] border overflow-hidden cursor-pointer group ${
                      isSelected ? 'border-2 border-[#E11D48] ring-1 ring-[#E11D48]' : 'border-neutral-300 hover:border-neutral-600'
                    }`}
                  >
                    <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                    <span className="absolute inset-x-0 bottom-0 bg-neutral-950/80 text-[8px] font-mono text-white px-1 py-0.5 truncate text-center block">
                      {p.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <input
              type="url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full py-2 px-2.5 bg-white border border-neutral-300 focus:border-neutral-900 focus:outline-none text-xs font-mono text-neutral-900 rounded-none"
            />
          </div>

          {/* 6. SELLOS DE INCLUSIÓN */}
          <div className="bg-neutral-50 p-3.5 border border-neutral-200 space-y-2">
            <span className="font-black text-neutral-900 uppercase tracking-wider text-[11px] block">
              Sellos de Inclusión Comunal
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={neuroFriendly}
                  onChange={(e) => setNeuroFriendly(e.target.checked)}
                  className="w-4 h-4 text-[#059669] rounded-none border-neutral-300 focus:ring-0"
                />
                <span className="font-bold text-neutral-800 text-xs">
                  Sello Neuro-Friendly (Baja sobrecarga sensorial)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={wheelchairAccess}
                  onChange={(e) => setWheelchairAccess(e.target.checked)}
                  className="w-4 h-4 text-[#059669] rounded-none border-neutral-300 focus:ring-0"
                />
                <span className="font-bold text-neutral-800 text-xs">
                  Acceso Universal (Sillas de ruedas / Rampas)
                </span>
              </label>
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
              className="py-2.5 px-6 bg-[#E11D48] hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>Publicar Actividad en Vivo</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
