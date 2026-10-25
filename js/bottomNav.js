/* ==========================================================================
   ARCHIVO: js/bottomNav.js
   Componente BottomNavigation Fijo Inferior para Celulares (Minimalista Blanco)
   ========================================================================== */

import { getReservedActivityIds } from './state.js';
import { openPaseVecinalModal } from './paseModal.js';
import { openSecurityGuideModal } from './securityGuideModal.js';
import { openSecurityModal } from './securityModal.js';

let bottomNavElement = null;

/**
 * Renderiza el componente de navegación inferior móvil
 * @param {'inicio' | 'actividades' | 'perfil' | 'seguridad'} activeTab
 */
export function renderBottomNav(activeTab = 'inicio') {
  if (bottomNavElement && document.body.contains(bottomNavElement)) {
    bottomNavElement.remove();
  }

  const reservedIds = getReservedActivityIds();
  const reserveCount = reservedIds.length;

  bottomNavElement = document.createElement('nav');
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
          ${
            !isCartelera && localStorage.getItem('chispaplay_cartelera_seen') !== 'true'
              ? `<span id="badge-cartelera-red-dot" class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#E11D48] rounded-full ring-2 ring-white animate-pulse" title="Nuevos talleres"></span>`
              : ''
          }
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
          ${
            reserveCount > 0
              ? `<span class="absolute -top-1 -right-2 bg-[#E11D48] text-white text-[9px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">${reserveCount}</span>`
              : ''
          }
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

  // Event Listeners
  const btnCartelera = document.getElementById('btn-bottom-cartelera');
  if (btnCartelera) {
    btnCartelera.addEventListener('click', () => {
      localStorage.setItem('chispaplay_cartelera_seen', 'true');
      const dot = document.getElementById('badge-cartelera-red-dot');
      if (dot) dot.remove();
    });
  }

  const btnPass = document.getElementById('btn-bottom-my-pass');
  if (btnPass) {
    btnPass.addEventListener('click', () => {
      openPaseVecinalModal();
    });
  }

  const btnSecurity = document.getElementById('btn-bottom-security-hub');
  if (btnSecurity) {
    btnSecurity.addEventListener('click', () => {
      openSecurityGuideModal();
    });
  }
}

// Escuchar cambios de reservas para actualizar el badge numérico dinámicamente
if (typeof window !== 'undefined') {
  window.addEventListener('chispaplay:reservations-changed', () => {
    const currentActive = window.location.pathname.includes('actividades')
      ? 'actividades'
      : window.location.pathname.includes('perfil')
      ? 'perfil'
      : 'inicio';
    renderBottomNav(currentActive);
  });
}
