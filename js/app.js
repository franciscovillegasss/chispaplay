import { configureGeography, getReferencePosition, renderDiscovery, renderNavigation } from './editorial.js';

const app = document.querySelector('#app');
const notice = document.querySelector('#notice');
const query = new URLSearchParams(location.search);
const page = document.body.dataset.page;
const eventUrl = id => '/actividad.html?id=' + encodeURIComponent(id);
const validId = value => /^[a-f0-9]{32}$/.test(value || '');
const chileDate = new Intl.DateTimeFormat('es-CL', {
  dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Santiago'
});
const statusNames = {
  reserved: 'Reserva confirmada', waiting: 'Lista de espera', attended: 'Asistencia registrada',
  cancelled: 'Cancelada', published: 'Publicada', received: 'Recibido', reviewed: 'En revisión',
  resolved: 'Resuelto'
};
let actor = null;
let communes = [];

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}

function status(value) {
  return statusNames[value] || 'Sin inscripción';
}

function date(timestamp) {
  return chileDate.format(new Date(timestamp * 1000));
}

function notify(message, isError = false) {
  notice.textContent = message;
  notice.classList.toggle('error', isError);
  notice.hidden = !message;
}

async function api(path, body, options = {}) {
  const response = await fetch(path, {
    ...(body === undefined ? {} : {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }),
    ...options
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data) throw new Error(data?.error || 'No se pudo conectar con ChispaPlay. Intenta nuevamente.');
  return data;
}

function onForm(id, action) {
  document.getElementById(id)?.addEventListener('submit', async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true;
    notify('');
    try {
      await action(Object.fromEntries(new FormData(form)), form);
    } catch (error) {
      notify(error.message, true);
    } finally {
      submit.disabled = false;
    }
  });
}

function onClick(id, action) {
  document.getElementById(id)?.addEventListener('click', async event => {
    const button = event.currentTarget;
    button.disabled = true;
    notify('');
    try {
      await action();
    } catch (error) {
      notify(error.message, true);
    } finally {
      button.disabled = false;
    }
  });
}

function track(action, eventId) {
  if (actor?.role === 'neighbor') {
    api('/api/traffic', { action, event_id: eventId }, { keepalive: true }).catch(() => {});
  }
}

function signOut() {
  onClick('logout', async () => {
    await api('/api/logout', {});
    actor = null;
    location.reload();
  });
}

function table(headers, rows, empty) {
  if (!rows.length) return '<p class="muted">' + escapeHtml(empty) + '</p>';
  return '<div class="table"><table><thead><tr>' + headers.map(header => '<th scope="col">' + escapeHtml(header) + '</th>').join('') +
    '</tr></thead><tbody>' + rows.map(row => '<tr>' + row.map(cell => '<td>' + cell + '</td>').join('') + '</tr>').join('') +
    '</tbody></table></div>';
}

async function renderEvent(id, logView = true) {
  if (!validId(id)) {
    app.innerHTML = '<h1>Selecciona una actividad</h1><a href="/actividades.html">Volver a la cartelera</a>';
    return;
  }
  const { event, booking } = await api('/api/events/' + id);
  const open = event.status === 'published' && event.starts * 1000 > Date.now();
  const user = actor?.role === 'neighbor';
  const alreadyBooked = ['reserved', 'waiting', 'attended'].includes(booking);
  const spots = open ? (event.available ? event.available + ' disponibles' : 'Lista de espera disponible') : 'Inscripciones cerradas';
  const origin = getReferencePosition(event.commune);
  const destination = event.latitude != null && event.longitude != null
    ? event.latitude + ',' + event.longitude : event.venue + ', ' + event.address + ', ' + event.commune + ', Chile';
  const map = 'https://www.google.com/maps/dir/?' + new URLSearchParams({
    api: '1', destination, travelmode: 'walking',
    ...(origin ? { origin: origin.latitude + ',' + origin.longitude } : {})
  });
  const share = 'https://wa.me/?text=' + encodeURIComponent(event.title + ' · ' + date(event.starts) + ' · ' + event.venue +
    ' · ' + new URL(eventUrl(id), location.origin).href);
  const facts = [
    ['Horario (Chile continental)', date(event.starts) + ' a ' + date(event.ends)],
    ['Lugar', event.venue + ' · ' + event.address], ['Organiza', event.organizer],
    ['Cupos', spots], ['Edades', event.ages], ['Accesibilidad y servicios', event.accessibility]
  ];
  document.title = event.title + ' · ChispaPlay';
  app.innerHTML = `
    <div class="dedicated-activity-view max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 animate-fade-soft">
    <div class="pb-4 mb-6 border-b-2 border-black"><a class="text-xs font-black uppercase" href="/actividades.html">← Volver a la cartelera</a></div>
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
    <div class="lg:col-span-8 space-y-6">
    <p class="eyebrow">${escapeHtml(event.commune + ' · ' + event.sector + ' · ' + event.category)}</p>
    <h1 class="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight">${escapeHtml(event.title)}</h1>
    <p class="text-xs font-mono font-bold text-neutral-700">📍 ${escapeHtml(event.venue)} · ${escapeHtml(date(event.starts))}</p>
    ${event.status === 'cancelled' ? '<p class="badge">Actividad cancelada</p>' : ''}
    ${event.photo ? '<img class="event-cover" src="' + escapeHtml(event.photo) + '" alt="">' : ''}
    ${event.why_go ? '<section class="panel"><p class="eyebrow">Por qué ir</p><p>' + escapeHtml(event.why_go) + '</p></section>' : ''}
    <section class="panel"><p class="preline">${escapeHtml(event.description)}</p>
      <dl class="facts">${facts.map(([key, value]) => '<div><dt>' + key + '</dt><dd>' + escapeHtml(value) + '</dd></div>').join('')}</dl>
      ${event.schedule.length ? '<h2>Cronograma</h2>' + table(['Hora', 'Actividad'], event.schedule.map(item => [
        escapeHtml(item.time), escapeHtml(item.activity)
      ]), '') : ''}
      <div class="actions">
        ${event.status === 'published' ? `<button id="save-calendar" class="secondary">Guardar evento en calendario</button>
        <a class="button secondary" id="google-calendar" href="${escapeHtml(calendarLink(event))}" target="_blank" rel="noopener">Google Calendar</a>` : ''}
        <a class="button secondary" href="${escapeHtml(map)}" id="directions" target="_blank" rel="noopener">Ver en el mapa</a>
        <a class="button secondary" href="${escapeHtml(share)}" id="share" target="_blank" rel="noopener">Compartir por WhatsApp</a>
      </div>
    </section>
    <section class="panel"><h2>Ubicación</h2>
      <iframe class="location-map" title="Ubicación de ${escapeHtml(event.venue)} en Google Maps"
        src="https://maps.google.com/maps?q=${encodeURIComponent(destination)}&amp;output=embed"
        loading="lazy" referrerpolicy="no-referrer" allowfullscreen></iframe>
    </section>
    </div><aside class="lg:col-span-4 lg:sticky lg:top-8">
    <section class="panel ticket-panel"><p class="eyebrow">Pase Vecinal</p><h2>Inscripción</h2>
      ${alreadyBooked ? '<p class="badge">' + (event.status === 'cancelled' ? 'Actividad cancelada' : status(booking)) + '</p>' : ''}
      ${booking === 'reserved' && event.status === 'published' ? '<p>Presenta tu <a href="/perfil.html">código personal</a> al llegar.</p>' : ''}
      ${booking === 'waiting' && open ? '<p>Si se libera un cupo, el sistema confirma la reserva en orden de inscripción. Revisa el estado en Mi Pase.</p>' : ''}
      ${open && !alreadyBooked ? (user
        ? '<button id="reserve">' + (event.available ? 'Reservar cupo' : 'Entrar a la lista de espera') + '</button>'
        : '<a class="button" href="/perfil.html?activity=' + id + '">Identificarme para inscribirme</a>') : ''}
      ${open && ['reserved', 'waiting'].includes(booking)
        ? '<div class="actions"><button class="secondary" id="cancel-reservation">Cancelar inscripción</button></div>' : ''}
      ${!open && !alreadyBooked ? '<p>Las inscripciones están cerradas.</p>' : ''}
    </section>
    ${user ? `<details class="panel narrow"><summary>Reportar un problema del lugar</summary>
      <p>El equipo de ChispaPlay revisa los reportes. Puedes consultar el estado en Mi Pase.</p>
      <form id="report"><label>Describe el problema
        <textarea name="detail" rows="4" required minlength="5" maxlength="1000"></textarea></label>
        <button type="submit">Enviar reporte</button></form></details>` : ''}
    </aside></div></div>
  `;
  onClick('save-calendar', () => {
    saveCalendar(event);
    track('calendario_guardado', id);
  });
  document.getElementById('google-calendar')?.addEventListener('click', () => track('calendario_guardado', id));
  document.getElementById('share').addEventListener('click', () => track('enlace_compartido', id));
  document.getElementById('directions').addEventListener('click', () => track('mapa_abierto', id));
  onClick('reserve', async () => {
    const result = await api('/api/events/' + id + '/reserve', {});
    await renderEvent(id, false);
    notify(status(result.status) + '.');
  });
  onClick('cancel-reservation', async () => {
    if (!confirm('¿Quieres cancelar tu inscripción?')) return;
    await api('/api/events/' + id + '/cancel', {});
    await renderEvent(id, false);
    notify('Inscripción cancelada.');
  });
  onForm('report', async (fields, form) => {
    const { folio } = await api('/api/events/' + id + '/report', fields);
    form.reset();
    notify('Reporte recibido. Folio ' + folio + '.');
  });
  if (logView) track('ficha_abierta', id);
}

function compactDate(timestamp) {
  return new Date(timestamp * 1000).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function calendarLink(event) {
  return 'https://calendar.google.com/calendar/render?' + new URLSearchParams({
    action: 'TEMPLATE', text: event.title, dates: compactDate(event.starts) + '/' + compactDate(event.ends),
    location: event.venue + ', ' + event.address + ', ' + event.commune,
    details: event.description + '\n' + new URL(eventUrl(event.id), location.origin).href
  });
}

function saveCalendar(event) {
  const text = value => String(value).replace(/\\/g, '\\\\').replace(/\n|\r\n?/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ChispaPlay//Cartelera//ES', 'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT', 'UID:' + event.id + '@chispaplay', 'DTSTAMP:' + compactDate(Date.now() / 1000),
    'DTSTART:' + compactDate(event.starts), 'DTEND:' + compactDate(event.ends), 'SUMMARY:' + text(event.title),
    'DESCRIPTION:' + text(event.description), 'LOCATION:' + text(event.venue + ', ' + event.address + ', ' + event.commune),
    'END:VEVENT', 'END:VCALENDAR'
  ];
  const encoder = new TextEncoder();
  const folded = [];
  for (const line of lines) {
    let part = '';
    for (const character of line) {
      if (encoder.encode(part + character).length > 73) {
        folded.push(part);
        part = ' ';
      }
      part += character;
    }
    folded.push(part);
  }
  const blob = new Blob([folded.join('\r\n') + '\r\n'], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'actividad-chispaplay.ics';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function notificationForm(formId, selected = '') {
  return `<form id="${formId}" class="narrow">
    <label>Comuna para recibir avisos <select name="commune" aria-label="Comuna para recibir avisos" required>
      <option value="">Selecciona tu comuna</option>
      ${communes.map(name => '<option value="' + escapeHtml(name) + '"' + (name === selected ? ' selected' : '') + '>' + escapeHtml(name) + '</option>').join('')}
    </select></label>
    <label class="check"><input name="consent" type="checkbox" required> Quiero recibir avisos de actividades de esta comuna por WhatsApp en mi celular registrado.</label>
    <button type="submit">Recibir notificaciones en WhatsApp</button>
  </form>`;
}

function bindNotifications(formId, refresh = false) {
  onForm(formId, async fields => {
    await api('/api/me/notifications', { commune: fields.commune, enabled: true, consent: fields.consent === 'on' });
    if (refresh) await renderProfile();
    notify('Preferencia guardada. El equipo podrá enviarte la cartelera de ' + fields.commune + ' por WhatsApp.');
  });
}

function renderWhatsAppFlyer() {
  const target = document.getElementById('ranking-section') || document.getElementById('actividades-main-content');
  if (!target) return;
  const flyer = document.createElement('section');
  flyer.id = 'whatsapp-flyer';
  flyer.className = 'whatsapp-flyer bg-black text-white border-4 border-black p-6 sm:p-8 shadow-[8px_8px_0px_0px_#E11D48] mt-10 mb-8';
  flyer.innerHTML = `<p class="text-xs font-mono font-black uppercase text-[#E11D48] mb-2">Radar barrial · WhatsApp</p>
    <h2 class="text-2xl sm:text-3xl font-black uppercase mb-3">Que el próximo panorama te encuentre</h2>
    <p class="text-sm text-neutral-200 mb-5">Elige tu comuna y recibe avisos de actividades gratuitas. El equipo comparte la cartelera por WhatsApp y puedes cancelar los avisos desde Mi Pase.</p>
    ${actor?.role === 'neighbor' ? notificationForm('flyer-subscribe') :
      '<a class="button" href="/perfil.html?notifications=1">Recibir notificaciones en WhatsApp</a>'}`;
  target.append(flyer);
  bindNotifications('flyer-subscribe');
}

function whatsappMessage(subscriber, events) {
  const next = events.filter(event => event.commune === subscriber.commune && event.status === 'published' && event.starts * 1000 > Date.now())
    .sort((a, b) => a.starts - b.starts).slice(0, 3);
  const listing = next.map(event => event.title + '\n' + date(event.starts) + '\n' + event.venue + ', ' + event.address).join('\n\n');
  return 'Hola ' + subscriber.name + ', esta es la cartelera de ChispaPlay en ' + subscriber.commune + '.\n\n' +
    listing + '\n\nPuedes cancelar estos avisos desde Mi Pase Vecinal.';
}

function neighborLogin(register = true) {
  app.innerHTML = `<section class="panel narrow auth-panel"><p class="eyebrow">Credencial de barrio</p>
    <h1>Mi Pase Vecinal</h1><h2>${register ? 'Crea tu cuenta' : 'Entra a tu cuenta'}</h2>
    <p>${register ? 'Usa tu nombre y celular para obtener tu código personal de asistencia.' : 'Ingresa el nombre, celular y contraseña de tu cuenta.'}</p>
    <form id="neighbor-auth">
      <label>Nombre <input name="name" autocomplete="${register ? 'name' : 'username'}" required minlength="2" maxlength="100"></label>
      <label>Celular chileno <input name="phone" type="tel" autocomplete="tel" required maxlength="25" placeholder="+56 9 1234 5678"></label>
      <label>Contraseña <input name="password" type="password" autocomplete="${register ? 'new-password' : 'current-password'}" required ${register ? 'minlength="12"' : ''} maxlength="128"></label>
      ${register ? '<div hidden aria-hidden="true"><label>Sitio web <input name="website" autocomplete="off" tabindex="-1"></label></div>' : ''}
      <p class="muted">ChispaPlay registra únicamente tus interacciones dentro de esta página web para medir el uso de la cartelera. No registra tu navegación en otros sitios ni aplicaciones. El historial de esta web se conserva durante 90 días.</p>
      <button type="submit">${register ? 'Crear Pase Vecinal' : 'Iniciar sesión'}</button>
    </form>
    <button id="switch-auth" class="secondary">${register ? 'Ya tengo una cuenta' : 'Crear una cuenta'}</button>
  </section>`;
  onClick('switch-auth', () => neighborLogin(!register));
  onForm('neighbor-auth', async fields => {
    ({ actor } = await api(register ? '/api/neighbors/register' : '/api/account/login', fields));
    renderNavigation(page, actor);
    if (actor.role === 'ceo') {
      location.assign('/perfil.html');
    } else if (validId(query.get('activity'))) {
      location.replace(eventUrl(query.get('activity')));
    } else {
      await renderProfile();
      notify('Ya puedes usar tu Pase Vecinal.');
    }
  });
}

async function renderProfile() {
  if (actor?.role === 'ceo') {
    app.innerHTML = '<section class="panel narrow ticket-panel"><p class="eyebrow">Mi Pase · Administración</p><h1>' +
      escapeHtml(actor.name) + '</h1><div class="actions"><a class="button" href="/ceo.html">Abrir panel CEO</a>' +
      '<button id="logout" class="secondary">Cerrar sesión</button></div></section>';
    signOut();
    return;
  }
  if (query.get('access') === 'ceo') {
    neighborLogin(false);
    return;
  }
  if (actor?.role !== 'neighbor') {
    neighborLogin();
    return;
  }
  const data = await api('/api/me');
  actor = data.actor;
  app.innerHTML = `<h1>Mi Pase Vecinal</h1>
    <section class="panel narrow ticket-panel"><p class="eyebrow">Credencial vecinal</p><h2>${escapeHtml(actor.name)}</h2>
      <p>${escapeHtml(actor.phone)}</p><p>Presenta este código cuando llegues a una actividad reservada.</p>
      <code class="code">${escapeHtml(actor.personal_code)}</code>
      <div class="actions"><button class="secondary" id="copy-code">Copiar código</button>
        <button class="secondary" id="logout">Cerrar sesión</button></div>
    </section>
    <section class="panel"><h2>Mis actividades</h2>
      ${table(['Actividad', 'Horario', 'Estado'], data.bookings.map(item => [
        '<a href="' + eventUrl(item.id) + '">' + escapeHtml(item.title) + '</a>',
        escapeHtml(date(item.starts)), item.event_status === 'cancelled' ? 'Actividad cancelada' : status(item.status)
      ]), 'Todavía no tienes inscripciones.')}
      <div class="actions"><a class="button" href="/actividades.html">Explorar cartelera</a></div>
    </section>
    <section class="panel"><h2>Mis reportes</h2>
      ${table(['Folio', 'Actividad', 'Estado'], data.reports.map(item => [
        escapeHtml(item.id), escapeHtml(item.title), status(item.status)
      ]), 'Todavía no has enviado reportes.')}
    </section>
    <section class="panel" id="notifications"><h2>Avisos por WhatsApp</h2>
      ${notificationForm('profile-subscribe')}
      ${table(['Comuna', 'Estado', 'Preferencia'], data.notifications.map((item, index) => [
        escapeHtml(item.commune), item.active ? 'Avisos activados' : 'Avisos desactivados',
        item.active ? '<button class="secondary" id="unsubscribe-' + index + '">Cancelar avisos</button>' : ''
      ]), 'Todavía no elegiste una comuna para recibir avisos.')}
    </section>
    <section class="panel narrow"><h2>Uso de la cartelera</h2>
      <p>Registramos únicamente las aperturas de la cartelera y fichas, el uso de filtros y los clics en mapa, calendario y compartir dentro de ChispaPlay durante 90 días. No registramos la navegación fuera de esta web. Las reservas, asistencias y reportes se conservan como operaciones del servicio.</p>
    </section>`;
  signOut();
  bindNotifications('profile-subscribe', true);
  for (const [index, item] of data.notifications.entries()) {
    onClick('unsubscribe-' + index, async () => {
      await api('/api/me/notifications', { commune: item.commune, enabled: false });
      await renderProfile();
      notify('Avisos de ' + item.commune + ' desactivados.');
    });
  }
  if (query.has('notifications')) document.getElementById('notifications').scrollIntoView();
  onClick('copy-code', async () => {
    await navigator.clipboard.writeText(actor.personal_code);
    notify('Código copiado.');
  });

}

function staffLogin(role) {
  const title = role === 'ceo' ? 'Panel de Inteligencia CEO' : 'Gestión Comunitaria de Talleres';
  app.innerHTML = `<section class="panel narrow auth-panel"><p class="eyebrow">Área restringida</p>
    <h1>${title}</h1><p>Usa tu cuenta de coordinación aprobada.</p><form id="staff-login">
      <label>Usuario <input name="username" autocomplete="username" required maxlength="64"></label>
      <label>Contraseña <input name="password" type="password" autocomplete="current-password" required maxlength="128"></label>
      <button type="submit">Iniciar sesión</button>
    </form><div class="actions"><button id="request-coordinator" class="secondary">Crear cuenta nueva</button></div></section>`;
  onClick('request-coordinator', coordinatorRequest);
  onForm('staff-login', async fields => {
    ({ actor } = await api('/api/staff/login', { ...fields, role }));
    await renderStaff(role);
  });
}

function coordinatorRequest() {
  app.innerHTML = `<section class="panel narrow auth-panel"><p class="eyebrow">Gestión comunitaria</p>
    <h1>Solicitar cuenta</h1><p>El equipo de ChispaPlay revisará tu solicitud antes de habilitar la publicación de actividades.</p>
    <form id="coordinator-request">
      ${textInput('username', 'Nombre de usuario', '', 64, 'autocomplete="username" minlength="3"')}
      ${textInput('name', 'Nombre del responsable', '', 120, 'autocomplete="name" minlength="2"')}
      ${textInput('phone', 'Celular chileno', '', 25, 'type="tel" autocomplete="tel"')}
      ${textInput('organization', 'Organización', '', 150, 'minlength="2"')}
      <label>Motivo de la solicitud <textarea name="reason" required minlength="10" maxlength="800" rows="3"></textarea></label>
      <label>Contraseña <input name="password" type="password" autocomplete="new-password" required minlength="12" maxlength="128"></label>
      <div hidden><input name="website" tabindex="-1" autocomplete="off" aria-label="Sitio web"></div>
      <button type="submit">Enviar solicitud</button>
    </form><div class="actions"><button id="back-to-login" class="secondary">Ya tengo cuenta</button></div>
  </section>`;
  onClick('back-to-login', () => staffLogin('coordinator'));
  onForm('coordinator-request', async fields => {
    await api('/api/coordinator/request', fields);
    staffLogin('coordinator');
    notify('Solicitud recibida. Podrás iniciar sesión cuando el equipo la apruebe.');
  });
}

function passwordSection(required = false) {
  const content = `<form id="change-password">
    <label>Contraseña actual <input name="current_password" type="password" autocomplete="current-password" required maxlength="128"></label>
    <label>Nueva contraseña <input name="new_password" type="password" autocomplete="new-password" required minlength="12" maxlength="128"></label>
    <button type="submit">Guardar contraseña</button>
  </form>`;
  return required ? '<section class="panel narrow"><h2>Cambia tu contraseña temporal</h2>' + content + '</section>' :
    '<details class="panel narrow"><summary>Cambiar contraseña</summary>' + content + '</details>';
}

function connectStaff(role) {
  signOut();
  onForm('change-password', async fields => {
    ({ actor } = await api('/api/staff/password', fields));
    await renderStaff(role);
    notify('Contraseña actualizada.');
  });
}

async function renderStaff(role) {
  if (actor?.role !== role) {
    if (role === 'ceo') location.replace('/perfil.html?access=ceo');
    else staffLogin(role);
  } else if (actor.must_change) {
    app.innerHTML = '<h1>Coordinación</h1>' + passwordSection(true) +
      '<button id="logout" class="secondary">Cerrar sesión</button>';
    connectStaff(role);
  } else if (role === 'coordinator') {
    await renderCoordinator();
  } else {
    await renderCEO();
  }
}

const chileInput = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Santiago', year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
});

function inputDate(timestamp) {
  const parts = Object.fromEntries(chileInput.formatToParts(new Date(timestamp * 1000)).map(part => [part.type, part.value]));
  return parts.year + '-' + parts.month + '-' + parts.day + 'T' + parts.hour + ':' + parts.minute;
}

function isoDate(local) {
  const nominal = new Date(local + 'Z').getTime() / 1000;
  if (!Number.isFinite(nominal)) throw new Error('Indica una fecha y hora válidas.');
  // Compare offsets on both sides of a possible Chilean daylight-saving transition.
  const matches = new Set();
  for (const sample of [nominal - 86400, nominal + 86400]) {
    const offset = new Date(inputDate(sample) + 'Z').getTime() / 1000 - sample;
    const candidate = nominal - offset;
    if (inputDate(candidate) === local) matches.add(candidate);
  }
  if (matches.size !== 1) throw new Error('Esta hora es ambigua o no existe por el cambio de hora en Chile. Elige otra.');
  return new Date([...matches][0] * 1000).toISOString();
}

function textInput(name, label, value, limit, extra = '') {
  return '<label>' + label + ' <input name="' + name + '" required maxlength="' + limit +
    '" value="' + escapeHtml(value) + '" ' + extra + '></label>';
}

function eventEditor(event = {}) {
  const edit = Boolean(event.id);
  return `<section class="panel" id="event-editor"><h2>${edit ? 'Editar actividad' : 'Publicar actividad'}</h2>
    <form id="edit-event">
      <div class="fields">
        ${textInput('title', 'Título', event.title, 120)}
        ${textInput('category', 'Categoría', event.category, 70)}
        <label>Comuna <select name="commune" aria-label="Comuna" required><option value="">Selecciona una comuna</option>
          ${communes.map(name => '<option value="' + escapeHtml(name) + '"' + (name === event.commune ? ' selected' : '') + '>' + escapeHtml(name) + '</option>').join('')}
        </select></label>
        ${textInput('sector', 'Sector', event.sector, 80)}
        ${textInput('venue', 'Lugar', event.venue, 120)}
        ${textInput('address', 'Dirección', event.address, 180)}
        <label>Inicio (hora de Chile continental) <input name="starts" type="datetime-local" required value="${edit ? inputDate(event.starts) : ''}"></label>
        <label>Término (hora de Chile continental) <input name="ends" type="datetime-local" required value="${edit ? inputDate(event.ends) : ''}"></label>
        <label>Cupos <input name="capacity" type="number" required min="1" max="500" value="${edit ? event.capacity : ''}"></label>
        ${textInput('ages', 'Edades recomendadas', event.ages, 120)}
      </div>
      <label>Descripción <textarea name="description" rows="4" required maxlength="2000">${escapeHtml(event.description)}</textarea></label>
      <label>Por qué ir · Resumen breve <input name="why_go" maxlength="240" value="${escapeHtml(event.why_go)}"></label>
      <label>Cronograma · Una línea por paso con el formato hora | actividad
        <textarea name="schedule" rows="4" maxlength="2500">${escapeHtml((event.schedule || []).map(row => row.time + ' | ' + row.activity).join('\n'))}</textarea>
      </label>
      <label>Accesibilidad y servicios (baños, sombra, acceso con silla de ruedas)
        <textarea name="accessibility" rows="3" required maxlength="400">${escapeHtml(event.accessibility)}</textarea>
      </label>
      <div class="actions">
        <label class="check"><input type="checkbox" name="wheelchair" ${event.wheelchair ? 'checked' : ''}> Acceso universal confirmado</label>
        <label class="check"><input type="checkbox" name="sensory" ${event.sensory ? 'checked' : ''}> Condiciones neuroamigables confirmadas</label>
      </div>
      <div class="fields">
        <label>Latitud (opcional) <input name="latitude" type="number" min="-90" max="90" step="any" value="${event.latitude ?? ''}"></label>
        <label>Longitud (opcional) <input name="longitude" type="number" min="-180" max="180" step="any" value="${event.longitude ?? ''}"></label>
      </div>
      <label>Foto opcional · JPEG, PNG o WebP, hasta 3 MB
        <input name="photo" type="file" accept="image/jpeg,image/png,image/webp">
      </label>
      ${event.photo ? '<label class="check"><input name="remove_photo" type="checkbox"> Quitar foto actual</label>' : ''}
      <p class="muted">La sugerencia completa los campos vacíos. Si la IA local está apagada, se ofrece un cronograma básico. Revisa la propuesta y confirma las condiciones de accesibilidad antes de publicar.</p>
      <label class="check"><input type="checkbox" name="device_ai"> Usar la IA instalada en este equipo</label>
      <div class="actions"><button type="button" id="suggest-sheet" class="secondary">Generar ficha sugerida con IA</button>
      <button type="submit">${edit ? 'Guardar cambios' : 'Publicar en cartelera'}</button>
      ${edit ? '<button type="button" class="secondary" id="stop-edit">Cerrar edición</button>' : ''}</div>
    </form></section>`;
}

function asDataUrl(file) {
  if (file.size > 3 * 1024 * 1024) throw new Error('La foto debe pesar hasta 3 MB.');
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result));
    reader.addEventListener('error', () => reject(new Error('No se pudo leer la foto.')));
    reader.readAsDataURL(file);
  });
}

async function suggestOnDevice(suggestion) {
  try {
    const response = await fetch('http://127.0.0.1:18747/v1/chat/completions', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      credentials: 'omit', targetAddressSpace: 'loopback', signal: AbortSignal.timeout(45000),
      body: JSON.stringify(suggestion.device_payload)
    });
    if (!response.ok) return suggestion;
    const output = await response.json();
    const { why_go, schedule } = JSON.parse(output.choices[0].message.content);
    const clean = value => typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
    const why = clean(why_go);
    if (!why || why.length > 240 || !Array.isArray(schedule) || schedule.length !== 3) return suggestion;
    const activities = schedule.map(row => clean(row?.activity));
    if (activities.some(activity => !activity || activity.length > 180) ||
        new Set(activities.map(activity => activity.toLowerCase())).size !== 3) return suggestion;
    return { why_go: why, source: 'device', schedule: suggestion.schedule.map((row, i) => ({ ...row, activity: activities[i] })) };
  } catch {
    return suggestion;
  }
}

function openEditor(event) {
  const editor = document.getElementById('editor');
  editor.innerHTML = eventEditor(event);
  onForm('edit-event', async fields => {
    const { photo, remove_photo, device_ai, ...body } = fields;
    body.starts = isoDate(body.starts);
    body.ends = isoDate(body.ends);
    body.capacity = Number(body.capacity);
    body.schedule = body.schedule.split('\n').filter(line => line.trim()).map(line => {
      const divider = line.indexOf('|');
      if (divider < 0) throw new Error('Separa la hora y la actividad del cronograma con |.');
      return { time: line.slice(0, divider).trim(), activity: line.slice(divider + 1).trim() };
    });
    body.latitude = body.latitude === '' ? null : Number(body.latitude);
    body.longitude = body.longitude === '' ? null : Number(body.longitude);
    body.wheelchair = body.wheelchair === 'on';
    body.sensory = body.sensory === 'on';
    if (photo?.size) body.photo = await asDataUrl(photo);
    if (remove_photo) body.remove_photo = true;
    const url = '/api/coordinator/events' + (event ? '/' + event.id + '/edit' : '');
    await api(url, body);
    await renderCoordinator();
    notify(event ? 'Actividad actualizada.' : 'Actividad publicada en la cartelera.');
  });
  onClick('suggest-sheet', async () => {
    const form = document.getElementById('edit-event');
    const inputs = ['title', 'description', 'category', 'ages', 'commune', 'venue', 'address', 'accessibility', 'starts', 'ends'];
    if (!inputs.every(name => form.elements[name].reportValidity())) return;
    const values = Object.fromEntries(new FormData(form));
    if (values.why_go.trim() && values.schedule.trim()) {
      throw new Error('Para sugerir un texto nuevo, deja vacío el resumen o el cronograma que quieras completar.');
    }
    const facts = Object.fromEntries(inputs.slice(0, -2).map(name => [name, values[name]]));
    const start = new Date(isoDate(values.starts)).getTime() / 1000;
    const end = new Date(isoDate(values.ends)).getTime() / 1000;
    if (end <= start) throw new Error('El término debe ser posterior al inicio.');
    facts.starts_label = date(start);
    facts.ends_label = date(end);
    facts.schedule_times = [values.starts.slice(11), inputDate((start + end) / 2).slice(11), values.ends.slice(11)];
    notify('Preparando una sugerencia para la ficha…');
    const requested = await api('/api/coordinator/suggest', { ...facts, device: values.device_ai === 'on' });
    const suggestion = requested.device_payload ? await suggestOnDevice(requested) : requested;
    if (!form.isConnected) return;
    if (inputs.some(name => form.elements[name].value !== values[name])) {
      throw new Error('Los datos de la actividad cambiaron. Vuelve a generar la sugerencia.');
    }
    if (!form.elements.why_go.value.trim() && suggestion.why_go) form.elements.why_go.value = suggestion.why_go;
    if (!form.elements.schedule.value.trim()) {
      form.elements.schedule.value = suggestion.schedule.map(row => row.time + ' | ' + row.activity).join('\n');
    }
    notify(suggestion.source === 'device' ? 'Ficha sugerida por la IA de este equipo. Revisa el texto antes de publicar.' : suggestion.source === 'template'
      ? 'IA local no disponible. Puedes usar el cronograma básico y completar el resumen.'
      : 'Ficha sugerida lista. Revisa el resumen y el cronograma antes de publicar.');
  });
  onClick('stop-edit', () => openEditor());
}

async function renderRoster(event) {
  const { bookings } = await api('/api/coordinator/events/' + event.id + '/bookings');
  const panel = document.getElementById('roster');
  panel.hidden = false;
  panel.innerHTML = `<h2>${escapeHtml(event.title)}</h2>
    ${table(['Vecino', 'Inscripción', 'Asistencia'], bookings.map(item => [
      escapeHtml(item.name), status(item.status), item.attended_at ? escapeHtml(date(item.attended_at)) : '—'
    ]), 'Todavía no hay inscripciones.')}
    ${event.status === 'published' ? `<form id="record-attendance" class="narrow">
      <label>Código personal del vecino <input name="personal_code" required maxlength="5" inputmode="numeric" pattern="[0-9]{5}" autocomplete="off" placeholder="12345"></label>
      <button type="submit">Registrar asistencia</button>
      <p class="muted">Disponible desde 30 minutos antes y hasta dos horas después de la actividad.</p>
    </form>` : '<p>Actividad cancelada.</p>'}
  `;
  onForm('record-attendance', async fields => {
    const result = await api('/api/coordinator/events/' + event.id + '/attendance', fields);
    await renderCoordinator(event.id);
    notify((result.already_recorded ? 'La asistencia ya estaba registrada para ' : 'Asistencia registrada para ') + result.name + '.');
  });
}

async function renderCoordinator(selected) {
  const { events } = await api('/api/coordinator');
  app.innerHTML = `<header class="editorial-heading">
    <p class="eyebrow">Modo Coordinador</p><h1>Gestión Comunitaria de Talleres</h1>
    <p class="lede">${escapeHtml(actor.name)} · Gestiona tus actividades, inscripciones y asistencias.</p>
    <div class="actions"><button id="logout" class="secondary">Cerrar sesión</button></div></header>
    <nav class="staff-tabs" aria-label="Panel de coordinación">
      <button id="tab-roster" class="secondary">Registro de asistencia</button>
      <button id="tab-publish" class="secondary">+ Publicar nueva actividad</button>
      <button id="tab-own" class="secondary">Mis actividades publicadas</button>
      <button id="tab-metrics" class="secondary">Métricas de registro</button>
    </nav>
    <section class="panel" id="own-events"><h2>Mis actividades</h2>
      ${table(['Actividad', 'Confirmadas', 'En espera', 'Asistencias', 'Gestión'], events.map((event, index) => [
        '<a href="' + eventUrl(event.id) + '">' + escapeHtml(event.title) + '</a><br>' +
          escapeHtml(date(event.starts)) + ' · ' + status(event.status),
        String(event.booked), String(event.waiting), String(event.attended),
        '<div class="actions"><button id="roster-' + index + '" class="secondary">Inscripciones</button>' +
          (event.status === 'published' && event.starts * 1000 > Date.now()
            ? '<button id="edit-' + index + '" class="secondary">Editar</button>' : '') +
          (event.status === 'published' && event.ends * 1000 > Date.now()
            ? '<button id="cancel-' + index + '" class="secondary">Cancelar</button>' : '') + '</div>'
      ]), 'Todavía no has publicado actividades.')}
    </section>
    <section class="panel" id="roster" hidden></section>
    <div id="editor" hidden></div>
    <section class="panel" id="registration-metrics" hidden><h2>Métricas de registro</h2>
      ${table(['Actividad', 'Confirmadas', 'En espera', 'Asistencias'], events.map(event => [
        escapeHtml(event.title), String(event.booked), String(event.waiting), String(event.attended)
      ]), 'Todavía no hay actividades.')}</section>
    ${passwordSection()}
  `;
  connectStaff('coordinator');
  openEditor();
  const show = (tab, panel) => {
    for (const [id, element] of [['tab-roster', 'roster'], ['tab-publish', 'editor'], ['tab-own', 'own-events'], ['tab-metrics', 'registration-metrics']]) {
      document.getElementById(element).hidden = element !== panel;
      document.getElementById(id).setAttribute('aria-pressed', String(id === tab));
    }
  };
  onClick('tab-own', () => show('tab-own', 'own-events'));
  onClick('tab-publish', () => { openEditor(); show('tab-publish', 'editor'); });
  onClick('tab-metrics', () => show('tab-metrics', 'registration-metrics'));
  onClick('tab-roster', () => {
    show('tab-roster', 'roster');
    const panel = document.getElementById('roster');
    panel.innerHTML = '<h2>Registro de asistencia</h2><p>Selecciona la actividad.</p><div class="actions" id="roster-choices"></div>';
    for (const event of events) {
      const button = document.createElement('button');
      button.className = 'secondary';
      button.textContent = event.title;
      button.addEventListener('click', () => renderRoster(event).catch(error => notify(error.message, true)));
      document.getElementById('roster-choices').append(button);
    }
    if (!events.length) panel.querySelector('p').textContent = 'Todavía no has publicado actividades.';
  });
  show('tab-own', 'own-events');
  for (const [index, event] of events.entries()) {
    onClick('roster-' + index, async () => {
      show('tab-roster', 'roster');
      await renderRoster(event);
      document.getElementById('roster').scrollIntoView({ block: 'start' });
    });
    onClick('edit-' + index, () => {
      openEditor(event);
      show('tab-publish', 'editor');
      document.getElementById('editor').scrollIntoView({ block: 'start' });
    });
    onClick('cancel-' + index, async () => {
      if (!confirm('¿Cancelar esta actividad? Las personas inscritas verán el cambio en Mi Pase.')) return;
      await api('/api/coordinator/events/' + event.id + '/cancel', {});
      await renderCoordinator();
      notify('Actividad cancelada.');
    });
  }
  const event = events.find(item => item.id === selected);
  if (event) {
    show('tab-roster', 'roster');
    await renderRoster(event);
  }
}

function actionName(action) {
  const text = action.replaceAll('_', ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function historyTable(items, empty) {
  return table(['Fecha', 'Acción', 'Actividad'], items.map(item => [
    escapeHtml(date(item.created)), escapeHtml(actionName(item.action)), escapeHtml(item.title || '—')
  ]), empty);
}

async function renderCEO(search = '') {
  const data = await api('/api/ceo?search=' + encodeURIComponent(search));
  const { counts } = data;
  const percent = counts.finished_bookings
    ? new Intl.NumberFormat('es-CL', { style: 'percent', maximumFractionDigits: 1 }).format(counts.finished_attendance / counts.finished_bookings)
    : 'Sin reservas finalizadas';
  const metrics = [
    ['Vecinos registrados', counts.neighbors], ['Actividades publicadas', counts.events],
    ['Reservas confirmadas', counts.confirmed], ['Inscripciones en espera', counts.waiting],
    ['Asistencias registradas', counts.attended], ['Asistencia en actividades terminadas', percent]
  ];
  app.innerHTML = `<header class="editorial-heading"><p class="eyebrow">Panel CEO · Confidencial</p>
    <h1>Inteligencia Territorial de Demanda</h1>
    <p class="lede">${escapeHtml(actor.name)} · Operación, cuentas y auditoría.</p>
    <div class="actions"><button id="logout" class="secondary">Cerrar sesión</button></div></header>
    <section class="panel"><h2>Métricas generales</h2>
      <dl class="facts">${metrics.map(([key, value]) => '<div><dt>' + key + '</dt><dd>' + escapeHtml(value) + '</dd></div>').join('')}</dl>
      <p class="muted">La tasa usa reservas confirmadas de actividades terminadas y excluye las canceladas.</p>
    </section>
    <section class="panel"><h2>Navegación de usuarios</h2>
      <p class="muted">Últimos 90 días de las cuentas vecinales.</p>
      ${table(['Acción', 'Total', 'Vecinos únicos'], data.traffic.map(item => [
        escapeHtml(actionName(item.action)), String(item.total), String(item.people)
      ]), 'Todavía no hay acciones de navegación registradas.')}
    </section>
    <section class="panel"><h2>Vecinos registrados</h2>
      <form id="find-neighbor" class="filters">
        <label>Buscar por nombre o teléfono <input name="search" type="search" maxlength="100" value="${escapeHtml(search)}"></label>
        <button type="submit" class="secondary">Buscar</button>
      </form>
      <p class="muted">Hasta 100 resultados. Busca una cuenta específica para ver su historial.</p>
      ${table(['Nombre', 'Teléfono', 'Registro', 'Historial'], data.neighbors.map((item, index) => [
        escapeHtml(item.name), escapeHtml(item.phone),
        escapeHtml(date(item.created)), '<button class="secondary" id="history-' + index + '">Ver historial</button>'
      ]), 'No hay vecinos para esta búsqueda.')}
    </section>
    <section class="panel" id="neighbor-history" hidden></section>
    <section class="panel"><h2>Avisos de WhatsApp</h2>
      <p class="muted">Los mensajes se abren en WhatsApp para que el equipo revise y envíe la cartelera. Se incluyen hasta tres próximas actividades de la comuna.</p>
      ${table(['Vecino', 'Celular', 'Comuna', 'Cartelera'], data.whatsapp.map(item => {
        const available = data.events.some(event => event.commune === item.commune && event.status === 'published' && event.starts * 1000 > Date.now());
        const href = 'https://wa.me/' + item.phone.replace(/[^0-9]/g, '') + '?text=' + encodeURIComponent(whatsappMessage(item, data.events));
        return [escapeHtml(item.name), escapeHtml(item.phone), escapeHtml(item.commune),
          available ? '<a class="button secondary" target="_blank" rel="noopener" href="' + escapeHtml(href) + '">Preparar mensaje</a>' : 'Sin actividades próximas'];
      }), 'No hay suscripciones activas.')}
    </section>
    <section class="panel"><h2>Solicitudes de gestión comunitaria</h2>
      ${table(['Responsable', 'Contacto', 'Organización', 'Motivo', 'Decisión'], data.requests.map((item, index) => [
        escapeHtml(item.name) + '<br>' + escapeHtml(item.username), escapeHtml(item.phone),
        escapeHtml(item.organization), escapeHtml(item.reason),
        '<div class="actions"><button class="secondary" id="approve-request-' + index + '">Aprobar</button>' +
        '<button class="secondary" id="reject-request-' + index + '">Rechazar</button></div>'
      ]), 'No hay solicitudes pendientes.')}
    </section>
    <section class="panel"><h2>Coordinadores</h2>
      ${table(['Usuario', 'Nombre u organización', 'Estado', 'Gestión'], data.staff.map((item, index) => [
        escapeHtml(item.username), escapeHtml(item.name), item.active ? (item.must_change ? 'Cambio de clave pendiente' : 'Activo') : 'Suspendido',
        '<div class="actions"><button class="secondary" id="staff-status-' + index + '">' +
          (item.active ? 'Suspender' : 'Activar') + '</button><button class="secondary" id="reset-staff-' + index +
          '">Restablecer contraseña</button></div>'
      ]), 'Todavía no hay cuentas de coordinación.')}
      <details><summary>Crear cuenta de coordinador</summary><form id="create-staff" class="narrow">
        ${textInput('username', 'Usuario', '', 64, 'autocomplete="off" minlength="3"')}
        ${textInput('name', 'Nombre u organización', '', 120, 'minlength="2"')}
        <label>Contraseña temporal <input name="password" type="password" autocomplete="new-password" required minlength="12" maxlength="128"></label>
        <button type="submit">Crear cuenta</button>
        <p class="muted">El coordinador deberá cambiar la contraseña temporal en su primer ingreso.</p>
      </form></details>
      <div id="reset-panel" hidden></div>
    </section>
    <section class="panel"><h2>Actividades</h2>
      ${table(['Actividad', 'Organiza', 'Confirmadas', 'En espera', 'Asistencias', 'Estado'], data.events.map((item, index) => [
        '<a href="' + eventUrl(item.id) + '">' + escapeHtml(item.title) + '</a><br>' + escapeHtml(date(item.starts)),
        escapeHtml(item.organizer), String(item.booked), String(item.waiting), String(item.attended), status(item.status) +
          (item.status === 'published' && item.ends * 1000 > Date.now()
            ? '<div><button class="secondary" id="cancel-ceo-' + index + '">Cancelar actividad</button></div>' : '')
      ]), 'Todavía no hay actividades.')}
    </section>
    <section class="panel"><h2>Reportes vecinales</h2>
      ${table(['Folio', 'Actividad', 'Detalle', 'Estado'], data.reports.map((item, index) => [
        escapeHtml(item.id), escapeHtml(item.title), escapeHtml(item.detail),
        '<form id="report-status-' + index + '"><label>Estado<select name="status">' +
          ['received', 'reviewed', 'resolved'].map(value =>
            '<option value="' + value + '"' + (item.status === value ? ' selected' : '') + '>' + status(value) + '</option>'
          ).join('') + '</select></label><button class="secondary" type="submit">Guardar</button></form>'
      ]), 'No hay reportes recibidos.')}
    </section>
    <section class="panel"><h2>Registro de auditoría</h2><p class="muted">Últimas 100 operaciones.</p>
      ${table(['Fecha', 'Cuenta', 'Acción', 'Actividad'], data.audit.map(item => [
        escapeHtml(date(item.created)), escapeHtml(item.actor_name),
        escapeHtml(actionName(item.action)), escapeHtml(item.title || '—')
      ]), 'Todavía no hay operaciones registradas.')}
    </section>
    ${passwordSection()}
  `;
  connectStaff('ceo');
  onForm('find-neighbor', fields => renderCEO(fields.search));
  for (const [index, request] of data.requests.entries()) {
    for (const [prefix, decision] of [['approve', 'approved'], ['reject', 'rejected']]) {
      onClick(prefix + '-request-' + index, async () => {
        if (!confirm((decision === 'approved' ? '¿Aprobar' : '¿Rechazar') + ' la solicitud de ' + request.organization + '?')) return;
        await api('/api/ceo/requests/review', { id: request.id, decision });
        await renderCEO(search);
        notify(decision === 'approved' ? 'Cuenta de coordinación habilitada.' : 'Solicitud rechazada.');
      });
    }
  }
  onForm('create-staff', async fields => {
    await api('/api/ceo/staff', fields);
    await renderCEO(search);
    notify('Cuenta creada.');
  });
  for (const [index, neighbor] of data.neighbors.entries()) {
    onClick('history-' + index, async () => {
      const history = await api('/api/ceo/history', { neighbor: neighbor.id });
      const panel = document.getElementById('neighbor-history');
      panel.innerHTML = '<h2>Historial de ' + escapeHtml(history.neighbor.name) + '</h2>' +
        '<h3>Operaciones</h3>' + historyTable(history.operations, 'Sin operaciones registradas.') +
        '<h3>Navegación de los últimos 90 días</h3>' + historyTable(history.visits, 'Sin acciones de navegación registradas.');
      panel.hidden = false;
      panel.scrollIntoView({ block: 'start' });
    });
  }
  for (const [index, staff] of data.staff.entries()) {
    onClick('staff-status-' + index, async () => {
      if (staff.active && !confirm('¿Suspender esta cuenta y cerrar sus sesiones?')) return;
      await api('/api/ceo/staff/status', { id: staff.id, active: !staff.active });
      await renderCEO(search);
      notify(staff.active ? 'Cuenta suspendida.' : 'Cuenta activada.');
    });
    onClick('reset-staff-' + index, () => {
      const panel = document.getElementById('reset-panel');
      panel.innerHTML = `<form id="reset-password" class="narrow">
        <label>Nueva contraseña temporal para ${escapeHtml(staff.username)}
          <input name="password" type="password" autocomplete="new-password" required minlength="12" maxlength="128">
        </label><button type="submit">Guardar contraseña temporal</button></form>`;
      panel.hidden = false;
      panel.querySelector('input').focus();
      onForm('reset-password', async fields => {
        await api('/api/ceo/staff/password', { id: staff.id, password: fields.password });
        await renderCEO(search);
        notify('Contraseña temporal actualizada. La cuenta deberá iniciar sesión nuevamente.');
      });
    });
  }
  for (const [index, event] of data.events.entries()) {
    onClick('cancel-ceo-' + index, async () => {
      if (!confirm('¿Cancelar esta actividad?')) return;
      await api('/api/ceo/events/cancel', { id: event.id });
      await renderCEO(search);
      notify('Actividad cancelada.');
    });
  }
  for (const [index, item] of data.reports.entries()) {
    onForm('report-status-' + index, async fields => {
      await api('/api/ceo/reports/status', { id: item.id, status: fields.status });
      notify('Estado del reporte actualizado.');
    });
  }
}

async function start() {
  try {
    const [sessionData, geographyData, catalogData] = await Promise.all([
      api('/api/session'), api('/api/communes'), api('/api/events')
    ]);
    actor = sessionData.actor;
    communes = geographyData.communes;
    configureGeography(communes, catalogData.events, geographyData.references);
    renderNavigation(page, actor);
    if (page === 'home' || page === 'catalog') {
      const events = catalogData.events;
      renderDiscovery(page, events, track);
      renderWhatsAppFlyer();
    }
    if (page === 'event') await renderEvent(query.get('id'));
    if (page === 'profile') await renderProfile();
    if (page === 'coordinator' || page === 'ceo') await renderStaff(page);
  } catch (error) {
    if (app) app.innerHTML = '<h1>No pudimos cargar esta página</h1><a href="/actividades.html">Volver a la cartelera</a>';
    notify(error.message, true);
  } finally {
    app?.removeAttribute('aria-busy');
  }
}

start();
