# ChispaPlay Mobile & Editorial Overhaul: Vista Diario, Tarjetas Limpias y Reportaje Dedicado

Unificación de la experiencia móvil y de escritorio de ChispaPlay con selector de visualización en Cartelera Diaria (`[⊞ Vista Póster | ☰ Vista Diario]`), tarjetas exteriores ultra simplificadas sin acordeones invasivos, y una **Página Dedicada a la Actividad** con reportaje editorial completo (65% contenido / 35% ticket de reserva sticky en desktop, y barra fija inferior en móvil).

---

## Decisiones Críticas Confirmadas

> [!IMPORTANT]
> Decisiones de diseño y arquitectura validadas interactivamente en la Fase 1:

- **Arquitectura de la Vista Dedicada**: Se implementa una **página dedicada con soporte para Deep Links** (`actividad.html?id=...` y fallback dinámico) accesible directamente desde el Ranking de Inicio, la Cartelera Diaria y el Modo Coordinador, con botón de retorno editorial limpio `← Volver a la cartelera`.
- **Estructura de 5 Elementos Ultra Limpios por Tarjeta Exterior**: Se erradica el acordeón desplegable que empujaba el contenido hacia abajo. Cada tarjeta exterior muestra exactamente:
  1. *Fotografía con badge de categoría + tiempo a pie en minutos*.
  2. *Hora y fecha clara*.
  3. *Título en negrita y Plaza/Lugar*.
  4. *Estado y cupos en tiempo real*.
  5. *Botón primario de acción directa: "Ver actividad / Reservar →"*.
- **Ergonomía Móvil y Barra de Conversión**: En teléfonos móviles, la página dedicada despliega una **barra fija inferior compacta** (`bottom-0 z-40`) con el estado de cupos y el botón directo de reserva/espera, respetando el límite del 15% del viewport para no cansar la lectura del reportaje.
- **Limpieza de Footers Intermedios Rotos**: Se elimina de raíz cualquier bloque textual repetido o footer secundario que aparecía entre secciones al filtrar o cambiar vistas en Inicio, consolidando un único footer unificado con holgura ergonómica `pb-24 md:pb-8`.

---

## 1. Visión General & Concepto Editorial

ChispaPlay evoluciona a un formato híbrido entre revista cultural barrial (*Time Out*, *The New Yorker*) y motor de servicios comunitarios de 15 minutos:
- **Público Objetivo**: Familias y vecinos de Maipú y Valparaíso que buscan actividades gratuitas sin fricción técnica, formularios extensos ni publicidad.
- **Propósito Clave**: Reducir el tiempo de descubrimiento y reserva a menos de 10 segundos, permitiendo una exploración rápida (vista póster o vista diario compacta) y una inmersión editorial de alta confianza en cada actividad.

---

## 2. Experiencia de Usuario & Diseño Visual

### A. Eliminación de Footers Intermedios en Inicio
- Auditoría y supresión de bloques redundantes (`CHISPAPLAY · Ingeniería Civil Industrial...`) inyectados dinámicamente entre pasos o tras actualizar filtros.
- El pie de página permanece exclusivamente al final del documento con espaciado móvil para que la barra inferior de navegación no colisione con los enlaces.

### B. Selector de Vista en Cartelera Diaria: `[ ⊞ Vista Póster | ☰ Vista Diario ]`
Ubicado junto al buscador y filtros en `actividades.html`:
- **⊞ Vista Póster (Por defecto)**: Grilla limpia de 2 columnas en desktop (1 columna en móvil) con las nuevas tarjetas de 5 elementos.
- **☰ Vista Diario (Agenda Compacta)**: Lista cronológica ultra escaneable inspirada en agendas impresas:
  - Fila horizontal delgada separada por líneas finas (`border-b border-neutral-200 py-3.5`).
  - Columna 1: Hora en gran tamaño (`17:30`) + indicador peatonal (`4 min a pie`).
  - Columna 2: Título en negrita + Plaza/Lugar + Organización convocante + sello compacto (`Neuro-Friendly`).
  - Columna 3: Estado de cupos (`9 cupos`) + Botón minimalista `"Abrir →"`.
  - Permite revisar más de 10 actividades en una sola pantalla sin necesidad de scrolling excesivo.

### C. Tarjetas Exteriores Ultra Limpias (Sin Acordeón)
Se eliminan permanentemente de la vista exterior de las tarjetas:
- ❌ El párrafo largo de descripción.
- ❌ La caja amarilla de "Por qué ir / Veredicto".
- ❌ La franja negra superior redundante con timestamps duplicados.
- ❌ La lista amontonada de píldoras grises.

**Los 5 Elementos Esenciales**:
1. **Fotografía Panorámica (16:10 / 16:9)**: Con contenedor de relación fija (cero CLS), badge discreto de categoría y tiempo estimado caminando.
2. **Fecha y Horario**: Día y hora destacados con tipografía tabular legible.
3. **Título & Espacio Público**: Título en tipografía negrita editorial y nombre de la plaza/parque barrial.
4. **Estado de Cupos**: Contador en tiempo real (`✓ Cupos disponibles` o `🔥 Cupos Agotados`).
5. **Botón de Acción**: Botón nítido `"Ver actividad / Reservar →"` que conduce a la vista dedicada.

### D. Página Dedicada a la Actividad (`actividad.html` / Deep Link)
Al hacer clic en cualquier tarjeta:
- **Barra Superior**: Botón limpio `← Volver a la cartelera` + migas editoriales (`Maipú / Deporte / Plaza El Abrazo`).
- **Layout de 2 Columnas (Desktop 65% / 35%)**:
  - **Columna Izquierda (Reportaje Editorial)**:
    - Categoría en rojo + Titular gigante de diario + Fecha, hora y distancia exacta a pie.
    - Fotografía principal en gran escala con verificación oficial.
    - Recuadro editorial *"El Veredicto ChispaPlay"* (por qué vale la pena ir, qué implementos llevar).
    - Cronograma paso a paso del taller (inicio, calentamiento, práctica, cierre vecinal).
    - Grilla de equipamiento del parque (sombra natural, baños públicos, accesibilidad universal, espacio calmo).
    - Mapa Leaflet interactivo con el radio caminable y botón `"Abrir ruta paso a paso a pie"`.
    - Muro Comunitario de recomendaciones y consejos vecinales al final.
  - **Columna Derecha (Sticky Ticket & Monitor Box)**:
    - Módulo fijo al hacer scroll en desktop (`sticky top-24`).
    - Estado de cupos y demanda B2G.
    - Botón primario: `"RESERVAR MI CUPO GRATIS →"` o `"UNIRME A LISTA DE ESPERA"`.
    - Si el cupo está reservado: Despliega acciones de terreno (`Agendar en Google Calendar / .ics`, `📍 Llegué a la plaza ✓`, `Liberar cupo`, `Avisar algo roto en la plaza`).
    - Ficha de confianza del Monitor Acreditado (Nombre, Organización, PJ) con botón directo a WhatsApp.
- **Versión Móvil**:
  - Flujo vertical continuo optimizado.
  - Barra de conversión inferior flotante (`bottom-0 z-40 bg-white border-t-2 border-black p-3`) que permite reservar o ver cupos en cualquier punto de lectura sin perder el contexto.

---

## 3. Arquitectura Técnica & Flujo de Datos

```
┌────────────────────────────────────────────────────────────────────────┐
│                          CHISPAPLAY APPLICATION                        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
           ┌────────────────────────┼────────────────────────┐
           ▼                        ▼                        ▼
     [index.html]          [actividades.html]       [actividad.html]
   (Ranking 15 min)        (Cartelera Diaria)      (Página Dedicada)
           │                        │                        │
           │  5 Elementos Limpios   │ [⊞ Póster | ☰ Diario]  │ Reportaje + Sticky Ticket
           └───────────┬────────────┴───────────┬────────────┘
                       │                        │
                       ▼                        ▼
           [URL: actividad.html?id=...] <───────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │       js/actividad.js        │
        │ - Renderiza Reportaje 65/35  │
        │ - Sticky Ticket / Mobile Bar │
        │ - Leaflet Map Lazy Mount     │
        │ - 1-Click Reserva / Waitlist │
        │ - Check-in GPS & Muro Vecino │
        └──────────────┬───────────────┘
                       │
                       ▼
     [js/state.js & localStorage]
     (Telemetría, Usuario Tokenizado, Reservas, Reseñas, Avisos)
```

---

## 4. Plan de Ejecución por Pasos

1. **Limpieza de UI Móvil & Footers**:
   - Auditar `index.html`, `js/index.js`, `actividades.html`, `coordinador.html`, `perfil.html` y eliminar cualquier bloque de footer secundario/huérfano entre secciones.
2. **Selector de Vistas en Cartelera**:
   - Implementar el conmutador `[ ⊞ Vista Póster | ☰ Vista Diario ]` en `actividades.html` y la lógica de renderizado en `js/actividades.js`.
3. **Simplificación Radical de Tarjetas Exteriores**:
   - Retirar los acordeones internos y condensar la tarjeta a los 5 elementos clave tanto en `js/index.js` como en `js/actividades.js`.
   - Conectar los clics hacia la nueva página dedicada pasando el parámetro `id`.
4. **Construcción de la Página Dedicada (`actividad.html` y `js/actividad.js`)**:
   - Crear el layout editorial con la división 65% / 35%, bloque sticky de ticket y barra fija en móvil.
   - Integrar todas las acciones (reserva 1-clic, micro-modal de contacto si es nuevo, GPS, .ics, WhatsApp del monitor y reporte de desperfecto).
5. **Verificación & Calidad**:
   - Validar navegación en mobile viewport (375px a 430px) y desktop (1440px).
   - Comprobación con `lint_applet` y `compile_applet`.
