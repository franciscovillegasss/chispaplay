/* ==========================================================================
   ARCHIVO: js/toast.js
   Sistema de Notificaciones Toast Flotantes · Micro-Feedback Háptico y Visual
   ========================================================================== */

let toastContainer = null;
let currentToastElement = null;
let currentToastTimer = null;

function ensureToastContainer() {
  if (!toastContainer || !document.body.contains(toastContainer)) {
    toastContainer = document.getElementById('chispaplay-toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'chispaplay-toast-container';
      // Posicionamiento ergonómico: top-20 en móvil (debajo del navbar) y top-5 en desktop, sin tapar navegación
      toastContainer.className = 'fixed top-20 right-4 sm:top-6 sm:right-6 z-50 flex flex-col items-end max-w-sm w-[calc(100%-2rem)] sm:w-auto pointer-events-none';
      document.body.appendChild(toastContainer);
    }
  }
  return toastContainer;
}

/**
 * Muestra una notificación flotante única (cero spam visual) estilo Time Out
 * Reemplaza inmediatamente cualquier toast previo y desaparece a los 2.2s
 * @param {string} title - Título breve en mayúsculas
 * @param {string} message - Descripción clara
 * @param {'success' | 'info' | 'warn' | 'error'} type
 * @param {number} duration - Milisegundos antes del autocierre (estrictamente 2200ms por defecto)
 */
export function showToast(title, message, type = 'success', duration = 2200) {
  const container = ensureToastContainer();

  // Cancelar y remover inmediatamente cualquier toast activo previo
  if (currentToastTimer) {
    clearTimeout(currentToastTimer);
    currentToastTimer = null;
  }
  if (currentToastElement && currentToastElement.parentElement) {
    currentToastElement.remove();
    currentToastElement = null;
  }

  const toast = document.createElement('div');
  toast.className = 'pointer-events-auto bg-white border-2 border-black p-3.5 shadow-[4px_4px_0px_0px_#111111] transform transition-all duration-200 ease-out translate-y-[-8px] opacity-0 flex items-start justify-between gap-3 font-sans w-full max-w-sm';

  let badgeColor = 'bg-[#059669] text-white';
  let badgeIcon = '✓';

  if (type === 'info') {
    badgeColor = 'bg-[#111111] text-white';
    badgeIcon = 'ℹ';
  } else if (type === 'warn') {
    badgeColor = 'bg-amber-500 text-black';
    badgeIcon = '⚠';
  } else if (type === 'error') {
    badgeColor = 'bg-[#E11D48] text-white';
    badgeIcon = '✕';
  }

  toast.innerHTML = `
    <div class="flex items-start gap-2.5 overflow-hidden">
      <span class="${badgeColor} w-6 h-6 flex items-center justify-center text-xs font-black shrink-0 border border-black shadow-[1px_1px_0px_0px_#111111]">
        ${badgeIcon}
      </span>
      <div>
        <div class="text-xs font-mono font-black uppercase tracking-tight text-neutral-900 leading-tight">
          ${title}
        </div>
        <div class="text-[12px] text-neutral-600 font-medium leading-snug mt-0.5">
          ${message}
        </div>
      </div>
    </div>
    <button class="btn-dismiss-toast text-neutral-400 hover:text-black text-sm font-bold p-0.5 leading-none cursor-pointer shrink-0">
      ✕
    </button>
  `;

  container.appendChild(toast);
  currentToastElement = toast;

  // Micro vibración háptica en teléfonos compatibles
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate([20, 15, 20]);
    } catch {
      // Ignorar si no está permitido
    }
  }

  // Animación de entrada
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-[-8px]', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
  });

  const dismiss = () => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-[-8px]', 'opacity-0');
    setTimeout(() => {
      if (toast.parentElement) toast.remove();
      if (currentToastElement === toast) {
        currentToastElement = null;
      }
    }, 200);
  };

  const closeBtn = toast.querySelector('.btn-dismiss-toast');
  if (closeBtn) {
    closeBtn.addEventListener('click', dismiss);
  }

  if (duration > 0) {
    currentToastTimer = setTimeout(dismiss, duration);
  }
}
