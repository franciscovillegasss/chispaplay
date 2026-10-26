/* ==========================================================================
   ARCHIVO: js/coordinador.js
   Lógica Modular del Modo Coordinador & Auditoría CEO
   ========================================================================== */

import { COMMUNES_DATA } from './data.js';
import {
  getActiveCommune,
  getCoordinators,
  getActiveCoordinator,
  setActiveCoordinator,
  registerCoordinator,
  getAllActivities,
  addCustomActivity,
  deleteCustomActivity,
  getActionLogs,
  clearActionLogs,
  logAction,
  getActivityViewsMap,
  getWaitlistCount,
  getReservedActivityIds,
  getLiveNotice,
  setLiveNotice
} from './state.js';
import { renderNavbar } from './navbar.js';
import { openScraperModal } from './scraper.js';

let activeTab = 'scan-qr';

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar('coordinador');
  setupCoordinatorSelector();
  setupTabNavigation();
  setupPublishForm();
  setupQrScanner();
  setupRegistrationModal();
  renderMyActivitiesList();
  renderAuditLogs();

  const coordBtnScraper = document.getElementById('coord-btn-scraper');
  if (coordBtnScraper) {
    coordBtnScraper.addEventListener('click', () => {
      openScraperModal(() => {
        renderMyActivitiesList();
      });
    });
  }

  window.addEventListener('chispaplay:new-log', () => {
    if (activeTab === 'audit') {
      renderAuditLogs();
    }
  });

  window.addEventListener('chispaplay:activities-updated', () => {
    renderMyActivitiesList();
    if (activeTab === 'analytics') {
      renderAnalyticsView();
    }
  });

  window.addEventListener('chispaplay:waitlist-updated', () => {
    if (activeTab === 'analytics') {
      renderAnalyticsView();
    }
  });

  window.addEventListener('chispaplay:reservations-changed', () => {
    if (activeTab === 'analytics') {
      renderAnalyticsView();
    }
  });
});

function setupCoordinatorSelector() {
  const coordSelect = document.getElementById('select-active-coord');
  const coordName = document.getElementById('active-coord-name');
  const coordDetails = document.getElementById('active-coord-details');

  const coords = getCoordinators();
  const active = getActiveCoordinator();

  if (coordSelect) {
    coordSelect.innerHTML = coords
      .map(c => `
        <option value="${c.id}" ${active && active.id === c.id ? 'selected' : ''}>
          ${c.orgName} (${c.commune === 'maipu' ? 'Maipú' : 'Valparaíso'})
        </option>
      `)
      .join('');

    coordSelect.addEventListener('change', (e) => {
      setActiveCoordinator(e.target.value);
      setupCoordinatorSelector();
    });
  }

  if (active) {
    if (coordName) coordName.textContent = active.orgName;
    if (coordDetails) {
      coordDetails.textContent = `${active.rutOrPj} · Monitor: ${active.monitorName} · WA: ${active.whatsapp}`;
    }
  }
}

function setupTabNavigation() {
  const btnScanQr = document.getElementById('tab-btn-scan-qr');
  const btnPublish = document.getElementById('tab-btn-publish');
  const btnMyActivities = document.getElementById('tab-btn-my-activities');
  const btnAnalytics = document.getElementById('tab-btn-analytics');
  const btnAudit = document.getElementById('tab-btn-audit');

  const panelScanQr = document.getElementById('panel-scan-qr');
  const panelPublish = document.getElementById('panel-publish');
  const panelMy = document.getElementById('panel-my-activities');
  const panelAnalytics = document.getElementById('panel-analytics');
  const panelAudit = document.getElementById('panel-audit');

  const tabs = [
    { key: 'scan-qr', btn: btnScanQr, panel: panelScanQr },
    { key: 'publish', btn: btnPublish, panel: panelPublish },
    { key: 'my-activities', btn: btnMyActivities, panel: panelMy },
    { key: 'analytics', btn: btnAnalytics, panel: panelAnalytics },
    { key: 'audit', btn: btnAudit, panel: panelAudit }
  ];

  tabs.forEach(tab => {
    if (!tab.btn) return;
    tab.btn.addEventListener('click', () => {
      activeTab = tab.key;

      tabs.forEach(t => {
        if (!t.btn || !t.panel) return;
        if (t.key === activeTab) {
          t.btn.className = 'coord-tab-btn py-3 px-4 sm:px-5 text-xs sm:text-sm font-black uppercase tracking-wider border-2 border-black border-b-0 bg-black text-white cursor-pointer shrink-0';
          t.panel.classList.remove('hidden');
        } else {
          t.btn.className = 'coord-tab-btn py-3 px-4 sm:px-5 text-xs sm:text-sm font-black uppercase tracking-wider border-2 border-transparent border-b-0 hover:border-black bg-white text-neutral-700 cursor-pointer shrink-0';
          t.panel.classList.add('hidden');
        }
      });

      if (activeTab === 'audit') {
        renderAuditLogs();
      } else if (activeTab === 'my-activities') {
        renderMyActivitiesList();
      } else if (activeTab === 'analytics') {
        renderAnalyticsView();
      }
    });
  });

  // Setup DIDECO export button
  const exportBtn = document.getElementById('btn-export-dideco');
  const feedback = document.getElementById('dideco-export-feedback');
  const printBtn = document.getElementById('btn-print-report');

  if (exportBtn && feedback) {
    exportBtn.addEventListener('click', () => {
      feedback.classList.remove('hidden');
      logAction('EXPORTACION_B2G_DIDECO', 'Reporte DIDECO Generado', 'Descarga de datos de demanda insatisfecha para asignación presupuestaria municipal.');
    });
  }

  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }
}

function setupPublishForm() {
  const form = document.getElementById('form-publish-activity');
  const autofillBtn = document.getElementById('btn-autofill-activity');

  if (autofillBtn) {
    autofillBtn.addEventListener('click', () => {
      const active = getActiveCoordinator();
      const commune = active ? active.commune : getActiveCommune();
      
      const testActivities = {
        maipu: {
          title: 'Taller Comunitario de Robótica Solar & Huerto Automatizado',
          location: 'Parque Tres Poniente',
          timeframe: 'hoy',
          date: 'Hoy · 17:00 a 19:00 hrs',
          category: 'Ciencia & Mini-Robótica',
          capacity: 25,
          age: 'Familias, niñas y niños (7 a 15 años)',
          summary: 'Construcción en vivo de pequeños kits solares con celdas fotovoltaicas para regar almácigos vecinales en el parque.',
          image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=900&auto=format&fit=crop&q=80'
        },
        valparaiso: {
          title: 'Ensamble de Cajón Peruano & Canto Porteño en las Gradas',
          location: 'Paseo Yugoslavo (Cerro Alegre)',
          timeframe: 'hoy',
          date: 'Hoy · 17:30 a 19:00 hrs',
          category: 'Cultura & Música',
          capacity: 30,
          age: 'Vecinos y jóvenes de todas las edades',
          summary: 'Práctica rítmica abierta sobre la madera del mirador frente a la bahía de Valparaíso. Se facilitan instrumentos.',
          image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=900&auto=format&fit=crop&q=80'
        }
      };

      const test = testActivities[commune] || testActivities.maipu;

      document.getElementById('pub-title').value = test.title;
      document.getElementById('pub-commune').value = commune;
      document.getElementById('pub-category').value = test.category;
      document.getElementById('pub-timeframe').value = test.timeframe;
      document.getElementById('pub-date').value = test.date;
      document.getElementById('pub-location').value = test.location;
      document.getElementById('pub-capacity').value = test.capacity;
      document.getElementById('pub-age').value = test.age;
      document.getElementById('pub-summary').value = test.summary;
      document.getElementById('pub-image').value = test.image;
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const activeCoord = getActiveCoordinator();
      const commune = document.getElementById('pub-commune').value;
      const title = document.getElementById('pub-title').value.trim();
      const category = document.getElementById('pub-category').value;
      const timeframe = document.getElementById('pub-timeframe').value;
      const dateLabel = document.getElementById('pub-date').value.trim();
      const locationName = document.getElementById('pub-location').value.trim();
      const capacity = parseInt(document.getElementById('pub-capacity').value, 10) || 20;
      const ageGroup = document.getElementById('pub-age').value.trim();
      const summary = document.getElementById('pub-summary').value.trim();
      const imageUrl = document.getElementById('pub-image').value.trim() || 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=900&auto=format&fit=crop&q=80';
      const isNeuroFriendly = document.getElementById('pub-check-neuro').checked;
      const isWheelchairAccessible = document.getElementById('pub-check-universal').checked;

      // Obtener coordenadas aproximadas del centro de la comuna
      const coords = COMMUNES_DATA[commune].centerReference.coordinates;

      const rawAddress = document.getElementById('pub-address')?.value.trim();
      const address = rawAddress || ${locationName}, ;
      const newActivity = addCustomActivity({
        commune,
        title,
        category,
        categoryTag: category.toUpperCase(),
        timeframe,
        dateLabel,
        locationName,
        address,
        coordinates: coords,
        organizerName: activeCoord ? activeCoord.orgName : 'Organización Barrial',
        organizerHandle: '@barrio_activo',
        legalEntityNumber: activeCoord ? activeCoord.rutOrPj : 'PJ N° 999',
        instructorName: activeCoord ? activeCoord.monitorName : 'Monitor de Turno',
        instructorWhatsapp: activeCoord ? activeCoord.whatsapp : '+56 9 7891 0000',
        capacity,
        ageGroup,
        summary,
        imageUrl,
        isFree: true,
        isInclusive: true,
        isNeuroFriendly,
        isWheelchairAccessible
      });

      if (newActivity) {
        alert(`¡Actividad publicada con éxito!\n\n"${title}" ya está visible en el Ranking y Cartelera de ${commune === 'maipu' ? 'Maipú' : 'Valparaíso'}.`);
        form.reset();
        
        // Cambiar a la pestaña de mis actividades
        const btnMyActivities = document.getElementById('tab-btn-my-activities');
        if (btnMyActivities) btnMyActivities.click();
      }
    });
  }
}

function renderMyActivitiesList() {
  const container = document.getElementById('coord-activities-list');
  const countLabel = document.getElementById('coord-activities-count');
  if (!container) return;

  const all = getAllActivities();
  const customOnly = all.filter(a => a.isCustom);

  if (countLabel) {
    countLabel.textContent = `${customOnly.length} actividades personalizadas`;
  }

  if (customOnly.length === 0) {
    container.innerHTML = `
      <div class="p-8 border-2 border-dashed border-neutral-300 text-center">
        <p class="font-bold text-sm mb-1">Aún no has publicado actividades personalizadas.</p>
        <p class="text-xs text-neutral-500 mb-4">Usa la pestaña "+ Publicar Nueva Actividad" para emitir convocatorias en tiempo real.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = customOnly
    .map(a => {
      const notice = getLiveNotice(a.id);
      return `
      <div class="border-2 border-black p-4 bg-neutral-50 flex flex-col gap-3">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div class="flex items-center gap-2 text-xs font-mono mb-1">
              <span class="bg-[#E11D48] text-white px-1.5 py-0.5 font-bold uppercase">${a.commune.toUpperCase()}</span>
              <span class="font-bold text-neutral-600">${a.timeframe.toUpperCase()} · ${a.dateLabel}</span>
            </div>
            <h3 class="text-base font-black uppercase text-neutral-900">${a.title}</h3>
            <div class="text-xs text-neutral-600">
              📍 ${a.locationName} · ${a.capacity} cupos totales · Organiza: ${a.organizerName}
            </div>
          </div>

          <div class="flex items-center gap-2">
            <a href="actividad.html?id=${a.id}" class="text-xs font-black uppercase text-black hover:text-[#E11D48] underline">
              Ver Reportaje Dedicado →
            </a>
            <button 
              type="button" 
              data-delete-id="${a.id}"
              class="btn-delete-custom bg-black text-white hover:bg-red-600 px-3 py-1.5 text-xs font-bold uppercase transition-colors cursor-pointer"
            >
              Eliminar
            </button>
          </div>
        </div>

        <!-- Panel de Aviso de Última Hora del Monitor -->
        <div class="pt-2 border-t border-neutral-300 bg-white p-2.5 border text-xs">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div class="flex items-center gap-1.5 font-mono font-bold">
              <span>🔔</span>
              <span>ESTADO EN VIVO:</span>
              <span class="bg-neutral-900 text-white px-2 py-0.5 text-[10px] uppercase">${notice.badgeText}</span>
              <span class="text-neutral-500 font-normal">"${notice.text}"</span>
            </div>
            <button 
              type="button" 
              data-update-notice-id="${a.id}"
              class="btn-trigger-update-notice bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-400 px-2 py-1 text-[11px] font-mono font-bold uppercase cursor-pointer"
            >
              ✏️ Cambiar Estado en Vivo
            </button>
          </div>
        </div>
      </div>
    `;
    })
    .join('');

  document.querySelectorAll('.btn-delete-custom').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-delete-id');
      if (confirm('¿Estás seguro de eliminar esta actividad de la cartelera?')) {
        deleteCustomActivity(id);
        renderMyActivitiesList();
      }
    });
  });

  document.querySelectorAll('.btn-trigger-update-notice').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-update-notice-id');
      const opt = prompt(
        'Selecciona el nuevo estado para este taller:\n' +
        '1. 100% Confirmado en Cancha Central\n' +
        '2. Traslado por Clima / Sol a Sombra\n' +
        '3. Cupos Liberados Express de Última Hora\n\n' +
        'Ingresa el número (1, 2 o 3):',
        '1'
      );

      let status = 'confirmed';
      let badge = '100% CONFIRMADO';
      let defText = 'Cancha y equipamiento verificados por el monitor.';

      if (opt === '2') {
        status = 'relocated';
        badge = 'TRASLADO POR CLIMA';
        defText = 'Taller trasladado bajo los árboles del costado poniente por sombra.';
      } else if (opt === '3') {
        status = 'express';
        badge = 'CUPOS LIBERADOS';
        defText = 'Se liberaron 3 cupos express por inasistencia avisada. Acércate a la plaza.';
      }

      const customText = prompt('Ingresa el mensaje para los vecinos:', defText);
      if (customText !== null) {
        setLiveNotice(id, {
          status,
          badgeText: badge,
          text: customText.trim() || defText
        });
        renderMyActivitiesList();
        alert('✓ Aviso de última hora actualizado y visible en la portada y cartelera.');
      }
    });
  });
}

function renderAuditLogs() {
  const tableBody = document.getElementById('audit-table-body');
  const clearBtn = document.getElementById('btn-clear-logs');
  if (!tableBody) return;

  const logs = getActionLogs();

  if (logs.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="p-6 text-center text-neutral-400 font-mono">
          No hay eventos registrados en este momento. Las acciones aparecerán automáticamente.
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = logs
    .map(log => `
      <tr class="hover:bg-neutral-50 border-b border-neutral-200">
        <td class="p-2.5 font-bold text-neutral-800">${log.timestamp}</td>
        <td class="p-2.5 font-bold text-[#E11D48]">${log.token}</td>
        <td class="p-2.5 text-neutral-900 font-medium">${log.userName}</td>
        <td class="p-2.5 text-neutral-600">${log.ip}</td>
        <td class="p-2.5">
          <span class="bg-neutral-200 text-neutral-800 px-1.5 py-0.5 text-[10px] font-bold">
            ${log.eventType}
          </span>
        </td>
        <td class="p-2.5 text-neutral-700">${log.details}</td>
      </tr>
    `)
    .join('');

  if (clearBtn) {
    clearBtn.onclick = () => {
      clearActionLogs();
      renderAuditLogs();
    };
  }
}

function setupRegistrationModal() {
  const modal = document.getElementById('modal-register-coord');
  const btnOpen = document.getElementById('btn-open-register-coord');
  const btnClose = document.getElementById('btn-close-coord-modal');
  const form = document.getElementById('form-new-coordinator');

  if (btnOpen && modal) {
    btnOpen.addEventListener('click', () => modal.classList.remove('hidden'));
  }
  if (btnClose && modal) {
    btnClose.addEventListener('click', () => modal.classList.add('hidden'));
  }

  if (form && modal) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const orgName = document.getElementById('coord-reg-name').value.trim();
      const rutOrPj = document.getElementById('coord-reg-rut').value.trim();
      const monitorName = document.getElementById('coord-reg-monitor').value.trim();
      const whatsapp = document.getElementById('coord-reg-whatsapp').value.trim();
      const commune = document.getElementById('coord-reg-commune').value;

      registerCoordinator({
        orgName,
        rutOrPj,
        monitorName,
        whatsapp,
        commune
      });

      alert(`¡Organización "${orgName}" registrada exitosamente!`);
      modal.classList.add('hidden');
      form.reset();
      setupCoordinatorSelector();
    });
  }
}

function renderAnalyticsView() {
  const allActivities = getAllActivities();
  const viewsMap = getActivityViewsMap();
  const reservedIds = getReservedActivityIds();

  // Baseline simulated views so each workshop has realistic counts, plus live real-time views added!
  const baseViews = {
    'ws-mai-1': 382,
    'ws-mai-2': 495, // Sold out - high views
    'ws-mai-3': 210,
    'ws-mai-4': 240,
    'ws-mai-5': 190,
    'ws-mai-6': 260,
    'ws-mai-7': 175,
    'ws-val-1': 310,
    'ws-val-2': 460, // Sold out - high views
    'ws-val-3': 180,
    'ws-val-4': 225,
    'ws-val-5': 195,
    'ws-val-6': 270,
    'ws-val-7': 160
  };

  // Compile detailed metrics for all activities
  const activityMetrics = allActivities.map(act => {
    const liveViews = viewsMap[act.id] || 0;
    const totalViews = (baseViews[act.id] || 120) + liveViews;
    const isReservedByCurrentUser = reservedIds.includes(act.id);
    const confirmedReserves = act.enrolledCount + (isReservedByCurrentUser ? 1 : 0);
    const waitlist = getWaitlistCount(act.id, act.waitlistCount || (act.isSoldOut ? 12 : 0));
    
    return {
      ...act,
      totalViews,
      confirmedReserves,
      waitlist,
      isSoldOut: act.isSoldOut || confirmedReserves >= act.capacity
    };
  });

  // Calculate totals
  const totalViewsSum = activityMetrics.reduce((acc, m) => acc + m.totalViews, 0);
  const totalReservesSum = activityMetrics.reduce((acc, m) => acc + m.confirmedReserves, 0);
  const totalWaitlistSum = activityMetrics.reduce((acc, m) => acc + m.waitlist, 0);

  // Update KPI elements
  const elTotalViews = document.getElementById('kpi-total-views');
  const elTotalReserves = document.getElementById('kpi-total-reserves');
  const elTotalWaitlist = document.getElementById('kpi-total-waitlist');
  const elAvgTime = document.getElementById('kpi-avg-time');

  if (elTotalViews) elTotalViews.textContent = totalViewsSum.toLocaleString('es-CL');
  if (elTotalReserves) elTotalReserves.textContent = totalReservesSum.toLocaleString('es-CL');
  if (elTotalWaitlist) elTotalWaitlist.textContent = totalWaitlistSum.toLocaleString('es-CL');
  if (elAvgTime) elAvgTime.textContent = '4m 38s';

  // Render Chart 1: Actividades Más Visualizadas
  const chartMostViewed = document.getElementById('chart-most-viewed');
  if (chartMostViewed) {
    const sortedByViews = [...activityMetrics].sort((a, b) => b.totalViews - a.totalViews).slice(0, 5);
    const maxViews = sortedByViews[0]?.totalViews || 1;

    chartMostViewed.innerHTML = sortedByViews.map((item, idx) => {
      const percentage = Math.round((item.totalViews / maxViews) * 100);
      const shareOfTotal = Math.round((item.totalViews / totalViewsSum) * 100);
      const communeLabel = item.commune === 'maipu' ? 'MAIPÚ' : 'VALPARAÍSO';

      return `
        <div class="p-3 bg-white border border-neutral-300 hover:border-black transition-colors">
          <div class="flex items-center justify-between text-xs mb-1.5 font-bold">
            <div class="flex items-center gap-1.5 truncate">
              <span class="w-5 h-5 bg-black text-white text-[10px] flex items-center justify-center shrink-0">#${idx + 1}</span>
              <span class="bg-neutral-100 text-neutral-800 text-[10px] px-1 py-0.5 uppercase shrink-0">${communeLabel}</span>
              <span class="truncate uppercase text-neutral-900">${item.title}</span>
            </div>
            <div class="text-right shrink-0 ml-2 font-mono">
              <span class="font-black text-[#E11D48] text-sm">${item.totalViews}</span>
              <span class="text-[10px] text-neutral-500">vistas (${shareOfTotal}%)</span>
            </div>
          </div>
          <div class="w-full bg-neutral-200 h-3 border border-neutral-300">
            <div class="bg-[#E11D48] h-full transition-all duration-500" style="width: ${percentage}%"></div>
          </div>
          <div class="flex items-center justify-between text-[10px] text-neutral-500 mt-1 font-mono">
            <span>📍 ${item.locationName}</span>
            <span>${item.confirmedReserves} reservas realizadas</span>
          </div>
        </div>
      `;
    }).join('');
  }

  // Render Chart 2: Demanda Efectiva vs. Lista de Espera B2G
  const chartDemand = document.getElementById('chart-demand-waitlist');
  if (chartDemand) {
    // Show top workshops with waitlist / sold out + highest pressure
    const highDemandItems = [...activityMetrics]
      .sort((a, b) => (b.waitlist + b.confirmedReserves) - (a.waitlist + a.confirmedReserves))
      .slice(0, 5);

    chartDemand.innerHTML = highDemandItems.map((item) => {
      const communeLabel = item.commune === 'maipu' ? 'MAIPÚ' : 'VALPARAÍSO';
      const hasWaitlist = item.waitlist > 0;
      const isFull = item.isSoldOut || item.confirmedReserves >= item.capacity;

      return `
        <div class="p-3 bg-white border-2 ${isFull ? 'border-[#E11D48] shadow-[2px_2px_0px_0px_#E11D48]' : 'border-neutral-300'}">
          <div class="flex items-center justify-between text-xs mb-1 font-bold">
            <div class="flex items-center gap-1.5 truncate">
              <span class="bg-black text-white text-[10px] px-1 py-0.5 uppercase shrink-0">${communeLabel}</span>
              <span class="truncate uppercase text-neutral-900">${item.title}</span>
            </div>
            ${isFull ? `
              <span class="bg-[#E11D48] text-white text-[10px] font-black uppercase px-1.5 py-0.5 shrink-0">
                🔥 CUPOS AGOTADOS
              </span>
            ` : `
              <span class="text-[#059669] text-[10px] font-black uppercase shrink-0">
                ${Math.max(0, item.capacity - item.confirmedReserves)} DISPONIBLES
              </span>
            `}
          </div>

          <!-- Barra comparativa Cupos vs Espera -->
          <div class="grid grid-cols-2 gap-2 mt-2">
            <div>
              <div class="flex justify-between text-[10px] font-mono text-neutral-600 mb-0.5">
                <span>Cupos Ocupados</span>
                <span class="font-bold text-neutral-900">${item.confirmedReserves}/${item.capacity}</span>
              </div>
              <div class="w-full bg-neutral-200 h-2.5">
                <div class="bg-black h-full" style="width: ${Math.min(100, Math.round((item.confirmedReserves / item.capacity) * 100))}%"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-[10px] font-mono ${hasWaitlist ? 'text-[#E11D48] font-bold' : 'text-neutral-500'} mb-0.5">
                <span>Lista de Espera B2G</span>
                <span>+${item.waitlist} vecinos</span>
              </div>
              <div class="w-full bg-neutral-200 h-2.5">
                <div class="bg-[#E11D48] h-full" style="width: ${Math.min(100, item.waitlist * 5)}%"></div>
              </div>
            </div>
          </div>

          <div class="mt-2 text-[10px] font-mono text-neutral-600 flex items-center justify-between border-t border-neutral-100 pt-1.5">
            <span>📍 ${item.locationName}</span>
            <span class="font-bold ${hasWaitlist ? 'text-[#E11D48]' : 'text-neutral-500'}">
              ${hasWaitlist ? `⚠️ Sobredemanda insatisfecha: +${item.waitlist} vecinos` : 'Capacidad equilibrada'}
            </span>
          </div>
        </div>
      `;
    }).join('');
  }
}



// ==========================================================================
// ESCÁNER QR DE ASISTENCIA EN TERRENO & SUBIDA DE FOTOS
// ==========================================================================
let html5QrScannerInstance = null;
const scannedAttendanceToday = [];

function playAttendanceSuccessSound() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    // Acorde alegre de confirmación: Do5 (523Hz), Mi5 (659Hz), Sol5 (784Hz)
    [523.25, 659.25, 783.99].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);
      gain.gain.setValueAtTime(0.2, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.4);
    });
  } catch (e) {
    console.log('Audio no disponible:', e);
  }
}

function setupQrScanner() {
  const selectActivity = document.getElementById('scan-activity-select');
  const btnStart = document.getElementById('btn-start-camera');
  const btnStop = document.getElementById('btn-stop-camera');
  const btnValidateManual = document.getElementById('btn-validate-manual');
  const inputManual = document.getElementById('input-manual-token');
  const btnExportCsv = document.getElementById('btn-export-attendance-csv');

  // Poblar actividades disponibles
  populateScanActivities();
  window.addEventListener('chispaplay:activities-updated', populateScanActivities);

  // Iniciar Cámara con html5-qrcode
  if (btnStart) {
    btnStart.addEventListener('click', () => {
      startCameraScanner();
    });
  }

  if (btnStop) {
    btnStop.addEventListener('click', () => {
      stopCameraScanner();
    });
  }

  // Validación Manual
  if (btnValidateManual && inputManual) {
    btnValidateManual.addEventListener('click', () => {
      const token = inputManual.value.trim();
      if (!token) {
        alert('Por favor ingresa un token de vecino (ej. CHISPA-MAIPU-8821)');
        return;
      }
      processAttendanceValidation(token);
      inputManual.value = '';
    });

    inputManual.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        btnValidateManual.click();
      }
    });
  }

  // Exportar CSV
  if (btnExportCsv) {
    btnExportCsv.addEventListener('click', exportAttendanceToCsv);
  }

  // Configurar subida de imagen en formulario de publicación
  setupImageUploadHandler();
}

function populateScanActivities() {
  const select = document.getElementById('scan-activity-select');
  if (!select) return;
  const activities = getAllActivities();
  select.innerHTML = activities.map(a => `
    <option value="${a.id}">
      [${a.commune === 'maipu' ? 'Maipú' : 'Valpo'}] ${a.title} (${a.locationName})
    </option>
  `).join('');
}

function startCameraScanner() {
  const placeholder = document.getElementById('qr-camera-placeholder');
  const btnStart = document.getElementById('btn-start-camera');
  const btnStop = document.getElementById('btn-stop-camera');

  if (typeof window.Html5Qrcode === 'undefined') {
    alert('Librería de escáner cargando... Por favor intenta en 2 segundos.');
    return;
  }

  if (placeholder) placeholder.classList.add('hidden');
  if (btnStart) btnStart.classList.add('hidden');
  if (btnStop) btnStop.classList.remove('hidden');

  try {
    if (!html5QrScannerInstance) {
      html5QrScannerInstance = new window.Html5Qrcode('qr-reader');
    }

    const config = { fps: 10, qrbox: { width: 220, height: 220 } };

    html5QrScannerInstance.start(
      { facingMode: 'environment' },
      config,
      (decodedText) => {
        // Éxito en lectura
        processAttendanceValidation(decodedText);
      },
      (error) => {
        // Frame sin QR (normal)
      }
    ).catch(err => {
      console.warn('Error al iniciar cámara:', err);
      alert('No se pudo acceder a la cámara. Por favor permite los permisos o usa la validación manual.');
      stopCameraScanner();
    });
  } catch (err) {
    console.error('Error inicializando Html5Qrcode:', err);
    stopCameraScanner();
  }
}

function stopCameraScanner() {
  const placeholder = document.getElementById('qr-camera-placeholder');
  const btnStart = document.getElementById('btn-start-camera');
  const btnStop = document.getElementById('btn-stop-camera');

  if (html5QrScannerInstance) {
    try {
      html5QrScannerInstance.stop().then(() => {
        html5QrScannerInstance.clear();
      }).catch(() => {});
    } catch {}
  }

  if (placeholder) placeholder.classList.remove('hidden');
  if (btnStart) btnStart.classList.remove('hidden');
  if (btnStop) btnStop.classList.add('hidden');
}

function processAttendanceValidation(qrPayload) {
  const selectActivity = document.getElementById('scan-activity-select');
  const activityId = selectActivity ? selectActivity.value : 'act-general';
  const activities = getAllActivities();
  const act = activities.find(a => a.id === activityId) || { title: 'Taller en Plaza' };
  const activeCoord = getActiveCoordinator();
  const validatedBy = activeCoord ? activeCoord.orgName : 'Coordinador en Terreno';

  // Parsear payload (puede ser JSON de Pase Vecinal o Token simple)
  let userToken = qrPayload;
  let userName = 'Vecino en Terreno';

  try {
    const parsed = JSON.parse(qrPayload);
    if (parsed.token) userToken = parsed.token;
    if (parsed.name) userName = parsed.name;
  } catch {}

  // Enviar a Backend SQLite si está en línea
  fetch('/api/attendance/scan-qr', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      qrData: qrPayload,
      activityId: act.id,
      activityTitle: act.title,
      validatedBy: validatedBy
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.user_name) userName = data.user_name;
    displayVerifiedAttendance(userToken, userName, act.title);
  })
  .catch(() => {
    // Si el backend no responde, validar localmente
    displayVerifiedAttendance(userToken, userName, act.title);
  });
}

function displayVerifiedAttendance(token, name, activityTitle) {
  // Reproducir sonido festivo
  playAttendanceSuccessSound();

  const card = document.getElementById('qr-verification-card');
  const nameEl = document.getElementById('verified-neighbor-name');
  const tokenEl = document.getElementById('verified-neighbor-token');
  const titleEl = document.getElementById('verified-activity-title');
  const timeEl = document.getElementById('verified-timestamp');

  const nowStr = new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  if (nameEl) nameEl.textContent = name;
  if (tokenEl) tokenEl.textContent = token;
  if (titleEl) titleEl.textContent = activityTitle;
  if (timeEl) timeEl.textContent = nowStr;

  if (card) {
    card.classList.remove('hidden');
    card.classList.add('animate-pulse');
    setTimeout(() => card.classList.remove('animate-pulse'), 1000);
  }

  // Registrar en lista de hoy
  scannedAttendanceToday.unshift({
    name,
    token,
    activityTitle,
    time: nowStr
  });

  renderScannedAttendanceList();
  logAction('VALIDACION_ASISTENCIA_QR', 'Asistencia Escaneada', `Vecino: ${name} (${token}) en "${activityTitle}"`);
}

function renderScannedAttendanceList() {
  const container = document.getElementById('coord-attendance-list');
  const countEl = document.getElementById('coord-scanned-count');

  if (countEl) countEl.textContent = scannedAttendanceToday.length;
  if (!container) return;

  if (scannedAttendanceToday.length === 0) {
    container.innerHTML = '<div class="text-neutral-400 font-mono text-center py-4">Aún no se han escaneado pases vecinales hoy.</div>';
    return;
  }

  container.innerHTML = scannedAttendanceToday.map((item, idx) => `
    <div class="p-2 bg-white border border-neutral-300 flex items-center justify-between gap-2 shadow-2xs">
      <div class="truncate">
        <strong class="text-neutral-900 block truncate">${escapeHtml(item.name)}</strong>
        <span class="text-[10px] font-mono text-neutral-500">${escapeHtml(item.token)} · ${escapeHtml(item.activityTitle)}</span>
      </div>
      <span class="text-[10px] font-mono font-bold text-[#059669] shrink-0 bg-emerald-50 px-1.5 py-0.5 border border-emerald-200">
        ${item.time}
      </span>
    </div>
  `).join('');
}

function exportAttendanceToCsv() {
  if (scannedAttendanceToday.length === 0) {
    alert('No hay asistencias registradas hoy para exportar.');
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,Nombre,Token,Taller,Hora,Estado\n";
  scannedAttendanceToday.forEach(row => {
    csvContent += `"${row.name}","${row.token}","${row.activityTitle}","${row.time}","VALIDADO EN TERRENO"\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `asistencias_chispaplay_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function setupImageUploadHandler() {
  const fileInput = document.getElementById('pub-image-file');
  const urlInput = document.getElementById('pub-image');
  const previewBox = document.getElementById('pub-image-preview-box');
  const previewImg = document.getElementById('pub-image-preview');
  const statusEl = document.getElementById('pub-image-status');

  if (!fileInput) return;

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target.result;
      if (previewImg) previewImg.src = base64Data;
      if (previewBox) previewBox.classList.remove('hidden');
      if (statusEl) {
        statusEl.textContent = 'Subiendo fotografía al servidor...';
        statusEl.className = 'text-xs font-mono text-amber-600 font-bold';
      }

      // Enviar imagen a backend
      fetch('/api/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageData: base64Data,
          filename: `taller_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '')}`
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.url) {
          if (urlInput) urlInput.value = data.url;
          if (statusEl) {
            statusEl.textContent = '✓ Fotografía subida y vinculada a la grilla';
            statusEl.className = 'text-xs font-mono text-[#059669] font-bold';
          }
        }
      })
      .catch(() => {
        // Modo offline: almacenar DataURL
        if (urlInput) urlInput.value = base64Data;
        if (statusEl) {
          statusEl.textContent = '✓ Imagen lista para la grilla (modo local)';
          statusEl.className = 'text-xs font-mono text-[#059669] font-bold';
        }
      });
    };
    reader.readAsDataURL(file);
  });
}
