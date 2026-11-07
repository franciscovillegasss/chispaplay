# ChispaPlay

La cartelera de ChispaPlay reúne actividades de las 52 comunas de la Región Metropolitana. Conserva la portada editorial por comuna, sector y fecha, las vistas Póster y Diario, la ficha de actividad y el Pase Vecinal.

## Servidor y base de datos

Requiere Python 3.11 o posterior. Ejecuta `python server.py` y abre `http://127.0.0.1:8080/`. SQLite guarda los datos en `chispaplay.db`, dentro de `CHISPA_DATA_DIR` si esa variable está definida, o en la raíz del repositorio. La base se conserva al reiniciar.

Los nombres y teléfonos se almacenan en SQLite. El archivo completo de la base queda sin cifrado a nivel de aplicación. Las contraseñas se guardan como hashes PBKDF2-HMAC-SHA256, con sal individual y 600.000 iteraciones. Las sesiones usan cookies HttpOnly y credenciales aleatorias distintas del código de asistencia.

La cuenta CEO se configura solo en la base del servidor. Sus credenciales no se incluyen en el repositorio. Para configurar una instalación nueva:

```sh
python server.py ceo nombre-del-administrador --name "Dirección" --phone "+56900000000"
```

El comando pide la contraseña sin mostrarla. Solo puede existir una cuenta CEO activa. La opción `--reset` restablece la misma cuenta y cierra sus sesiones.

## Acceso y coordinación

El ingreso se realiza desde «Ya tengo una cuenta» en Mi Pase Vecinal. La cuenta CEO requiere nombre de usuario, teléfono y contraseña. El servidor comprueba el rol CEO en cada operación del panel.

La cuenta vecinal usa nombre, celular y contraseña. El celular es un identificador y su titularidad queda sin verificación por SMS. El código personal tiene cinco dígitos y sirve para registrar una asistencia ante un coordinador autenticado. Cada código es único entre los vecinos registrados y permanece fijo. El espacio permite hasta 90.000 cuentas vecinales.

Los coordinadores solicitan su cuenta desde la pantalla de coordinación, incluyendo responsable, organización y motivo. CEO aprueba o rechaza cada solicitud. Una cuenta pendiente no puede publicar. Cada coordinador aprobado administra exclusivamente sus propias actividades e inscripciones.

## Navegación y métricas

El seguimiento de navegación está activo para todas las cuentas vecinales. Registra aperturas de cartelera y fichas, uso de filtros y clics en mapa, compartir o calendario. El historial de navegación se conserva durante 90 días. Reservas, asistencias, solicitudes de coordinación y cambios administrativos se registran como operaciones del servicio.

## IA local y ficha de actividad

El asistente de fichas está disponible desde el formulario de coordinación. El servidor produce un borrador con una frase de la descripción y el cronograma, sin depender de un modelo externo. Si Chrome tiene su modelo integrado disponible en español, el formulario puede mejorar ese borrador con la Prompt API. La aplicación completa solo los campos vacíos. El coordinador conserva el control de la accesibilidad, los horarios y el lugar.

El servicio de IA usa un modelo local con `node-llama-cpp`. Requiere Node.js y un modelo GGUF compatible. Para instalar las dependencias del servicio:

```sh
npm install --prefix local-ai
```

Configura `CHISPA_AI_MODEL_PATH` con la ruta absoluta al modelo y ejecuta `node local-ai/server.mjs` junto a `python server.py`. El servicio escucha únicamente en `127.0.0.1:18747`. Puedes cambiar el puerto con `CHISPA_AI_PORT` y ajustar `CHISPA_AI_URL` en el servidor web. Si el modelo está apagado o devuelve datos inválidos, el asistente conserva el borrador generado con el texto y los horarios del coordinador. El Blueprint de Render publica el servidor Python y el asistente de fichas.

Se ha integrado [Qwen3-0.6B-GGUF de Qwen](https://huggingface.co/Qwen/Qwen3-0.6B-GGUF), que ocupa aproximadamente 610 MiB. El procesamiento local usa memoria y CPU del computador, sin llamadas a una API de pago. La ficha publicada incluye el resumen aprobado, el cronograma, los datos de accesibilidad, una ventana de Google Maps y descarga de calendario ICS o enlace a Google Calendar.

### Usar la IA del equipo desde la página publicada

Cada coordinador puede instalar el servicio `local-ai` y el modelo en su propio computador. En PowerShell, desde el repositorio, instala las dependencias y arráncalo con el puerto predeterminado:

```powershell
npm install --prefix local-ai
$env:CHISPA_AI_MODEL_PATH = 'C:\ruta\Qwen3-0.6B-Q4_K_M.gguf'
$env:CHISPA_AI_BROWSER_ORIGIN = 'https://chispaplay-eofb.onrender.com'
node local-ai/server.mjs
```

Sustituye la ruta del modelo por la de tu archivo GGUF. Si cambias el dominio público, actualiza el origen sin la barra final. Desde el formulario de coordinación, marca «Usar la IA instalada en este equipo» y genera la ficha. Si Chrome o Edge solicita permiso para acceder a este equipo, concédelo al dominio de ChispaPlay. La inferencia se ejecuta en `127.0.0.1:18747`. El sitio sigue usando Render y Supabase para las cuentas, la edición y la publicación.

Para iniciarla automáticamente en Windows, guarda las tres líneas de configuración y arranque en un archivo `.ps1` que use una ruta absoluta al script `server.mjs`. Crea un acceso directo a `pwsh.exe -File "C:\ruta\iniciar-chispaplay-ia.ps1"` y colócalo en `shell:startup`. Con el equipo y el servicio activos, el modelo queda disponible para las solicitudes del coordinador. Si el servicio está apagado o el navegador bloquea el acceso local, la ficha ofrece la plantilla editable.

## Publicación y estilos

Para publicar se necesita un servidor con HTTPS y almacenamiento persistente. En Render, ChispaPlay usa `CF-Connecting-IP` del borde para los límites por IP. El diagnóstico `/api/ceo/network` muestra al CEO únicamente la IP de su propia solicitud y su origen. En otros entornos, activa `CHISPA_TRUST_PROXY=1` únicamente si el servidor recibe todas las peticiones desde un proxy de confianza que agrega la IP real del cliente al final de `X-Forwarded-For`.

El catálogo empieza vacío. Las tablas previas se conservan y los registros de comunas fuera de la RM quedan fuera de la cartelera pública. Los códigos largos anteriores se migran a cinco dígitos conservando las reservas y la identidad interna.

Si cambian las clases de HTML o JavaScript, recompila la hoja editorial:

```sh
npx tailwindcss@3.4.19 -i css/editorial.input.css -o css/editorial.css --content "./*.html,./js/*.js" --minify
```

La lista de comunas se basa en la [Mapoteca de la Biblioteca del Congreso Nacional](https://www.bcn.cl/siit/mapoteca/comunas).

## Base alojada en Supabase Free

La aplicación admite PostgreSQL mediante `CHISPA_DATABASE_URL`. Usa la URI del pooler de sesión de Supabase, con su contraseña, únicamente como secreto del servidor. La conexión remota exige TLS. Las tablas de ChispaPlay se crean en el esquema privado `chispa`, fuera de las tablas públicas de la Data API, y se revoca el acceso a los roles públicos.

Para activar el proyecto alojado, instala `requirements.txt` en el entorno Python y configura la conexión. Para transferir una base local existente:

```sh
python migrate_cloud.py /ruta/al/chispaplay.db
```

Detén previamente la instancia que escribe en esa base, conserva una copia de seguridad y usa un esquema remoto vacío. La copia preserva los hashes de contraseñas y los identificadores de las cuentas. Las sesiones se vuelven a iniciar. Si el destino ya tiene registros, la migración se rechaza. La aplicación puede seguir sirviéndose desde el computador mientras su almacenamiento ya está alojado. Para que también la página funcione sin ese equipo, hace falta alojar el servidor web.

El plan Free de Supabase incluye 500 MB de base y puede pausarse tras una semana sin actividad. Consulta los límites del [plan gratuito](https://supabase.com/pricing) antes de activarlo. La integración preparada necesita el proyecto y la conexión del servidor para completar la migración real.

## Publicación desde GitHub

En Render, crea un Blueprint conectado a este repositorio y selecciona la rama `chispaplay-operativo`. El archivo `render.yaml` configura un servicio web Free que sirve la página y la API bajo el mismo dominio HTTPS. Introduce `CHISPA_DATABASE_URL` como secreto durante la creación. El servidor requiere la conexión a PostgreSQL para arrancar en ese entorno.

Si vas a conservar cuentas y eventos existentes, ejecuta la migración anterior antes de habilitar el servicio público. Usa una contraseña nueva para la cuenta CEO antes de publicar. Si partes de una base vacía, puedes crear la cuenta CEO desde tu entorno local conectado al mismo PostgreSQL, con el comando `python server.py ceo` documentado arriba.

El asistente básico de fichas está incluido en la aplicación Python publicada. La IA generativa se puede ejecutar con el modelo integrado de un navegador compatible o con el proceso Qwen del equipo del coordinador.

## Referencias y avisos de WhatsApp

`references.json` contiene tres lugares de referencia por cada una de las 52 comunas. Sus coordenadas y fuentes cartográficas individuales provienen de un extracto de OpenStreetMap de Geofabrik. Los puntos ayudan a orientar la búsqueda y ordenar actividades con coordenadas por cercanía. La estimación usa distancia en línea recta a 80 metros por minuto. El enlace de Google Maps abre indicaciones a pie desde el punto elegido. Tres puntos no garantizan cobertura peatonal completa de una comuna.

Datos cartográficos © [colaboradores de OpenStreetMap](https://www.openstreetmap.org/copyright), disponibles bajo ODbL. [Extracto de Chile de Geofabrik](https://download.geofabrik.de/south-america/chile.html).

El flyer al final del ranking y de la cartelera permite suscribirse a avisos de una comuna con la cuenta vecinal. La suscripción requiere confirmación expresa y puede cancelarse desde Mi Pase. CEO puede preparar en WhatsApp un mensaje con las próximas actividades para cada suscriptor. El equipo revisa y envía los mensajes manualmente desde WhatsApp, sin una API de envío pagada.

## Ingreso unificado

En Mi Pase, la opción «Ya tengo una cuenta» recibe nombre, celular y contraseña. El servidor reconoce la cuenta y su rol. Una cuenta CEO válida abre su perfil con acceso al panel. Los registros de navegación se limitan a interacciones dentro de ChispaPlay, como se indica al crear la cuenta.

Los coordinadores pueden ingresar con el nombre de usuario o con su celular registrado. El panel CEO permite asignar un celular a cuentas de coordinación antiguas. La opción «Mantener mi sesión en este dispositivo» amplía la sesión vecinal a 90 días y la de coordinación a 7 días. Los formularios permiten el autocompletado del navegador y pueden ofrecer guardar las credenciales en el gestor del dispositivo.

Vecinos y coordinadores pueden generar un código de recuperación desde su perfil o panel con la contraseña actual. Se muestra al generarlo y se almacena como hash. «Olvidé mi contraseña» consume el código y revoca todas las sesiones de la cuenta. El equipo puede ayudar a un vecino sin código desde el panel CEO, verificando primero el celular registrado y enviando manualmente un código que vence en 30 minutos. Para coordinadores sigue disponible la contraseña temporal administrada por CEO.

Al publicar un taller, selecciona uno de los puntos de referencia de su comuna. El ranking muestra únicamente esas referencias. Las fichas anteriores conservan su sector histórico si se edita la actividad sin cambiar de comuna ni de sector.
