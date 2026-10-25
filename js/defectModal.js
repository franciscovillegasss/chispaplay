/* ==========================================================================
   ARCHIVO: js/defectModal.js
   Modal Modular para Reporte Ciudadano de Plazas y Espacios Públicos
   ========================================================================== */

import { reportParkDefect, getActiveCommune } from './state.js';
import { showToast } from './toast.js';

let currentReportingTarget = null;

export function openParkDefectModal(activityId = null, locationName = null) {
  let modal = document.getElementById('modal-park-defect');

  const defaultLocation = locationName || (getActiveCommune() === 'maipu' ? 'Plaza de Maipú' : 'Plaza Victoria, Valparaíso');
  currentReportingTarget = { id: activityId || 'plaza-general', locationName: defaultLocation };

  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-park-defect';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-soft';
    modal.innerHTML = `
      <div class="bg-white border-2 border-black max-w-md w-full p-6 shadow-[6px_6px_0px_0px_#111111] relative">
        <button id="btn-close-defect-modal" class="absolute top-4 right-4 text-neutral-400 hover:text-black text-xl font-bold leading-none cursor-pointer">
          ✕
        </button>

        <div class="flex items-center gap-2 mb-2">
          <span class="bg-black text-white text-[10px] font-mono font-bold uppercase px-2 py-0.5">
            CUIDADO COMUNITARIO
          </span>
          <span class="text-xs font-mono text-[#059669] font-bold">DESPACHO VECINAL</span>
        </div>

        <h3 class="text-lg font-bold font-sans text-neutral-900 mb-1">
          Avisar desperfecto en plaza
        </h3>
        <p id="defect-modal-subtitle" class="text-xs text-neutral-600 mb-4 font-mono">
          Lugar: ${defaultLocation}
        </p>

        <form id="form-report-defect" class="space-y-4">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-1">
              ¿Qué problema encontraste? *
            </label>
            <select id="select-defect-type" class="w-full bg-neutral-50 border border-black p-2.5 text-xs font-bold outline-none">
              <option value="Luminaria o Foco Apagado">Luminaria o farol apagado</option>
              <option value="Bancos o Mobiliario Roto">Bancos o asientos rotos</option>
              <option value="Juegos Infantiles Inseguros">Juegos infantiles o arcos con peligro</option>
              <option value="Aseo y Basura Acumulada">Basura acumulada o pasto muy alto</option>
              <option value="Acceso Universal Bloqueado">Rampa o vereda en mal estado</option>
              <option value="Falta de Agua en Bebedero">Bebedero sin agua o grifo dañado</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-1">
              Detalle breve del lugar *
            </label>
            <textarea 
              id="textarea-defect-detail" 
              required 
              rows="3" 
              placeholder="Ej. El farol junto a los columpios no enciende de noche..."
              class="w-full bg-neutral-50 border border-neutral-300 focus:border-black p-2.5 text-xs font-medium outline-none"
            ></textarea>
          </div>

          <button 
            type="submit" 
            class="w-full bg-black hover:bg-[#E11D48] text-white py-3 font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer shadow-[2px_2px_0px_0px_#111111]"
          >
            Enviar aviso para cuadrilla municipal →
          </button>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('#btn-close-defect-modal');
    closeBtn?.addEventListener('click', () => modal.classList.add('hidden'));

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.add('hidden');
    });

    const form = modal.querySelector('#form-report-defect');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const issueType = modal.querySelector('#select-defect-type').value;
      const detail = modal.querySelector('#textarea-defect-detail').value.trim();

      reportParkDefect(currentReportingTarget.id, issueType, detail);
      showToast('AVISO REGISTRADO', `Se notificó a cuadrilla vecinal sobre ${currentReportingTarget.locationName}.`, 'success');

      form.reset();
      modal.classList.add('hidden');
    });
  } else {
    const subtitle = document.getElementById('defect-modal-subtitle');
    if (subtitle) {
      subtitle.textContent = `Lugar: ${defaultLocation}`;
    }
  }

  modal.classList.remove('hidden');
}
