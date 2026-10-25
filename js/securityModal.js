/* ==========================================================================
   ARCHIVO: js/securityModal.js
   Modal Ergonómico de Seguridad Vecinal & Emergencias
   ========================================================================== */

import { getActiveCommune } from './state.js';
import { openParkDefectModal } from './defectModal.js';

let securityModalElement = null;

export function initSecurityModal() {
  if (document.getElementById('modal-security-hub')) return;

  securityModalElement = document.createElement('div');
  securityModalElement.id = 'modal-security-hub';
  securityModalElement.className = 'fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 hidden transition-opacity';

  const activeComuna = getActiveCommune();
  const isMaipu = activeComuna === 'maipu';
  const localSeguridadNumber = isMaipu ? '1418' : '1433';
  const localSeguridadName = isMaipu ? 'Seguridad Municipal Maipú' : 'Seguridad Municipal Valparaíso';

  securityModalElement.innerHTML = `
    <div class="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-xl border-t-2 sm:border-2 border-black p-5 sm:p-6 shadow-2xl animate-fade-soft max-h-[90vh] overflow-y-auto">
      
      <!-- Drag handle sutil para celular -->
      <div class="w-10 h-1 bg-neutral-300 rounded-full mx-auto mb-4 sm:hidden"></div>

      <!-- Cabecera -->
      <div class="flex items-center justify-between pb-3 border-b border-neutral-200">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <h3 class="font-sans font-bold text-base text-neutral-900 leading-tight">Seguridad y Cuidados</h3>
            <p class="text-xs text-neutral-500 font-sans">Contactos rápidos y reporte de tu plaza</p>
          </div>
        </div>
        <button 
          type="button" 
          id="btn-close-security-modal"
          class="text-neutral-400 hover:text-black p-1.5 transition-colors cursor-pointer rounded-lg hover:bg-neutral-100"
          aria-label="Cerrar modal"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- OPCIÓN 1: Reportar en Plaza -->
      <div class="mt-4 p-4 rounded-xl border border-neutral-200 hover:border-black transition-all bg-neutral-50/70">
        <div class="flex items-start gap-3">
          <div class="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center shrink-0 mt-0.5">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div class="flex-1">
            <div class="font-sans font-bold text-sm text-neutral-900">Avisar algo roto en la plaza</div>
            <p class="text-xs text-neutral-600 mt-0.5 leading-relaxed">
              Luminarias apagadas, máquinas deterioradas o basura acumulada. Se envía directo al catastro vecinal.
            </p>
            <button 
              type="button" 
              id="btn-action-report-plaza"
              class="mt-3 w-full bg-black hover:bg-[#E11D48] text-white font-sans text-xs font-bold py-2.5 px-4 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>Abrir reporte vecinal</span>
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- OPCIÓN 2: Teléfonos de Emergencia (Solo Recordatorio) -->
      <div class="mt-4">
        <div class="flex items-center justify-between mb-2 px-1">
          <span class="text-[11px] font-sans font-semibold uppercase tracking-wider text-neutral-500">
            Teléfonos de emergencia
          </span>
          <span class="text-[9px] font-mono bg-neutral-100 text-neutral-600 px-1.5 py-0.5 border border-neutral-300 font-bold uppercase">
            Solo recordatorio
          </span>
        </div>

        <div class="grid grid-cols-2 gap-2">
          
          <!-- Seguridad Municipal / Ciudadana -->
          <div class="p-3 rounded-lg border border-neutral-200 bg-white">
            <div class="text-xs font-sans font-bold text-neutral-900 flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-blue-600"></span>
              <span class="font-mono text-sm">1418 · 1433</span>
            </div>
            <div class="text-[10px] text-neutral-500 font-sans mt-0.5 truncate">Seguridad Municipal</div>
          </div>

          <!-- Carabineros -->
          <div class="p-3 rounded-lg border border-neutral-200 bg-white">
            <div class="text-xs font-sans font-bold text-neutral-900 flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span class="font-mono text-sm">133</span>
            </div>
            <div class="text-[10px] text-neutral-500 font-sans mt-0.5">Carabineros de Chile</div>
          </div>

          <!-- SAMU -->
          <div class="p-3 rounded-lg border border-neutral-200 bg-white">
            <div class="text-xs font-sans font-bold text-neutral-900 flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-red-600"></span>
              <span class="font-mono text-sm">131</span>
            </div>
            <div class="text-[10px] text-neutral-500 font-sans mt-0.5">Ambulancia SAMU</div>
          </div>

          <!-- Bomberos -->
          <div class="p-3 rounded-lg border border-neutral-200 bg-white">
            <div class="text-xs font-sans font-bold text-neutral-900 flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-amber-600"></span>
              <span class="font-mono text-sm">132</span>
            </div>
            <div class="text-[10px] text-neutral-500 font-sans mt-0.5">Bomberos</div>
          </div>

        </div>
      </div>

      <!-- Pie de cierre -->
      <div class="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
        <span>Protocolo barrial aplicable a todas las plazas</span>
        <button 
          type="button" 
          id="btn-dismiss-security-bottom"
          class="font-sans font-semibold text-neutral-700 hover:text-black cursor-pointer py-1 px-2"
        >
          Cerrar
        </button>
      </div>

    </div>
  `;

  document.body.appendChild(securityModalElement);

  // Handlers
  const closeBtn = document.getElementById('btn-close-security-modal');
  const dismissBtn = document.getElementById('btn-dismiss-security-bottom');
  const reportBtn = document.getElementById('btn-action-report-plaza');

  const hide = () => {
    securityModalElement.classList.add('hidden');
  };

  closeBtn?.addEventListener('click', hide);
  dismissBtn?.addEventListener('click', hide);
  securityModalElement.addEventListener('click', (e) => {
    if (e.target === securityModalElement) hide();
  });

  reportBtn?.addEventListener('click', () => {
    hide();
    openParkDefectModal(null, isMaipu ? 'Plaza de Maipú' : 'Plaza Victoria, Valparaíso');
  });
}

export function openSecurityModal() {
  initSecurityModal();
  if (securityModalElement) {
    securityModalElement.classList.remove('hidden');
  }
}
