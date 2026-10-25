/* ==========================================================================
   ARCHIVO: js/securityGuideModal.js
   Guía Ilustrada de Seguridad y Emergencia Vecinal (Entrada Slide-In)
   ========================================================================== */

import { getActiveCommune } from './state.js';
import { openParkDefectModal } from './defectModal.js';

let securityGuideModalElement = null;

export function initSecurityGuideModal() {
  if (document.getElementById('modal-security-guide')) return;

  securityGuideModalElement = document.createElement('div');
  securityGuideModalElement.id = 'modal-security-guide';
  securityGuideModalElement.className = 'fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 hidden transition-opacity';

  const activeComuna = getActiveCommune();
  const isMaipu = activeComuna === 'maipu';
  const localSeguridadNumber = isMaipu ? '1418' : '1433';
  const localSeguridadName = isMaipu ? 'Seguridad Municipal Maipú' : 'Seguridad Municipal Valparaíso';

  securityGuideModalElement.innerHTML = `
    <div class="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl border-t-2 sm:border-2 border-black p-5 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto animate-slide-in-up">
      
      <!-- Drag handle ergonómico para celular -->
      <div class="w-12 h-1.5 bg-neutral-300 rounded-full mx-auto mb-4 sm:hidden"></div>

      <!-- Cabecera -->
      <div class="flex items-center justify-between pb-3.5 border-b border-neutral-200">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
            <svg class="w-5 h-5 stroke-[2.2]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-mono uppercase tracking-wider bg-black text-white px-2 py-0.5 font-bold">
                Guía Oficial
              </span>
              <span class="text-xs text-neutral-500 font-medium font-mono">
                Cuidado Barrial
              </span>
            </div>
            <h3 class="font-sans font-black text-lg text-neutral-900 leading-tight mt-0.5">
              Seguridad y Emergencia Barrial
            </h3>
          </div>
        </div>
        <button 
          type="button" 
          id="btn-close-security-guide"
          class="text-neutral-400 hover:text-black p-2 transition-colors cursor-pointer rounded-lg hover:bg-neutral-100"
          aria-label="Cerrar guía de seguridad"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <p class="text-xs text-neutral-600 mt-3 leading-relaxed">
        Protocolo ilustrado paso a paso sobre cómo actuar de forma segura y coordinada ante cualquier situación de riesgo o descompensación en la plaza.
      </p>

      <!-- GUÍA ILUSTRADA EN 3 PASOS CON ICONOS GRANDES -->
      <div class="mt-4 space-y-3">
        
        <!-- PASO 1: BOTÓN DE ALERTA -->
        <div class="p-4 rounded-xl border border-neutral-200 bg-neutral-50/70 hover:border-black transition-all">
          <div class="flex items-start gap-3.5">
            <div class="w-11 h-11 rounded-xl bg-[#E11D48] text-white flex items-center justify-center shrink-0 shadow-xs">
              <svg class="w-5 h-5 stroke-[2.2]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0M3.124 7.5A8.969 8.969 0 015.292 3m13.416 0a8.969 8.969 0 012.168 4.5" />
              </svg>
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-mono font-bold bg-neutral-900 text-white px-1.5 py-0.2 uppercase">
                  Paso 1
                </span>
                <h4 class="font-sans font-bold text-sm text-neutral-900">
                  Botón de Alerta Silenciosa
                </h4>
              </div>
              <p class="text-xs text-neutral-600 mt-1 leading-relaxed">
                Si notas peligro, personas sospechosas o corte de luz, activa la alerta vecinal en ChispaPlay. Notifica discretamente a guardianes en 500m a la redonda sin generar alarma pública.
              </p>
            </div>
          </div>
        </div>

        <!-- PASO 2: CONTACTO CON VIGILANTES -->
        <div class="p-4 rounded-xl border border-neutral-200 bg-neutral-50/70 hover:border-black transition-all">
          <div class="flex items-start gap-3.5">
            <div class="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <svg class="w-5 h-5 stroke-[2.2]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
              </svg>
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-mono font-bold bg-neutral-900 text-white px-1.5 py-0.2 uppercase">
                  Paso 2
                </span>
                <h4 class="font-sans font-bold text-sm text-neutral-900">
                  Contacto con Vigilantes y Monitores
                </h4>
              </div>
              <p class="text-xs text-neutral-600 mt-1 leading-relaxed">
                Acércate al monitor acreditado del taller (con credencial oficial visible) o al móvil de Seguridad Municipal de tu cuadrante. Tienen enlace directo con la central y ambulancias.
              </p>
            </div>
          </div>
        </div>

        <!-- PASO 3: PUNTOS DE ENCUENTRO SEGUROS -->
        <div class="p-4 rounded-xl border border-neutral-200 bg-neutral-50/70 hover:border-black transition-all">
          <div class="flex items-start gap-3.5">
            <div class="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <svg class="w-5 h-5 stroke-[2.2]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-mono font-bold bg-neutral-900 text-white px-1.5 py-0.2 uppercase">
                  Paso 3
                </span>
                <h4 class="font-sans font-bold text-sm text-neutral-900">
                  Puntos de Encuentro Protegidos
                </h4>
              </div>
              <p class="text-xs text-neutral-600 mt-1 leading-relaxed">
                Ante evacuación o emergencia mayor, acude a la zona señalizada frente a la sede de la Junta de Vecinos o el tótem solar de la plaza, donde la iluminación y visibilidad son permanentes.
              </p>
            </div>
          </div>
        </div>

      </div>

      <!-- NÚMEROS DE EMERGENCIA: SOLO RECORDATORIO (SIN ENLACES TEL:) -->
      <div class="mt-5 pt-4 border-t border-neutral-200">
        <div class="flex items-center justify-between mb-2">
          <span class="text-[11px] font-sans font-bold uppercase tracking-wider text-neutral-700">
            Teléfonos de Emergencia
          </span>
          <span class="text-[9px] font-mono bg-neutral-100 text-neutral-600 border border-neutral-300 px-1.5 py-0.5 uppercase font-semibold">
            Solo Recordatorio
          </span>
        </div>

        <p className="text-[11px] text-neutral-500 mb-2.5">
          Para evitar llamadas accidentales, marca estos números directamente en el teclado de tu celular:
        </p>

        <div class="grid grid-cols-2 gap-2">
          
          <!-- Seguridad Municipal / Ciudadana -->
          <div class="p-2.5 rounded-lg border border-neutral-200 bg-white">
            <div class="flex items-center justify-between">
              <span class="w-2 h-2 rounded-full bg-blue-600"></span>
              <span class="text-[9px] font-mono text-neutral-400 uppercase">Seguridad</span>
            </div>
            <div class="font-mono font-black text-base text-neutral-900 mt-1 leading-none">
              1418 · 1433
            </div>
            <div class="text-[10px] text-neutral-600 font-medium truncate mt-0.5">
              Seguridad Municipal
            </div>
          </div>

          <!-- Carabineros -->
          <div class="p-2.5 rounded-lg border border-neutral-200 bg-white">
            <div class="flex items-center justify-between">
              <span class="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span class="text-[9px] font-mono text-neutral-400 uppercase">Policial</span>
            </div>
            <div class="font-mono font-black text-base text-neutral-900 mt-1 leading-none">
              133
            </div>
            <div class="text-[10px] text-neutral-600 font-medium truncate mt-0.5">
              Carabineros de Chile
            </div>
          </div>

          <!-- SAMU -->
          <div class="p-2.5 rounded-lg border border-neutral-200 bg-white">
            <div class="flex items-center justify-between">
              <span class="w-2 h-2 rounded-full bg-red-600"></span>
              <span class="text-[9px] font-mono text-neutral-400 uppercase">Salud</span>
            </div>
            <div class="font-mono font-black text-base text-neutral-900 mt-1 leading-none">
              131
            </div>
            <div class="text-[10px] text-neutral-600 font-medium truncate mt-0.5">
              Ambulancia SAMU
            </div>
          </div>

          <!-- Bomberos -->
          <div class="p-2.5 rounded-lg border border-neutral-200 bg-white">
            <div class="flex items-center justify-between">
              <span class="w-2 h-2 rounded-full bg-amber-600"></span>
              <span class="text-[9px] font-mono text-neutral-400 uppercase">Rescate</span>
            </div>
            <div class="font-mono font-black text-base text-neutral-900 mt-1 leading-none">
              132
            </div>
            <div class="text-[10px] text-neutral-600 font-medium truncate mt-0.5">
              Bomberos
            </div>
          </div>

        </div>
      </div>

      <!-- ACCESO RÁPIDO A REPORTE DE PLAZA -->
      <div class="mt-4 p-3.5 rounded-xl border border-neutral-200 bg-neutral-50 flex items-center justify-between gap-3">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center shrink-0">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <div class="text-xs font-bold text-neutral-900">¿Hay algo roto en la plaza?</div>
            <div class="text-[11px] text-neutral-500">Luminarias, máquinas o juegos dañados</div>
          </div>
        </div>
        <button
          type="button"
          id="btn-guide-report-park"
          class="px-3 py-2 bg-black hover:bg-[#E11D48] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0 flex items-center gap-1 shadow-xs"
        >
          <span>Avisar</span>
          <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>

      <!-- Botón de Cierre al Pie -->
      <div class="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between">
        <span class="text-[11px] text-neutral-500 font-medium">
          Protocolo de cuidado vecinal aplicable a todas las plazas.
        </span>
        <button 
          type="button" 
          id="btn-dismiss-security-guide"
          class="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0"
        >
          Entendido, cerrar guía
        </button>
      </div>

    </div>
  `;

  document.body.appendChild(securityGuideModalElement);

  // Handlers
  const closeBtn = document.getElementById('btn-close-security-guide');
  const dismissBtn = document.getElementById('btn-dismiss-security-guide');
  const reportBtn = document.getElementById('btn-guide-report-park');

  const hide = () => {
    securityGuideModalElement.classList.add('hidden');
  };

  closeBtn?.addEventListener('click', hide);
  dismissBtn?.addEventListener('click', hide);
  securityGuideModalElement.addEventListener('click', (e) => {
    if (e.target === securityGuideModalElement) hide();
  });

  reportBtn?.addEventListener('click', () => {
    hide();
    openParkDefectModal(null, isMaipu ? 'Plaza de Maipú' : 'Plaza Victoria, Valparaíso');
  });
}

export function openSecurityGuideModal() {
  initSecurityGuideModal();
  if (securityGuideModalElement) {
    securityGuideModalElement.classList.remove('hidden');
  }
}
