/* ==========================================================================
   ARCHIVO: js/paseModal.js
   Credencial 'Pase Vecinal Chispa' con Código QR Offline Dinámico
   ========================================================================== */

import QRCode from 'qrcode';
import {
  getTrackedUser,
  getReservedActivityIds,
  getAllActivities,
  calculateDistanceAndWalkingTime,
  logAction,
  escapeHtml
} from './state.js';
import { openUserModal } from './userModal.js';
import { showToast } from './toast.js';

let paseModalContainer = null;

function ensurePaseModalContainer() {
  if (!paseModalContainer || !document.body.contains(paseModalContainer)) {
    paseModalContainer = document.getElementById('pase-vecinal-modal-root');
    if (!paseModalContainer) {
      paseModalContainer = document.createElement('div');
      paseModalContainer.id = 'pase-vecinal-modal-root';
      document.body.appendChild(paseModalContainer);
    }
  }
  return paseModalContainer;
}

export function closePaseModal() {
  const container = document.getElementById('pase-vecinal-modal-root');
  if (container) {
    container.innerHTML = '';
  }
}

/**
 * Abre el modal de la Credencial Vecinal Oficial con código QR offline
 */
export function openPaseVecinalModal() {
  const user = getTrackedUser();

  if (!user) {
    // Si no tiene pase, abre el micro-checkout
    openUserModal(null, (newUser) => {
      openPaseVecinalModal();
    });
    return;
  }

  const container = ensurePaseModalContainer();
  const reservedIds = getReservedActivityIds();
  const allActivities = getAllActivities();
  const reservedActivities = allActivities.filter(a => reservedIds.includes(a.id));

  container.innerHTML = `
    <div class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md transition-all">
      <div class="w-full sm:max-w-lg relative animate-pocket-extract">
        
        <!-- Pestaña superior del bolsillo digital -->
        <div class="bg-neutral-900 text-white px-4 py-2 rounded-t-2xl sm:rounded-t-xl flex items-center justify-between border-t-2 border-x-2 border-black">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span class="text-[11px] font-mono uppercase tracking-widest font-black text-white">
              Bolsillo Digital · Credencial Física
            </span>
          </div>
          <button id="btn-close-pase-modal" class="text-neutral-400 hover:text-white transition-colors cursor-pointer p-1 rounded-md" aria-label="Guardar credencial">
            ✕
          </button>
        </div>

        <div class="bg-white border-2 border-black p-5 sm:p-7 shadow-2xl relative max-h-[88vh] overflow-y-auto rounded-b-none sm:rounded-b-xl border-t-0">
          
          <!-- Cabecera de la credencial -->
          <div class="flex items-center gap-2 mb-3 pb-2 border-b-2 border-black">
            <span class="bg-[#111111] text-white text-[10px] font-mono font-black uppercase px-2 py-0.5">
              CREDENCIAL VECINAL OFICIAL
            </span>
            <span class="text-xs font-mono font-bold text-[#059669] flex items-center gap-1">
              <span class="w-2 h-2 bg-[#059669] rounded-full animate-pulse"></span>
              100% OPERATIVA OFFLINE
            </span>
          </div>

        <!-- Tarjeta de Identidad Física / Pase Digital -->
        <div class="bg-[#F8F8F6] border-3 border-black p-4 sm:p-5 shadow-[4px_4px_0px_0px_#111111] mb-5">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
            
            <div class="flex-1 text-center sm:text-left">
              <div class="text-[10px] font-mono uppercase text-neutral-500 font-bold">VECINO ACREDITADO</div>
              <h3 class="text-2xl font-black uppercase tracking-tight text-neutral-900 leading-none mt-1">
                ${escapeHtml(user.name)}
              </h3>
              
              <div class="mt-2.5 space-y-1 text-xs font-mono">
                <div class="flex items-center justify-center sm:justify-start gap-2">
                  <span class="text-neutral-500">TOKEN:</span>
                  <span class="font-black text-[#E11D48] text-base">${escapeHtml(user.token)}</span>
                </div>
                <div class="flex items-center justify-center sm:justify-start gap-2">
                  <span class="text-neutral-500">CONTACTO:</span>
                  <span class="font-bold text-neutral-900">${escapeHtml(user.whatsapp || user.contact || '+56 9 8765 4321')}</span>
                </div>
                <div class="flex items-center justify-center sm:justify-start gap-2">
                  <span class="text-neutral-500">COMUNA:</span>
                  <span class="font-bold text-neutral-800">${escapeHtml(user.commune || 'Comuna')}</span>
                </div>
              </div>

              <div class="mt-3 flex justify-center sm:justify-start">
                <button 
                  type="button" 
                  id="btn-edit-user-contact" 
                  class="text-[11px] font-mono font-bold text-[#E11D48] hover:text-black underline uppercase flex items-center gap-1 cursor-pointer"
                >
                  ✏️ Editar mis datos de contacto
                </button>
              </div>
            </div>

            <!-- Código QR generado en Canvas de forma 100% nativa y offline -->
            <div class="flex flex-col items-center shrink-0">
              <div class="bg-white p-2 border-2 border-black shadow-[2px_2px_0px_0px_#111111]">
                <canvas id="qr-pase-canvas" width="130" height="130" class="block"></canvas>
              </div>
              <div class="text-[9px] font-mono text-neutral-500 font-bold uppercase mt-1 text-center">
                Escanear en Plaza
              </div>
            </div>

          </div>
        </div>

        <!-- Sección de Cupos Activos -->
        <div class="mb-5">
          <div class="flex items-center justify-between mb-2 pb-1 border-b border-neutral-300">
            <span class="text-xs font-mono font-black uppercase text-neutral-900">
              Cupos Reservados en tu Pase (${reservedActivities.length})
            </span>
            <span class="text-[11px] font-mono text-[#059669] font-bold">Confirmación 1-Clic</span>
          </div>

          ${
            reservedActivities.length === 0
              ? `
                <div class="p-4 bg-neutral-100 border border-neutral-300 text-center text-xs text-neutral-600 font-medium">
                  Aún no has reservado talleres. Explora el ranking o la cartelera para reservar con 1 clic.
                </div>
              `
              : `
                <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
                  ${reservedActivities
                    .map(act => {
                      const walking = calculateDistanceAndWalkingTime(act.coordinates);
                      return `
                        <div class="p-2.5 bg-neutral-50 border border-neutral-300 flex items-center justify-between gap-3 text-xs">
                          <div class="overflow-hidden">
                            <div class="font-black text-neutral-900 truncate">${act.title}</div>
                            <div class="text-[11px] text-neutral-500 font-mono flex items-center gap-2 mt-0.5">
                              <span>📍 ${act.locationName}</span>
                              <span>·</span>
                              <span class="text-[#059669] font-bold">🚶 ${walking.minutes} min</span>
                            </div>
                          </div>
                          <span class="bg-[#059669] text-white text-[10px] font-mono font-bold px-2 py-0.5 shrink-0">
                            ✓ RESERVADO
                          </span>
                        </div>
                      `;
                    })
                    .join('')}
                </div>
              `
          }
        </div>

        <!-- Aviso para terreno -->
        <div class="p-3 bg-neutral-100 border border-neutral-300 text-[11px] text-neutral-700 font-mono mb-5">
          <strong>💡 Consejo en Terreno:</strong> Puedes mostrar este código QR directamente al monitor en la plaza para validar tu cupo incluso si tu teléfono queda sin datos móviles.
        </div>

        <!-- Botones de Acción -->
        <div class="flex flex-col sm:flex-row gap-2">
          <button 
            type="button" 
            id="btn-download-pase-qr"
            class="flex-1 bg-black hover:bg-[#E11D48] text-white py-3 px-4 font-black uppercase tracking-wider text-xs transition-colors cursor-pointer text-center shadow-[3px_3px_0px_0px_#111111] flex items-center justify-center gap-1.5"
          >
            <span>📥 Guardar Credencial en Teléfono</span>
          </button>
          <button 
            type="button" 
            id="btn-close-pase-action"
            class="bg-neutral-200 hover:bg-neutral-300 text-neutral-900 py-3 px-4 font-black uppercase tracking-wider text-xs transition-colors cursor-pointer text-center"
          >
            Cerrar
          </button>
        </div>

        </div>
      </div>
    </div>
  `;

  // Renderizar QR Code en Canvas
  const canvas = document.getElementById('qr-pase-canvas');
  if (canvas) {
    const qrPayload = JSON.stringify({
      app: 'ChispaPlay',
      token: user.token,
      name: user.name,
      contact: user.contact,
      commune: user.commune,
      reservesCount: reservedActivities.length,
      timestamp: Date.now()
    });

    QRCode.toCanvas(canvas, qrPayload, {
      width: 130,
      margin: 1,
      color: {
        dark: '#111111',
        light: '#FFFFFF'
      }
    }, (err) => {
      if (err) console.error('Error generando QR offline:', err);
    });
  }

  // Event Listeners
  const btnClose = document.getElementById('btn-close-pase-modal');
  const btnCloseAction = document.getElementById('btn-close-pase-action');
  if (btnClose) btnClose.addEventListener('click', closePaseModal);
  if (btnCloseAction) btnCloseAction.addEventListener('click', closePaseModal);

  const btnEditContact = document.getElementById('btn-edit-user-contact');
  if (btnEditContact) {
    btnEditContact.addEventListener('click', () => {
      closePaseModal();
      openUserModal(null, () => {
        openPaseVecinalModal();
      }, true);
    });
  }

  const btnDownload = document.getElementById('btn-download-pase-qr');
  if (btnDownload && canvas) {
    btnDownload.addEventListener('click', () => {
      try {
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `Pase-Vecinal-${user.token}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        link.remove();
        showToast('PASE GUARDADO', 'Credencial descargada como imagen para usar sin internet.', 'success');
        logAction('DESCARGA_PASE', 'Pase Vecinal Descargado', `Token: ${user.token}`);
      } catch (err) {
        console.error('Error al descargar pase:', err);
        showToast('AVISO', 'Captura la pantalla para conservar tu credencial.', 'info');
      }
    });
  }
}
