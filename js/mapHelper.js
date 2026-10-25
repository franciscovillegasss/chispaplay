/* ==========================================================================
   ARCHIVO: js/mapHelper.js
   Mini-Mapa Interactivo de Caminata 15 Minutos (Leaflet + OpenStreetMap 100% Gratis)
   ========================================================================== */

import L from 'leaflet';

// Mapa de instancias activas para evitar inicializaciones duplicadas en el mismo contenedor
const activeMapInstances = new Map();

/**
 * Destruye limpiamente una instancia de mapa activa y libera memoria
 * @param {string} containerId
 */
export function destroyActivityMap(containerId) {
  if (activeMapInstances.has(containerId)) {
    try {
      activeMapInstances.get(containerId).remove();
    } catch {
      // Ignorar
    }
    activeMapInstances.delete(containerId);
  }
}

/**
 * Renderiza un mapa interactivo centrado en las coordenadas del taller con radio de 15 minutos
 * @param {string} containerId - ID del elemento div donde se montará el mapa
 * @param {{lat: number, lng: number}} coords - Coordenadas de la plaza o taller
 * @param {string} locationName - Nombre del parque o plaza
 * @param {number} walkingMinutes - Minutos calculados de caminata
 * @param {string} [category] - Categoría del taller
 */
export function renderActivityMap(containerId, coords, locationName, walkingMinutes = 8, category = 'Taller Barrial') {
  const container = document.getElementById(containerId);
  if (!container || !coords || typeof coords.lat !== 'number' || typeof coords.lng !== 'number') {
    return null;
  }

  // Si ya existía un mapa en este contenedor, removerlo limpiamente
  destroyActivityMap(containerId);

  // Asegurar que el contenedor esté limpio
  container.innerHTML = '';

  try {
    const map = L.map(containerId, {
      center: [coords.lat, coords.lng],
      zoom: 15,
      zoomControl: true,
      scrollWheelZoom: false, // Evita atrapar el scroll de la página en móviles
      attributionControl: true
    });

    // Capa de teselas de OpenStreetMap (100% gratuita y sin API key)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> · ChispaPlay'
    }).addTo(map);

    // Círculo sombreado del radio caminable de 15 minutos (~1.200 metros)
    const walkingRadiusMeters = 1200;
    const walkingCircle = L.circle([coords.lat, coords.lng], {
      color: '#059669',
      fillColor: '#10B981',
      fillOpacity: 0.16,
      weight: 2,
      dashArray: '5, 5',
      radius: walkingRadiusMeters
    }).addTo(map);

    walkingCircle.bindTooltip('Zona caminable a 15 min a pie', {
      permanent: false,
      direction: 'top',
      className: 'font-mono text-xs font-bold text-neutral-800'
    });

    // Icono editorial personalizado con estilo Time Out
    const customIcon = L.divIcon({
      className: 'chispaplay-map-marker',
      html: `
        <div style="background-color: #111111; color: #FFFFFF; border: 2px solid #E11D48; padding: 4px 6px; font-family: monospace; font-size: 11px; font-weight: 900; box-shadow: 2px 2px 0px #E11D48; white-space: nowrap; transform: translate(-50%, -100%);">
          📍 ${walkingMinutes} MIN
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0]
    });

    const marker = L.marker([coords.lat, coords.lng], { icon: customIcon }).addTo(map);
    
    marker.bindPopup(`
      <div style="font-family: sans-serif; padding: 4px; max-width: 200px;">
        <div style="font-size: 9px; font-family: monospace; font-weight: bold; text-transform: uppercase; color: #E11D48;">
          ${category}
        </div>
        <div style="font-size: 12px; font-weight: 900; color: #111111; margin-top: 2px;">
          ${locationName}
        </div>
        <div style="font-size: 11px; color: #059669; font-weight: bold; margin-top: 4px;">
          🚶 A ${walkingMinutes} min caminando (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})
        </div>
      </div>
    `);

    activeMapInstances.set(containerId, map);

    // Ajuste de tamaño diferido para asegurar renderizado correcto al expandir el acordeón
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return map;
  } catch (err) {
    console.error('Error inicializando mapa Leaflet:', err);
    container.innerHTML = `
      <div class="h-full flex items-center justify-center bg-neutral-100 text-neutral-500 text-xs font-mono p-4 text-center">
        📍 Ubicación: ${locationName} (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})
      </div>
    `;
    return null;
  }
}
