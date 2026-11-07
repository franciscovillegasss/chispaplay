let COMMUNES_DATA = {};

export function configureGeography(communes, events = []) {
  COMMUNES_DATA = Object.fromEntries(communes.map(name => {
    const id = normalize(name);
    const sectors = [...new Set(events.filter(event => normalize(event.commune) === id).map(event => event.sector))];
    return [id, { id, name, centerReference: { id: 'all', name: 'Todos los sectores' },
      suggestions: [{ id: 'all', name: 'Todos los sectores' }, ...sectors.map((sector, index) => ({ id: String(index), name: sector }))] }];
  }));
}

export function renderNavigation(page, actor) {
  const activePageKey = { home: 'inicio', catalog: 'actividades', event: 'actividades', profile: 'perfil' }[page];
  const container = document.getElementById('navbar-container');
  if (!container) return;

  const currentCommuneKey = getActiveCommune();
  const currentCommune = COMMUNES_DATA[currentCommuneKey];
  const currentRef = getActiveReferencePoint();
  const user = actor?.role === "neighbor" ? actor : null;

  const mainNavLinks = [
    { key: 'inicio', label: 'Inicio & Ranking', href: 'index.html' },
    { key: 'actividades', label: 'Cartelera Diaria', href: 'actividades.html' },
    { key: 'perfil', label: 'Mi Pase Vecinal', href: 'perfil.html' }
  ];

  container.innerHTML = `
    <!-- Main Navigation Bar -->
    <nav class="bg-white border-b-2 border-black sticky top-0 z-40 px-3 sm:px-6 md:px-8 py-2.5 sm:py-3 shadow-xs">
      <div class="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">

        <!-- Logo & Commune Indicator -->
        <div class="flex items-center gap-2 shrink-0">
          <a href="index.html" id="nav-logo-link" class="flex items-center gap-1.5 sm:gap-2 group text-decoration-none cursor-pointer">
            <span class="bg-[#111111] text-white px-2 py-0.5 sm:py-1 font-black text-lg sm:text-2xl tracking-tighter uppercase font-mono group-hover:bg-[#E11D48] transition-colors">
              CHISPA
            </span>
            <span class="font-black text-lg sm:text-2xl tracking-tighter text-[#111111] uppercase font-mono">
              PLAY
            </span>
          </a>
        </div>

        <!-- Links Navigation (Visible en Desktop y Tablet) -->
        <div class="hidden md:flex items-center gap-1 sm:gap-2">
          ${mainNavLinks
            .map(link => {
              const isActive = link.key === activePageKey;
              return `
                <a
                  href="${link.href}"
                  class="px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-black uppercase tracking-wider transition-all whitespace-nowrap text-decoration-none border ${
                    isActive
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-neutral-800 border-transparent hover:border-black hover:bg-neutral-100'
                  }"
                >
                  ${link.label}
                  ${link.key === 'perfil' && user ? `<span class="ml-1 w-1.5 h-1.5 bg-[#059669] inline-block rounded-full"></span>` : ''}
                </a>
              `;
            })
            .join('')}
        </div>

        <!-- Right Side: Persistent Sector Switcher & Menu 3 Barras -->
        <div class="flex items-center gap-2 sm:gap-3 shrink-0">

          <!-- SELECTOR GLOBAL PERSISTENTE DE BARRIO (Visible en Desktop/Tablet) -->
          <div class="relative hidden md:inline-block text-left">
            <button
              id="nav-btn-quick-sector"
              class="flex items-center gap-1.5 bg-neutral-100 hover:bg-black hover:text-white border-2 border-black px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs font-mono font-bold transition-all cursor-pointer shadow-[2px_2px_0px_0px_#111111]"
              title="Cambiar sector de referencia (15 minutos)"
            >
              <span class="text-[#E11D48]">📍</span>
              <span class="max-w-[110px] sm:max-w-[150px] truncate text-neutral-900 group-hover:text-white font-bold">${escapeHtml(currentRef.name)}</span>
              <span class="text-[9px] text-neutral-500 font-normal">▼</span>
            </button>

            <!-- Menú Desplegable Rápido de Sectores -->
            <div
              id="nav-dropdown-quick-sector"
              class="hidden absolute right-0 mt-2 w-72 bg-white border-3 border-black shadow-[6px_6px_0px_0px_#111111] z-50 animate-fade-soft py-2 font-sans"
            >
              <div class="px-3.5 py-1.5 text-[10px] font-mono uppercase text-neutral-500 font-bold border-b border-neutral-200 flex items-center justify-between">
                <span>SECTORES ${escapeHtml(currentCommune.name.toUpperCase())} (15 MIN)</span>
                <span class="text-[#059669]">● ACTIVO</span>
              </div>

              <!-- Lista de Sectores de la Comuna Actual -->
              <div class="py-1 max-h-56 overflow-y-auto">
                ${currentCommune.suggestions
                  .map(s => {
                    const isSelected = currentRef.id === s.id;
                    return `
                      <button
                        type="button"
                        data-quick-ref-id="${s.id}"
                        class="btn-quick-ref w-full text-left px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-neutral-900 text-white font-black'
                            : 'text-neutral-800 hover:bg-neutral-100 hover:text-[#E11D48]'
                        }"
                      >
                        <span class="truncate">📍 ${escapeHtml(s.name)}</span>
                        ${isSelected ? `<span class="text-[10px] font-mono text-[#059669]">✓</span>` : ''}
                      </button>
                    `;
                  })
                  .join('')}
              </div>

              <!-- Cambio Rápido a la Otra Comuna -->
              <div class="border-t border-neutral-200 my-1 pt-1 px-3">
                <button
                  type="button"
                  id="btn-quick-switch-commune"
                  class="w-full text-left py-1.5 text-[11px] font-mono font-bold text-neutral-600 hover:text-black flex items-center justify-between cursor-pointer"
                >
                  <span>Cambiar a otra comuna →</span>
                  <span class="text-[10px] bg-neutral-200 px-1.5 py-0.5 uppercase">Switch</span>
                </button>
              </div>
            </div>
          </div>

          <!-- User Status (Desktop) -->
          ${
            user
              ? `
                <button id="nav-btn-user-pass-card" class="hidden md:flex items-center gap-1.5 sm:gap-2 bg-neutral-100 border-2 border-black hover:border-[#E11D48] px-2 py-1 sm:px-3 sm:py-1.5 transition-all cursor-pointer shadow-[2px_2px_0px_0px_#111111]">
                  <div class="w-2 h-2 bg-[#059669] rounded-full shrink-0"></div>
                  <div class="text-left">
                    <div class="text-xs font-black text-neutral-900 leading-none">${escapeHtml(user.name.split(' ')[0])}</div>
                    <div class="text-[9px] font-mono text-neutral-500 leading-none mt-0.5">Pase activo</div>
                  </div>
                </button>
              `
              : `
                <button id="nav-btn-register" class="hidden md:inline-block bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-black uppercase tracking-wider px-2.5 sm:px-3.5 py-1.5 sm:py-2 transition-colors cursor-pointer shadow-[2px_2px_0px_0px_#111111]">
                  Pase
                </button>
              `
          }

          <!-- Botón de 3 Barras Integrado con Holgura y Touch Target Ergonómico -->
          <div class="relative inline-block text-left shrink-0">
            <button
              id="nav-btn-more-menu"
              aria-label="Abrir menú de navegación"
              class="border-2 border-black bg-white hover:bg-black hover:text-white px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-[3px_3px_0px_0px_#111111] flex items-center justify-center gap-1.5 min-h-[40px] min-w-[44px]"
            >
              <span class="text-base sm:text-lg leading-none font-bold">☰</span>
              <span class="hidden sm:inline">Menú</span>
            </button>

            <!-- Dropdown Desplegable: Vistas Ciudadanas vs. Acceso Organizadores -->
            <div
              id="nav-dropdown-more"
              class="hidden absolute right-0 mt-2 w-64 bg-white border-3 border-black shadow-[6px_6px_0px_0px_#111111] z-50 animate-fade-soft py-2 font-sans"
            >
              <!-- SECCIÓN CIUDADANA -->
              <div class="px-4 py-1 text-[10px] font-mono uppercase text-neutral-500 font-bold border-b border-neutral-200">
                VISTAS CIUDADANAS
              </div>
              <button
                type="button"
                id="menu-btn-mobile-location"
                class="w-full text-left px-4 py-2 text-xs font-bold text-neutral-900 hover:bg-neutral-100 hover:text-[#E11D48] cursor-pointer flex items-center justify-between md:hidden"
              >
                <span>📍 Cambiar Sector</span>
                <span class="text-[10px] font-mono text-[#E11D48] font-bold truncate max-w-[110px]">${escapeHtml(currentRef.name)}</span>
              </button>
              <a
                href="index.html"
                class="block px-4 py-2 text-xs font-black uppercase text-neutral-900 hover:bg-neutral-100 flex items-center justify-between"
              >
                <span>🏠 Inicio & Ranking</span>
                <span class="text-[10px] font-mono text-neutral-400">15 min</span>
              </a>
              <a
                href="actividades.html"
                class="block px-4 py-2 text-xs font-black uppercase text-neutral-900 hover:bg-neutral-100 flex items-center justify-between"
              >
                <span>📋 Cartelera Diaria</span>
                <span class="text-[10px] font-mono text-neutral-400">Agenda</span>
              </a>
              <a
                href="perfil.html"
                class="block px-4 py-2 text-xs font-black uppercase text-neutral-900 hover:bg-neutral-100 flex items-center justify-between"
              >
                <span>🎫 Mi Pase Vecinal</span>
                <span class="text-[10px] font-mono text-[#059669]">Código personal</span>
              </a>
              <button
                type="button"
                id="menu-btn-security-guide"
                class="w-full text-left px-4 py-2 text-xs font-black uppercase text-neutral-900 hover:bg-neutral-100 hover:text-[#E11D48] cursor-pointer flex items-center justify-between"
              >
                <span>🛡️ Guía de Seguridad</span>
                <span class="text-[9px] font-mono bg-neutral-100 text-neutral-700 px-1.5 py-0.5 border border-neutral-300">Emergencias</span>
              </button>

              <!-- LÍNEA DIVISORIA ESTRICTA CIUDADANO VS ORGANIZADOR -->
              <div class="border-t-2 border-neutral-300 my-2"></div>

              <!-- SECCIÓN ACCESO ORGANIZADORES -->
              <div class="px-4 py-1 text-[10px] font-mono uppercase text-[#E11D48] font-black">
                ACCESO ORGANIZADORES
              </div>
              <a
                href="coordinador.html"
                class="block px-4 py-2 text-xs font-bold text-neutral-900 hover:bg-neutral-100 hover:text-[#E11D48] flex items-center justify-between"
              >
                <span>🏛️ Coordinadores (JJVV)</span>
                <span class="text-[10px] font-mono text-neutral-500">Gestión</span>
              </a>

              <div class="border-t border-neutral-200 my-1 pt-1"></div>

              <a
                href="nosotros.html"
                class="block px-4 py-2 text-xs font-bold text-neutral-900 hover:bg-neutral-100 hover:text-[#E11D48] flex items-center justify-between"
              >
                <span>🎓 Quiénes Somos</span>
                <span class="text-[10px] font-mono text-neutral-500">U. de Chile</span>
              </a>
            </div>
          </div>

        </div>

      </div>
    </nav>
  `;

  bindNavbarEvents(container, currentCommune);
  renderBottomNav(activePageKey);
}

function renderBottomNav(activeTab) {
  document.getElementById('chispaplay-mobile-bottom-nav')?.remove();
  const bottomNavElement = document.createElement('nav');
  bottomNavElement.id = 'chispaplay-mobile-bottom-nav';
  bottomNavElement.setAttribute('aria-label', 'Navegación inferior móvil');
  bottomNavElement.className = 'md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200 pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_10px_rgba(0,0,0,0.05)]';

  const isInicio = activeTab === 'inicio';
  const isCartelera = activeTab === 'actividades';
  const isPase = activeTab === 'perfil';

  bottomNavElement.innerHTML = `
    <div class="grid grid-cols-4 h-14 max-w-md mx-auto items-center px-1">

      <!-- 1. Inicio -->
      <a
        href="index.html"
        class="flex flex-col items-center justify-center h-full transition-colors text-decoration-none group ${
          isInicio ? 'text-neutral-950 font-bold' : 'text-neutral-400 hover:text-neutral-700 font-medium'
        }"
      >
        <svg class="w-5 h-5 transition-transform group-active:scale-90" viewBox="0 0 24 24" fill="${isInicio ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="${isInicio ? '1.5' : '1.8'}">
          <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
        <span class="text-[10px] tracking-tight mt-0.5">Inicio</span>
      </a>

      <!-- 2. Cartelera (Con Punto Rojo de Nuevos Talleres) -->
      <a
        href="actividades.html"
        id="btn-bottom-cartelera"
        class="flex flex-col items-center justify-center h-full transition-colors text-decoration-none group relative ${
          isCartelera ? 'text-neutral-950 font-bold' : 'text-neutral-400 hover:text-neutral-700 font-medium'
        }"
      >
        <div class="relative inline-flex items-center justify-center leading-none">
          <svg class="w-5 h-5 transition-transform group-active:scale-90" viewBox="0 0 24 24" fill="${isCartelera ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="${isCartelera ? '1.5' : '1.8'}">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>

        </div>
        <span class="text-[10px] tracking-tight mt-0.5">Cartelera</span>
      </a>

      <!-- 3. Mi Pase con Badge de Cupos Guardados -->
      <button
        type="button"
        id="btn-bottom-my-pass"
        class="flex flex-col items-center justify-center h-full transition-colors relative cursor-pointer group ${
          isPase ? 'text-neutral-950 font-bold' : 'text-neutral-400 hover:text-neutral-700 font-medium'
        }"
      >
        <div class="relative inline-flex items-center justify-center leading-none">
          <svg class="w-5 h-5 transition-transform group-active:scale-90" viewBox="0 0 24 24" fill="${isPase ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="${isPase ? '1.5' : '1.8'}">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
          </svg>

        </div>
        <span class="text-[10px] tracking-tight mt-0.5">Mi Pase</span>
      </button>

      <!-- 4. Seguridad Vecinal & Emergencias -->
      <button
        type="button"
        id="btn-bottom-security-hub"
        class="flex flex-col items-center justify-center h-full transition-colors cursor-pointer group text-neutral-400 hover:text-neutral-700 font-medium"
      >
        <svg class="w-5 h-5 transition-transform group-active:scale-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
        </svg>
        <span class="text-[10px] tracking-tight mt-0.5">Seguridad</span>
      </button>

    </div>
  `;

  document.body.appendChild(bottomNavElement);

  // Padding inferior en celular para que el contenido no quede tapado por la barra
  document.body.classList.add('pb-16', 'md:pb-0');

  document.getElementById('btn-bottom-my-pass').addEventListener('click', () => { location.href = 'perfil.html'; });
  document.getElementById('btn-bottom-security-hub').addEventListener('click', openSafety);
}

const params = new URLSearchParams(location.search);
const getActiveCommune = () => {
  const value = normalize(params.get('commune') || localStorage.getItem('chispaplay_active_commune') || 'Santiago');
  return COMMUNES_DATA[value] ? value : 'santiago';
};
const normalize = value => String(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const catalogUrl = (commune, sector = '') => 'actividades.html?' + new URLSearchParams({ commune, sector });
const localDay = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Santiago' });
const dateTime = new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Santiago' });

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}

function getActiveReferencePoint() {
  const commune = COMMUNES_DATA[getActiveCommune()];
  const name = params.get('sector') || localStorage.getItem('chispaplay_editorial_sector');
  return commune.suggestions.find(sector => sector.name === name) || commune.centerReference;
}

function bindNavbarEvents(container, commune) {
  const select = id => container.querySelector('#' + id);
  for (const [id, target] of [['nav-btn-more-menu', 'nav-dropdown-more'], ['nav-btn-quick-sector', 'nav-dropdown-quick-sector']]) {
    const button = select(id);
    const panel = select(target);
    button.setAttribute('aria-controls', target);
    button.setAttribute('aria-expanded', 'false');
    button.addEventListener('click', () => button.setAttribute('aria-expanded', String(!panel.classList.toggle('hidden'))));
    button.parentElement.addEventListener('focusout', event => {
      if (!button.parentElement.contains(event.relatedTarget)) {
        panel.classList.add('hidden');
        button.setAttribute('aria-expanded', 'false');
      }
    });
  }
  container.querySelectorAll('[data-quick-ref-id]').forEach(button => button.addEventListener('click', () => {
    const sector = commune.suggestions.find(item => item.id === button.dataset.quickRefId);
    location.href = catalogUrl(commune.id, sector.id === 'all' ? '' : sector.name);
  }));
  select('btn-quick-switch-commune').addEventListener('click', () => {
    location.href = 'index.html#hero-interactive-canvas';
  });
  select('menu-btn-mobile-location').addEventListener('click', () => { location.href = 'index.html#hero-interactive-canvas'; });
  for (const id of ['nav-btn-register', 'nav-btn-user-pass-card']) {
    select(id)?.addEventListener('click', () => { location.href = 'perfil.html'; });
  }
  select('menu-btn-security-guide').addEventListener('click', openSafety);
}

function openSafety() {
  let dialog = document.getElementById('safety');
  if (!dialog) {
    dialog = document.createElement('dialog');
    dialog.id = 'safety';
    dialog.className = 'bg-white border-4 border-black p-6 max-w-md shadow-[8px_8px_0px_0px_#E11D48]';
    dialog.innerHTML = `<h2 class="font-black uppercase mb-3">Seguridad vecinal</h2>
      <p>Si detectas un problema en el lugar, abre la ficha de la actividad y envía un reporte. Puedes revisar su estado en Mi Pase.</p>
      <a class="button mt-3" href="actividades.html">Abrir cartelera</a>
      <form method="dialog"><button type="submit" class="secondary">Cerrar</button></form>`;
    document.body.append(dialog);
  }
  dialog.showModal();
}

function daysAway(event) {
  return (Date.parse(localDay.format(new Date(event.starts * 1000))) -
    Date.parse(localDay.format(new Date()))) / 86400000;
}

function walkingEstimate(event, origin) {
  if (!origin || event.latitude == null || event.longitude == null) return '';
  const radians = angle => angle * Math.PI / 180;
  const deltaLat = radians(event.latitude - origin.latitude);
  const deltaLng = radians(event.longitude - origin.longitude);
  const a = Math.sin(deltaLat / 2) ** 2 +
    Math.cos(radians(origin.latitude)) * Math.cos(radians(event.latitude)) * Math.sin(deltaLng / 2) ** 2;
  const meters = 12742000 * Math.asin(Math.sqrt(Math.min(1, a)));
  return Math.max(1, Math.ceil(meters / 80)) + ' min estimados en línea recta';
}

function cards(events, poster, position) {
  if (!events.length) return '<div class="col-span-full p-6 border border-dashed border-neutral-300 text-xs font-mono text-neutral-500 text-center bg-white">No hay actividades publicadas para esta selección.</div>';
  return events.map(event => {
    const href = 'actividad.html?id=' + encodeURIComponent(event.id);
    const image = poster && event.photo ? `<a href="${href}" class="relative block aspect-[16/10] bg-neutral-200 border border-black mb-3">
      <img src="${escapeHtml(event.photo)}" alt="" class="w-full h-full object-cover" loading="lazy">
      <span class="absolute top-2.5 left-2.5 bg-black text-white px-2.5 py-0.5 font-mono font-black text-xs">${escapeHtml(event.category)}</span></a>` : '';
    const seats = event.starts * 1000 <= Date.now() ? 'Inscripciones cerradas' :
      event.available ? event.available + ' cupos disponibles' : 'Lista de espera';
    const estimate = walkingEstimate(event, position);
    return `<article class="workshop-card bg-white border-2 border-black p-4 sm:p-5 shadow-[5px_5px_0px_0px_#111111]">
      ${image}<div class="text-xs font-mono font-bold uppercase text-neutral-600">
        <span class="text-[#E11D48]">📍 ${escapeHtml(event.venue)}</span> · ${escapeHtml(dateTime.format(new Date(event.starts * 1000)))}
      </div>
      ${estimate ? '<p class="text-xs font-mono text-neutral-600">' + estimate + '</p>' : ''}
      <h3 class="text-lg sm:text-xl font-black uppercase mb-3"><a href="${href}">${escapeHtml(event.title)}</a></h3>
      <div class="pt-3 border-t-2 border-black flex items-center flex-wrap justify-between gap-3">
        <span class="text-xs font-mono font-black">${seats}</span>
        <a class="button" href="${href}">Ver actividad / Reservar →</a>
      </div></article>`;
  }).join('');
}

function renderHome(events, track) {
  let commune, sector;
  const selector = document.getElementById('home-commune');
  const sectorBox = document.getElementById('hero-step2-container');
  const sectorGrid = document.getElementById('step2-sectors-grid');
  const timeframeBox = document.getElementById('hero-step3-container');
  const ranking = document.getElementById('ranking-section');
  const inCommune = event => normalize(event.commune) === commune;
  for (const [id, data] of Object.entries(COMMUNES_DATA)) selector.add(new Option(data.name, id));
  selector.addEventListener('change', () => {
    commune = selector.value;
    if (!commune) return;
    sector = '';
    localStorage.setItem('chispaplay_active_commune', commune);
    localStorage.removeItem('chispaplay_editorial_sector');
    document.getElementById('step2-commune-label').textContent = COMMUNES_DATA[commune].name;
    const labels = new Set(['', ...events.filter(inCommune).map(event => event.sector)]);
    sectorGrid.replaceChildren();
    for (const name of labels) {
      const choice = document.createElement('button');
      choice.type = 'button';
      choice.className = 'bg-neutral-50 border-2 border-black p-2 text-xs font-bold hover:bg-black hover:text-white';
      choice.textContent = name || 'Todos los sectores';
      choice.addEventListener('click', () => {
        sector = name;
        localStorage.setItem('chispaplay_editorial_sector', name);
        document.getElementById('step3-ref-label').textContent = choice.textContent;
        timeframeBox.classList.remove('hidden');
        ranking.classList.add('hidden');
      });
      sectorGrid.append(choice);
    }
    sectorBox.classList.remove('hidden');
    timeframeBox.classList.add('hidden');
    ranking.classList.add('hidden');
  });
  document.querySelectorAll('.btn-step3-timeframe').forEach(button => {
    button.addEventListener('click', () => {
      const maxDays = { hoy: 0, semana: 7, mes: 30 }[button.dataset.timeframe];
      const items = events.filter(event => inCommune(event) &&
        (!sector || normalize(event.sector) === normalize(sector)) && daysAway(event) <= maxDays);
      document.getElementById('ranking-headline').textContent = 'Actividades · ' + (sector || COMMUNES_DATA[commune].name);
      document.getElementById('ranking-count-label').textContent = items.length + ' actividades';
      document.getElementById('ranking-list-container').innerHTML = cards(items, true);
      ranking.querySelector('a').href = catalogUrl(commune, sector);
      ranking.classList.remove('hidden');
      ranking.scrollIntoView({ block: 'start' });
      track('filtros_usados');
    });
  });
}

function renderDaily(events, track) {
  const search = document.getElementById('input-search-activities');
  const clear = document.getElementById('btn-clear-search');
  const commune = document.getElementById('catalog-commune');
  const poster = document.getElementById('btn-view-poster');
  const diary = document.getElementById('btn-view-diario');
  const categories = [...document.querySelectorAll('.btn-filter-category')];
  const sensory = document.getElementById('check-neurofriendly');
  const wheelchair = document.getElementById('check-universal');
  const gps = document.getElementById('btn-realtime-gps-actividades');
  const gpsStatus = document.getElementById('gps-status');
  let position;
  let watchId;
  const terms = { deporte: ['deporte', 'juego'], ciencia: ['ciencia', 'stem', 'robotica'],
    arte: ['arte', 'circo', 'musica', 'teatro', 'cultura'], naturaleza: ['huerto', 'naturaleza'] };
  let category = 'todas';
  let isPoster = localStorage.getItem('chispaplay_editorial_view') !== 'diario';
  let timer;
  for (const [id, data] of Object.entries(COMMUNES_DATA)) commune.add(new Option(data.name, id));
  const initial = normalize(params.get('commune') || '');
  commune.value = COMMUNES_DATA[initial] ? initial : '';
  search.value = params.get('sector') || '';
  function render() {
    const needle = normalize(search.value.trim());
    const items = events.filter(event =>
      (!commune.value || normalize(event.commune) === commune.value) &&
      (!sensory.checked || event.sensory) && (!wheelchair.checked || event.wheelchair) &&
      (category === 'todas' || terms[category].some(word => normalize(event.category).includes(word))) &&
      normalize([event.title, event.venue, event.sector, event.organizer, event.category].join(' ')).includes(needle)
    );
    document.getElementById('actividades-commune-badge').textContent = commune.value ? 'COMUNA: ' + COMMUNES_DATA[commune.value].name : 'REGIÓN METROPOLITANA';
    document.getElementById('actividades-count-display').textContent = items.length + ' actividades';
    clear.classList.toggle('hidden', !search.value);
    for (const [button, active] of [[poster, isPoster], [diary, !isPoster], ...categories.map(button => [button, button.dataset.cat === category])]) {
      button.classList.toggle('bg-black', active);
      button.classList.toggle('text-white', active);
      button.classList.toggle('bg-white', !active);
      button.classList.toggle('text-neutral-800', !active);
      button.classList.remove('text-neutral-700');
      button.setAttribute('aria-pressed', String(active));
    }
    for (const [group, includes] of [['hoy', days => days <= 0], ['semana', days => days > 0 && days <= 7], ['mes', days => days > 7]]) {
      const list = document.getElementById('list-' + group);
      list.className = isPoster ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-3';
      list.innerHTML = cards(items.filter(event => includes(daysAway(event))), isPoster, position);
    }
  }
  function apply() {
    render();
    track('filtros_usados');
  }
  search.addEventListener('input', () => {
    render();
    clearTimeout(timer);
    timer = setTimeout(() => track('filtros_usados'), 500);
  });
  clear.addEventListener('click', () => { search.value = ''; apply(); });
  for (const filter of [commune, sensory, wheelchair]) filter.addEventListener('change', apply);
  function stopGps() {
    if (watchId !== undefined) navigator.geolocation.clearWatch(watchId);
    watchId = undefined;
    position = undefined;
    gps.setAttribute('aria-pressed', 'false');
    render();
  }
  gps.setAttribute('aria-pressed', 'false');
  gps.addEventListener('click', () => {
    if (watchId !== undefined) {
      stopGps();
      gpsStatus.textContent = 'Ubicación desactivada.';
      return;
    }
    if (!navigator.geolocation) {
      gpsStatus.textContent = 'La ubicación no está disponible en este navegador.';
      return;
    }
    gps.setAttribute('aria-pressed', 'true');
    gpsStatus.textContent = 'Solicitando ubicación…';
    watchId = navigator.geolocation.watchPosition(({ coords }) => {
      position = coords;
      gpsStatus.textContent = 'Estimación disponible en actividades con coordenadas publicadas.';
      render();
    }, () => {
      stopGps();
      gpsStatus.textContent = 'No pudimos obtener tu ubicación. Puedes seguir usando los filtros.';
    }, { maximumAge: 20000, timeout: 10000 });
  });
  window.addEventListener('pagehide', stopGps);
  categories.forEach(button => button.addEventListener('click', () => { category = button.dataset.cat; apply(); }));
  for (const [button, active] of [[poster, true], [diary, false]]) {
    button.addEventListener('click', () => {
      isPoster = active;
      localStorage.setItem('chispaplay_editorial_view', active ? 'poster' : 'diario');
      render();
    });
  }
  render();
}

export function renderDiscovery(page, events, track) {
  if (page === 'home') renderHome(events, track);
  else renderDaily(events, track);
  track('cartelera_abierta');
}
