/* ==========================================================================
   ARCHIVO: js/activityPage.js
   Página Dedicada de Actividad · Diseño Editorial Time Out (65% Reportaje / 35% Sticky Ticket)
   Sustituye completamente los acordeones en toda la web
   ========================================================================== */

import { COMMUNES_DATA } from './data.js';
import {
  getAllActivities,
  calculateDistanceAndWalkingTime,
  isActivityReserved,
  toggleActivityReservation,
  isAttendanceValidated,
  validateGroundAttendance,
  validateGroundAttendanceWithGps,
  getAttendanceDetail,
  getLiveNotice,
  getReviewsForActivity,
  addNeighborhoodReview,
  isUserOnWaitlist,
  joinWaitlist,
  hasValidUserContact,
  getActiveCommune
} from './state.js';
import { getGoogleCalendarUrl, downloadIcsFile, getGoogleMapsDirectionsUrl } from './calendar.js';
import { renderActivityMap, destroyActivityMap } from './mapHelper.js';
import { openParkDefectModal } from './defectModal.js';
import { openUserModal } from './userModal.js';
import { showToast } from './toast.js';

let currentMountedMapId = null;

/**
 * Renderiza la vista de página dedicada completa para una actividad
 * @param {string} activityId - ID de la actividad a mostrar
 * @param {HTMLElement} containerEl - Contenedor donde se montará la vista
 * @param {Function} [onBackCallback] - Función para volver a la cartelera o ranking
 * @param {string} [backButtonLabel] - Texto del botón de volver ("← Volver a la cartelera")
 */
export function renderDedicatedActivityPage(activityId, containerEl, onBackCallback = null, backButtonLabel = '← Volver a la cartelera') {
  if (!containerEl) return;

  const all = getAllActivities();
  const activity = all.find(a => a.id === activityId);

  if (!activity) {
    containerEl.innerHTML = `
      <div class="max-w-4xl mx-auto py-16 px-4 text-center">
        <h2 class="text-2xl font-black uppercase text-neutral-900 mb-4">Actividad no encontrada</h2>
        <p class="text-sm text-neutral-600 mb-6">El taller solicitado no existe o fue reprogramado.</p>
        <button id="btn-back-fallback" class="bg-black hover:bg-[#E11D48] text-white px-6 py-3 font-black uppercase text-xs cursor-pointer">
          ${backButtonLabel}
        </button>
      </div>
    `;
    const btn = containerEl.querySelector('#btn-back-fallback');
    btn?.addEventListener('click', () => {
      if (onBackCallback) onBackCallback();
      else if (window.history.length > 1) window.history.back();
      else window.location.href = 'actividades.html';
    });
    return;
  }

  // Destruir mapa previo si existía
  if (currentMountedMapId) {
    destroyActivityMap(currentMountedMapId);
    currentMountedMapId = null;
  }

  const communeObj = COMMUNES_DATA[activity.commune] || COMMUNES_DATA[getActiveCommune()] || { name: 'Comuna' };
  const distInfo = calculateDistanceAndWalkingTime(activity.coordinates);
  const isReserved = isActivityReserved(activity.id);
  const isValidated = isAttendanceValidated(activity.id);
  const attendanceDetail = getAttendanceDetail(activity.id);
  const isWaitlisted = isUserOnWaitlist(activity.id);
  const liveNotice = getLiveNotice(activity.id);
  const reviews = getReviewsForActivity(activity.id);

  // Cálculo de cupos
  const isConfiguredSoldOut = activity.enrolledCount >= activity.capacity;
  const remainingSpots = isReserved
    ? Math.max(0, activity.capacity - activity.enrolledCount - 1)
    : Math.max(0, activity.capacity - activity.enrolledCount);
  const isSoldOut = isConfiguredSoldOut || (remainingSpots === 0 && !isReserved);
  const effectiveWaitlist = (activity.waitlistCount || 12) + (isWaitlisted ? 1 : 0);

  const mapContainerId = `dedicated-map-${activity.id}`;
  currentMountedMapId = mapContainerId;

  // Mensaje predeterminado de WhatsApp para el monitor
  const whatsappText = encodeURIComponent(`Hola ${activity.instructorName}, te escribo por el taller "${activity.title}" que vi en ChispaPlay.`);
  const cleanPhone = (activity.instructorWhatsapp || '+56978910002').replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${whatsappText}`;

  // URLs de calendario y mapa
  const googleCalUrl = getGoogleCalendarUrl(activity);
  const googleMapsUrl = getGoogleMapsDirectionsUrl(activity.coordinates, activity.locationName);

  containerEl.innerHTML = `
    <div class="dedicated-activity-view max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 animate-fade-soft font-sans">
      
      <!-- BARRA SUPERIOR DE RETORNO Y RUTA EDITORIAL -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-6 border-b-2 border-black">
        <button 
          id="btn-dedicated-back" 
          type="button" 
          class="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-black hover:text-[#E11D48] transition-colors cursor-pointer py-1"
        >
          <span class="text-base leading-none">←</span>
          <span>${backButtonLabel}</span>
        </button>

        <!-- Ruta Editorial -->
        <nav class="text-xs font-mono font-bold text-neutral-500 flex items-center gap-2 flex-wrap">
          <span class="text-black uppercase">${communeObj.name}</span>
          <span>/</span>
          <span class="text-neutral-700">${activity.categoryTag || activity.category}</span>
          <span>/</span>
          <span class="text-[#E11D48] truncate max-w-[200px] sm:max-w-xs">${activity.locationName}</span>
        </nav>
      </div>

      <!-- LAYOUT EDITORIAL DE 2 COLUMNAS (65% REPORTAJE / 35% STICKY TICKET) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        
        <!-- ====================================================================
             COLUMNA IZQUIERDA: EL REPORTAJE EDITORIAL (65% en Desktop)
             ==================================================================== -->
        <div class="lg:col-span-8 space-y-8">
          
          <!-- Encabezado Editorial -->
          <div>
            <div class="flex flex-wrap items-center gap-2.5 mb-2.5">
              <span class="bg-[#E11D48] text-white text-[11px] font-mono font-black uppercase tracking-wider px-2.5 py-0.5 shadow-[1px_1px_0px_0px_#111111]">
                ${activity.categoryTag || activity.category}
              </span>

              <!-- Badge Peatonal Coherente -->
              <span class="text-xs font-mono font-black px-2.5 py-0.5 border border-black ${
                distInfo.walkingMinutes <= 15
                  ? 'bg-emerald-100 text-[#059669]'
                  : 'bg-neutral-100 text-neutral-800'
              }">
                ${
                  distInfo.walkingMinutes <= 15
                    ? `✓ A ${distInfo.walkingMinutes} MIN CAMINANDO (${distInfo.distanceMeters}m)`
                    : `📍 A ${distInfo.walkingMinutes} MIN DE TU SECTOR (${distInfo.distanceMeters}m)`
                }
              </span>

              ${activity.isNeuroFriendly ? `
                <span class="text-[11px] font-mono font-bold bg-purple-100 text-purple-900 px-2 py-0.5 border border-purple-300">
                  🧠 Neuro-Friendly
                </span>
              ` : ''}
            </div>

            <!-- Titular Gigante Estilo Periódico -->
            <h1 class="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-neutral-900 leading-[1.08] mb-3">
              ${activity.title}
            </h1>

            <!-- Bajada y Coordenadas de Tiempo -->
            <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm font-mono text-neutral-700 font-bold">
              <span class="flex items-center gap-1.5 text-black">
                <span>📍</span> ${activity.locationName} (${activity.address || ''})
              </span>
              <span>·</span>
              <span class="text-[#E11D48] flex items-center gap-1.5">
                <span>🕒</span> ${activity.dateLabel}
              </span>
            </div>
          </div>

          <!-- Fotografía Principal Panorámica con Sello de Verificación -->
          <div class="relative w-full aspect-[16/9] bg-neutral-200 border-2 border-black overflow-hidden shadow-[5px_5px_0px_0px_#111111]">
            <img 
              src="${activity.imageUrl}" 
              alt="${activity.title}" 
              class="w-full h-full object-cover"
              loading="eager"
            />
            
            <!-- Sello de Verificación -->
            <div class="absolute bottom-3 left-3 bg-black/90 text-white border border-white/30 backdrop-blur-xs px-3 py-1.5 flex items-center gap-2 shadow-[2px_2px_0px_0px_#059669]">
              <span class="w-2.5 h-2.5 bg-[#059669] rounded-full inline-block animate-pulse"></span>
              <span class="text-[11px] font-mono font-black uppercase tracking-wider">
                ✓ Actividad Verificada por Municipio y JJVV
              </span>
            </div>

            <!-- Badge de Gratuidad -->
            <div class="absolute top-3 right-3 bg-[#E11D48] text-white font-mono font-black text-xs uppercase px-3 py-1 shadow-[2px_2px_0px_0px_#111111]">
              100% Gratuito
            </div>
          </div>

          <!-- EL VEREDICTO CHISPAPLAY (POR QUÉ IR) & DESCRIPCIÓN COMPLETA -->
          <div class="bg-neutral-50 border-2 border-black p-5 sm:p-6 shadow-[4px_4px_0px_0px_#111111] space-y-4">
            
            <div class="border-l-4 border-[#E11D48] pl-4 py-1">
              <div class="text-[11px] font-mono font-black uppercase tracking-wider text-[#E11D48] mb-1">
                EL VEREDICTO CHISPAPLAY (POR QUÉ IR)
              </div>
              <p class="font-serif italic text-base sm:text-lg text-neutral-900 leading-relaxed font-semibold">
                "${activity.editorialVerdict || activity.journalisticSubtitle || 'Una experiencia comunitaria enriquecedora y segura para disfrutar en el barrio.'}"
              </p>
            </div>

            <div class="text-sm sm:text-base text-neutral-800 font-medium leading-relaxed pt-2 border-t border-neutral-200">
              <p class="mb-3">${activity.summary}</p>
              ${activity.communityNotice ? `
                <div class="p-3 bg-amber-50 border-l-3 border-amber-500 text-xs sm:text-sm text-neutral-800 font-medium my-3">
                  <strong class="font-bold">Nota de Terreno:</strong> ${activity.communityNotice}
                </div>
              ` : ''}
            </div>

            <!-- Qué Llevar -->
            <div class="p-3.5 bg-white border border-neutral-300 flex items-start gap-3">
              <span class="text-xl">🎒</span>
              <div class="text-xs sm:text-sm text-neutral-800">
                <strong class="font-black uppercase tracking-wider font-mono text-[11px] block text-neutral-900 mb-0.5">
                  ¿Qué implementos llevar?
                </strong>
                ${activity.whatToBring || 'Ropa cómoda y botella de agua reutilizable.'}
              </div>
            </div>

          </div>

          <!-- CRONOGRAMA PASO A PASO EN LÍNEA DE TIEMPO MINIMALISTA -->
          <div class="bg-white border-2 border-black p-5 sm:p-6 shadow-[4px_4px_0px_0px_#111111]">
            <div class="flex items-center gap-2 mb-4 pb-2 border-b-2 border-black">
              <span class="w-3 h-3 bg-black"></span>
              <h2 class="text-base sm:text-lg font-black uppercase tracking-tight text-neutral-900 font-mono">
                Cronograma de la Actividad (Paso a Paso)
              </h2>
            </div>

            <div class="relative border-l-2 border-black ml-3 space-y-5 my-2 pl-4 sm:pl-5">
              ${
                (activity.schedule && activity.schedule.length > 0)
                  ? activity.schedule.map(slot => `
                      <div class="relative">
                        <!-- Punto negro en la línea -->
                        <span class="absolute -left-[23px] sm:-left-[27px] top-1.5 w-3 h-3 bg-white border-2 border-black rounded-full"></span>
                        <div class="text-xs font-mono font-black text-[#E11D48] uppercase tracking-wider">
                          ${slot.time}
                        </div>
                        <h4 class="text-sm font-black text-neutral-900 uppercase tracking-tight mt-0.5">
                          ${slot.title}
                        </h4>
                        <p class="text-xs text-neutral-600 font-medium mt-0.5 leading-relaxed">
                          ${slot.desc}
                        </p>
                      </div>
                    `).join('')
                  : `
                    <div class="relative">
                      <span class="absolute -left-[23px] top-1.5 w-3 h-3 bg-white border-2 border-black rounded-full"></span>
                      <div class="text-xs font-mono font-black text-[#E11D48]">INICIO · PUNTUAL</div>
                      <p class="text-xs text-neutral-700 font-medium">Recepción, bienvenida comunitaria y desarrollo del taller.</p>
                    </div>
                  `
              }
            </div>
          </div>

          <!-- GRILLA LIMPIA DE EQUIPAMIENTO E INCLUSIÓN DEL PARQUE -->
          <div class="bg-white border-2 border-black p-5 sm:p-6 shadow-[4px_4px_0px_0px_#111111]">
            <div class="flex items-center gap-2 mb-4 pb-2 border-b-2 border-black">
              <span class="w-3 h-3 bg-[#E11D48]"></span>
              <h2 class="text-base sm:text-lg font-black uppercase tracking-tight text-neutral-900 font-mono">
                Equipamiento del Parque & Accesibilidad
              </h2>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              
              <!-- Sombra -->
              <div class="p-3 border ${activity.amenities?.shade ? 'border-emerald-300 bg-emerald-50/60' : 'border-neutral-200 bg-neutral-50'}">
                <div class="text-lg mb-1">🌳</div>
                <div class="font-mono font-black uppercase text-neutral-900 text-[11px]">Sombra</div>
                <div class="text-[11px] font-bold ${activity.amenities?.shade ? 'text-[#059669]' : 'text-neutral-500'}">
                  ${activity.amenities?.shade ? '✓ Sí tiene' : '— Parcial'}
                </div>
              </div>

              <!-- Baños -->
              <div class="p-3 border ${activity.amenities?.restrooms ? 'border-emerald-300 bg-emerald-50/60' : 'border-neutral-200 bg-neutral-50'}">
                <div class="text-lg mb-1">🚻</div>
                <div class="font-mono font-black uppercase text-neutral-900 text-[11px]">Baños</div>
                <div class="text-[11px] font-bold ${activity.amenities?.restrooms ? 'text-[#059669]' : 'text-neutral-500'}">
                  ${activity.amenities?.restrooms ? '✓ Públicos' : '— Cercanos'}
                </div>
              </div>

              <!-- Rampa Universal -->
              <div class="p-3 border ${activity.isWheelchairAccessible || activity.amenities?.ramps ? 'border-emerald-300 bg-emerald-50/60' : 'border-neutral-200 bg-neutral-50'}">
                <div class="text-lg mb-1">♿</div>
                <div class="font-mono font-black uppercase text-neutral-900 text-[11px]">Rampa</div>
                <div class="text-[11px] font-bold ${activity.isWheelchairAccessible || activity.amenities?.ramps ? 'text-[#059669]' : 'text-neutral-500'}">
                  ${activity.isWheelchairAccessible || activity.amenities?.ramps ? '✓ 100% Accesible' : '— Acceso Regular'}
                </div>
              </div>

              <!-- Neuro-Friendly -->
              <div class="p-3 border ${activity.isNeuroFriendly || activity.amenities?.neuroFriendly ? 'border-purple-300 bg-purple-50/60' : 'border-neutral-200 bg-neutral-50'}">
                <div class="text-lg mb-1">🧠</div>
                <div class="font-mono font-black uppercase text-neutral-900 text-[11px]">Neuro</div>
                <div class="text-[11px] font-bold ${activity.isNeuroFriendly || activity.amenities?.neuroFriendly ? 'text-purple-900' : 'text-neutral-500'}">
                  ${activity.isNeuroFriendly || activity.amenities?.neuroFriendly ? '✓ Amigable TEA' : '— Abierto'}
                </div>
              </div>

            </div>
          </div>

          <!-- MAPA INTERACTIVO LEAFLET CON RADIO CAMINABLE Y RUTA A PIE -->
          <div class="bg-white border-2 border-black p-5 sm:p-6 shadow-[4px_4px_0px_0px_#111111]">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-2 border-b-2 border-black">
              <div>
                <span class="text-[10px] font-mono font-black uppercase tracking-wider text-[#E11D48] block">RADIO PEATONAL</span>
                <h2 class="text-base sm:text-lg font-black uppercase tracking-tight text-neutral-900 font-mono">
                  Ubicación & Radio Caminable (15 Minutos)
                </h2>
              </div>
              <a 
                href="${googleMapsUrl}" 
                target="_blank" 
                rel="noopener"
                class="inline-flex items-center gap-1.5 text-xs font-mono font-black uppercase bg-black text-white hover:bg-[#E11D48] px-3 py-1.5 transition-colors shadow-[2px_2px_0px_0px_#111111]"
              >
                <span>🚶 Abrir ruta a pie en Maps →</span>
              </a>
            </div>

            <!-- Contenedor del Mapa Leaflet -->
            <div 
              id="${mapContainerId}" 
              class="w-full h-[280px] sm:h-[320px] bg-neutral-100 border-2 border-black"
            ></div>
            
            <div class="mt-3 flex items-center justify-between text-xs font-mono text-neutral-600">
              <span>📍 ${activity.locationName} · ${activity.address || ''}</span>
              <span class="font-bold text-[#059669]">Radio seguro de 15 min a pie</span>
            </div>
          </div>

          <!-- MURO COMUNITARIO DE CONSEJOS DE VECINOS -->
          <div class="bg-white border-2 border-black p-5 sm:p-6 shadow-[4px_4px_0px_0px_#111111]">
            <div class="flex items-center justify-between gap-2 mb-4 pb-2 border-b-2 border-black">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 bg-black"></span>
                <h2 class="text-base sm:text-lg font-black uppercase tracking-tight text-neutral-900 font-mono">
                  Consejos de Vecinos para esta Plaza
                </h2>
              </div>
              <span id="reviews-count-badge" class="text-xs font-mono font-bold bg-neutral-200 px-2 py-0.5">
                ${reviews.length} aportes
              </span>
            </div>

            <!-- Lista de Consejos -->
            <div id="reviews-list-container" class="space-y-3 mb-5">
              ${
                reviews.length > 0
                  ? reviews.map(r => `
                      <div class="p-3 bg-neutral-50 border border-neutral-300 text-xs">
                        <div class="flex items-center justify-between mb-1">
                          <strong class="font-mono uppercase font-black text-neutral-900">${r.author}</strong>
                          <span class="text-[10px] font-mono text-neutral-500">${r.timeAgo || 'Reciente'}</span>
                        </div>
                        <p class="text-neutral-700 font-medium">${r.comment}</p>
                      </div>
                    `).join('')
                  : `
                    <div class="p-4 border border-dashed border-neutral-300 text-xs text-neutral-500 font-mono text-center">
                      Sé el primer vecino en dejar un dato útil (ej. sombra, estacionamiento de bicicletas o acceso).
                    </div>
                  `
              }
            </div>

            <!-- Formulario de Nuevo Consejo -->
            <form id="form-new-neighborhood-review" class="p-3.5 bg-neutral-100 border border-neutral-300 space-y-2.5">
              <div class="text-xs font-mono font-black uppercase text-neutral-800">
                + Agregar dato útil o recomendación
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input 
                  type="text" 
                  id="input-review-name" 
                  placeholder="Tu nombre o apodo" 
                  required 
                  class="bg-white border border-neutral-400 p-2 text-xs font-medium outline-none focus:border-black"
                />
                <input 
                  type="text" 
                  id="input-review-text" 
                  placeholder="Ej. Hay agua fresca en la esquina poniente..." 
                  required 
                  class="sm:col-span-2 bg-white border border-neutral-400 p-2 text-xs font-medium outline-none focus:border-black"
                />
              </div>
              <button 
                type="submit" 
                class="bg-black hover:bg-[#E11D48] text-white text-xs font-black uppercase px-4 py-2 transition-colors cursor-pointer shadow-[2px_2px_0px_0px_#111111]"
              >
                Publicar en el Muro Comunitario →
              </button>
            </form>

          </div>

        </div>

        <!-- ====================================================================
             COLUMNA DERECHA: STICKY TICKET & MONITOR BOX (35% en Desktop)
             ==================================================================== -->
        <div class="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
          
          <!-- TICKET CARD PRINCIPAL DE ACCIÓN -->
          <div class="bg-white border-3 border-black p-5 sm:p-6 shadow-[6px_6px_0px_0px_#111111]">
            
            <!-- Barra Superior del Ticket -->
            <div class="flex items-center justify-between pb-3 mb-4 border-b-2 border-black">
              <span class="font-mono font-black text-xs uppercase tracking-wider text-neutral-600">
                PASE OFICIAL CHISPAPLAY
              </span>
              <span class="text-xs font-mono font-black uppercase px-2 py-0.5 ${
                isReserved ? 'bg-emerald-100 text-[#059669]' : (isSoldOut ? 'bg-red-100 text-[#E11D48]' : 'bg-black text-white')
              }">
                ${isReserved ? '✓ RESERVADO' : (isSoldOut ? 'LISTA ESPERA' : 'GRATIS')}
              </span>
            </div>

            <!-- ESTADO DE CUPOS EN TIEMPO REAL -->
            <div class="mb-5">
              ${
                isReserved
                  ? `
                    <div class="p-3 bg-emerald-50 border-2 border-[#059669] text-xs font-mono">
                      <div class="flex items-center gap-2 text-[#059669] font-black uppercase">
                        <span class="w-2.5 h-2.5 bg-[#059669] rounded-full animate-ping"></span>
                        ¡TU CUPO ESTÁ ASEGURADO!
                      </div>
                      <p class="text-[11px] text-neutral-600 mt-1">
                        Presenta tu nombre o Pase Vecinal al llegar a la plaza.
                      </p>
                    </div>
                  `
                  : `
                    <div class="flex items-baseline justify-between mb-1.5">
                      <span class="text-xs font-mono uppercase font-bold text-neutral-500">Disponibilidad:</span>
                      <span class="font-mono font-black text-sm ${isSoldOut ? 'text-[#E11D48]' : 'text-neutral-900'}">
                        ${isSoldOut ? '🔥 CUPOS AGOTADOS' : `${remainingSpots} cupos disponibles`}
                      </span>
                    </div>

                    <!-- Barra visual de capacidad -->
                    <div class="w-full bg-neutral-200 h-2 border border-black overflow-hidden">
                      <div 
                        class="h-full ${isSoldOut ? 'bg-[#E11D48]' : 'bg-[#059669]'}" 
                        style="width: ${Math.min(100, Math.round((activity.enrolledCount / activity.capacity) * 100))}%"
                      ></div>
                    </div>
                  `
              }
            </div>

            <!-- BOTÓN PRIMARIO DE CONVERSIÓN -->
            ${
              !isReserved
                ? `
                  <div>
                    ${
                      !isSoldOut
                        ? `
                          <button 
                            id="btn-dedicated-reserve"
                            type="button" 
                            class="w-full bg-[#E11D48] hover:bg-black text-white font-black uppercase text-sm tracking-wider py-4 px-4 transition-all duration-200 cursor-pointer shadow-[4px_4px_0px_0px_#111111] text-center"
                          >
                            RESERVAR MI CUPO GRATIS →
                          </button>
                        `
                        : `
                          <button 
                            id="btn-dedicated-waitlist"
                            type="button" 
                            class="w-full ${isWaitlisted ? 'bg-neutral-800' : 'bg-black hover:bg-[#E11D48]'} text-white font-black uppercase text-xs sm:text-sm tracking-wider py-4 px-4 transition-all duration-200 cursor-pointer shadow-[4px_4px_0px_0px_#111111] text-center"
                          >
                            ${isWaitlisted ? `✓ EN LISTA DE ESPERA (#${effectiveWaitlist})` : `UNIRME A LISTA DE ESPERA (${effectiveWaitlist} en fila) →`}
                          </button>
                        `
                    }
                    <div class="mt-2.5 text-center text-[10px] font-mono text-neutral-500">
                      ⚡ Sin pagos ni tarjetas · 100% Gratuito y Comunitario
                    </div>
                  </div>
                `
                : `
                  <!-- ACCIONES DE TERRENO CUANDO YA ESTÁ RESERVADO -->
                  <div class="space-y-3 pt-2">
                    
                    <!-- 1. Agendar en Google Calendar / .ics -->
                    <div class="p-3 bg-neutral-50 border border-neutral-300 space-y-2">
                      <div class="text-[10px] font-mono font-black uppercase text-neutral-600">
                        1. Guardar en tu calendario:
                      </div>
                      <div class="grid grid-cols-2 gap-2">
                        <a 
                          href="${googleCalUrl}" 
                          target="_blank" 
                          rel="noopener"
                          class="bg-white hover:bg-neutral-100 border border-black p-2 text-center text-xs font-bold text-neutral-900 block"
                        >
                          📅 Google Cal
                        </a>
                        <button 
                          id="btn-dedicated-ics"
                          type="button" 
                          class="bg-white hover:bg-neutral-100 border border-black p-2 text-center text-xs font-bold text-neutral-900 cursor-pointer"
                        >
                          📥 Archivo .ics
                        </button>
                      </div>
                    </div>

                    <!-- 2. Check-in de Terreno: Llegué a la Plaza -->
                    <div class="p-3 ${isValidated ? 'bg-emerald-50 border-2 border-[#059669]' : 'bg-white border-2 border-black'} space-y-2">
                      <div class="text-[10px] font-mono font-black uppercase ${isValidated ? 'text-[#059669]' : 'text-neutral-700'}">
                        2. Validación de Terreno:
                      </div>
                      ${
                        isValidated
                          ? `
                            <div class="flex items-center gap-2 text-xs font-mono font-black text-[#059669]">
                              <span>✓</span> ASISTENCIA VALIDADA EN PLAZA (${attendanceDetail?.timeStr || 'Hoy'})
                            </div>
                          `
                          : `
                            <button 
                              id="btn-dedicated-checkin-gps" 
                              type="button" 
                              class="w-full bg-[#059669] hover:bg-black text-white text-xs font-black uppercase tracking-wider py-3 px-3 transition-colors cursor-pointer shadow-[2px_2px_0px_0px_#111111]"
                            >
                              📍 Llegué a la plaza ✓ (Check-in)
                            </button>
                          `
                      }
                    </div>

                    <!-- 3. Liberar Cupo -->
                    <button 
                      id="btn-dedicated-cancel-reserve" 
                      type="button" 
                      class="w-full bg-white hover:bg-red-50 text-neutral-700 hover:text-red-700 border border-neutral-300 py-2.5 text-xs font-mono font-bold uppercase transition-colors cursor-pointer"
                    >
                      Liberar mi cupo (Ceder a otro vecino)
                    </button>

                    <!-- 4. Avisar Desperfecto en Plaza -->
                    <button 
                      id="btn-dedicated-report-defect" 
                      type="button" 
                      class="w-full bg-neutral-100 hover:bg-black hover:text-white border border-neutral-400 py-2.5 text-xs font-mono font-bold uppercase transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>⚠️</span>
                      <span>Avisar algo roto en esta plaza</span>
                    </button>

                  </div>
                `
            }

          </div>

          <!-- TARJETA DE CONFIANZA: MONITOR ACREDITADO -->
          <div class="bg-white border-2 border-black p-5 shadow-[4px_4px_0px_0px_#111111]">
            <div class="text-[10px] font-mono font-black uppercase text-[#E11D48] tracking-wider mb-2">
              ORGANIZACIÓN & MONITOR ACREDITADO
            </div>

            <div class="space-y-1 mb-4">
              <h3 class="font-black text-base text-neutral-900 leading-tight">
                ${activity.instructorName}
              </h3>
              <p class="text-xs font-mono text-neutral-600">
                ${activity.instructorRole}
              </p>
              <div class="pt-2 text-xs font-medium text-neutral-700 border-t border-neutral-200">
                <span class="font-bold text-neutral-900">${activity.organizerName}</span>
                ${activity.legalEntityNumber ? `<span class="text-neutral-500 block text-[11px] font-mono">(${activity.legalEntityNumber})</span>` : ''}
              </div>
            </div>

            <!-- Botón WhatsApp Directo al Monitor -->
            <a 
              href="${whatsappUrl}" 
              target="_blank" 
              rel="noopener"
              class="w-full bg-[#25D366] hover:bg-[#1EBE5D] text-black font-black uppercase text-xs py-3 px-3 shadow-[3px_3px_0px_0px_#111111] flex items-center justify-center gap-2 transition-colors border border-black"
            >
              <span class="text-base">💬</span>
              <span>WhatsApp Directo al Monitor</span>
            </a>
          </div>

          <!-- Mini Nota de Seguridad Ciudadana -->
          <div class="p-3 bg-neutral-100 border border-neutral-300 text-[11px] font-mono text-neutral-600 flex items-center justify-between">
            <span>🛡️ Protocolo Municipal Activo</span>
            <span class="font-bold text-neutral-900">1418 / 1433</span>
          </div>

        </div>

      </div>

      <!-- BARRA DE CONVERSIÓN INFERIOR FIJA EXCLUSIVA PARA MÓVIL (<= 15% Viewport) -->
      <div class="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-black p-3 shadow-[0_-4px_12px_rgba(0,0,0,0.15)] flex items-center justify-between gap-3 font-sans">
        <div class="min-w-0">
          <div class="text-[9px] font-mono uppercase font-bold text-neutral-500 truncate">CUPOS DISPONIBLES:</div>
          <div class="text-xs sm:text-sm font-mono font-black ${isReserved ? 'text-[#059669]' : (isSoldOut ? 'text-[#E11D48]' : 'text-neutral-900')} truncate">
            ${isReserved ? '✓ CUPO ASEGURADO' : (isSoldOut ? '🔥 AGOTADOS' : `${remainingSpots} CUPOS`)}
          </div>
        </div>
        <div class="shrink-0 flex items-center gap-2">
          ${
            !isReserved
              ? (!isSoldOut
                  ? `<button id="btn-mobile-sticky-reserve" type="button" class="bg-[#E11D48] hover:bg-black text-white px-4 py-2.5 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#111111] cursor-pointer">RESERVAR CUPO →</button>`
                  : `<button id="btn-mobile-sticky-waitlist" type="button" class="bg-black hover:bg-[#E11D48] text-white px-3 py-2 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#111111] cursor-pointer">${isWaitlisted ? '✓ EN FILA' : 'FILA DE ESPERA →'}</button>`)
              : `<button id="btn-mobile-sticky-checkin" type="button" class="bg-[#059669] hover:bg-black text-white px-3.5 py-2 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#111111] cursor-pointer">${isValidated ? '✓ LLEGADA OK' : '📍 LLEGUÉ ✓'}</button>`
          }
        </div>
      </div>

    </div>
  `;

  // Montar Mapa Leaflet diferido
  setTimeout(() => {
    renderActivityMap(
      mapContainerId,
      activity.coordinates,
      activity.locationName,
      distInfo.walkingMinutes,
      activity.category
    );
  }, 100);

  // VINCULAR EVENTOS INTERACTIVOS

  // Botón Volver
  const btnBack = containerEl.querySelector('#btn-dedicated-back');
  btnBack?.addEventListener('click', () => {
    if (onBackCallback) {
      onBackCallback();
    } else if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = 'actividades.html';
    }
  });

  const handleReserveAction = () => {
    if (!hasValidUserContact()) {
      openUserModal(activity.id, () => {
        toggleActivityReservation(activity.id);
        showToast('CUPO CONFIRMADO', `¡Aseguraste tu lugar en "${activity.title}"!`, 'success');
        renderDedicatedActivityPage(activity.id, containerEl, onBackCallback, backButtonLabel);
      });
      return;
    }

    const res = toggleActivityReservation(activity.id);
    if (res.reserved) {
      showToast('CUPO CONFIRMADO', `¡Aseguraste tu cupo gratis para ${activity.locationName}!`, 'success');
    }
    renderDedicatedActivityPage(activity.id, containerEl, onBackCallback, backButtonLabel);
  };

  const handleWaitlistAction = () => {
    if (isWaitlisted) return;

    if (!hasValidUserContact()) {
      openUserModal(activity.id, () => {
        joinWaitlist(activity.id);
        showToast('LISTA DE ESPERA', 'Te avisaremos por WhatsApp si se libera un cupo.', 'info');
        renderDedicatedActivityPage(activity.id, containerEl, onBackCallback, backButtonLabel);
      });
      return;
    }

    joinWaitlist(activity.id);
    showToast('LISTA DE ESPERA', 'Quedaste en lista de espera. Si alguien libera cupo, te avisaremos.', 'info');
    renderDedicatedActivityPage(activity.id, containerEl, onBackCallback, backButtonLabel);
  };

  // Botón Reservar Desktop & Mobile
  const btnReserve = containerEl.querySelector('#btn-dedicated-reserve');
  btnReserve?.addEventListener('click', handleReserveAction);
  const btnMobileReserve = containerEl.querySelector('#btn-mobile-sticky-reserve');
  btnMobileReserve?.addEventListener('click', handleReserveAction);

  // Botón Lista de Espera Desktop & Mobile
  const btnWaitlist = containerEl.querySelector('#btn-dedicated-waitlist');
  btnWaitlist?.addEventListener('click', handleWaitlistAction);
  const btnMobileWaitlist = containerEl.querySelector('#btn-mobile-sticky-waitlist');
  btnMobileWaitlist?.addEventListener('click', handleWaitlistAction);

  // Botón Mobile Check-in
  const btnMobileCheckin = containerEl.querySelector('#btn-mobile-sticky-checkin');
  btnMobileCheckin?.addEventListener('click', () => {
    const btnCheckinGps = containerEl.querySelector('#btn-dedicated-checkin-gps');
    if (btnCheckinGps) {
      btnCheckinGps.click();
    } else {
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  });

  // Botón Cancelar Reserva
  const btnCancel = containerEl.querySelector('#btn-dedicated-cancel-reserve');
  btnCancel?.addEventListener('click', () => {
    toggleActivityReservation(activity.id);
    showToast('CUPO LIBERADO', 'Tu cupo fue liberado para otro vecino del barrio.', 'info');
    renderDedicatedActivityPage(activity.id, containerEl, onBackCallback, backButtonLabel);
  });

  // Botón Descargar .ics
  const btnIcs = containerEl.querySelector('#btn-dedicated-ics');
  btnIcs?.addEventListener('click', () => {
    downloadIcsFile(activity);
    showToast('ARCHIVO .ICS DESCARGADO', 'Listo para importar en tu calendario.', 'success');
  });

  // Botón Check-in GPS
  const btnCheckinGps = containerEl.querySelector('#btn-dedicated-checkin-gps');
  btnCheckinGps?.addEventListener('click', () => {
    btnCheckinGps.disabled = true;
    btnCheckinGps.textContent = '📍 Verificando GPS...';

    validateGroundAttendanceWithGps(activity.id, (res) => {
      if (res.success) {
        showToast('ASISTENCIA VALIDADA', '¡Bienvenido a la plaza! Check-in registrado con éxito.', 'success');
      } else {
        // Fallback validación manual
        validateGroundAttendance(activity.id);
        showToast('ASISTENCIA REGISTRADA', 'Check-in confirmado manualmente en terreno.', 'success');
      }
      renderDedicatedActivityPage(activity.id, containerEl, onBackCallback, backButtonLabel);
    });
  });

  // Botón Reportar Desperfecto
  const btnReportDefect = containerEl.querySelector('#btn-dedicated-report-defect');
  btnReportDefect?.addEventListener('click', () => {
    openParkDefectModal(activity.id, activity.locationName);
  });

  // Formulario de Reseñas / Consejos de Vecinos
  const formReview = containerEl.querySelector('#form-new-neighborhood-review');
  formReview?.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = containerEl.querySelector('#input-review-name');
    const textInput = containerEl.querySelector('#input-review-text');
    const name = nameInput?.value.trim() || 'Vecino Anónimo';
    const text = textInput?.value.trim();

    if (text) {
      addNeighborhoodReview(activity.id, text, name);
      showToast('CONSEJO PUBLICADO', '¡Gracias por aportar al muro comunitario del parque!', 'success');
      renderDedicatedActivityPage(activity.id, containerEl, onBackCallback, backButtonLabel);
    }
  });
}
