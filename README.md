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

La IA sugiere un resumen breve de por qué ir y un cronograma editable. El coordinador revisa la propuesta antes de publicar. La accesibilidad conserva la información proporcionada por el responsable y sus confirmaciones explícitas.

El servicio de IA usa un modelo local con `node-llama-cpp`. Requiere Node.js y un modelo GGUF compatible. Para instalar las dependencias del servicio:

```sh
npm install --prefix local-ai
```

Configura `CHISPA_AI_MODEL_PATH` con la ruta absoluta al modelo y ejecuta `node local-ai/server.mjs`. El servicio escucha únicamente en `127.0.0.1:18747`. La aplicación también admite otro servicio local compatible mediante `CHISPA_AI_URL`. Si la IA está apagada, el coordinador puede completar la ficha manualmente.

Se ha integrado [Qwen3-0.6B-GGUF de Qwen](https://huggingface.co/Qwen/Qwen3-0.6B-GGUF), que ocupa aproximadamente 610 MiB. El procesamiento local usa memoria y CPU del computador, sin llamadas a una API de pago. La ficha publicada incluye el resumen aprobado, el cronograma, los datos de accesibilidad, una ventana de Google Maps y descarga de calendario ICS o enlace a Google Calendar.

## Publicación y estilos

Para publicar se necesita un servidor con HTTPS y un volumen persistente. Configura `HOST`, `CHISPA_PUBLIC_ORIGIN` y `CHISPA_DATA_DIR` en ese entorno. Activa `CHISPA_TRUST_PROXY=1` únicamente si el servidor recibe todas las peticiones desde un proxy de confianza que agrega la IP real del cliente al final de `X-Forwarded-For`.

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

## Referencias y avisos de WhatsApp

`references.json` contiene tres lugares de referencia por cada una de las 52 comunas. Sus coordenadas y fuentes cartográficas individuales provienen de un extracto de OpenStreetMap de Geofabrik. Los puntos ayudan a orientar la búsqueda y ordenar actividades con coordenadas por cercanía. La estimación usa distancia en línea recta a 80 metros por minuto. El enlace de Google Maps abre indicaciones a pie desde el punto elegido. Tres puntos no garantizan cobertura peatonal completa de una comuna.

Datos cartográficos © [colaboradores de OpenStreetMap](https://www.openstreetmap.org/copyright), disponibles bajo ODbL. [Extracto de Chile de Geofabrik](https://download.geofabrik.de/south-america/chile.html).

El flyer al final del ranking y de la cartelera permite suscribirse a avisos de una comuna con la cuenta vecinal. La suscripción requiere confirmación expresa y puede cancelarse desde Mi Pase. CEO puede preparar en WhatsApp un mensaje con las próximas actividades para cada suscriptor. El equipo revisa y envía los mensajes manualmente desde WhatsApp, sin una API de envío pagada.

## Ingreso unificado

En Mi Pase, la opción «Ya tengo una cuenta» recibe nombre, celular y contraseña. El servidor reconoce la cuenta y su rol. Una cuenta CEO válida abre su perfil con acceso al panel. Los registros de navegación se limitan a interacciones dentro de ChispaPlay, como se indica al crear la cuenta.
