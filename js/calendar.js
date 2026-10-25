/* ==========================================================================
   ARCHIVO: js/calendar.js
   Sincronización Instantánea con Google Calendar & Apple iCal (.ics)
   100% Gratis · Cero Dependencias de Pago · Client-Side Puro
   ========================================================================== */

/**
 * Calcula fechas ISO UTC para eventos según el timeframe y horario del taller
 */
function getActivityTimestamps(activity) {
  const now = new Date();
  let eventDate = new Date();

  // Si es hoy, programar para hoy
  if (activity.timeframe === 'hoy') {
    eventDate.setHours(17, 0, 0, 0); // 17:00 hrs estándar de tarde
  } else if (activity.timeframe === 'semana') {
    // Próximo sábado
    const dayOfWeek = eventDate.getDay();
    const distanceToSaturday = (6 - dayOfWeek + 7) % 7 || 3;
    eventDate.setDate(eventDate.getDate() + distanceToSaturday);
    eventDate.setHours(11, 0, 0, 0); // 11:00 hrs
  } else {
    // Este mes: dentro de 10 días
    eventDate.setDate(eventDate.getDate() + 10);
    eventDate.setHours(10, 30, 0, 0);
  }

  // Duración: 2 horas
  const endDate = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000);

  const formatUtcIso = (date) => {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  };

  return {
    start: formatUtcIso(eventDate),
    end: formatUtcIso(endDate),
    formattedDate: eventDate.toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  };
}

/**
 * Genera URL directa para Google Calendar (sin API keys, 100% gratuita)
 */
export function getGoogleCalendarUrl(activity) {
  const { start, end } = getActivityTimestamps(activity);
  const title = encodeURIComponent(`ChispaPlay: ${activity.title}`);
  const details = encodeURIComponent(
    `Taller Barrial Comunitario: ${activity.title}\n\n` +
    `📍 Lugar: ${activity.locationName} (${activity.address || 'Maipú / Valparaíso'})\n` +
    `🕒 Horario: ${activity.dateLabel || 'Horario oficial'}\n` +
    `👤 Monitor: ${activity.instructorName || 'Monitor Acreditado'} · ${activity.instructorRole || 'Docente'}\n` +
    `🎒 Qué llevar: ${activity.whatToBring || 'Ropa cómoda y agua'}\n\n` +
    `💡 Veredicto ChispaPlay: ${activity.editorialVerdict || activity.summary || 'Taller gratuito 15 min'}\n\n` +
    `Convocatoria gestionada a través de ChispaPlay (U. de Chile FCFM).`
  );
  const location = encodeURIComponent(`${activity.locationName}, ${activity.address || ''}`);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
}

/**
 * Genera y descarga un archivo .ics para Apple Calendar / Outlook (100% cliente)
 */
export function downloadIcsFile(activity) {
  const { start, end } = getActivityTimestamps(activity);

  const cleanText = (str) => (str || '').replace(/[\r\n]+/g, ' ').replace(/,/g, '\\,');

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ChispaPlay//Ciudad de 15 Minutos//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:chispaplay-${activity.id}-${Date.now()}@chispaplay.cl`,
    `DTSTAMP:${start}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:ChispaPlay: ${cleanText(activity.title)}`,
    `DESCRIPTION:${cleanText(activity.editorialVerdict || activity.summary)} - Monitor: ${cleanText(activity.instructorName)}`,
    `LOCATION:${cleanText(activity.locationName)}\\, ${cleanText(activity.address)}`,
    'STATUS:CONFIRMED',
    'CLASS:PUBLIC',
    'END:VEVENT',
    'END:VCALENDAR'
  ];

  const blob = new Blob([icsLines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `chispaplay-${activity.id}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Genera enlace a Google Maps para caminar desde el sector a la plaza (100% gratuito)
 */
export function getGoogleMapsDirectionsUrl(activity) {
  if (activity.coordinates && activity.coordinates.lat && activity.coordinates.lng) {
    return `https://www.google.com/maps/dir/?api=1&destination=${activity.coordinates.lat},${activity.coordinates.lng}&travelmode=walking`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${activity.locationName}, ${activity.address || ''}`)}`;
}
