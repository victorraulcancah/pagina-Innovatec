# Roles y permisos del panel

Cada persona que entra al panel tiene **un rol**, y cada rol es un conjunto de **permisos**. Todo se gestiona desde
el propio panel; no hace falta tocar código.

| Pantalla | Para qué |
|---|---|
| **Admin → Roles y permisos** | Crear roles, elegir qué permisos da cada uno, ver el resumen por rol y eliminar los que no se usan |
| **Admin → Usuarios** | Crear personas y asignarles un rol; activarlas, desactivarlas o eliminarlas |

## Permisos disponibles

Cada permiso es una acción concreta (ver, editar, eliminar), no un área completa.

- **Páginas del sitio** — uno por página: Inicio, Nosotros, División Enterprise, División Telcos, Casos de éxito, Clientes y Contacto.
- **Empresa** — editar logo, favicon, redes sociales, WhatsApp y datos legales.
- **Blog** — ver, crear y editar publicaciones, eliminar publicaciones, gestionar categorías.
- **Mensajes** — ver, eliminar.
- **Usuarios** — ver, crear, editar, eliminar.
- **Roles y permisos** — ver, crear y editar roles.

Un permiso que necesita otro lo trae solo: quien puede editar el blog también puede verlo.
Todos los roles pueden cambiar sus propios datos y contraseña en «Mi cuenta».

## Roles de origen

| Rol | Permisos |
|---|---|
| **Administrador** | Acceso total, también a lo que se agregue después. No se edita ni se elimina. |
| **Editor** | Todas las páginas del sitio y el blog |
| **Redactor** | Solo el blog |
| **Comercial** | Ver y eliminar mensajes |

Los tres últimos se pueden editar o eliminar (si no tienen usuarios) como cualquier rol creado a mano.

## Reglas de seguridad

- Nadie edita ni elimina **su propio rol**, ni cambia su rol, ni se desactiva o elimina a sí mismo: siempre queda un administrador.
- Solo se pueden dar permisos que **uno mismo ya tiene**. Quien gestiona roles pero no tiene «Empresa» no puede crear un rol con «Empresa».
- Solo se asignan roles con permisos **dentro de los propios**, y no se modifica a quien tiene más permisos que uno.
- Un rol con usuarios no se elimina: primero se les cambia el rol.
- El rol y los permisos se leen de la base de datos en cada petición: un cambio vale desde la siguiente página que abra la persona.

## Agregar un permiso nuevo (para quien programa)

1. Añádelo a `App\Support\PermissionCatalog::groups()` (las páginas nuevas se agregan solas desde `SiteSections::pages()`).
2. Protege la ruta con `->middleware('permission:area.accion')` en `routes/web.php`.
3. Si aplica, muéstralo en el menú en `SiteSections::navigation()`.

## Al actualizar un servidor

```bash
git pull && php artisan migrate --force && npm run build
php artisan optimize:clear && php artisan config:cache && php artisan route:cache && php artisan view:cache
```

La migración crea los roles de origen y deja a cada usuario con el rol que ya tenía. Sin `route:cache` renovado, las
pantallas nuevas (`/admin/roles`) dan 404.
