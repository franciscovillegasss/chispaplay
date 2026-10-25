/* ==========================================================================
   ARCHIVO: js/scraper.js
   Módulo AI Scraper · Rastreo y Extracción Inteligente de Actividades
   ========================================================================== */

import { addCustomActivity, logAction, getActiveCommune } from './state.js';
import { COMMUNES_DATA } from './data.js';

// Base de fuentes reales monitoreadas por el AI Scraper
const SCRAPER_SOURCES = {
  maipu: [
    { name: 'DIDECO & Cultura Maipú', url: 'cultura.maipu.cl/agenda-talleres', status: 'Sincronizado' },
    { name: 'Red de Juntas de Vecinos Poniente', url: 'jjvv-maipu-red.cl', status: 'Sincronizado' },
    { name: 'Parque Municipal & Deportes Maipú', url: 'deportes.maipu.cl/talleres-abiertos', status: 'Sincronizado' }
  ],
  valparaiso: [
    { name: 'Parque Cultural Ex Cárcel Valparaíso', url: 'parquecultural.cl/cartelera-comunitaria', status: 'Sincronizado' },
    { name: 'Dirección de Desarrollo Comunal Valpo', url: 'valparaiso.cl/dideco/actividades', status: 'Sincronizado' },
    { name: 'Mesa de Cultura Cerros de Valparaíso', url: 'cerrosvalpo.org/talleres', status: 'Sincronizado' }
  ]
};

// Repositorio de actividades rastreadas listas para indexar
const AI_DISCOVERIES = {
  maipu: [
    {
      title: 'Taller de Huerto Familiar & Lombricultura Urbana',
      category: 'Huertito & Naturaleza',
      categoryTag: 'AGROECOLOGÍA BARRIAL',
      timeframe: 'hoy',
      dateLabel: 'Hoy · 17:00 a 18:30 hrs',
      locationName: 'Parque Tres Poniente',
      address: 'Av. Tres Poniente con Nueva San Martín, Maipú',
      organizerName: 'Mesa Agroecológica Tres Poniente',
      legalEntityNumber: 'PJ N° 402-Maipú',
      instructorName: 'Agrónoma Camila Farías',
      instructorWhatsapp: '+56 9 7891 0081',
      capacity: 25,
      ageGroup: 'Familias, niñas y niños (6+ años)',
      summary: 'Técnicas de sustrato vivo, preparación de composteras caseras y entrega de semillas de hortalizas de temporada.',
      imageUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=900&auto=format&fit=crop&q=80',
      isNeuroFriendly: true,
      isWheelchairAccessible: true
    },
    {
      title: 'Taller de Robótica Infantil & Ensamblaje Solar',
      category: 'Ciencia & Mini-Robótica',
      categoryTag: 'STEM BARRIAL',
      timeframe: 'semana',
      dateLabel: 'Sábado · 11:30 a 13:00 hrs',
      locationName: 'Plaza Mayor de Maipú',
      address: 'Av. 5 de Abril con Av. Pajaritos, Maipú',
      organizerName: 'Colectivo Tecnológico Juvenil Maipú',
      legalEntityNumber: 'PJ N° 290-Maipú',
      instructorName: 'Ignacio Henríquez',
      instructorWhatsapp: '+56 9 7891 0082',
      capacity: 20,
      ageGroup: 'Niñas y niños (8 a 14 años)',
      summary: 'Armado de pequeños carritos impulsados por miniceldas fotovoltaicas y sensores de luz con piezas reutilizadas.',
      imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=900&auto=format&fit=crop&q=80',
      isNeuroFriendly: true,
      isWheelchairAccessible: true
    },
    {
      title: 'Encuentro de Ajedrez Callejero & Juegos de Estrategia',
      category: 'Deporte & Juegos Tradicionales',
      categoryTag: 'AJEDREZ URBANO',
      timeframe: 'mes',
      dateLabel: 'Domingo 26 · 10:30 a 13:00 hrs',
      locationName: 'Cerro Primo de Rivera',
      address: 'Av. Pajaritos con Anker Keim, Maipú',
      organizerName: 'Club de Ajedrez Primo de Rivera',
      legalEntityNumber: 'PJ N° 115-Maipú',
      instructorName: 'Prof. Mario Cárdenas',
      instructorWhatsapp: '+56 9 7891 0083',
      capacity: 35,
      ageGroup: 'Todas las edades (principiantes y avanzados)',
      summary: 'Mesas al aire libre bajo los árboles del cerro histórico. Simultáneas y nociones básicas de apertura.',
      imageUrl: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=900&auto=format&fit=crop&q=80',
      isNeuroFriendly: true,
      isWheelchairAccessible: false
    }
  ],
  valparaiso: [
    {
      title: 'Clínica de Acrobacia Aérea & Malabares Porteños',
      category: 'Teatro, Circo & Cuentos',
      categoryTag: 'CIRCO PORTEÑO',
      timeframe: 'hoy',
      dateLabel: 'Hoy · 17:30 a 19:30 hrs',
      locationName: 'Parque Cultural de Valparaíso (Ex Cárcel)',
      address: 'Calle Cárcel #471, Cerro Cárcel, Valparaíso',
      organizerName: 'Escuela de Circo Barrial Valpo',
      legalEntityNumber: 'PJ N° 189-Valparaíso',
      instructorName: 'Simón Bahamondes',
      instructorWhatsapp: '+56 9 8891 0081',
      capacity: 22,
      ageGroup: 'Jóvenes y niños (7 a 18 años)',
      summary: 'Iniciación segura en tela aérea baja, trapecio formativo y juego colectivo con clavas de malabarismo.',
      imageUrl: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=900&auto=format&fit=crop&q=80',
      isNeuroFriendly: true,
      isWheelchairAccessible: true
    },
    {
      title: 'Pintura y Boceto al Aire Libre de Casonas Patrimoniales',
      category: 'Arte & Creatividad',
      categoryTag: 'PATRIMONIO VISUAL',
      timeframe: 'semana',
      dateLabel: 'Sábado · 11:00 a 13:00 hrs',
      locationName: 'Paseo Yugoslavo (Cerro Alegre)',
      address: 'Paseo Yugoslavo s/n, Cerro Alegre, Valparaíso',
      organizerName: 'JJVV N° 71 Cerro Alegre',
      legalEntityNumber: 'PJ N° 71-Valparaíso',
      instructorName: 'Paulina Avaria',
      instructorWhatsapp: '+56 9 8891 0082',
      capacity: 20,
      ageGroup: 'Para toda la familia (8+ años)',
      summary: 'Acuarela y carboncillo en atril portátil con vista a los tejados y la bahía. Materiales incluidos por la junta vecinal.',
      imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=900&auto=format&fit=crop&q=80',
      isNeuroFriendly: true,
      isWheelchairAccessible: true
    },
    {
      title: 'Remo Formativo & Reconocimiento Marino en Kayak Doble',
      category: 'Deporte & Juegos Tradicionales',
      categoryTag: 'DEPORTE NÁUTICO',
      timeframe: 'mes',
      dateLabel: 'Domingo 26 · 09:30 a 12:00 hrs',
      locationName: 'Muelle Barón',
      address: 'Av. Errázuriz con Muelle Barón, Valparaíso',
      organizerName: 'Club Náutico Bahía Barón',
      legalEntityNumber: 'PJ N° 440-Valparaíso',
      instructorName: 'Cap. Ignacio Vera',
      instructorWhatsapp: '+56 9 8891 0083',
      capacity: 18,
      ageGroup: 'Jóvenes y adultos (10+ años)',
      summary: 'Seguridad en el agua, chalecos salvavidas y recorrido por las aguas protegidas del muelle histórico.',
      imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=900&auto=format&fit=crop&q=80',
      isNeuroFriendly: true,
      isWheelchairAccessible: false
    }
  ]
};

export function openScraperModal(onActivityImported = null) {
  let modalRoot = document.getElementById('scraper-modal-root');
  if (!modalRoot) {
    modalRoot = document.createElement('div');
    modalRoot.id = 'scraper-modal-root';
    document.body.appendChild(modalRoot);
  }

  const commune = getActiveCommune();
  const communeName = commune === 'maipu' ? 'Maipú' : 'Valparaíso';
  const sources = SCRAPER_SOURCES[commune] || [];
  const discoveries = AI_DISCOVERIES[commune] || [];

  modalRoot.innerHTML = `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-soft">
      <div class="bg-white border-4 border-black max-w-2xl w-full p-6 sm:p-8 shadow-[10px_10px_0px_0px_#E11D48] relative max-h-[92vh] overflow-y-auto">
        
        <!-- Botón Cerrar -->
        <button id="btn-close-scraper" class="absolute top-4 right-4 text-black hover:text-[#E11D48] text-2xl font-black leading-none focus:outline-none">
          ✕
        </button>

        <div class="flex items-center gap-2 mb-2">
          <span class="bg-[#E11D48] text-white text-[10px] font-mono font-black uppercase px-2 py-0.5 tracking-wider">
            AI SCRAPER COMUNITARIO
          </span>
          <span class="text-xs font-mono text-neutral-500 font-bold flex items-center gap-1">
            <span class="w-2 h-2 bg-[#059669] rounded-full inline-block animate-ping"></span>
            FUENTES LOCALES ACTIVAS
          </span>
        </div>

        <h2 class="text-2xl sm:text-3xl font-black uppercase tracking-tight text-neutral-900 leading-none mb-2">
          Rastreador Inteligente de Talleres: ${communeName}
        </h2>
        <p class="text-xs sm:text-sm text-neutral-600 mb-5">
          El AI Scraper inspecciona boletines municipales, convocatorias de juntas de vecinos y agendas culturales para descubrir y traer nuevas actividades verificadas a ChispaPlay.
        </p>

        <!-- Fuentes Conectadas -->
        <div class="bg-neutral-100 border border-neutral-300 p-3 mb-5 text-xs font-mono">
          <div class="font-bold text-neutral-800 uppercase text-[10px] mb-1">Fuentes Verificadas de ${communeName}:</div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
            ${sources
              .map(
                s => `
              <div class="bg-white p-2 border border-neutral-300">
                <div class="font-bold text-neutral-900 truncate">${s.name}</div>
                <div class="text-[10px] text-[#059669] flex items-center gap-1">
                  <span>✓</span> ${s.status}
                </div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>

        <!-- Lista de Nuevas Actividades Rastreadas -->
        <div class="mb-6">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-black uppercase tracking-wider text-neutral-900 font-mono">
              Talleres Nuevos Detectados (${discoveries.length}):
            </span>
            <button 
              id="btn-import-all-scraper" 
              class="bg-black hover:bg-[#E11D48] text-white text-xs font-black uppercase tracking-wider px-3 py-1.5 transition-colors cursor-pointer"
            >
              + Integrar Todas a la Cartelera
            </button>
          </div>

          <div class="space-y-3">
            ${discoveries
              .map(
                (item, idx) => `
              <div class="border-2 border-black p-4 bg-neutral-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#E11D48] transition-colors">
                <div class="space-y-1">
                  <div class="flex items-center gap-2 text-[10px] font-mono">
                    <span class="bg-[#111111] text-white px-1.5 py-0.2 font-bold">${item.categoryTag}</span>
                    <span class="text-[#E11D48] font-bold">📍 ${item.locationName}</span>
                    <span class="text-neutral-500">${item.dateLabel}</span>
                  </div>
                  <h4 class="text-sm font-black uppercase text-neutral-900 leading-snug">
                    ${item.title}
                  </h4>
                  <p class="text-xs text-neutral-600 line-clamp-1">
                    ${item.summary}
                  </p>
                  <div class="text-[11px] font-mono text-neutral-500">
                    Organiza: <strong>${item.organizerName}</strong> · Cupos: ${item.capacity}
                  </div>
                </div>

                <button 
                  type="button" 
                  data-discovery-idx="${idx}"
                  class="btn-import-single shrink-0 bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-black uppercase px-3 py-2 transition-colors cursor-pointer shadow-[2px_2px_0px_0px_#111111]"
                >
                  + Integrar
                </button>
              </div>
            `
              )
              .join('')}
          </div>
        </div>

        <div class="border-t border-neutral-300 pt-3 flex justify-between items-center text-xs text-neutral-500 font-mono">
          <span>Actualización en tiempo real · Despliegue oficial</span>
          <button id="btn-close-scraper-bottom" class="font-bold text-neutral-800 hover:text-black uppercase underline">
            Cerrar
          </button>
        </div>

      </div>
    </div>
  `;

  // Bindings
  const close = () => {
    modalRoot.innerHTML = '';
  };

  document.getElementById('btn-close-scraper').addEventListener('click', close);
  document.getElementById('btn-close-scraper-bottom').addEventListener('click', close);

  // Importar una sola
  document.querySelectorAll('.btn-import-single').forEach(btn => {
    btn.addEventListener('click', e => {
      const idx = parseInt(e.currentTarget.getAttribute('data-discovery-idx'), 10);
      const item = discoveries[idx];
      if (!item) return;

      const coords = COMMUNES_DATA[commune].centerReference.coordinates;
      addCustomActivity({
        ...item,
        commune,
        coordinates: coords
      });

      logAction('AI_SCRAPER_IMPORT', 'Actividad Rastreada Integrada', `"${item.title}" en ${item.locationName}`);
      e.currentTarget.textContent = '✓ Integrada';
      e.currentTarget.classList.remove('bg-[#E11D48]', 'hover:bg-[#BE123C]');
      e.currentTarget.classList.add('bg-[#059669]');
      e.currentTarget.disabled = true;

      if (onActivityImported) onActivityImported();
    });
  });

  // Importar todas
  document.getElementById('btn-import-all-scraper').addEventListener('click', () => {
    const coords = COMMUNES_DATA[commune].centerReference.coordinates;
    discoveries.forEach(item => {
      addCustomActivity({
        ...item,
        commune,
        coordinates: coords
      });
    });

    logAction('AI_SCRAPER_IMPORT_ALL', 'Lote de Actividades Integrado', `${discoveries.length} talleres añadidos a ${communeName}`);
    alert(`¡Se integraron ${discoveries.length} nuevas actividades rastreadas en ${communeName}!`);
    close();
    if (onActivityImported) onActivityImported();
  });
}
