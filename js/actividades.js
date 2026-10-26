/* ==========================================================================
   ARCHIVO: js/actividades.js
   Lógica Modular de Cartelera Diaria & Explorador de Actividades
   Modo Póster vs. Modo Diario Cultural (Agenda The New Yorker / Time Out)
   Página Dedicada de Actividad (Sin Acordeones)
   ========================================================================== */

import { COMMUNES_DATA } from './data.js';
import {
  getActiveCommune,
  getAllActivities,
  calculateDistanceAndWalkingTime,
  isActivityReserved,
  isUserOnWaitlist,
  logAction,
  startRealTimeGps,
  getRealTimeGps
} from './state.js';
import { renderNavbar } from './navbar.js';
import { renderBottomNav } from './bottomNav.js';
import { renderDedicatedActivityPage } from './activityPage.js';

let searchQuery = '';
let selectedCategory = 'todas';
let filterNeuroFriendly = false;
let filterUniversalAccess = false;
let currentViewMode = 'poster'; // 'poster' | 'diario'
let selectedActivityId = null;

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar('actividades');
  setupSearchAndFilters();
  setupViewModeToggle();
  renderDailyFeed();

  // Botón GPS en Tiempo Real
  const gpsBtn = document.getElementById('btn-realtime-gps-actividades');
  if (gpsBtn) {
    gpsBtn.addEventListener('click', () => {
      gpsBtn.innerHTML = '<span>🛰️ Buscando señal...</span>';
      startRealTimeGps(
        (pos) => {
          gpsBtn.className = 'inline-flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-bold uppercase tracking-wider bg-emerald-600 text-white border-2 border-black shadow-[3px_3px_0px_0px_#111111] cursor-pointer transition-colors';
          gpsBtn.innerHTML = '<span class="w-2 h-2 rounded-full bg-white animate-ping"></span><span>🛰️ GPS Activo</span>';
          renderDailyFeed();
        },
        (err) => {
          alert('No se pudo obtener el GPS: ' + (err.message || 'Permiso denegado'));
          gpsBtn.className = 'inline-flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-bold uppercase tracking-wider bg-white border-2 border-black hover:bg-neutral-900 hover:text-white shadow-[3px_3px_0px_0px_#111111] cursor-pointer transition-colors';
          gpsBtn.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span><span>🛰️ GPS En Vivo</span>';
        }
      );
    });
  }

  window.addEventListener('chispaplay:gps-updated', () => {
    renderDailyFeed();
  });

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

  // Escuchar eventos globales
  window.addEventListener('chispaplay:commune-changed', () => {
    renderDailyFeed();
  });

  window.addEventListener('chispaplay:ref-changed', () => {
    renderDailyFeed();
  });

  window.addEventListener('chispaplay:reservations-changed', () => {
    renderDailyFeed();
    if (selectedActivityId) {
      const dedicatedContainer = document.getElementById('dedicated-activity-container');
      if (dedicatedContainer) {
        renderDedicatedActivityPage(selectedActivityId, dedicatedContainer, () => closeDedicatedActivity(), '← Volver a la cartelera');
      }
    }
  });

  window.addEventListener('chispaplay:activities-updated', () => {
    renderDailyFeed();
  });
});

function setupViewModeToggle() {
  const btnPoster = document.getElementById('btn-view-poster');
  const btnDiario = document.getElementById('btn-view-diario');

  if (btnPoster && btnDiario) {
    btnPoster.addEventListener('click', () => {
      if (currentViewMode === 'poster') return;
      currentViewMode = 'poster';
      updateToggleStyles(btnPoster, btnDiario);
      logAction('CAMBIO_VISTA', 'Vista Póster Activada', 'Cartelera');
      renderDailyFeed();
    });

    btnDiario.addEventListener('click', () => {
      if (currentViewMode === 'diario') return;
      currentViewMode = 'diario';
      updateToggleStyles(btnDiario, btnPoster);
      logAction('CAMBIO_VISTA', 'Vista Diario Cultural Activada', 'Cartelera');
      renderDailyFeed();
    });
  }
}

function updateToggleStyles(activeBtn, inactiveBtn) {
  activeBtn.className = 'btn-view-mode px-3 sm:px-4 py-2 text-xs font-mono font-black uppercase tracking-wider bg-black text-white cursor-pointer transition-colors';
  inactiveBtn.className = 'btn-view-mode px-3 sm:px-4 py-2 text-xs font-mono font-black uppercase tracking-wider bg-white text-neutral-800 hover:bg-neutral-100 cursor-pointer transition-colors';
}

function setupSearchAndFilters() {
  const searchInput = document.getElementById('input-search-activities');
  const clearBtn = document.getElementById('btn-clear-search');
  const catButtons = document.querySelectorAll('.btn-filter-category');
  const checkNeuro = document.getElementById('check-neurofriendly');
  const checkUniversal = document.getElementById('check-universal');

  if (searchInput) {
    let timeoutId = null;
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();

      // ACCESO SECRETO AL MODO CEO MEDIANTE BÚSQUEDA 'ceo2026'
      if (searchQuery === 'ceo2026') {
        window.location.href = 'ceo.html';
        return;
      }

      if (clearBtn) {
        clearBtn.classList.toggle('hidden', searchQuery.length === 0);
      }

      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (searchQuery.length > 2) {
          logAction('BUSQUEDA_CARTELERA', 'Consulta en Buscador', `Buscó: "${searchQuery}"`);
        }
        renderDailyFeed();
      }, 250);
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        searchQuery = '';
        clearBtn.classList.add('hidden');
        renderDailyFeed();
      }
    });
  }

  catButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      selectedCategory = e.currentTarget.getAttribute('data-cat');
      
      catButtons.forEach(b => {
        b.className = 'btn-filter-category px-3 py-1.5 text-xs font-bold uppercase tracking-wider border border-neutral-300 bg-white text-neutral-700 hover:border-black cursor-pointer';
      });

      e.currentTarget.className = 'btn-filter-category px-3 py-1.5 text-xs font-black uppercase tracking-wider border border-black bg-black text-white cursor-pointer';

      logAction('FILTRO_CATEGORIA', 'Filtro por Categoría', `Categoría: ${selectedCategory}`);
      renderDailyFeed();
    });
  });

  if (checkNeuro) {
    checkNeuro.addEventListener('change', (e) => {
      filterNeuroFriendly = e.target.checked;
      renderDailyFeed();
    });
  }

  if (checkUniversal) {
    checkUniversal.addEventListener('change', (e) => {
      filterUniversalAccess = e.target.checked;
      renderDailyFeed();
    });
  }
}

function renderDailyFeed() {
  const communeKey = getActiveCommune();
  const communeObj = COMMUNES_DATA[communeKey];
  const allActivities = getAllActivities();

  // Actualizar badge comuna
  const communeBadge = document.getElementById('actividades-commune-badge');
  if (communeBadge) {
    communeBadge.textContent = `COMUNA: ${communeObj.name.toUpperCase()}`;
  }

  // Filtrado general por comuna
  let filtered = allActivities.filter(a => a.commune === communeKey);

  // Filtro de búsqueda
  if (searchQuery) {
    filtered = filtered.filter(a => {
      const haystack = `${a.title} ${a.summary} ${a.locationName} ${a.organizerName} ${a.instructorName} ${a.category}`.toLowerCase();
      return haystack.includes(searchQuery);
    });
  }

  // Filtro de categoría
  if (selectedCategory !== 'todas') {
    filtered = filtered.filter(a => {
      const cat = (a.category + ' ' + (a.categoryTag || '')).toLowerCase();
      if (selectedCategory === 'deporte') return cat.includes('deporte') || cat.includes('skate') || cat.includes('calistenia') || cat.includes('náutico') || cat.includes('patinaje') || cat.includes('fútbol');
      if (selectedCategory === 'ciencia') return cat.includes('ciencia') || cat.includes('astronomía') || cat.includes('robótica') || cat.includes('stem') || cat.includes('física') || cat.includes('óptica');
      if (selectedCategory === 'arte') return cat.includes('arte') || cat.includes('música') || cat.includes('circo') || cat.includes('teatro') || cat.includes('acuarela') || cat.includes('mosaico') || cat.includes('muralismo');
      if (selectedCategory === 'naturaleza') return cat.includes('huerto') || cat.includes('naturaleza') || cat.includes('reforestación') || cat.includes('ecología');
      return true;
    });
  }

  // Filtros de inclusión
  if (filterNeuroFriendly) {
    filtered = filtered.filter(a => a.isNeuroFriendly);
  }
  if (filterUniversalAccess) {
    filtered = filtered.filter(a => a.isWheelchairAccessible);
  }

  // Actualizar contador
  const countDisplay = document.getElementById('actividades-count-display');
  if (countDisplay) {
    countDisplay.textContent = `${filtered.length} Actividades`;
  }

  // Grupos por temporalidad
  const itemsHoy = filtered.filter(a => a.timeframe === 'hoy');
  const itemsSemana = filtered.filter(a => a.timeframe === 'semana');
  const itemsMes = filtered.filter(a => a.timeframe === 'mes');

  renderGroupList('list-hoy', 'group-hoy-container', itemsHoy, 'No hay actividades para hoy con estos filtros.');
  renderGroupList('list-semana', 'group-semana-container', itemsSemana, 'No hay actividades para esta semana con estos filtros.');
  renderGroupList('list-mes', 'group-mes-container', itemsMes, 'No hay convocatorias este mes con estos filtros.');

  bindOpenDedicatedEvents();
}

function renderGroupList(containerId, parentGroupId, items, emptyMessage) {
  const container = document.getElementById(containerId);
  const parent = document.getElementById(parentGroupId);
  if (!container || !parent) return;

  if (items.length === 0) {
    container.className = 'grid grid-cols-1 gap-4';
    container.innerHTML = `
      <div class="col-span-full p-6 border border-dashed border-neutral-300 text-xs font-mono text-neutral-500 text-center bg-white">
        ${emptyMessage}
      </div>
    `;
    return;
  }

  // VISTA PÓSTER: Grilla con fotografías limpias y 4 datos
  if (currentViewMode === 'poster') {
    container.className = 'grid grid-cols-1 md:grid-cols-2 gap-6';
    container.innerHTML = items
      .map(item => {
        const distInfo = calculateDistanceAndWalkingTime(item.coordinates);
        const isReserved = isActivityReserved(item.id);
        const distMeters = distInfo.distanceMeters || Math.round(distInfo.distanceKm * 1000);

        const isConfiguredSoldOut = item.enrolledCount >= item.capacity;
        const spotsLeft = isReserved
          ? Math.max(0, item.capacity - item.enrolledCount - 1)
          : Math.max(0, item.capacity - item.enrolledCount);
        const isSoldOut = isConfiguredSoldOut || (spotsLeft === 0 && !isReserved);

        return `
          <article class="clean-workshop-card bg-white border-2 border-black p-4 sm:p-5 shadow-[5px_5px_0px_0px_#111111] flex flex-col justify-between hover:shadow-[7px_7px_0px_0px_#E11D48] transition-all">
            <div>
              <!-- 1. FOTO LIMPIA (aspect-[16/10]) con categoría y etiqueta de cercanía coherente -->
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
                  ${item.categoryTag || item.category}
                </div>

                <!-- Etiqueta Dinámica de Cercanía Coherente -->
                <div class="absolute bottom-2.5 left-2.5 right-2.5">
                  <span class="inline-block text-[11px] font-mono font-black px-2.5 py-1 border border-black shadow-[2px_2px_0px_0px_#111111] ${
                    distInfo.walkingMinutes <= 15
                      ? 'bg-emerald-100 text-[#059669] border-[#059669]'
                      : 'bg-neutral-100 text-neutral-800'
                  }">
                    ${
                      distInfo.walkingMinutes <= 15
                        ? `✓ A ${distInfo.walkingMinutes} MIN CAMINANDO (${distMeters}m)`
                        : `📍 A ${distInfo.walkingMinutes} MIN DE TU SECTOR (${distMeters}m)`
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

              <!-- 3. GRAN TÍTULO EDITORIAL EN NEGRITA -->
              <h3 
                class="text-lg sm:text-xl font-black uppercase tracking-tight text-neutral-900 leading-snug mb-3 hover:text-[#E11D48] transition-colors cursor-pointer btn-open-dedicated"
                data-activity-id="${item.id}"
              >
                ${item.title}
              </h3>
            </div>

            <!-- 4. PIE DE TARJETA EN 1 SOLA FILA -->
            <div class="pt-3 border-t-2 border-black flex items-center justify-between gap-3 mt-1">
              <div class="text-xs font-mono font-black ${
                isReserved ? 'text-[#059669]' : (isSoldOut ? 'text-[#E11D48]' : 'text-neutral-800')
              }">
                ${
                  isReserved
                    ? '✓ CUPO RESERVADO'
                    : isSoldOut
                    ? '🔥 Cupos Agotados'
                    : `${spotsLeft} cupos disponibles`
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
  } 
  // VISTA DIARIO CULTURAL: Agenda compacta estilo The New Yorker / Time Out sin fotos
  else {
    container.className = 'border-t-2 border-b-2 border-black bg-white divide-y divide-neutral-200 shadow-[4px_4px_0px_0px_#111111] mb-6';
    container.innerHTML = items
      .map(item => {
        const distInfo = calculateDistanceAndWalkingTime(item.coordinates);
        const isReserved = isActivityReserved(item.id);
        const distMeters = distInfo.distanceMeters || Math.round(distInfo.distanceKm * 1000);

        const isConfiguredSoldOut = item.enrolledCount >= item.capacity;
        const spotsLeft = isReserved
          ? Math.max(0, item.capacity - item.enrolledCount - 1)
          : Math.max(0, item.capacity - item.enrolledCount);
        const isSoldOut = isConfiguredSoldOut || (spotsLeft === 0 && !isReserved);
        const timeOnly = item.dateLabel.includes('·') ? item.dateLabel.split('·')[1].trim() : item.dateLabel;
        const dayOnly = item.dateLabel.includes('·') ? item.dateLabel.split('·')[0].trim() : 'Hoy';

        return `
          <div class="agenda-item border-b border-neutral-200 py-4 px-3 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-50 transition-colors">
            
            <!-- Col 1: Hora en Grande (17:30) + Día -->
            <div class="sm:w-36 shrink-0 flex sm:flex-col items-center sm:items-start justify-between gap-0.5">
              <span class="text-xl sm:text-2xl font-black font-mono text-neutral-900 tracking-tight leading-none">
                ${timeOnly.replace(/hrs/i, '').trim()}
              </span>
              <span class="text-[10px] font-mono uppercase font-bold text-neutral-500">
                ${dayOnly}
              </span>
            </div>

            <!-- Col 2: Badge de Minutos (4 min) -->
            <div class="sm:w-32 shrink-0">
              <span class="inline-block text-xs font-mono font-black px-2 py-0.5 border border-black shadow-[1px_1px_0px_0px_#111111] ${
                distInfo.walkingMinutes <= 15 ? 'bg-emerald-100 text-[#059669]' : 'bg-neutral-100 text-neutral-800'
              }">
                ${distInfo.walkingMinutes} min a pie
              </span>
            </div>

            <!-- Col 3: Título en negrita + Plaza + Organización + Sellos compactos -->
            <div class="flex-1 min-w-0">
              <h3 
                class="text-sm sm:text-base font-black uppercase tracking-tight text-neutral-900 hover:text-[#E11D48] cursor-pointer btn-open-dedicated truncate"
                data-activity-id="${item.id}"
              >
                ${item.title}
              </h3>
              <div class="text-xs font-mono text-neutral-600 flex items-center gap-2 mt-0.5 flex-wrap">
                <span class="text-[#E11D48] font-bold">📍 ${item.locationName}</span>
                <span>·</span>
                <span class="text-neutral-700">${item.organizerName}</span>
                ${item.isNeuroFriendly ? '<span class="bg-purple-100 text-purple-900 px-1.5 py-0.5 text-[10px] font-bold border border-purple-300">🧠 Neuro-Friendly</span>' : ''}
                ${item.isWheelchairAccessible ? '<span class="bg-neutral-100 text-neutral-800 px-1.5 py-0.5 text-[10px] font-bold border border-neutral-300">♿ Accesible</span>' : ''}
              </div>
            </div>

            <!-- Col 4: Estado de cupos + Botón "Abrir →" -->
            <div class="sm:w-44 shrink-0 flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-200">
              <span class="text-xs font-mono font-black ${isReserved ? 'text-[#059669]' : (isSoldOut ? 'text-[#E11D48]' : 'text-neutral-800')}">
                ${isReserved ? '✓ Reservado' : (isSoldOut ? '🔥 Agotado' : `${spotsLeft} cupos`)}
              </span>
              <button 
                type="button" 
                data-activity-id="${item.id}"
                class="btn-open-dedicated bg-black hover:bg-[#E11D48] text-white text-xs font-black uppercase px-3.5 py-1.5 transition-colors cursor-pointer shadow-[2px_2px_0px_0px_#111111]"
              >
                Abrir →
              </button>
            </div>

          </div>
        `;
      })
      .join('');
  }
}

function bindOpenDedicatedEvents() {
  document.querySelectorAll('.btn-open-dedicated').forEach(el => {
    el.addEventListener('click', (e) => {
      const actId = e.currentTarget.getAttribute('data-activity-id');
      if (actId) {
        openDedicatedActivity(actId);
      }
    });
  });
}

/**
 * Abre la Página Dedicada de Actividad dentro de la Cartelera
 */
export function openDedicatedActivity(activityId, pushState = true) {
  selectedActivityId = activityId;
  const mainFeed = document.getElementById('actividades-main-content');
  const dedicatedContainer = document.getElementById('dedicated-activity-container');
  const mobileBottomNav = document.getElementById('chispaplay-mobile-bottom-nav');

  if (mainFeed) mainFeed.classList.add('hidden');
  if (mobileBottomNav) mobileBottomNav.classList.add('hidden');

  if (dedicatedContainer) {
    dedicatedContainer.classList.remove('hidden');
    renderDedicatedActivityPage(
      activityId,
      dedicatedContainer,
      () => closeDedicatedActivity(true),
      '← Volver a la cartelera'
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
 * Cierra la Página Dedicada y restaura la vista de la Cartelera
 */
export function closeDedicatedActivity(pushState = true) {
  selectedActivityId = null;
  const mainFeed = document.getElementById('actividades-main-content');
  const dedicatedContainer = document.getElementById('dedicated-activity-container');
  const mobileBottomNav = document.getElementById('chispaplay-mobile-bottom-nav');

  if (dedicatedContainer) {
    dedicatedContainer.classList.add('hidden');
    dedicatedContainer.innerHTML = '';
  }
  if (mainFeed) mainFeed.classList.remove('hidden');
  if (mobileBottomNav) mobileBottomNav.classList.remove('hidden');

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

  window.scrollTo({ top: 0, behavior: 'smooth' });
}
