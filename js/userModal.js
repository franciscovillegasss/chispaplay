/* ==========================================================================
   ARCHIVO: js/userModal.js
   Micro-Checkout Barrial · Pase Vecinal en 1 Clic con Token (CERO RUT)
   ========================================================================== */

import { confirmPaseVecinal, getTrackedUser, logAction } from './state.js';
import { showToast } from './toast.js';

let pendingActivityId = null;
let pendingOnSuccessCallback = null;

let isEditMode = false;

export function openUserModal(activityIdToReserve = null, onSuccess = null, editMode = false) {
  pendingActivityId = activityIdToReserve;
  pendingOnSuccessCallback = onSuccess;
  isEditMode = editMode;

  const modalContainer = document.getElementById('user-registration-modal-root') || createModalContainer();
  renderCheckoutModal();
}

export function closeUserModal() {
  const modalContainer = document.getElementById('user-registration-modal-root');
  if (modalContainer) {
    modalContainer.innerHTML = '';
  }
  pendingActivityId = null;
  pendingOnSuccessCallback = null;
  isEditMode = false;
}

function createModalContainer() {
  const div = document.createElement('div');
  div.id = 'user-registration-modal-root';
  document.body.appendChild(div);
  return div;
}

function renderCheckoutModal() {
  const container = document.getElementById('user-registration-modal-root');
  if (!container) return;

  const existingUser = getTrackedUser();
  const defaultWhatsApp = existingUser?.whatsapp || (existingUser?.contact && existingUser.contact.includes('+') ? existingUser.contact : '');

  container.innerHTML = `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-soft">
      <div id="checkout-modal-card" class="bg-white border-4 border-black max-w-md w-full p-6 sm:p-7 shadow-[10px_10px_0px_0px_#E11D48] relative">
        
        <!-- Botón cerrar -->
        <button id="btn-close-modal" class="absolute top-4 right-4 text-black hover:text-[#E11D48] text-2xl font-black leading-none focus:outline-none cursor-pointer" aria-label="Cerrar">
          ✕
        </button>

        <div class="flex items-center gap-2 mb-2">
          <span class="bg-[#E11D48] text-white text-[10px] font-mono font-black uppercase tracking-wider px-2 py-0.5">
            ${isEditMode ? 'ACTUALIZAR DATOS' : 'PASO RÁPIDO · 5 SEGUNDOS'}
          </span>
          <span class="text-xs text-[#059669] font-mono font-bold flex items-center gap-1">
            <span class="w-2 h-2 rounded-full bg-[#059669] inline-block animate-pulse"></span>
            100% GRATUITO · CERO RUT
          </span>
        </div>

        <h3 class="text-2xl font-black uppercase tracking-tight text-neutral-900 mb-1.5 leading-tight">
          ${isEditMode ? 'Editar Datos de Contacto' : 'Tu Credencial Vecinal'}
        </h3>

        <p class="text-xs sm:text-sm text-neutral-700 mb-5 leading-relaxed font-medium bg-neutral-50 p-2.5 border-l-4 border-[#E11D48]">
          Para generar tu <strong>Credencial QR Vecinal</strong> y avisarte si se liberan cupos.
        </p>

        <form id="form-micro-checkout" class="space-y-4">
          <div>
            <label for="input-adult-name" class="block text-xs font-black uppercase tracking-wider text-neutral-900 mb-1">
              Tu Nombre *
            </label>
            <input 
              type="text" 
              id="input-adult-name" 
              required 
              value="${existingUser?.name || ''}"
              placeholder="Ej. Constanza Morales"
              class="w-full bg-neutral-50 border-2 border-black focus:border-[#E11D48] p-2.5 text-sm font-bold text-neutral-900 outline-none shadow-[2px_2px_0px_0px_#111111]"
            />
          </div>

          <div>
            <label for="input-adult-whatsapp" class="block text-xs font-black uppercase tracking-wider text-neutral-900 mb-1 flex items-center justify-between">
              <span>Tu WhatsApp (+56 9 XXXX XXXX) *</span>
              <span class="text-[10px] font-mono text-[#059669] font-bold">Avisos de Cupos</span>
            </label>
            <input 
              type="tel" 
              id="input-adult-whatsapp" 
              required
              value="${defaultWhatsApp}"
              placeholder="+56 9 8765 4321"
              class="w-full bg-neutral-50 border-2 border-black focus:border-[#E11D48] p-2.5 text-sm font-mono font-bold text-neutral-900 outline-none shadow-[2px_2px_0px_0px_#111111]"
            />
            <p class="text-[11px] text-neutral-500 mt-1.5 font-medium">
              Solo para generar tu credencial digital y notificarte en 1 clic. No pedimos RUT ni tarjeta.
            </p>
          </div>

          <div class="pt-2">
            <button 
              type="submit" 
              class="w-full bg-black hover:bg-[#E11D48] text-white py-3.5 px-4 font-black uppercase tracking-wider text-xs sm:text-sm transition-all text-center shadow-[4px_4px_0px_0px_#E11D48] cursor-pointer"
            >
              ${isEditMode ? 'Guardar Cambios →' : 'Generar Credencial y Confirmar →'}
            </button>
          </div>
        </form>

      </div>
    </div>
  `;

  document.getElementById('btn-close-modal').addEventListener('click', closeUserModal);

  const waInput = document.getElementById('input-adult-whatsapp');

  document.getElementById('form-micro-checkout').addEventListener('submit', (e) => {
    e.preventDefault();
    const adultName = document.getElementById('input-adult-name').value.trim();
    const whatsapp = waInput.value.trim();

    if (!adultName) return;
    if (!whatsapp) {
      waInput.focus();
      return;
    }

    const result = confirmPaseVecinal({
      activityId: pendingActivityId,
      adultName,
      whatsapp,
      email: '',
      contactType: 'whatsapp'
    });

    if (isEditMode) {
      showToast('DATOS ACTUALIZADOS', `✓ Contacto guardado para ${result.user.name}.`, 'success');
      if (pendingOnSuccessCallback) {
        pendingOnSuccessCallback(result.user);
      }
      closeUserModal();
      return;
    }

    renderConfirmationStep(result);
  });
}

function renderConfirmationStep({ user, activityId }) {
  const card = document.getElementById('checkout-modal-card');
  if (!card) return;

  showToast('PASE GENERADO', `✓ Token ${user.token} activado para ${user.name}.`, 'success');

  card.innerHTML = `
    <div class="animate-fade-soft">
      <div class="flex items-center justify-between mb-3 pb-2 border-b-2 border-neutral-200">
        <span class="bg-[#059669] text-white text-[10px] font-mono font-black uppercase px-2 py-0.5">
          ✓ PASE VECINAL GENERADO
        </span>
        <span class="text-xs font-mono font-bold text-neutral-900">${user.token}</span>
      </div>

      <h3 class="text-2xl font-black uppercase tracking-tight text-neutral-900 mb-1 leading-tight">
        ¡Cupo Reservado con Éxito!
      </h3>
      <p class="text-xs text-neutral-600 mb-4 font-medium leading-relaxed">
        Tu token <strong>${user.token}</strong> quedó guardado en tu navegador a nombre de <strong>${user.name}</strong>. Desde ahora, cualquier otra actividad se reservará en <strong>1 solo clic</strong>.
      </p>

      <div class="bg-neutral-50 border-2 border-neutral-300 p-3.5 mb-4 text-xs font-mono">
        <div class="text-neutral-500 uppercase text-[10px]">Validación en Plaza:</div>
        <div class="text-neutral-900 font-bold mt-0.5">
          Cuando llegues a la plaza, sólo toca <span class="bg-[#059669] text-white px-1.5 py-0.2">Confirmar mi asistencia</span> directamente en tu tarjeta.
        </div>
      </div>

      <div>
        <button 
          id="btn-done-checkout" 
          class="w-full bg-black hover:bg-[#E11D48] text-white py-3.5 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer shadow-[3px_3px_0px_0px_#111111]"
        >
          Entendido, Ver Mi Cartelera →
        </button>
      </div>
    </div>
  `;

  document.getElementById('btn-done-checkout').addEventListener('click', () => {
    if (pendingOnSuccessCallback) {
      pendingOnSuccessCallback(user);
    }
    closeUserModal();
  });
}
