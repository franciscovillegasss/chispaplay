# ChispaPlay

ChispaPlay conserva la portada por comuna, sector y fecha, la Cartelera Diaria en vistas Póster y Diario, la ficha editorial, el Pase Vecinal y los paneles del equipo. La cartelera empieza vacía y muestra las actividades que publican los coordinadores habilitados.

## Ejecutar sin servicios pagados

Con Python 3.11 o posterior, ejecuta desde la raíz del repositorio:

```sh
python server.py
```

Abre `http://127.0.0.1:8080/`. La aplicación usa SQLite y guarda la base en `chispaplay.db`. Puedes indicar otra carpeta con `CHISPA_DATA_DIR`. Usa la misma carpeta para iniciar el servidor y gestionar cuentas. El servidor local escucha en el propio computador.

Para habilitar el panel CEO, ejecuta en otra terminal:

```sh
python server.py ceo direccion --name "Dirección ChispaPlay"
```

La orden pide una contraseña de al menos 12 caracteres sin mostrarla. Entra en `/ceo.html` y crea las cuentas de coordinación. Cada coordinador debe cambiar su contraseña temporal al entrar por primera vez. La opción `--reset` restablece una cuenta CEO existente y cierra sus sesiones.

## Cuentas, reservas y seguimiento

El vecino se registra con nombre, celular chileno y contraseña. El servidor normaliza el número, permite una cuenta por teléfono y limita los intentos de registro e ingreso. La titularidad del número queda sin verificar. La contraseña y el código personal son distintos. El vecino presenta su código fijo ante el coordinador para registrar asistencia a una reserva confirmada. Al liberarse un cupo se confirma la primera inscripción en espera y el estado cambia en Mi Pase.

Las contraseñas se guardan como hashes PBKDF2-HMAC-SHA256 con sal individual. El acceso usa sesiones de servidor con vencimiento y cookies HttpOnly. Cada coordinador puede editar sus propias actividades, consultar sus inscripciones y registrar asistencia. CEO puede suspender coordinadores, revisar el registro y cancelar actividades.

Mi Pase permite activar y desactivar el seguimiento voluntario de navegación. CEO puede consultar aperturas de cartelera y ficha, uso de filtros, clics en mapa y enlaces compartidos. Al desactivar el seguimiento se borra ese historial. Las operaciones del servicio, como reservas y asistencias, se mantienen en su propio registro.

## Datos y publicación

El servidor local funciona sin suscripciones ni envíos de SMS. Para un enlace público persistente se necesita un equipo accesible con HTTPS y almacenamiento persistente para SQLite. Configura `HOST`, `CHISPA_PUBLIC_ORIGIN` y `CHISPA_DATA_DIR` en el entorno del servidor. Activa `CHISPA_TRUST_PROXY=1` solo si un proxy de confianza es el único acceso al servidor y agrega la IP real del cliente al final de `X-Forwarded-For`.

La inicialización conserva las tablas anteriores y las excluye de la cartelera operativa. Las cuentas de la versión con SMS que no tenían contraseña quedan sin acceso mediante contraseña hasta una migración controlada. Conserva un respaldo si existían datos reales.

La hoja `css/editorial.css` se entrega compilada para servirla localmente. Si cambian las clases editoriales en HTML o JavaScript, recompílala así:

```sh
npx tailwindcss@3.4.19 -i css/editorial.input.css -o css/editorial.css --content "./*.html,./js/*.js" --minify
```
