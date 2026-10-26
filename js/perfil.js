/* ==========================================================================
   ARCHIVO: js/perfil.js
   Lógica Modular de Página 3 · Perfil Verídico del Vecino & Pase Digital
   ========================================================================== */

import {
  getTrackedUser,
  getReservedActivityIds,
  getAllActivities,
  toggleActivityReservation,
  logoutUser,
  calculateDistanceAndWalkingTime,
  isAttendanceValidated,
  validateGroundAttendance,
  validateGroundAttendanceWithGps,
  getAttendanceDetail,
  reportParkDefect,
  escapeHtml
} from './state.js';
import { getGoogleCalendarUrl, downloadIcsFile, getGoogleMapsDirectionsUrl } from './calendar.js';
import { renderNavbar } from './navbar.js';
import { renderBottomNav } from './bottomNav.js';
import { openUserModal } from './userModal.js';
import { showToast } from './toast.js';
import QRCode from 'qrcode';

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar('perfil');
  renderProfileView();

  window.addEventListener('chispaplay:user-registered', () => {
    renderNavbar('perfil');
    renderProfileView();
  });

  window.addEventListener('chispaplay:user-logged-out', () => {
    renderNavbar('perfil');
    renderProfileView();
  });

  window.addEventListener('chispaplay:reservations-changed', () => {
    renderProfileView();
  });
});

function renderProfileView() {
  const root = document.getElementById('perfil-dynamic-root');
  if (!root) return;

  const user = getTrackedUser();

  if (!user) {
    // ESTADO 1: Usuario No Registrado (100% verídico, sin datos falsos inventados)
    root.innerHTML = `
      <section class="max-w-2xl mx-auto my-8 bg-white border-4 border-black p-6 sm:p-10 shadow-[8px_8px_0px_0px_#111111] animate-fade-soft">
        
        <div class="flex items-center gap-2 mb-3">
          <span class="bg-neutral-800 text-white text-[10px] font-mono uppercase px-2 py-0.5">
            ESTADO DE SESIÓN: VISITANTE LIBRE
          </span>
          <span class="text-xs font-mono text-neutral-500">SIN PASE VECINAL</span>
        </div>

        <h1 class="text-3xl sm:text-4xl font-black uppercase tracking-tight text-neutral-900 leading-none mb-3">
          Mi Pase Digital Vecinal
        </h1>

        <p class="text-sm sm:text-base text-neutral-600 font-medium mb-6 leading-relaxed">
          Actualmente estás explorando la cartelera como <strong>Visitante de Vitrina</strong>. 
          Para que tu asistencia y tus cupos queden auditados de forma transparente con los monitores comunitarios, 
          necesitas registrar tu nombre y tu contacto una sola vez.
        </p>

        <div class="bg-neutral-100 border-2 border-neutral-300 p-4 mb-6 space-y-2 text-xs text-neutral-700">
          <div class="font-bold text-neutral-900 uppercase">¿Por qué registrar un Pase Vecinal?</div>
          <ul class="list-disc pl-4 space-y-1">
            <li><strong>Sin contraseñas:</strong> Te asignamos un token digital único vinculado a tu sesión.</li>
            <li><strong>Monitoreo real:</strong> Los monitores de la Junta de Vecinos sabrán quién asistirá.</li>
            <li><strong>Historial verídico:</strong> Todas las actividades a las que asistas quedarán guardadas aquí.</li>
          </ul>
        </div>

        <div class="flex flex-col sm:flex-row gap-3">
          <button 
            id="btn-create-pass" 
            class="bg-[#E11D48] hover:bg-[#BE123C] text-white px-6 py-3.5 font-black uppercase tracking-wider text-sm transition-colors text-center shadow-[4px_4px_0px_0px_#111111] cursor-pointer"
          >
            Obtener Mi Pase Vecinal Ahora →
          </button>
          
          <a 
            href="actividades.html" 
            class="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300 px-6 py-3.5 font-black uppercase tracking-wider text-xs transition-colors text-center"
          >
            Volver a la Cartelera
          </a>
        </div>

      </section>
    `;

    const btnCreate = document.getElementById('btn-create-pass');
    if (btnCreate) {
      btnCreate.addEventListener('click', () => {
        openUserModal(null, () => {
          renderNavbar('perfil');
          renderProfileView();
        });
      });
    }

    return;
  }

  // ESTADO 2: Usuario Registrado con Token e Historial Real
  const reservedIds = getReservedActivityIds();
  const allActivities = getAllActivities();
  const userReservations = allActivities.filter(a => reservedIds.includes(a.id));

  root.innerHTML = `
    <div class="space-y-8 animate-fade-soft">
      
      <!-- Ficha de Identidad & Token -->
      <section class="bg-white border-4 border-black p-6 sm:p-8 shadow-[8px_8px_0px_0px_#111111]">
        
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b-2 border-black pb-6 mb-6">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="w-2.5 h-2.5 bg-[#059669] rounded-full inline-block animate-pulse"></span>
              <span class="text-xs font-mono font-bold uppercase text-[#059669]">
                PASE VECINAL AUDITADO & OPERATIVO OFFLINE
              </span>
            </div>
            <h1 class="text-3xl sm:text-4xl font-black uppercase tracking-tight text-neutral-900 leading-none">
              ${escapeHtml(user.name)}
            </h1>
            <div class="mt-2 text-xs font-mono text-neutral-600">
              Comuna: <strong>${escapeHtml(user.commune)}</strong> · Contacto: <strong>${escapeHtml(user.emailOrPhone)}</strong>
            </div>
          </div>

          <!-- Credencial QR Offline Integrada -->
          <div class="bg-neutral-50 border-2 border-black p-3 flex items-center gap-4 shadow-[4px_4px_0px_0px_#E11D48] shrink-0">
            <div class="bg-white p-1.5 border border-black">
              <canvas id="perfil-qr-canvas" width="100" height="100" class="block"></canvas>
            </div>
            <div>
              <div class="text-[9px] font-mono uppercase text-neutral-500 font-bold">TOKEN VECINAL:</div>
              <div class="text-xl font-mono font-black text-[#E11D48] tracking-wider leading-none mb-1.5">
                ${escapeHtml(user.token)}
              </div>
              <button 
                type="button" 
                id="btn-download-perfil-pass"
                class="bg-black hover:bg-[#E11D48] text-white text-[10px] font-mono font-bold uppercase px-2 py-1 transition-colors cursor-pointer block text-center"
              >
                📥 Guardar Pase
              </button>
            </div>
          </div>
        </div>

        <!-- Metadatos de Auditoría Real -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-neutral-100 border border-neutral-300 text-xs font-mono mb-6">
          <div>
            <span class="text-neutral-500 uppercase block text-[10px]">Contacto Registrado:</span>
            <strong class="text-neutral-900 font-bold">${escapeHtml(user.emailOrPhone)}</strong>
          </div>
          <div>
            <span class="text-neutral-500 uppercase block text-[10px]">Comuna Base:</span>
            <strong class="text-neutral-900 font-bold">${escapeHtml(user.commune)}</strong>
          </div>
          <div>
            <span class="text-neutral-500 uppercase block text-[10px]">IP de Auditoría:</span>
            <strong class="text-neutral-900 font-bold">${escapeHtml(user.ip)}</strong>
          </div>
          <div>
            <span class="text-neutral-500 uppercase block text-[10px]">Fecha de Expedición:</span>
            <strong class="text-neutral-900 font-bold">${escapeHtml(user.registeredAt)}</strong>
          </div>
        </div>

        <!-- Acciones de Cuenta -->
        <div class="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div class="text-neutral-500 font-mono text-[11px]">
            💡 Muestra tu código QR al monitor en la plaza para validar tu cupo incluso si no tienes internet móvil.
          </div>
          <button 
            id="btn-logout-user" 
            class="text-[#E11D48] hover:underline font-bold uppercase font-mono cursor-pointer"
          >
            Cerrar Sesión / Desvincular Pase ✕
          </button>
        </div>

      </section>

      <!-- Historial de Talleres Asistidos & Reservados -->
      <section class="bg-white border-2 border-black p-6 sm:p-8 shadow-[6px_6px_0px_0px_#111111]">
        
        <div class="flex items-center justify-between border-b-2 border-neutral-300 pb-3 mb-6">
          <div>
            <div class="text-xs font-mono font-bold text-neutral-500 uppercase">MIS TALLERES CONFIRMADOS</div>
            <h2 class="text-2xl font-black uppercase tracking-tight text-neutral-900">
              Historial de Asistencia (${userReservations.length})
            </h2>
          </div>
          <a href="actividades.html" class="text-xs font-black uppercase text-[#E11D48] hover:underline">
            + Buscar Más Talleres
          </a>
        </div>

        ${
          userReservations.length === 0
            ? `
              <div class="p-8 border-2 border-dashed border-neutral-300 text-center">
                <div class="text-3xl mb-2">📋</div>
                <h3 class="text-base font-black uppercase text-neutral-800 mb-1">
                  Aún no has reservado ningún taller
                </h3>
                <p class="text-xs text-neutral-500 max-w-md mx-auto mb-4">
                  Tu pase está activo y listo. Explora las actividades de hoy o el fin de semana para confirmar tu primer cupo gratuito.
                </p>
                <a 
                  href="actividades.html" 
                  class="inline-block bg-black text-white hover:bg-[#E11D48] px-5 py-2.5 text-xs font-black uppercase tracking-wider transition-colors"
                >
                  Explorar Cartelera de Actividades →
                </a>
              </div>
            `
            : `
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${userReservations
                  .map(item => {
                    const distInfo = calculateDistanceAndWalkingTime(item.coordinates);
                    const isValidated = isAttendanceValidated(item.id);
                    const attendanceDetail = getAttendanceDetail(item.id);
                    return `
                      <div class="border-2 border-black p-4 bg-neutral-50 flex flex-col justify-between">
                        <div>
                          <div class="flex items-center justify-between text-[11px] font-mono mb-2">
                            <span class="bg-[#059669] text-white px-2 py-0.5 font-bold uppercase">CUPO CONFIRMADO</span>
                            <span class="font-bold text-neutral-600">${item.dateLabel}</span>
                          </div>

                          <h4 class="text-base font-black uppercase tracking-tight text-neutral-900 mb-1">
                            ${item.title}
                          </h4>

                          <div class="text-xs font-mono text-[#E11D48] font-bold mb-2">
                            📍 ${item.locationName} · ${distInfo.label}
                          </div>

                          <div class="text-xs text-neutral-600 mb-3 line-clamp-2">
                            ${item.summary}
                          </div>

                          <!-- Botones de Calendario en Perfil -->
                          <div class="mb-3 p-2 bg-white border border-neutral-300">
                            <div class="text-[9px] font-mono font-black uppercase text-neutral-500 mb-1">
                              📅 Recordatorio en tu Calendario:
                            </div>
                            <div class="flex flex-wrap gap-1.5 text-[10px] font-mono font-bold">
                              <a 
                                href="${getGoogleCalendarUrl(item)}" 
                                target="_blank" 
                                rel="noopener"
                                class="bg-black hover:bg-[#E11D48] text-white px-2 py-1 uppercase"
                              >
                                Google Calendar
                              </a>
                              <button 
                                type="button" 
                                data-perfil-ics="${item.id}"
                                class="btn-perfil-ics bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-400 px-2 py-1 uppercase cursor-pointer"
                              >
                                Apple iCal (.ics)
                              </button>
                              <a 
                                href="${getGoogleMapsDirectionsUrl(item)}" 
                                target="_blank" 
                                rel="noopener"
                                class="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-400 px-2 py-1 uppercase"
                              >
                                🗺️ Ruta
                              </a>
                            </div>
                          </div>

                          <div class="text-[11px] font-mono text-neutral-500 border-t border-neutral-200 pt-2 mb-3">
                            Monitor: <strong>${item.instructorName}</strong> (${item.organizerName})
                            <br>WhatsApp: <span class="text-neutral-900">${item.instructorWhatsapp}</span>
                          </div>
                        </div>

                        <div class="pt-2 border-t border-neutral-200 space-y-2">
                          <div class="flex items-center justify-between text-xs font-mono">
                            <span class="text-neutral-500 font-bold">ESTADO CUPO:</span>
                            <button 
                              type="button" 
                              data-cancel-id="${item.id}"
                              class="btn-cancel-reservation text-xs font-bold text-red-600 hover:text-red-800 uppercase underline cursor-pointer"
                            >
                              Liberar Cupo
                            </button>
                          </div>

                          <!-- Barra Interactiva de Validación en Terreno -->
                          ${
                            isValidated
                              ? `
                                <div class="bg-[#059669] text-white p-2 font-mono font-bold text-center text-xs">
                                  ✓ ASISTENCIA VALIDADA ${attendanceDetail?.isGps ? `(GPS a ${attendanceDetail.distanceMeters || '0'}m)` : ''}
                                </div>
                                <button 
                                  type="button"
                                  data-defect-loc="${item.locationName}"
                                  data-defect-id="${item.id}"
                                  class="btn-perfil-defect w-full text-left text-[11px] font-mono text-neutral-800 hover:text-black border border-neutral-400 p-2 bg-white transition-colors cursor-pointer flex items-center justify-between shadow-xs"
                                >
                                  <span>⚠️ Reportar desperfecto en esta plaza</span>
                                  <span class="font-bold text-neutral-500">→</span>
                                </button>
                              `
                              : `
                                <div>
                                  <button 
                                    type="button" 
                                    data-val-id="${item.id}"
                                    class="btn-perfil-validate w-full text-center bg-[#059669] hover:bg-emerald-700 text-white font-black uppercase text-xs py-2 transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1"
                                  >
                                    <span>📡</span> Validar con GPS en Plaza
                                  </button>
                                  <div id="perfil-gps-msg-${item.id}" class="hidden mt-1 p-1.5 text-[10px] font-mono border"></div>
                                </div>
                              `
                          }
                        </div>
                      </div>
                    `;
                  })
                  .join('')}
              </div>
            `
        }

      </section>

    </div>
  `;

  // Renderizar QR Code Offline en Canvas
  const qrCanvas = document.getElementById('perfil-qr-canvas');
  if (qrCanvas && user) {
    const qrData = JSON.stringify({
      app: 'ChispaPlay',
      token: user.token,
      name: user.name,
      commune: user.commune,
      reservesCount: userReservations.length
    });
    QRCode.toCanvas(qrCanvas, qrData, {
      width: 100,
      margin: 1,
      color: { dark: '#111111', light: '#FFFFFF' }
    }, (err) => {
      if (err) console.error('Error QR:', err);
    });
  }

  // Descargar Pase Vecinal como imagen
  const btnDownloadPass = document.getElementById('btn-download-perfil-pass');
  if (btnDownloadPass && qrCanvas) {
    btnDownloadPass.addEventListener('click', () => {
      try {
        const dataUrl = qrCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `Pase-Vecinal-${user.token}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        link.remove();
        showToast('PASE GUARDADO', 'Credencial descargada como imagen.', 'success');
      } catch (err) {
        showToast('AVISO', 'Captura la pantalla para conservar tu credencial.', 'info');
      }
    });
  }

  // Listener para cerrar sesión
  const btnLogout = document.getElementById('btn-logout-user');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      logoutUser();
      showToast('SESIÓN CERRADA', 'Has desvinculado tu pase de este navegador.', 'info');
    });
  }

  // Listener para cancelar reservas
  document.querySelectorAll('.btn-cancel-reservation').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const actId = e.currentTarget.getAttribute('data-cancel-id');
      toggleActivityReservation(actId);
      showToast('CUPO LIBERADO', 'Tu cupo ha quedado disponible para otro vecino.', 'info');
    });
  });

  // Listener para descarga .ics
  document.querySelectorAll('.btn-perfil-ics').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const actId = e.currentTarget.getAttribute('data-perfil-ics');
      const all = getAllActivities();
      const activity = all.find(a => a.id === actId);
      if (activity) {
        downloadIcsFile(activity);
        showToast('CALENDARIO AGENDADO', `✓ Archivo .ics descargado para "${activity.title}".`, 'success');
      }
    });
  });

  // Listener para validar asistencia en terreno con GPS
  document.querySelectorAll('.btn-perfil-validate').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const actId = e.currentTarget.getAttribute('data-val-id');
      const all = getAllActivities();
      const activity = all.find(a => a.id === actId);
      const msgBox = document.getElementById(`perfil-gps-msg-${actId}`);

      if (!activity) {
        validateGroundAttendance(actId);
        showToast('ASISTENCIA VALIDADA', '✓ Presencia registrada.', 'success');
        renderProfileView();
        return;
      }

      if (msgBox) {
        msgBox.classList.remove('hidden');
        msgBox.className = 'mt-1 p-1.5 text-[10px] font-mono border bg-amber-50 text-amber-900 border-amber-300';
        msgBox.textContent = 'Verificando señal GPS...';
      }

      validateGroundAttendanceWithGps(actId, activity.coordinates, (res) => {
        if (res.ok) {
          showToast('PRESENCIA EN TERRENO', `✓ Presencia certificada por GPS a ${res.distance}m.`, 'success');
          if (msgBox) msgBox.textContent = res.message;
          setTimeout(() => renderProfileView(), 800);
        } else {
          showToast('GEOCERCA GPS', res.message, 'warn');
          if (msgBox) {
            msgBox.className = 'mt-1 p-1.5 text-[10px] font-mono border bg-neutral-100 text-neutral-800 border-neutral-300';
            msgBox.innerHTML = `
              <div class="text-red-600 mb-1 font-bold">📍 ${res.message}</div>
              <button class="bg-black text-white px-2 py-0.5 uppercase btn-perfil-force-manual" data-act="${actId}">
                [ Validar modo manual ]
              </button>
            `;
            msgBox.querySelector('.btn-perfil-force-manual')?.addEventListener('click', () => {
              validateGroundAttendance(actId, { isGps: false });
              showToast('ASISTENCIA VALIDADA', '✓ Asistencia manual registrada.', 'success');
              renderProfileView();
            });
          }
        }
      });
    });
  });

  // Listener para reportar desperfecto en plaza
  document.querySelectorAll('.btn-perfil-defect').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const actId = e.currentTarget.getAttribute('data-defect-id');
      const locName = e.currentTarget.getAttribute('data-defect-loc');
      const reason = prompt(`Reportar desperfecto en ${locName}:\nIngresa el problema (ej. Luminaria apagada, juego roto, basura):`);
      if (reason && reason.trim()) {
        reportParkDefect(actId, 'Reporte Vecinal', reason.trim());
        showToast('REPORTE ENVIADO', `✓ Solicitud de mantención para ${locName} enviada a DIDECO.`, 'success');
      }
    });
  });
}
