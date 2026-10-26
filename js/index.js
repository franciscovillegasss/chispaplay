/* ==========================================================================
   ARCHIVO: js/index.js
   Lógica Modular de Inicio · Ciudad de 15 Minutos, Artículos de Revista y 1-Clic
   ========================================================================== */

import { COMMUNES_DATA } from './data.js';
import {
  setActiveCommune,
  setActiveReferencePoint,
  getAllActivities,
  calculateDistanceAndWalkingTime,
  getTrackedUser,
  isActivityReserved,
  toggleActivityReservation,
  isAttendanceValidated,
  validateGroundAttendance,
  validateGroundAttendanceWithGps,
  getAttendanceDetail,
  getLiveNotice,
  getReviewsForActivity,
  addNeighborhoodReview,
  recordActivityView,
  recordTelemetryEvent,
  isUserOnWaitlist,
  joinWaitlist,
  hasValidUserContact,
  subscribeRadarWhatsApp,
  reportParkDefect,
  logAction
} from './state.js';
import { getGoogleCalendarUrl, downloadIcsFile, getGoogleMapsDirectionsUrl } from './calendar.js';
import { renderNavbar } from './navbar.js';
import { renderBottomNav } from './bottomNav.js';
import { openUserModal } from './userModal.js';
import { showToast } from './toast.js';
import { renderDedicatedActivityPage } from './activityPage.js';

// Estado inicial estricto: Todo en null hasta la interacción del usuario
let selectedComuna = null;
let selectedSector = null;
let selectedTimeframe = null;
let forceShowAllDistances = false;
let selectedActivityId = null;

// Referencia a actividad actual para reporte de desperfecto
let currentReportingActivity = null;

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar('inicio');
  renderBottomNav('inicio');
  initProgressiveDisclosure();
  initRadarWhatsAppForm();
  initParkDefectModal();

  // Soporte de enlace directo a actividad (?actividad=ID o ?id=ID)
  const urlParams = new URLSearchParams(window.location.search);
  const deepActId = urlParams.get('actividad') || urlParams.get('id');
  if (deepActId) {
    openDedicatedActivity(deepActId, false);
  }

  // Escuchar popstate del navegador (botón Atrás/Adelante)
  window.addEventListener('popstate', (e) => {
    const actId = e.state?.activityId || new URLSearchParams(window.location.search).get('actividad') || new URLSearchParams(window.location.search).get('id');
    if (actId) {
      openDedicatedActivity(actId, false);
    } else if (selectedActivityId) {
      closeDedicatedActivity(false);
    }
  });

  window.addEventListener('chispaplay:reservations-changed', () => {
    if (selectedComuna && selectedTimeframe) {
      renderRanking();
    }
    if (selectedActivityId) {
      const dedicatedContainer = document.getElementById('dedicated-activity-container');
      if (dedicatedContainer) {
        renderDedicatedActivityPage(selectedActivityId, dedicatedContainer, () => closeDedicatedActivity(), '← Volver al ranking');
      }
    }
  });

  window.addEventListener('chispaplay:attendance-validated', () => {
    if (selectedComuna && selectedTimeframe) {
      renderRanking();
    }
  });

  window.addEventListener('chispaplay:waitlist-changed', () => {
    if (selectedComuna && selectedTimeframe) {
      renderRanking();
    }
  });

  window.addEventListener('chispaplay:activities-updated', () => {
    if (selectedComuna && selectedTimeframe) {
      renderRanking();
    }
  });

  window.addEventListener('chispaplay:live-notice-updated', () => {
    if (selectedComuna && selectedTimeframe) {
      renderRanking();
    }
  });

  window.addEventListener('chispaplay:reviews-updated', () => {
    if (selectedComuna && selectedTimeframe) {
      renderRanking();
    }
  });

  window.addEventListener('chispaplay:ref-changed', (e) => {
    const newRef = e.detail?.refPoint;
    if (newRef) {
      selectedSector = newRef;
      const radarSectorDisplay = document.getElementById('radar-sector-name');
      if (radarSectorDisplay) radarSectorDisplay.textContent = newRef.name;
      const step3RefLabel = document.getElementById('step3-ref-label');
      if (step3RefLabel) step3RefLabel.textContent = `Ref: ${newRef.name}`;
      if (selectedComuna && selectedTimeframe) {
        renderRanking();
      }
    }
  });

  window.addEventListener('chispaplay:commune-changed', (e) => {
    const newCommune = e.detail?.communeId;
    if (newCommune && newCommune !== selectedComuna) {
      handleCommuneSelect(newCommune);
    }
  });
});

function initProgressiveDisclosure() {
  const btnMaipu = document.getElementById('btn-select-maipu');
  const btnValpo = document.getElementById('btn-select-valpo');

  if (btnMaipu) {
    btnMaipu.addEventListener('click', () => handleCommuneSelect('maipu'));
  }
  if (btnValpo) {
    btnValpo.addEventListener('click', () => handleCommuneSelect('valparaiso'));
  }

  // Listener para botones de temporalidad del Paso 3
  const timeframeButtons = document.querySelectorAll('.btn-step3-timeframe');
  timeframeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const timeframe = e.currentTarget.getAttribute('data-timeframe');
      handleTimeframeSelect(timeframe, e.currentTarget);
    });
  });
}

// ==========================================================================
// PASO 1: SELECCIÓN DE COMUNA
// ==========================================================================
function handleCommuneSelect(communeId) {
  const isChange = selectedComuna !== communeId;
  selectedComuna = communeId;
  forceShowAllDistances = false;

  const btnMaipu = document.getElementById('btn-select-maipu');
  const btnValpo = document.getElementById('btn-select-valpo');

  if (communeId === 'maipu') {
    btnMaipu.className = 'btn-commune-choice px-4 sm:px-6 py-2 sm:py-2.5 font-black uppercase text-base sm:text-xl tracking-wider transition-all cursor-pointer bg-black text-white shadow-[2px_2px_0px_0px_#E11D48]';
    btnValpo.className = 'btn-commune-choice px-4 sm:px-6 py-2 sm:py-2.5 font-black uppercase text-base sm:text-xl tracking-wider transition-all cursor-pointer bg-neutral-100 text-neutral-800 hover:bg-black hover:text-white';
  } else {
    btnValpo.className = 'btn-commune-choice px-4 sm:px-6 py-2 sm:py-2.5 font-black uppercase text-base sm:text-xl tracking-wider transition-all cursor-pointer bg-black text-white shadow-[2px_2px_0px_0px_#E11D48]';
    btnMaipu.className = 'btn-commune-choice px-4 sm:px-6 py-2 sm:py-2.5 font-black uppercase text-base sm:text-xl tracking-wider transition-all cursor-pointer bg-neutral-100 text-neutral-800 hover:bg-black hover:text-white';
  }

  setActiveCommune(communeId);
  logAction('SELECCION_COMUNA', 'Paso 1: Comuna Seleccionada', communeId === 'maipu' ? 'Maipú' : 'Valparaíso');

  if (isChange) {
    selectedSector = null;
    selectedTimeframe = null;
    hideStep3();
    hideRanking();
  }

  revealStep2();
}

// ==========================================================================
// PASO 2: CAJA BLANCA CON SECTORES DE REFERENCIA
// ==========================================================================
function revealStep2() {
  const step2Container = document.getElementById('hero-step2-container');
  const communeLabel = document.getElementById('step2-commune-label');
  const sectorsGrid = document.getElementById('step2-sectors-grid');

  if (!step2Container || !sectorsGrid || !selectedComuna) return;

  const communeObj = COMMUNES_DATA[selectedComuna];
  if (communeLabel) communeLabel.textContent = `COMUNA: ${communeObj.name.toUpperCase()}`;

  sectorsGrid.innerHTML = communeObj.suggestions
    .map(s => {
      const isSelected = selectedSector && selectedSector.id === s.id;
      return `
        <button 
          type="button" 
          data-sector-id="${s.id}"
          class="btn-sector-choice p-2.5 border-2 text-xs font-bold text-center transition-all cursor-pointer ${
            isSelected
              ? 'border-black bg-black text-white font-black shadow-[2px_2px_0px_0px_#E11D48]'
              : 'border-neutral-300 bg-neutral-50 text-neutral-800 hover:border-black hover:bg-neutral-100'
          }"
        >
          📍 ${s.name}
        </button>
      `;
    })
    .join('') +
    `
      <button 
        type="button" 
        data-sector-id="center"
        class="btn-sector-choice p-2.5 border-2 border-dashed border-neutral-400 hover:border-black text-xs font-bold text-center bg-white text-neutral-700 cursor-pointer"
      >
        Centro: ${communeObj.centerReference.name}
      </button>
    `;

  sectorsGrid.querySelectorAll('.btn-sector-choice').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const sectorId = e.currentTarget.getAttribute('data-sector-id');
      handleSectorSelect(sectorId, communeObj);
    });
  });

  step2Container.classList.remove('hidden');
  setTimeout(() => {
    step2Container.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 100);
}

function handleSectorSelect(sectorId, communeObj) {
  let targetRef = null;
  if (sectorId === 'center') {
    targetRef = communeObj.centerReference;
  } else {
    targetRef = communeObj.suggestions.find(s => s.id === sectorId) || communeObj.centerReference;
  }

  selectedSector = targetRef;
  forceShowAllDistances = false;
  setActiveReferencePoint(targetRef);
  logAction('SELECCION_SECTOR', 'Paso 2: Sector de Referencia', targetRef.name);

  // Actualizar nombre del sector en el banner del Radar WhatsApp
  const radarSectorDisplay = document.getElementById('radar-sector-name');
  if (radarSectorDisplay) {
    radarSectorDisplay.textContent = targetRef.name;
  }

  const sectorsGrid = document.getElementById('step2-sectors-grid');
  if (sectorsGrid) {
    sectorsGrid.querySelectorAll('.btn-sector-choice').forEach(btn => {
      const id = btn.getAttribute('data-sector-id');
      if (id === sectorId) {
        btn.className = 'btn-sector-choice p-2.5 border-2 text-xs font-black text-center transition-all cursor-pointer border-black bg-black text-white shadow-[2px_2px_0px_0px_#E11D48]';
      } else {
        btn.className = 'btn-sector-choice p-2.5 border-2 text-xs font-bold text-center transition-all cursor-pointer border-neutral-300 bg-neutral-50 text-neutral-800 hover:border-black hover:bg-neutral-100';
      }
    });
  }

  // Si ya había una temporalidad elegida, recalcula el ranking de inmediato
  if (selectedTimeframe) {
    renderRanking();
  }

  revealStep3();
}

// ==========================================================================
// PASO 3: SELECCIÓN DE TEMPORALIDAD
// ==========================================================================
function revealStep3() {
  const step3Container = document.getElementById('hero-step3-container');
  const step3RefLabel = document.getElementById('step3-ref-label');

  if (!step3Container) return;

  if (step3RefLabel && selectedSector) {
    step3RefLabel.textContent = `Ref: ${selectedSector.name}`;
  }

  step3Container.classList.remove('hidden');
  setTimeout(() => {
    step3Container.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 100);
}

function hideStep3() {
  const step3Container = document.getElementById('hero-step3-container');
  if (step3Container) {
    step3Container.classList.add('hidden');
  }
}

function handleTimeframeSelect(timeframe, clickedButton) {
  selectedTimeframe = timeframe;
  forceShowAllDistances = false;

  const timeframeButtons = document.querySelectorAll('.btn-step3-timeframe');
  timeframeButtons.forEach(btn => {
    btn.className = 'btn-step3-timeframe py-4 px-3 text-center font-black uppercase tracking-wider border-2 border-neutral-600 hover:border-white bg-neutral-900 text-white transition-all cursor-pointer';
  });

  if (clickedButton) {
    clickedButton.className = 'btn-step3-timeframe py-4 px-3 text-center font-black uppercase tracking-wider border-2 border-black transition-all cursor-pointer bg-white text-black shadow-[4px_4px_0px_0px_#E11D48]';
  }

  logAction('SELECCION_TEMPORALIDAD', 'Paso 3: Temporalidad Activada', timeframe.toUpperCase());

  renderRanking();
  revealRanking();
}

// ==========================================================================
// GRILLA BLANCA INFERIOR: RANKING DE ACTIVIDADES & AUTO-SCROLL
// ==========================================================================
function revealRanking() {
  const rankingSection = document.getElementById('ranking-section');
  if (!rankingSection) return;

  rankingSection.classList.remove('hidden');

  setTimeout(() => {
    rankingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

function hideRanking() {
  const rankingSection = document.getElementById('ranking-section');
  if (rankingSection) {
    rankingSection.classList.add('hidden');
  }
}

// ==========================================================================
// MOTOR ESTRICTO DE 15 MINUTOS, REORDENAMIENTO & FALLBACK
// ==========================================================================
function renderRanking() {
  if (!selectedComuna || !selectedTimeframe) return;

  const allActivities = getAllActivities();
  const rawFiltered = allActivities.filter(
    item => item.commune === selectedComuna && item.timeframe === selectedTimeframe
  );

  const headline = document.getElementById('ranking-headline');
  const countLabel = document.getElementById('ranking-count-label');
  const container = document.getElementById('ranking-list-container');

  const timeframeLabels = {
    hoy: 'HOY',
    semana: 'ESTA SEMANA',
    mes: 'ESTE MES'
  };

  const communeName = selectedComuna === 'maipu' ? 'Maipú' : 'Valparaíso';
  const sectorName = selectedSector ? selectedSector.name : 'Sector Habitual';

  // Calcular distancias y minutos exactos desde el sector activo
  const withDistance = rawFiltered.map(item => {
    const distInfo = calculateDistanceAndWalkingTime(item.coordinates, selectedSector);
    return {
      ...item,
      distInfo,
      walkingMinutes: distInfo.minutes
    };
  });

  // Filtrado estricto a <= 15 minutos caminando (a menos que el usuario fuerce ver todas)
  let displayList = [];
  if (forceShowAllDistances) {
    displayList = [...withDistance].sort((a, b) => a.walkingMinutes - b.walkingMinutes);
  } else {
    displayList = withDistance
      .filter(item => item.walkingMinutes <= 15)
      .sort((a, b) => a.walkingMinutes - b.walkingMinutes);
  }

  if (headline) {
    headline.textContent = forceShowAllDistances
      ? `Cartelera en ${communeName}: ${timeframeLabels[selectedTimeframe]}`
      : `Talleres en tu barrio (${sectorName}): ${timeframeLabels[selectedTimeframe]}`;
  }

  document.title = `ChispaPlay ${communeName} | Talleres y Actividades Familiares Gratuitas a 15 min`;
  const ogTitleMeta = document.getElementById('og-title-meta');
  if (ogTitleMeta) {
    ogTitleMeta.setAttribute('content', `ChispaPlay ${communeName} | Talleres y Actividades Familiares Gratuitas a 15 min`);
  }

  const schemaScript = document.getElementById('schema-events-jsonld');
  if (schemaScript && displayList.length > 0) {
    const eventsJson = {
      "@context": "https://schema.org",
      "@graph": displayList.map(item => ({
        "@type": "Event",
        "name": item.title,
        "description": item.summary,
        "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
        "eventStatus": "https://schema.org/EventScheduled",
        "location": {
          "@type": "Place",
          "name": item.locationName,
          "address": {
            "@type": "PostalAddress",
            "addressLocality": item.commune === 'valparaiso' ? 'Valparaíso' : 'Maipú',
            "addressCountry": "CL"
          }
        },
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "CLP",
          "availability": "https://schema.org/InStock"
        },
        "organizer": {
          "@type": "Organization",
          "name": item.organizerName
        }
      }))
    };
    schemaScript.textContent = JSON.stringify(eventsJson);
  }

  if (headline) {
    headline.textContent = forceShowAllDistances
      ? `Cartelera en ${communeName}: ${timeframeLabels[selectedTimeframe]}`
      : `Talleres en tu barrio (${sectorName}): ${timeframeLabels[selectedTimeframe]}`;
  }

  if (countLabel) {
    countLabel.textContent = forceShowAllDistances
      ? `${displayList.length} actividades en toda la comuna`
      : `${displayList.length} talleres cerca de ti`;
  }

  if (!container) return;

  // FALLBACK INTELIGENTE: Si no hay actividades cerca
  if (displayList.length === 0) {
    container.innerHTML = `
      <div class="bg-white border-2 border-dashed border-neutral-400 p-8 sm:p-12 text-center text-neutral-800 animate-fade-soft">
        <div class="text-4xl mb-3">🚶‍♂️</div>
        <h3 class="font-black text-lg uppercase tracking-tight mb-2">
          No encontramos talleres cerca en este horario para tu sector
        </h3>
        <p class="text-xs sm:text-sm text-neutral-600 mb-6 font-medium max-w-md mx-auto leading-relaxed">
          Para <strong>${sectorName}</strong> en el horario <strong>${timeframeLabels[selectedTimeframe]}</strong> no encontramos actividades a corta distancia. Puedes revisar otro horario arriba o explorar todos los talleres de ${communeName}.
        </p>
        <button 
          id="btn-show-all-distances" 
          type="button"
          class="bg-black hover:bg-[#E11D48] text-white text-xs font-black uppercase tracking-wider px-6 py-3.5 transition-colors cursor-pointer shadow-[4px_4px_0px_0px_#111111]"
        >
          Ver todos los talleres de ${communeName} →
        </button>
      </div>
    `;

    const btnShowAll = document.getElementById('btn-show-all-distances');
    if (btnShowAll) {
      btnShowAll.addEventListener('click', () => {
        forceShowAllDistances = true;
        renderRanking();
      });
    }
    return;
  }

  // RENDERIZADO DE TARJETAS LIMPIAS (REGLA DE LOS 4 DATOS · SIN ACORDEÓN NI RUIDO)
  container.innerHTML = displayList
    .map((item, index) => {
      recordActivityView(item.id);

      const rankNumber = String(index + 1).padStart(2, '0');
      const isReserved = isActivityReserved(item.id);
      const distMeters = item.distInfo?.distanceMeters || Math.round((item.distInfo?.distanceKm || 0.4) * 1000);

      // Cupos y demanda
      const isConfiguredSoldOut = item.enrolledCount >= item.capacity;
      const remainingSpots = isReserved
        ? Math.max(0, item.capacity - item.enrolledCount - 1)
        : Math.max(0, item.capacity - item.enrolledCount);
      const isSoldOut = isConfiguredSoldOut || (remainingSpots === 0 && !isReserved);

      return `
        <article class="clean-workshop-card bg-white border-2 border-black p-4 sm:p-5 shadow-[5px_5px_0px_0px_#111111] flex flex-col justify-between hover:shadow-[7px_7px_0px_0px_#E11D48] transition-all animate-fade-soft">
          <div>
            <!-- 1. FOTO LIMPIA (aspect-[16/10]) con número de ranking y etiqueta de cercanía coherente -->
            <div 
              class="relative aspect-[16/10] w-full bg-neutral-200 overflow-hidden border border-black mb-3 cursor-pointer btn-open-dedicated" 
              data-activity-id="${item.id}"
            >
              <img 
                src="${item.imageUrl}" 
                alt="${item.title}" 
                width="600"
                height="375"
                class="w-full h-full object-cover transition-transform duration-300 hover:scale-102"
                loading="lazy"
              />
              <div class="absolute top-2.5 left-2.5 bg-black text-white px-2.5 py-0.5 font-mono font-black text-xs border border-white shadow-[2px_2px_0px_0px_#E11D48]">
                #${rankNumber}
              </div>

              <!-- Etiqueta Dinámica de Cercanía Coherente -->
              <div class="absolute bottom-2.5 left-2.5 right-2.5">
                <span class="inline-block text-[11px] font-mono font-black px-2.5 py-1 border border-black shadow-[2px_2px_0px_0px_#111111] ${
                  item.walkingMinutes <= 15
                    ? 'bg-emerald-100 text-[#059669] border-[#059669]'
                    : 'bg-neutral-100 text-neutral-800'
                }">
                  ${
                    item.walkingMinutes <= 15
                      ? `✓ A ${item.walkingMinutes} MIN CAMINANDO (${distMeters}m)`
                      : `📍 A ${item.walkingMinutes} MIN DE TU SECTOR (${distMeters}m)`
                  }
                </span>
              </div>
            </div>

            <!-- 2. SUPRATÍTULO: PLAZA O LUGAR · DÍA Y HORA -->
            <div class="text-xs font-mono font-bold text-neutral-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5 truncate">
              <span class="text-[#E11D48] font-black">📍 ${item.locationName}</span>
              <span>·</span>
              <span class="text-neutral-700">🕒 ${item.dateLabel}</span>
            </div>

            <!-- 3. GRAN TÍTULO EDITORIAL EN NEGRITA (CLIC ABRE LA PÁGINA DEDICADA) -->
            <h3 
              class="text-lg sm:text-xl font-black uppercase tracking-tight text-neutral-900 leading-snug mb-3 hover:text-[#E11D48] transition-colors cursor-pointer btn-open-dedicated"
              data-activity-id="${item.id}"
            >
              ${item.title}
            </h3>
          </div>

          <!-- 4. PIE DE TARJETA EN 1 SOLA FILA: CUPOS A LA IZQUIERDA + BOTÓN LIMPIO A LA DERECHA -->
          <div class="pt-3 border-t-2 border-black flex items-center justify-between gap-3 mt-1">
            <div class="text-xs font-mono font-black ${
              isReserved ? 'text-[#059669]' : (isSoldOut ? 'text-[#E11D48]' : 'text-neutral-800')
            }">
              ${
                isReserved
                  ? '✓ CUPO RESERVADO'
                  : isSoldOut
                  ? '🔥 Cupos Agotados'
                  : `${remainingSpots} cupos disponibles`
              }
            </div>

            <button 
              type="button" 
              data-activity-id="${item.id}"
              class="btn-open-dedicated bg-black hover:bg-[#E11D48] text-white text-xs font-black uppercase tracking-wider px-3.5 py-2 transition-colors cursor-pointer shadow-[2px_2px_0px_0px_#111111] shrink-0"
            >
              ${isReserved ? 'Ver mi cupo →' : 'Ver actividad / Reservar →'}
            </button>
          </div>
        </article>
      `;
    })
    .join('');

  // Vincular eventos de apertura de Página Dedicada
  container.querySelectorAll('.btn-open-dedicated').forEach(el => {
    el.addEventListener('click', (e) => {
      const actId = e.currentTarget.getAttribute('data-activity-id');
      if (actId) {
        openDedicatedActivity(actId);
      }
    });
  });
}

/**
 * Abre la Página Dedicada de Actividad de manera fluida (selectedActivityId)
 */
export function openDedicatedActivity(activityId, pushState = true) {
  selectedActivityId = activityId;
  const heroCanvas = document.getElementById('hero-interactive-canvas');
  const rankingSection = document.getElementById('ranking-section');
  const dedicatedContainer = document.getElementById('dedicated-activity-container');
  const mobileBottomNav = document.getElementById('chispaplay-mobile-bottom-nav');

  if (heroCanvas) heroCanvas.classList.add('hidden');
  if (rankingSection) rankingSection.classList.add('hidden');
  if (mobileBottomNav) mobileBottomNav.classList.add('hidden');

  if (dedicatedContainer) {
    dedicatedContainer.classList.remove('hidden');
    renderDedicatedActivityPage(
      activityId,
      dedicatedContainer,
      () => closeDedicatedActivity(true),
      '← Volver al ranking'
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (pushState) {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('actividad', activityId);
      window.history.pushState({ activityId }, '', url.toString());
    } catch {
      // fallback
    }
  }
}

/**
 * Cierra la Página Dedicada y restaura la vista del ranking
 */
export function closeDedicatedActivity(pushState = true) {
  selectedActivityId = null;
  const heroCanvas = document.getElementById('hero-interactive-canvas');
  const rankingSection = document.getElementById('ranking-section');
  const dedicatedContainer = document.getElementById('dedicated-activity-container');
  const mobileBottomNav = document.getElementById('chispaplay-mobile-bottom-nav');

  if (dedicatedContainer) {
    dedicatedContainer.classList.add('hidden');
    dedicatedContainer.innerHTML = '';
  }
  if (heroCanvas) heroCanvas.classList.remove('hidden');
  if (selectedTimeframe && rankingSection) {
    rankingSection.classList.remove('hidden');
  }
  if (mobileBottomNav) {
    mobileBottomNav.classList.remove('hidden');
  }

  if (pushState) {
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('actividad');
      url.searchParams.delete('id');
      window.history.pushState({}, '', url.toString());
    } catch {
      // fallback
    }
  }

  if (rankingSection && !rankingSection.classList.contains('hidden')) {
    setTimeout(() => {
      rankingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// ==========================================================================
// BANNER: RADAR BARRIAL DE LOS JUEVES (WHATSAPP)
// ==========================================================================
function initRadarWhatsAppForm() {
  const form = document.getElementById('form-radar-whatsapp');
  const input = document.getElementById('input-radar-phone');
  const successMsg = document.getElementById('radar-success-message');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const phone = input.value.trim();
      if (!phone) return;

      const sector = selectedSector ? selectedSector.name : 'Plaza Principal';
      const commune = selectedComuna === 'maipu' ? 'Maipú' : 'Valparaíso';

      subscribeRadarWhatsApp(phone, sector, commune);

      if (successMsg) {
        successMsg.classList.remove('hidden');
      }
      form.reset();

      setTimeout(() => {
        if (successMsg) successMsg.classList.add('hidden');
      }, 7000);
    });
  }
}

// ==========================================================================
// MODAL: REPORTAR DESPERFECTO EN PLAZA
// ==========================================================================
function initParkDefectModal() {
  const modal = document.getElementById('modal-park-defect');
  const closeBtn = document.getElementById('btn-close-defect-modal');
  const form = document.getElementById('form-report-defect');

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
  }

  if (form && modal && !form.dataset.defectBound) {
    form.dataset.defectBound = 'true';
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const issueType = document.getElementById('select-defect-type')?.value || 'Desperfecto en Plaza';
      const detail = document.getElementById('textarea-defect-detail')?.value.trim() || '';

      const targetId = currentReportingActivity?.id || 'plaza-general';
      const targetLoc = currentReportingActivity?.locationName || (selectedSector ? selectedSector.name : 'Plaza Comunitaria');

      reportParkDefect(targetId, issueType, detail);
      showToast('REPORTE REGISTRADO', `Se envió la solicitud para ${targetLoc}.`, 'success');

      form.reset();
      modal.classList.add('hidden');
      currentReportingActivity = null;
    });
  }
}

function openParkDefectModal(activityId, locationName) {
  const modal = document.getElementById('modal-park-defect');
  const subtitle = document.getElementById('defect-modal-subtitle');
  if (!modal) return;

  currentReportingActivity = { id: activityId, locationName };
  if (subtitle) {
    subtitle.textContent = `Lugar de terreno: ${locationName}`;
  }

  modal.classList.remove('hidden');
}
