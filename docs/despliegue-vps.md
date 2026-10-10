# Despliegue en un VPS (servidor de prueba)

Guía para publicar PROINNOVATEC en un VPS con Apache + PHP + MySQL (por ejemplo AlmaLinux/CentOS).
Reemplaza `PUERTO`, `IP` y `CLAVE_SEGURA` por tus valores.

## 0. Qué necesitas llevar al servidor

| Qué | De dónde sale |
|---|---|
| Código | `git clone` del repositorio |
| Imágenes subidas | Ya vienen en el repositorio (`storage/app/public`) |
| Base de datos | Archivo `database/dumps/pagina_innovatec.sql` (no está en GitHub; se genera en tu PC) |
| Estilos y scripts compilados | Carpeta `public/build` (no está en GitHub; se genera con `npm run build`) |
| Video de portada | Si lo usas, súbelo desde el panel del servidor (los videos no van en git) |

## 1. Revisa el servidor

```bash
php -v                 # necesita PHP 8.3 o superior
php -m | grep -E "pdo_mysql|mbstring|xml|fileinfo|openssl|sodium|tokenizer|curl"
composer -V
mysql --version
```

Si `php -v` muestra una versión menor a 8.3, no instales este proyecto con ese PHP: te saldrá un error de Composer.
Los otros proyectos del servidor no se tocan.

## 2. Base de datos

Sube `pagina_innovatec.sql` (por ejemplo con `scp`) y créala con un usuario propio, no con `root`:

```bash
mysql -uroot -p -e "
CREATE DATABASE pagina_innovatec CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'innovatec'@'localhost' IDENTIFIED BY 'CLAVE_SEGURA';
GRANT ALL PRIVILEGES ON pagina_innovatec.* TO 'innovatec'@'localhost';
FLUSH PRIVILEGES;"

mysql -uinnovatec -p --default-character-set=utf8mb4 pagina_innovatec < pagina_innovatec.sql
```

El archivo ya trae las tablas y los datos. **No ejecutes `php artisan db:seed` ni `migrate:fresh`.**

## 3. Código

Pon el proyecto **fuera** de `/var/www/html` para que solo `public/` quede expuesto:

```bash
cd /var/www
git clone https://github.com/victorraulcancah/pagina-Innovatec.git
cd pagina-Innovatec
composer install --no-dev --optimize-autoloader
```

## 4. Estilos y scripts compilados

Lo más simple es compilar en tu PC y subir el resultado:

```bash
# En tu PC (carpeta del proyecto)
npm run build
tar czf build.tgz -C public build
scp build.tgz root@IP:/var/www/pagina-Innovatec/

# En el servidor
cd /var/www/pagina-Innovatec && tar xzf build.tgz -C public && rm build.tgz
```

## 5. Configuración (`.env`)

```bash
cp .env.example .env
php artisan key:generate
php artisan jwt:secret --force
nano .env
```

Valores a revisar en `.env`:

```dotenv
APP_ENV=production
APP_DEBUG=false
APP_URL=http://IP:PUERTO          # debe coincidir con la dirección real: de aquí salen las URLs de las imágenes

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=pagina_innovatec
DB_USERNAME=innovatec
DB_PASSWORD=CLAVE_SEGURA
```

## 6. Permisos y caché

```bash
chown -R apache:apache storage bootstrap/cache      # en Debian/Ubuntu: www-data
chmod -R ug+rwx storage bootstrap/cache
php artisan storage:link
php artisan config:cache && php artisan route:cache && php artisan view:cache
```

Si el servidor usa SELinux (AlmaLinux/CentOS):

```bash
chcon -R -t httpd_sys_rw_content_t storage bootstrap/cache
setsebool -P httpd_can_network_connect_db on
```

## 7. Apache en un puerto libre

Elige un puerto que no use ningún otro proyecto (comprueba con `ss -ltnp | grep PUERTO`).
Crea `/etc/httpd/conf.d/pagina-innovatec.conf` (en Debian/Ubuntu: `/etc/apache2/sites-available/`):

```apache
Listen PUERTO

<VirtualHost *:PUERTO>
    DocumentRoot "/var/www/pagina-Innovatec/public"

    <Directory "/var/www/pagina-Innovatec/public">
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog  /var/log/httpd/pagina-innovatec-error.log
    CustomLog /var/log/httpd/pagina-innovatec-access.log combined
</VirtualHost>
```

```bash
apachectl configtest && systemctl reload httpd
firewall-cmd --add-port=PUERTO/tcp --permanent && firewall-cmd --reload   # si usas firewalld
```

Abre `http://IP:PUERTO/` y el panel en `http://IP:PUERTO/admin`.

## 8. Después de publicar

- **Cambia la contraseña del administrador** en el panel (Mi cuenta). El respaldo trae la de tu entorno local.
- **Correo:** configura `MAIL_*` en `.env` si quieres que el formulario de contacto avise por correo (si no, los mensajes igual llegan a la bandeja del panel).
- **Actualizar el código más adelante:**
  ```bash
  git pull
  composer install --no-dev --optimize-autoloader
  # sube de nuevo public/build si cambió el diseño
  php artisan migrate --force
  php artisan config:cache && php artisan route:cache && php artisan view:cache
  ```
- **Contenido editado en el servidor** (textos, imágenes, mensajes) vive en la base de datos de ese servidor. No se mezcla solo con lo que edites en tu PC: si trabajas en los dos lados, exporta e importa el `.sql` en el sentido que corresponda.

## Problemas frecuentes

| Síntoma | Causa probable |
|---|---|
| Pantalla en blanco o error 500 | Permisos de `storage` y `bootstrap/cache`, o SELinux. Mira `storage/logs/laravel.log` |
| La página carga sin estilos | Falta `public/build` (paso 4) |
| Las imágenes no se ven | Falta `php artisan storage:link` o `APP_URL` no coincide con la dirección real |
| `Class not found` / error de Composer | PHP menor a 8.3 o `composer install` sin terminar |
| Panel pide login una y otra vez | `APP_URL` con otro dominio/puerto, o la hora del servidor mal configurada (el token JWT vence) |
