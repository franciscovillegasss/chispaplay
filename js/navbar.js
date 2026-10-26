/* ==========================================================================
   ARCHIVO: js/navbar.js
   Barra de Navegación Consistente & Selector Global Persistente de Barrio
   ========================================================================== */

import { COMMUNES_DATA } from './data.js';
import {
  getActiveCommune,
  setActiveCommune,
  getActiveReferencePoint,
  setActiveReferencePoint,
  getTrackedUser,
  logAction
} from './state.js';
import { openUserModal } from './userModal.js';
import { openPaseVecinalModal } from './paseModal.js';
import { openSecurityGuideModal } from './securityGuideModal.js';
import { openScraperModal } from './scraper.js';
import { showToast } from './toast.js';
import { renderBottomNav } from './bottomNav.js';

export function renderNavbar(activePageKey = 'inicio') {
  const container = document.getElementById('navbar-container');
  if (!container) return;

  const currentCommuneKey = getActiveCommune();
  const currentCommune = COMMUNES_DATA[currentCommuneKey];
  const currentRef = getActiveReferencePoint();
  const user = getTrackedUser();

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
              <span class="max-w-[110px] sm:max-w-[150px] truncate text-neutral-900 group-hover:text-white font-bold">${currentRef.name}</span>
              <span class="text-[9px] text-neutral-500 font-normal">▼</span>
            </button>

            <!-- Menú Desplegable Rápido de Sectores -->
            <div 
              id="nav-dropdown-quick-sector" 
              class="hidden absolute right-0 mt-2 w-72 bg-white border-3 border-black shadow-[6px_6px_0px_0px_#111111] z-50 animate-fade-soft py-2 font-sans"
            >
              <div class="px-3.5 py-1.5 text-[10px] font-mono uppercase text-neutral-500 font-bold border-b border-neutral-200 flex items-center justify-between">
                <span>SECTORES ${currentCommune.name.toUpperCase()} (15 MIN)</span>
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
                        <span class="truncate">📍 ${s.name}</span>
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
                  <span>Cambiar a ${currentCommuneKey === 'maipu' ? 'Valparaíso' : 'Maipú'} →</span>
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
                    <div class="text-xs font-black text-neutral-900 leading-none">${user.name.split(' ')[0]}</div>
                    <div class="text-[9px] font-mono text-neutral-500 leading-none mt-0.5">${user.token}</div>
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
                <span class="text-[10px] font-mono text-[#E11D48] font-bold truncate max-w-[110px]">${currentRef.name}</span>
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
                <span class="text-[10px] font-mono text-[#059669]">QR Offline</span>
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
              <button 
                type="button"
                id="menu-btn-scraper"
                class="w-full text-left px-4 py-2 text-xs font-bold text-neutral-900 hover:bg-neutral-100 hover:text-[#E11D48] cursor-pointer flex items-center justify-between"
              >
                <span>✦ Sincronizador Municipal</span>
                <span class="text-[10px] font-mono text-neutral-500">Rastreador</span>
              </button>

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

  bindNavbarEvents(activePageKey);
  renderBottomNav(activePageKey);
}

function bindNavbarEvents(activePageKey = 'inicio') {
  const btnOpenLocation = document.getElementById('nav-btn-open-location');
  const btnRegister = document.getElementById('nav-btn-register');
  const btnUserPassCard = document.getElementById('nav-btn-user-pass-card');
  const btnOpenScraper = document.getElementById('nav-btn-open-scraper');
  const btnMoreMenu = document.getElementById('nav-btn-more-menu');
  const dropdownMore = document.getElementById('nav-dropdown-more');
  const menuBtnScraper = document.getElementById('menu-btn-scraper');

  // Selector rápido de barrio
  const btnQuickSector = document.getElementById('nav-btn-quick-sector');
  const dropdownQuickSector = document.getElementById('nav-dropdown-quick-sector');
  const btnQuickSwitchCommune = document.getElementById('btn-quick-switch-commune');

  if (btnQuickSector && dropdownQuickSector) {
    btnQuickSector.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdownQuickSector.classList.toggle('hidden');
      if (dropdownMore) dropdownMore.classList.add('hidden');
    });

    document.querySelectorAll('.btn-quick-ref').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const refId = e.currentTarget.getAttribute('data-quick-ref-id');
        const communeKey = getActiveCommune();
        const communeObj = COMMUNES_DATA[communeKey];
        const found = communeObj.suggestions.find(s => s.id === refId);
        if (found) {
          setActiveReferencePoint(found);
          dropdownQuickSector.classList.add('hidden');
          showToast('SECTOR ACTUALIZADO', `📍 Mostrando actividades a menos de 15 min de ${found.name}`, 'success');
          renderNavbar(activePageKey);
        }
      });
    });

    if (btnQuickSwitchCommune) {
      btnQuickSwitchCommune.addEventListener('click', () => {
        const currentCommune = getActiveCommune();
        const newCommune = currentCommune === 'maipu' ? 'valparaiso' : 'maipu';
        setActiveCommune(newCommune);
        dropdownQuickSector.classList.add('hidden');
        showToast('COMUNA ACTUALIZADA', `📍 Cambiaste a ${newCommune === 'maipu' ? 'Maipú' : 'Valparaíso'}`, 'info');
        renderNavbar(activePageKey);
      });
    }

    document.addEventListener('click', (e) => {
      if (!dropdownQuickSector.contains(e.target) && e.target !== btnQuickSector) {
        dropdownQuickSector.classList.add('hidden');
      }
    });
  }

  const openLocation = () => openLocationModal();

  if (btnOpenLocation) btnOpenLocation.addEventListener('click', openLocation);

  if (btnMoreMenu && dropdownMore) {
    btnMoreMenu.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdownMore.classList.toggle('hidden');
      if (dropdownQuickSector) dropdownQuickSector.classList.add('hidden');
    });

    document.addEventListener('click', (e) => {
      if (!dropdownMore.contains(e.target) && e.target !== btnMoreMenu) {
        dropdownMore.classList.add('hidden');
      }
    });

    const menuBtnMobileLocation = document.getElementById('menu-btn-mobile-location');
    if (menuBtnMobileLocation) {
      menuBtnMobileLocation.addEventListener('click', () => {
        dropdownMore.classList.add('hidden');
        openLocationModal();
      });
    }
  }

  const menuBtnSecurityGuide = document.getElementById('menu-btn-security-guide');
  if (menuBtnSecurityGuide) {
    menuBtnSecurityGuide.addEventListener('click', () => {
      if (dropdownMore) dropdownMore.classList.add('hidden');
      openSecurityGuideModal();
    });
  }

  const launchScraper = () => {
    openScraperModal(() => {
      window.location.reload();
    });
  };

  if (btnOpenScraper) btnOpenScraper.addEventListener('click', launchScraper);
  if (menuBtnScraper) menuBtnScraper.addEventListener('click', launchScraper);

  if (btnRegister) {
    btnRegister.addEventListener('click', () => {
      openPaseVecinalModal();
    });
  }

  if (btnUserPassCard) {
    btnUserPassCard.addEventListener('click', () => {
      openPaseVecinalModal();
    });
  }

  // ==========================================================================
  // ACCESO SECRETO AL MODO CEO / MUNICIPAL (CERO RASTRO PÚBLICO)
  // 1. 5 clics rápidos seguidos en el logo CHISPA PLAY
  // 2. Atajo de teclado Alt + Shift + C o #ceo en URL
  // 3. Palabra clave 'ceo2026' en cualquier input de búsqueda
  // ==========================================================================
  let logoClicks = 0;
  let logoTimer = null;
  const logoLink = document.getElementById('nav-logo-link');
  if (logoLink) {
    logoLink.addEventListener('click', (e) => {
      logoClicks++;
      clearTimeout(logoTimer);
      if (logoClicks >= 5) {
        e.preventDefault();
        logoClicks = 0;
        window.location.href = 'ceo.html';
        return;
      }
      logoTimer = setTimeout(() => {
        logoClicks = 0;
      }, 1800);
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.altKey && e.shiftKey && (e.key === 'C' || e.key === 'c')) {
      e.preventDefault();
      window.location.href = 'ceo.html';
    }
  });

  if (window.location.hash === '#ceo') {
    window.location.href = 'ceo.html';
  }

  document.addEventListener('input', (e) => {
    if (e.target && e.target.value && typeof e.target.value === 'string') {
      if (e.target.value.toLowerCase().trim() === 'ceo2026') {
        e.target.value = '';
        window.location.href = 'ceo.html';
      }
    }
  });
}

// Modal de Selección Hiperfocalizada de Comuna y Punto de Referencia
export function openLocationModal(isForcedFirstTime = false) {
  let modalRoot = document.getElementById('location-modal-root');
  if (!modalRoot) {
    modalRoot = document.createElement('div');
    modalRoot.id = 'location-modal-root';
    document.body.appendChild(modalRoot);
  }

  let selectedCommuneKey = getActiveCommune();
  let communeObj = COMMUNES_DATA[selectedCommuneKey];

  function renderContent() {
    communeObj = COMMUNES_DATA[selectedCommuneKey];

    modalRoot.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-soft">
        <div class="bg-white border-4 border-black max-w-xl w-full p-6 md:p-8 shadow-[12px_12px_0px_0px_#E11D48] relative max-h-[92vh] overflow-y-auto">
          
          ${
            !isForcedFirstTime
              ? `<button id="btn-close-loc-modal" class="absolute top-4 right-4 text-black hover:text-[#E11D48] text-2xl font-black focus:outline-none">✕</button>`
              : ''
          }

          <div class="mb-4">
            <span class="bg-[#111111] text-white text-[11px] font-mono uppercase tracking-widest px-2.5 py-1">
              CHISPAPLAY · CONFIGURACIÓN HIPERLOCAL
            </span>
          </div>

          <h2 class="text-3xl md:text-4xl font-black uppercase tracking-tight text-neutral-900 leading-none mb-2">
            ¿Qué hacemos en ${communeObj.name}?
          </h2>
          <p class="text-sm text-neutral-600 mb-6 font-medium">
            Selecciona tu comuna y tu sector habitual para calcular tiempos caminando en tiempo real bajo la regla de 15 minutos.
          </p>

          <!-- Paso 1: Selección de Comuna -->
          <div class="mb-6">
            <div class="text-xs font-black uppercase tracking-wider text-neutral-800 mb-2 flex items-center gap-2">
              <span class="bg-neutral-900 text-white w-5 h-5 flex items-center justify-center text-[10px]">1</span>
              <span>Comuna Activa:</span>
            </div>
            
            <div class="grid grid-cols-2 gap-3">
              <button 
                type="button" 
                data-commune="maipu"
                class="btn-commune-select p-4 border-2 text-left transition-all cursor-pointer ${
                  selectedCommuneKey === 'maipu'
                    ? 'border-black bg-neutral-900 text-white shadow-[4px_4px_0px_0px_#E11D48]'
                    : 'border-neutral-300 bg-neutral-50 text-neutral-800 hover:border-black'
                }"
              >
                <div class="text-base font-black uppercase">Maipú</div>
                <div class="text-xs ${selectedCommuneKey === 'maipu' ? 'text-neutral-300' : 'text-neutral-500'}">
                  Santiago Poniente · RM
                </div>
              </button>

              <button 
                type="button" 
                data-commune="valparaiso"
                class="btn-commune-select p-4 border-2 text-left transition-all cursor-pointer ${
                  selectedCommuneKey === 'valparaiso'
                    ? 'border-black bg-neutral-900 text-white shadow-[4px_4px_0px_0px_#E11D48]'
                    : 'border-neutral-300 bg-neutral-50 text-neutral-800 hover:border-black'
                }"
              >
                <div class="text-base font-black uppercase">Valparaíso</div>
                <div class="text-xs ${selectedCommuneKey === 'valparaiso' ? 'text-neutral-300' : 'text-neutral-500'}">
                  Cerros & Costa · V Región
                </div>
              </button>
            </div>
          </div>

          <!-- Paso 2: Punto de Referencia -->
          <div class="mb-6">
            <div class="text-xs font-black uppercase tracking-wider text-neutral-800 mb-2 flex items-center gap-2">
              <span class="bg-neutral-900 text-white w-5 h-5 flex items-center justify-center text-[10px]">2</span>
              <span>Punto de Referencia (Cálculo de Cercanía Peatonal):</span>
            </div>

            <p class="text-xs text-neutral-500 mb-3">
              Elige tu barrio o sector de referencia en <strong>${communeObj.name}</strong> para ver distancias exactas:
            </p>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
              ${communeObj.suggestions
                .map(s => {
                  const currentRef = getActiveReferencePoint();
                  const isSelected = currentRef.id === s.id;
                  return `
                    <button 
                      type="button" 
                      data-ref-id="${s.id}"
                      class="btn-ref-select p-2.5 text-left border text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'border-black bg-neutral-200 text-black shadow-xs font-black'
                          : 'border-neutral-300 bg-white hover:border-black text-neutral-800'
                      }"
                    >
                      📍 ${s.name}
                    </button>
                  `;
                })
                .join('')}
            </div>

            <!-- Botón Omitir -->
            <button 
              type="button" 
              id="btn-skip-ref" 
              class="w-full text-center py-2 text-xs font-bold uppercase tracking-wider text-neutral-600 hover:text-black border border-dashed border-neutral-400 hover:border-black bg-neutral-50 transition-colors"
            >
              Omitir (Usar centro de la comuna como referencia: ${communeObj.centerReference.name})
            </button>
          </div>

          <!-- Botón de Confirmación -->
          <button 
            type="button" 
            id="btn-confirm-location"
            class="w-full bg-[#E11D48] hover:bg-[#BE123C] text-white py-3.5 font-black uppercase tracking-wider text-sm shadow-[4px_4px_0px_0px_#111111] transition-all cursor-pointer"
          >
            Explorar Actividades en ${communeObj.name} →
          </button>
        </div>
      </div>
    `;

    // Bindings
    if (!isForcedFirstTime) {
      const closeBtn = document.getElementById('btn-close-loc-modal');
      if (closeBtn) closeBtn.addEventListener('click', () => { modalRoot.innerHTML = ''; });
    }

    document.querySelectorAll('.btn-commune-select').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const comm = e.currentTarget.getAttribute('data-commune');
        selectedCommuneKey = comm;
        setActiveCommune(comm);
        renderContent();
      });
    });

    document.querySelectorAll('.btn-ref-select').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const refId = e.currentTarget.getAttribute('data-ref-id');
        const found = communeObj.suggestions.find(s => s.id === refId);
        if (found) {
          setActiveReferencePoint(found);
          logAction('SELECCION_UBICACION', 'Punto de Referencia Actualizado', `${found.name} (${communeObj.name})`);
          renderContent();
        }
      });
    });

    document.getElementById('btn-skip-ref').addEventListener('click', () => {
      setActiveReferencePoint(communeObj.centerReference);
      logAction('SELECCION_UBICACION', 'Punto de Referencia por Defecto', `${communeObj.centerReference.name} (${communeObj.name})`);
      modalRoot.innerHTML = '';
      window.location.reload();
    });

    document.getElementById('btn-confirm-location').addEventListener('click', () => {
      modalRoot.innerHTML = '';
      window.location.reload();
    });
  }

  renderContent();
}

// Auto-check on first visit (Deshabilitado: toda la interacción ocurre directamente sobre el lienzo rojo)
export function checkFirstTimeOnboarding() {
  // Sin modal emergente inicial
}
