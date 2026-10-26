/* ==========================================================================
   ARCHIVO: js/ceo.js
   Lógica Modular del Panel CEO & Gráficos D3.js de Demanda Municipal Real
   ========================================================================== */

// D3.js cargado globalmente desde CDN en <head>
const d3 = typeof window !== 'undefined' ? window.d3 : null;
import {
  getCeoMetrics,
  getParkDefectReports,
  getRadarSubscribers,
  resetTelemetryData,
  generateDidecoExecutiveReport,
  logAction,
  escapeHtml
} from './state.js';
import { renderNavbar } from './navbar.js';

let currentFilter = 'todas';

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar('ceo');
  initCeoDashboard();

  const filterSelect = document.getElementById('ceo-commune-filter');
  if (filterSelect) {
    filterSelect.addEventListener('change', (e) => {
      currentFilter = e.target.value;
      renderDashboardData();
    });
  }

  const exportBtn = document.getElementById('btn-export-ceo-report');
  if (exportBtn) {
    exportBtn.addEventListener('click', handleExportReport);
  }

  const resetBtn = document.getElementById('btn-reset-telemetry');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('¿Confirmas reiniciar todos los contadores y telemetría a 0? Esta acción borrará todas las reservas y eventos reales.')) {
        resetTelemetryData();
        renderDashboardData();
        alert('✓ Telemetría reiniciada a 0 con éxito.');
      }
    });
  }

  window.addEventListener('chispaplay:waitlist-changed', () => {
    renderDashboardData();
  });

  window.addEventListener('chispaplay:telemetry-updated', () => {
    renderDashboardData();
  });

  window.addEventListener('chispaplay:telemetry-reset', () => {
    renderDashboardData();
  });
});

function initCeoDashboard() {
  renderDashboardData();
}

function renderDashboardData() {
  const metrics = getCeoMetrics();
  let activities = metrics.activityMetrics;

  if (currentFilter !== 'todas') {
    activities = activities.filter(a => a.commune === currentFilter);
  }

  // Actualizar KPIs con telemetría 100% real
  const totalWaitlist = activities.reduce((sum, a) => sum + (a.waitlist || 0), 0);
  const radarSubscribers = getRadarSubscribers();
  const reports = getParkDefectReports();

  const kpiWaitlist = document.getElementById('kpi-waitlist-total');
  const kpiRadar = document.getElementById('kpi-radar-total');
  const kpiReports = document.getElementById('kpi-reports-total');
  const kpiAvgTime = document.getElementById('kpi-avg-time');

  if (kpiWaitlist) kpiWaitlist.textContent = `${totalWaitlist} inscritos`;
  if (kpiRadar) kpiRadar.textContent = `${radarSubscribers.length}`;
  if (kpiReports) kpiReports.textContent = `${reports.length}`;
  if (kpiAvgTime) kpiAvgTime.textContent = `${metrics.avgSessionMinutes} min`;

  // Renderizar Gráficos con D3
  renderViewsChart(activities.slice(0, 5));
  renderWaitlistChart(activities.slice(0, 5));
  renderReportsTable(reports);
}

// --------------------------------------------------------------------------
// Gráfico 1: Visualizaciones vs Reservas con D3.js
// --------------------------------------------------------------------------
function renderViewsChart(data) {
  const container = document.getElementById('chart-views-container');
  if (!container) return;
  container.innerHTML = '';

  const margin = { top: 20, right: 20, bottom: 60, left: 45 };
  const width = Math.min(container.clientWidth || 500, 560) - margin.left - margin.right;
  const height = 260 - margin.top - margin.bottom;

  const svg = d3
    .select('#chart-views-container')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Escalas con ID único para prevenir sobreescritura de barras
  const x0 = d3
    .scaleBand()
    .domain(data.map(d => d.id))
    .rangeRound([0, width])
    .paddingInner(0.2);

  const x1 = d3
    .scaleBand()
    .domain(['views', 'reserves'])
    .rangeRound([0, x0.bandwidth()])
    .padding(0.1);

  const maxVal = d3.max(data, d => Math.max(d.views, d.reserves)) || 0;
  const yMax = Math.max(10, maxVal * 1.15);
  const y = d3.scaleLinear().domain([0, yMax]).range([height, 0]);

  // Ejes con formateador de texto del taller
  svg
    .append('g')
    .attr('transform', `translate(0,${height})`)
    .call(
      d3.axisBottom(x0).tickFormat(id => {
        const item = data.find(d => d.id === id);
        return item ? item.title.substring(0, 16) + '...' : id;
      })
    )
    .selectAll('text')
    .style('text-anchor', 'end')
    .attr('dx', '-.8em')
    .attr('dy', '.15em')
    .attr('transform', 'rotate(-25)')
    .style('font-size', '10px')
    .style('font-family', 'monospace')
    .style('font-weight', 'bold');

  svg
    .append('g')
    .call(d3.axisLeft(y).ticks(5))
    .selectAll('text')
    .style('font-size', '10px')
    .style('font-family', 'monospace');

  // Barras
  const group = svg
    .selectAll('.bar-group')
    .data(data)
    .enter()
    .append('g')
    .attr('transform', d => `translate(${x0(d.id)},0)`);

  // Barra Vistas
  group
    .append('rect')
    .attr('x', x1('views'))
    .attr('y', d => y(d.views))
    .attr('width', x1.bandwidth())
    .attr('height', d => Math.max(0, height - y(d.views)))
    .attr('fill', '#111111');

  // Barra Reservas
  group
    .append('rect')
    .attr('x', x1('reserves'))
    .attr('y', d => y(d.reserves))
    .attr('width', x1.bandwidth())
    .attr('height', d => Math.max(0, height - y(d.reserves)))
    .attr('fill', '#E11D48');
}

// --------------------------------------------------------------------------
// Gráfico 2: Demanda Insatisfecha (Lista de Espera B2G) con D3.js
// --------------------------------------------------------------------------
function renderWaitlistChart(data) {
  const container = document.getElementById('chart-waitlist-container');
  if (!container) return;
  container.innerHTML = '';

  const margin = { top: 20, right: 20, bottom: 60, left: 45 };
  const width = Math.min(container.clientWidth || 500, 560) - margin.left - margin.right;
  const height = 260 - margin.top - margin.bottom;

  const svg = d3
    .select('#chart-waitlist-container')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3
    .scaleBand()
    .domain(data.map(d => d.id))
    .rangeRound([0, width])
    .padding(0.3);

  const maxWait = d3.max(data, d => d.waitlist) || 0;
  const yMax = Math.max(10, maxWait * 1.25);
  const y = d3.scaleLinear().domain([0, yMax]).range([height, 0]);

  // Ejes
  svg
    .append('g')
    .attr('transform', `translate(0,${height})`)
    .call(
      d3.axisBottom(x).tickFormat(id => {
        const item = data.find(d => d.id === id);
        return item ? item.title.substring(0, 16) + '...' : id;
      })
    )
    .selectAll('text')
    .style('text-anchor', 'end')
    .attr('dx', '-.8em')
    .attr('dy', '.15em')
    .attr('transform', 'rotate(-25)')
    .style('font-size', '10px')
    .style('font-family', 'monospace')
    .style('font-weight', 'bold');

  svg
    .append('g')
    .call(d3.axisLeft(y).ticks(4))
    .selectAll('text')
    .style('font-size', '10px')
    .style('font-family', 'monospace');

  // Barras de Demanda Insatisfecha
  svg
    .selectAll('.waitlist-bar')
    .data(data)
    .enter()
    .append('rect')
    .attr('x', d => x(d.id))
    .attr('y', d => y(d.waitlist))
    .attr('width', x.bandwidth())
    .attr('height', d => Math.max(0, height - y(d.waitlist)))
    .attr('fill', d => (d.waitlist > 0 ? '#E11D48' : '#EEEEEE'))
    .attr('stroke', '#111111')
    .attr('stroke-width', 1.5);

  // Etiquetas con valor encima de la barra
  svg
    .selectAll('.waitlist-label')
    .data(data)
    .enter()
    .append('text')
    .attr('x', d => (x(d.id) || 0) + x.bandwidth() / 2)
    .attr('y', d => y(d.waitlist) - 5)
    .attr('text-anchor', 'middle')
    .style('font-size', '11px')
    .style('font-family', 'monospace')
    .style('font-weight', 'bold')
    .style('fill', '#111111')
    .text(d => (d.waitlist > 0 ? `+${d.waitlist}` : '0'));
}

// --------------------------------------------------------------------------
// Tabla de Reportes Ciudadanos de Terreno (100% Real)
// --------------------------------------------------------------------------
function renderReportsTable(reports) {
  const tbody = document.getElementById('ceo-reports-table-body');
  const countBadge = document.getElementById('reports-count-badge');
  if (!tbody) return;

  if (countBadge) {
    countBadge.textContent = `${reports.length} reportes activos`;
  }

  if (reports.length === 0) {
    tbody.innerHTML = `
      <tr class="border-b border-neutral-200">
        <td colspan="6" class="p-6 text-center text-neutral-500 font-mono text-xs">
          No hay reportes de desperfectos registrados aún. Cuando un vecino con cupo use "Reportar desperfecto en esta plaza", aparecerá aquí en tiempo real.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = reports
    .map(
      r => `
    <tr class="hover:bg-neutral-50 border-b border-neutral-200">
      <td class="p-3 font-bold text-neutral-800">${escapeHtml(r.timestamp)}</td>
      <td class="p-3 font-bold text-neutral-900">${escapeHtml(r.locationName)}</td>
      <td class="p-3 uppercase text-[10px] font-black">${escapeHtml(r.commune)}</td>
      <td class="p-3">
        <span class="bg-red-100 text-[#E11D48] px-2 py-0.5 text-[10px] font-bold border border-red-300">
          ${escapeHtml(r.issueType)}
        </span>
      </td>
      <td class="p-3 text-neutral-700">${escapeHtml(r.details)}</td>
      <td class="p-3 text-neutral-600 font-mono text-[11px]">${escapeHtml(r.reporterName)} (${escapeHtml(r.reporterToken)})</td>
    </tr>
  `
    )
    .join('');
}

// --------------------------------------------------------------------------
// Generar & Abrir Informe Ejecutivo Oficial DIDECO (Membrete Formal / PDF)
// --------------------------------------------------------------------------
function handleExportReport() {
  const report = generateDidecoExecutiveReport(currentFilter);
  const modal = document.getElementById('modal-dideco-report');
  const body = document.getElementById('dideco-report-body');

  if (!modal || !body) return;

  logAction('GENERACION_INFORME_DIDECO', 'Memorándum DIDECO Emitido', `Ámbito: ${report.communeName}`);

  body.innerHTML = `
    <!-- Membrete Formal Municipal Chileno -->
    <div class="border-b-4 border-black pb-4 mb-6">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div class="text-[10px] font-mono font-black tracking-widest text-neutral-500 uppercase">
            REPÚBLICA DE CHILE · GOBIERNO LOCAL
          </div>
          <div class="text-xl sm:text-2xl font-black uppercase text-neutral-900 leading-tight">
            ${report.communeName}
          </div>
          <div class="text-xs font-mono font-bold text-[#E11D48] uppercase mt-0.5">
            ${report.department}
          </div>
        </div>

        <div class="text-left sm:text-right font-mono text-xs border border-black p-2.5 bg-neutral-50 shrink-0">
          <div><strong class="text-neutral-900">${report.reportNumber}</strong></div>
          <div class="text-neutral-500 text-[11px]">${report.dateText}</div>
          <div class="text-[10px] bg-black text-white px-1.5 py-0.2 mt-1 inline-block uppercase font-bold">
            DOCUMENTO TÉCNICO B2G
          </div>
        </div>
      </div>
    </div>

    <!-- Título del Memorándum -->
    <div class="mb-6">
      <h2 class="text-2xl sm:text-3xl font-black uppercase tracking-tight text-neutral-900 mb-1">
        INFORME TÉCNICO DE TRACCIÓN, DEMANDA TERRITORIAL E INFRAESTRUCTURA DE PLAZAS
      </h2>
      <p class="text-xs sm:text-sm text-neutral-600 font-medium leading-relaxed">
        Elaborado por: <strong>${report.authors}</strong> para la consideración de DIDECO, SECPLA y el H. Concejo Municipal.
      </p>
    </div>

    <!-- 1. RESUMEN EJECUTIVO DE IMPACTO CIUDADANO -->
    <div class="mb-6">
      <h3 class="text-xs font-mono font-black uppercase bg-black text-white px-2 py-1 inline-block mb-3">
        1. RESUMEN EJECUTIVO DE IMPACTO VECINAL (REGLA DE LOS 15 MINUTOS)
      </h3>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div class="border-2 border-black p-3 bg-neutral-50">
          <div class="text-[10px] font-mono text-neutral-500 uppercase font-bold">INTERACCIONES TOTALES</div>
          <div class="text-2xl font-black font-mono text-neutral-900">${report.executiveSummary.totalViews}</div>
          <div class="text-[10px] text-neutral-500">Consultas ciudadanas</div>
        </div>
        <div class="border-2 border-black p-3 bg-neutral-50">
          <div class="text-[10px] font-mono text-neutral-500 uppercase font-bold">CUPOS RESERVADOS</div>
          <div class="text-2xl font-black font-mono text-neutral-900">${report.executiveSummary.totalReserves}</div>
          <div class="text-[10px] text-[#059669] font-bold">Pases vecinales emitidos</div>
        </div>
        <div class="border-2 border-black p-3 bg-red-50 border-red-600">
          <div class="text-[10px] font-mono text-red-600 uppercase font-bold">DEMANDA LATENTE (ESPERA)</div>
          <div class="text-2xl font-black font-mono text-[#E11D48]">${report.executiveSummary.totalWaitlistDemand}</div>
          <div class="text-[10px] text-red-700 font-bold">Vecinos sin cupo</div>
        </div>
        <div class="border-2 border-black p-3 bg-neutral-50">
          <div class="text-[10px] font-mono text-neutral-500 uppercase font-bold">PRESENCIA CERTIFICADA</div>
          <div class="text-2xl font-black font-mono text-neutral-900">
            ${report.executiveSummary.gpsVerifiedAttendances} <span class="text-xs font-normal text-neutral-500">GPS</span>
          </div>
          <div class="text-[10px] text-neutral-600 font-bold">Cotejo a &lt; 250m de plaza</div>
        </div>
      </div>
    </div>

    <!-- 2. ANÁLISIS DE DEMANDA INSATISFECHA POR SECTOR (FONDEVE / NUEVOS TALLERES) -->
    <div class="mb-6">
      <h3 class="text-xs font-mono font-black uppercase bg-black text-white px-2 py-1 inline-block mb-3">
        2. DEMANDA TERRITORIAL INSATISFECHA (CRITERIO FONDEVE)
      </h3>
      <p class="text-xs text-neutral-600 mb-2">
        Talleres donde los cupos se agotaron y los vecinos activaron la lista de espera solicitando nuevos turnos:
      </p>
      <div class="overflow-x-auto border border-black">
        <table class="w-full text-left text-xs font-mono">
          <thead class="bg-neutral-900 text-white uppercase text-[10px]">
            <tr>
              <th class="p-2.5">Actividad / Taller</th>
              <th class="p-2.5">Lugar / Plaza</th>
              <th class="p-2.5 text-center">Capacidad</th>
              <th class="p-2.5 text-center">Reservados</th>
              <th class="p-2.5 text-center text-red-400">Lista de Espera</th>
              <th class="p-2.5">Prioridad DIDECO</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-200">
            ${
              report.topWaitlistWorkshops.length === 0
                ? `<tr><td colspan="6" class="p-3 text-center text-neutral-400">No hay talleres con lista de espera acumulada en este filtro.</td></tr>`
                : report.topWaitlistWorkshops.map(a => `
                  <tr>
                    <td class="p-2.5 font-bold text-neutral-900">${a.title}</td>
                    <td class="p-2.5 text-neutral-700">${a.locationName}</td>
                    <td class="p-2.5 text-center">${a.capacity}</td>
                    <td class="p-2.5 text-center font-bold text-[#059669]">${a.reserves}</td>
                    <td class="p-2.5 text-center font-black text-red-600 bg-red-50">+${a.waitlist} vecinos</td>
                    <td class="p-2.5">
                      <span class="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 uppercase">
                        ${a.waitlist >= 10 ? 'Urgente: Abrir Turno' : 'Monitorear'}
                      </span>
                    </td>
                  </tr>
                `).join('')
            }
          </tbody>
        </table>
      </div>
    </div>

    <!-- 3. CATASTRO CIUDADANO DE INFRAESTRUCTURA EN PLAZAS PÚBLICAS -->
    <div class="mb-6">
      <h3 class="text-xs font-mono font-black uppercase bg-black text-white px-2 py-1 inline-block mb-3">
        3. CATASTRO DE DESPERFECTOS DE PLAZAS (PARA ASEO Y ORNATO / OPERACIONES)
      </h3>
      <div class="overflow-x-auto border border-black">
        <table class="w-full text-left text-xs font-mono">
          <thead class="bg-neutral-900 text-white uppercase text-[10px]">
            <tr>
              <th class="p-2.5">Hora / Fecha</th>
              <th class="p-2.5">Plaza / Multicancha</th>
              <th class="p-2.5">Tipo de Falla</th>
              <th class="p-2.5">Descripción del Vecino</th>
              <th class="p-2.5">Vecino Validador</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-200">
            ${
              report.parkDefects.length === 0
                ? `<tr><td colspan="5" class="p-3 text-center text-neutral-400">No se registran denuncias de infraestructura pendientes.</td></tr>`
                : report.parkDefects.map(p => `
                  <tr>
                    <td class="p-2.5 font-bold">${p.timestamp}</td>
                    <td class="p-2.5 font-bold text-neutral-900">${p.locationName} (${p.commune.toUpperCase()})</td>
                    <td class="p-2.5 text-red-600 font-bold">${p.issueType}</td>
                    <td class="p-2.5 text-neutral-700">${p.details}</td>
                    <td class="p-2.5 text-neutral-500">${p.reporterName} (${p.reporterToken})</td>
                  </tr>
                `).join('')
            }
          </tbody>
        </table>
      </div>
    </div>

    <!-- 4. DICTAMEN & RECOMENDACIÓN TÉCNICA FINAL -->
    <div class="p-4 bg-neutral-100 border-2 border-black">
      <div class="text-[11px] font-mono font-black text-neutral-900 uppercase mb-1">
        4. CONCLUSIÓN Y RECOMENDACIÓN TÉCNICA:
      </div>
      <p class="text-xs sm:text-sm text-neutral-800 leading-relaxed font-serif italic">
        "${report.technicalRecommendation}"
      </p>
      <div class="mt-4 pt-3 border-t border-neutral-300 flex items-center justify-between text-[11px] font-mono text-neutral-500">
        <span>Firma Digital: <strong>CHISPAPLAY-FCFM-UCHILE</strong></span>
        <span>Código de Verificación: ${report.reportNumber}</span>
      </div>
    </div>
  `;

  // Controladores de modal
  modal.classList.remove('hidden');

  const btnPrint = document.getElementById('btn-print-dideco-official');
  if (btnPrint) {
    btnPrint.onclick = () => {
      window.print();
    };
  }

  const btnClose = document.getElementById('btn-close-dideco-modal');
  if (btnClose) {
    btnClose.onclick = () => {
      modal.classList.add('hidden');
    };
  }
}

