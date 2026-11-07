# ChispaPlay

ChispaPlay sirve la cartelera pública y la API desde el mismo servidor. La cartelera comienza vacía y muestra las actividades que publican los coordinadores habilitados.

## Puesta en marcha

Con Python 3.11 o posterior, ejecuta desde la raíz:

```sh
python server.py ceo direccion --name "Dirección ChispaPlay"
python server.py
```

La primera orden pide la contraseña sin mostrarla. Usa una contraseña única de al menos 12 caracteres. Entra en `http://127.0.0.1:8080/ceo.html` y crea las cuentas de coordinación. Cada coordinador debe cambiar su contraseña temporal al entrar por primera vez. El comando `ceo ... --reset` restablece una cuenta CEO existente y cierra sus sesiones.

Las contraseñas se guardan como hashes PBKDF2-HMAC-SHA256 con sal individual. El acceso usa sesiones de servidor con vencimiento y cookies HttpOnly. Solo la cuenta dueña de una actividad puede editarla, consultar sus inscripciones y registrar asistencia. CEO puede suspender coordinadores, revisar el registro y cancelar actividades.

## Verificación por teléfono

Crea un servicio en Twilio Verify, habilita SMS a Chile y configura estos secretos en el entorno del servidor:

- `TWILIO_API_KEY` y `TWILIO_API_SECRET`, correspondientes a una API Key del mismo proyecto.
- `TWILIO_VERIFY_SERVICE_SID`, el SID del servicio Verify.

Activa [Verify Fraud Guard](https://www.twilio.com/docs/verify/preventing-toll-fraud/verify-fraud-guard) y limita los destinos a Chile en la consola de Twilio. El servidor limita envíos por teléfono e IP y aplica un límite global de 100 SMS por hora, ajustable con `CHISPA_SMS_HOURLY_LIMIT`. Sin secretos, el registro informa que el SMS está temporalmente indisponible.

Tras verificar el celular, el vecino obtiene un código personal fijo que puede recuperar en cualquier dispositivo mediante SMS. El código sirve para identificar una reserva confirmada ante su coordinador desde 30 minutos antes de la actividad hasta dos horas después. La sesión usa una credencial distinta. Cuando se libera un cupo, se confirma la primera inscripción en espera y su estado cambia en Mi Pase.

## Seguimiento

Mi Pase permite activar o desactivar la medición de navegación. Registra aperturas de cartelera y ficha, uso de filtros, clics en mapa y enlaces compartidos. CEO ve los totales y el historial por vecino. El historial de navegación vence a los 90 días y se borra al desactivar el seguimiento. Las reservas, asistencias y reportes se registran como operaciones del servicio. Coordinación tiene acceso solo a la gestión y las cifras de sus actividades.

## Despliegue y datos

El Blueprint de Render define un servicio Python con disco persistente. Configura `CHISPA_PUBLIC_ORIGIN` con la URL HTTPS real y los secretos de Twilio. Ejecuta el comando de creación de CEO desde la consola del servicio con el disco montado. El disco de Render requiere un plan de pago. También puedes usar un servidor Python propio con HTTPS y volumen persistente.

`CHISPA_DATA_DIR` apunta a la carpeta del volumen. Guarda allí `chispaplay.db` y usa el mecanismo de copia de seguridad de SQLite para respaldar la base mientras está en uso. Activa `CHISPA_TRUST_PROXY=1` solo si el proxy de confianza es el único acceso al servidor y agrega la IP real del cliente al final de `X-Forwarded-For`.

La inicialización crea tablas nuevas y conserva las tablas anteriores si ya existe una base. Las muestras y las credenciales locales anteriores quedan fuera de la cartelera y de las cuentas verificadas. Si hubo registros reales durante el piloto, guarda una copia del sistema anterior antes del cambio y revisa su migración por separado. GitHub Pages solo sirve archivos estáticos. Una vez probado el servicio nuevo, usa su URL como enlace público de ChispaPlay y retira o redirige el sitio estático anterior.

Antes de abrir la URL al público, completa una reserva de extremo a extremo con un SMS recibido en un celular chileno y comprueba que los datos sobreviven a un reinicio. [Documentación de Twilio Verify](https://www.twilio.com/docs/verify/api). [Discos persistentes de Render](https://render.com/docs/disks).
