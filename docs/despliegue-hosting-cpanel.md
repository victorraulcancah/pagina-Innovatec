# Despliegue de un proyecto Laravel en hosting compartido con cPanel

Guía basada en cómo se subió PROINNOVATEC (noviembre de 2026). Sirve para subir otro proyecto
Laravel + Inertia + React + Vite al mismo tipo de hosting.

> **Para la IA que ayude con esto:** sigue los pasos en orden, **uno a la vez**, y espera la salida del
> usuario antes del siguiente. No supongas la configuración del hosting: si un dato importa (carpeta,
> versión, dominio, DNS), pregúntalo o pide un comando que lo muestre. Respuestas cortas. **Nunca pidas
> contraseñas en el chat**: el usuario las escribe directamente en el `.env` o en cPanel.

---

## 1. Cómo es este hosting (datos comprobados)

| Dato | Valor en PROINNOVATEC |
| --- | --- |
| Tipo | Hosting compartido cPanel con CloudLinux (servidoresph, servidor `cp013`) |
| Usuario de la cuenta | `magusqao` (home: `/home/magusqao`) |
| IP del sitio | `147.124.195.39` (IP **compartida** con otros sitios) |
| Carpeta del proyecto | `/home/magusqao/proinnovatec.com` (la carpeta del dominio) |
| Raíz del documento | `/home/magusqao/proinnovatec.com/public` |
| PHP de la terminal (por defecto) | 8.1, **no sirve** para Laravel 13 |
| PHP 8.3 | `/opt/alt/php83/usr/bin/php` |
| Node.js | No está en el PATH; hay versiones en `/opt/alt/alt-nodejsXX/root/usr/bin` |
| Base de datos | MySQL en `localhost`; nombres con el prefijo `magusqao_` |
| DNS del dominio | Cloudflare (lo gestiona el cliente) |

Para otro proyecto en la **misma cuenta** casi todo esto es igual: solo cambian el dominio, la
carpeta y la base de datos. En **otra cuenta u otro hosting**, comprueba cada dato antes de usarlo.

---

## 2. Antes de empezar (en local)

1. El código debe estar en GitHub, incluido `composer.lock` y `package-lock.json`.
2. Las imágenes subidas desde el panel (`storage/app/public`) **no siempre están en Git**. Anota de
   dónde vas a sacar la base de datos: las imágenes deben salir **del mismo servidor** (ver paso 9).
3. Revisa qué versión de PHP pide `composer.json` (`"php": "^8.3"` en este caso).

---

## 3. Clonar el código en la carpeta del dominio

Se clona **dentro de la carpeta del dominio** (`~/proinnovatec.com`), no en otra. Esa carpeta ya
traía archivos del hosting (`cgi-bin`, `php.ini`): **no se borran**. Como la carpeta no está vacía,
no se usa `git clone`, sino:

```bash
cd ~/proinnovatec.com
git init
git remote add origin https://github.com/<usuario>/<repositorio>.git
git fetch origin
git checkout -t origin/main
```

---

## 4. Elegir PHP 8.3

**En la terminal:** la versión por defecto es 8.1. Para ver las versiones disponibles:

```bash
ls /opt/alt/ | grep php
/opt/alt/php83/usr/bin/php -v
```

Para no escribir la ruta completa cada vez, se dejó PHP 8.3 en el PATH:

```bash
echo 'export PATH=/opt/alt/php83/usr/bin:$PATH' >> ~/.bashrc && source ~/.bashrc && php -v
```

**En la web:** se forzó PHP 8.3 agregando una línea al `.htaccess` de la carpeta del dominio. La
línea se copió de otro proyecto de la misma cuenta que ya funcionaba
(`~/corporacionromaerp.com/projroma/public/.htaccess`):

```bash
echo 'AddHandler application/x-httpd-ea-php83 .php' >> ~/proinnovatec.com/.htaccess
```

Para comprobar qué PHP usa la web, crea un archivo temporal y bórralo después:

```bash
echo '<?php echo PHP_VERSION;' > public/version-check.php
# abrirlo en el navegador o con curl (ver paso 10), y luego:
rm public/version-check.php
```

---

## 5. Instalar dependencias de PHP

```bash
php $(command -v composer) install --no-dev --optimize-autoloader
```

(Si PHP 8.3 todavía no está en el PATH: `/opt/alt/php83/usr/bin/php $(command -v composer) install --no-dev --optimize-autoloader`.)

---

## 6. Crear el `.env`

```bash
cp .env.example .env
sed -i -e 's/^APP_ENV=.*/APP_ENV=production/' -e 's/^APP_DEBUG=.*/APP_DEBUG=false/' -e 's/^LOG_LEVEL=.*/LOG_LEVEL=error/' .env
php artisan key:generate --force
php artisan jwt:secret --force
```

Luego el usuario edita el `.env` **a mano** (Administrador de archivos de cPanel o `nano .env`):

```
APP_URL=https://<dominio>
DB_HOST=localhost
DB_DATABASE=<cuenta>_<nombre_bd>
DB_USERNAME=<cuenta>_<usuario_bd>
DB_PASSWORD=<la que puso en cPanel>
```

> **No regeneres `APP_KEY`** una vez que el sitio esté en uso: los secretos cifrados (por ejemplo, el
> MFA de los usuarios) y los códigos de respaldo dejarían de funcionar.

---

## 7. Base de datos

1. cPanel → **Bases de datos MySQL**: crear la base de datos y el usuario (cPanel antepone
   `<cuenta>_` a los dos nombres).
2. En la misma pantalla, **agregar el usuario a la base de datos** con **todos los privilegios**. Si
   te lo saltas, Laravel no puede conectarse.
3. Hay dos opciones:
   - **Copiar los datos de otro servidor:** exportar el `.sql` (con Navicat o phpMyAdmin) e
     importarlo en cPanel → **phpMyAdmin** → base de datos → **Importar**.
   - **Base de datos nueva:** `php artisan migrate --force` (y los seeders si el proyecto los usa).
4. Comprobar:

```bash
php artisan migrate:status
```

---

## 8. Compilar el frontend (`npm run build`) en el hosting

Node no viene activado. Primero ver qué versiones hay:

```bash
ls -d /opt/alt/alt-nodejs*/root/usr/bin 2>/dev/null
```

Activar Node 22 de forma permanente:

```bash
echo 'export PATH=/opt/alt/alt-nodejs22/root/usr/bin:$PATH' >> ~/.bashrc && source ~/.bashrc && node -v && npm -v
```

**Límite de procesos (importante):** CloudLinux limita los procesos de la cuenta y cuenta cada hilo
como un proceso. Rolldown (el compilador de Vite 8) abre un hilo por cada núcleo del servidor,
supera el límite y pasa esto:

- `npm run build` (`vp build`) **se queda pegado sin mostrar nada**;
- `npx vite build` falla con `Error: spawn /bin/sh EAGAIN`.

La solución es limitar los hilos (se dejó guardado en `~/.bashrc`):

```bash
echo 'export ROLLDOWN_WORKER_THREADS=2 ROLLDOWN_MAX_BLOCKING_THREADS=2 RAYON_NUM_THREADS=2 TOKIO_WORKER_THREADS=2 UV_THREADPOOL_SIZE=2' >> ~/.bashrc && source ~/.bashrc
```

Después:

```bash
npm ci
npm run build
```

La compilación ejecuta `php artisan wayfinder:generate`, así que `php` debe ser 8.3 (paso 4).

> En la cuenta `magusqao`, el `~/.bashrc` ya tiene Node 22, PHP 8.3 y el límite de hilos. **Otro
> proyecto en la misma cuenta no necesita repetir el paso 4 (PATH) ni el paso 8**: solo `npm ci` y
> `npm run build` en su carpeta.

---

## 9. Imágenes subidas desde el panel

Laravel sirve las imágenes desde `storage/app/public` a través del enlace `public/storage`:

```bash
php artisan storage:link
ls -la public/storage   # debe apuntar a .../storage/app/public
```

Si la base de datos viene de otro servidor, ahí también están sus imágenes. En PROINNOVATEC
solo cargaban las que estaban en Git: faltaban 17 en la página de inicio. Se copiaron desde el VPS:

```bash
# En el servidor de origen (VPS), dentro del proyecto:
tar -czf /tmp/imagenes.tar.gz -C storage/app/public .
```

Descargar el archivo (WinSCP), subirlo a la carpeta del proyecto en el hosting (Administrador de
archivos de cPanel → Cargar) y extraerlo ahí:

```bash
tar -xzf imagenes.tar.gz -C storage/app/public && rm imagenes.tar.gz && php artisan cache:clear
```

Para contar las imágenes de la página de inicio que faltan (debe salir `0`):

```bash
curl -s https://<dominio>/ | grep -o 'storage\\/seed\\/[A-Za-z0-9]*\.[a-z]*' | tr -d '\\' | sort -u | while read f; do [ -f "storage/app/public/${f#storage/}" ] || echo "falta $f"; done | wc -l
```

(Ajusta `seed` a la carpeta donde guarde las imágenes el otro proyecto.)

---

## 10. Probar antes de cambiar el DNS

En un hosting compartido **no se puede ver el sitio solo con la IP**: muchos sitios comparten
la IP y el servidor elige el sitio por el nombre del dominio. Con la IP sola aparece la página
«SORRY» de cPanel. Tampoco sirve `IP/carpeta`.

Para probarlo desde la terminal sin tocar el DNS:

```bash
curl -s --resolve <dominio>:80:<IP> http://<dominio>/ | grep -o '<title>[^<]*'
```

Si devuelve el título del sitio, el hosting funciona. Para que alguien lo vea en el navegador antes
del cambio de DNS: usar un subdominio de prueba (registro A `prueba` → IP en el DNS, y agregar el
subdominio en cPanel con la raíz `<carpeta>/public`).

---

## 11. Publicar: DNS y SSL

1. Averiguar **dónde está el DNS** del dominio (con `dig NS <dominio>` o preguntando al cliente).
   En PROINNOVATEC era **Cloudflare**, no el registrador.
2. Cambiar el **registro A** del dominio (y de `www`) a la IP del hosting.
3. Preguntar al cliente qué **modo SSL de Cloudflare** usa (Flexible, Full o Full strict). Con
   *Full strict* hace falta un certificado válido en el hosting (cPanel → SSL/TLS Status → AutoSSL).
4. Después del cambio, comprobar `https://<dominio>` y el login (`/admin/login`).

---

## 12. Actualizar el sitio más adelante

```bash
cd ~/<carpeta-del-proyecto>
git pull
composer install --no-dev --optimize-autoloader   # solo si cambió composer.lock
npm ci                                            # solo si cambió package-lock.json
npm run build
php artisan migrate --force
php artisan optimize:clear
```

---

## 13. Errores que aparecieron y su causa

| Síntoma | Causa | Solución |
| --- | --- | --- |
| `npm: command not found` | Node no está en el PATH | Paso 8 |
| `npm run build` se queda pegado | Límite de procesos de CloudLinux | Limitar los hilos (paso 8) |
| `spawn /bin/sh EAGAIN` | La misma causa | La misma solución |
| Composer o artisan fallan por la versión de PHP | La terminal usa PHP 8.1 | Paso 4 |
| Algunas imágenes rotas y otras bien | Faltan archivos en `storage/app/public` (la base de datos viene de otro servidor) | Paso 9 |
| Todas las imágenes rotas | Falta `public/storage` o `APP_URL` está mal | `php artisan storage:link` y revisar `APP_URL` |
| Página «SORRY» al abrir la IP | Hosting compartido: no responde solo por la IP | Probar con `curl --resolve` o un subdominio (paso 10) |
| `public-build.zip` no se descomprime con `unzip` | Era un archivo tar con extensión .zip | `tar -xf` (ya no hace falta: se compila en el hosting) |
| Ruta nueva da 404 después de actualizar | Caché de rutas vieja | `php artisan optimize:clear` |

---

## 14. Errores de quien guiaba el despliegue (que no se repitan)

- Proponer otra carpeta en vez de la que indicó el usuario: **se usa la carpeta que diga el usuario**.
- Dar por hecho dónde está el DNS (se dijo GoDaddy y era Cloudflare): **preguntar o comprobarlo**.
- Usar una IP sacada de otra prueba (84.247.162.204) en vez de la del hosting
  (147.124.195.39): **confirmar la IP en cPanel**.
- Dar varios pasos de golpe o mensajes largos: **un paso, un comando, esperar la respuesta**.
- Pedir o mostrar contraseñas: **las pone el usuario a mano**.
