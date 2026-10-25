/* ==========================================================================
   ARCHIVO: js/actividad.js
   Página Dedicada de Actividad (Standalone Entry Point)
   ========================================================================== */

import { renderNavbar } from './navbar.js';
import { renderBottomNav } from './bottomNav.js';
import { renderDedicatedActivityPage } from './activityPage.js';
import { getAllActivities } from './state.js';

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar('actividades');
  renderBottomNav('actividades');

  const params = new URLSearchParams(window.location.search);
  let activityId = params.get('id');

  const all = getAllActivities();
  if (!activityId && all.length > 0) {
    activityId = all[0].id;
  }

  const container = document.getElementById('dedicated-activity-root');
  if (container && activityId) {
    renderDedicatedActivityPage(activityId, container, () => {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = 'actividades.html';
      }
    }, '← Volver a la cartelera');
  }
});
