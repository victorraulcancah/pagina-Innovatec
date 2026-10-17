# Fotos del sitio y su origen

Fotos libres de [Unsplash](https://unsplash.com/license) (licencia Unsplash: uso comercial permitido, sin
atribución obligatoria). Están en `database/seeders/assets/photos/` y el `SiteContentSeeder` las asigna **solo**
a los elementos que no tienen imagen; una foto subida desde el panel nunca se reemplaza.

| Archivo | Dónde se usa | Página de origen |
|---|---|---|
| `comunicaciones-unificadas.jpg` | Solución Comunicaciones Unificadas | https://unsplash.com/photos/smgTvepind4 |
| `ciberseguridad.jpg` | Solución Ciberseguridad | https://unsplash.com/photos/KdCJ1nIkgOU |
| `networking.jpg` | Solución Networking | https://unsplash.com/photos/pl6My-v7gnE |
| `infraestructura-ti.jpg` | Solución Infraestructura TI | https://unsplash.com/photos/ufT32_VFS-I |
| `seguridad-electronica.jpg` | Solución Seguridad Electrónica | https://unsplash.com/photos/zBTYRFCeaS0 |
| `telcos-torre.jpg` | Cabecera de División Telcos | https://unsplash.com/photos/jcrgaPcoxnM |
| `telcos-router.jpg` | Bloque «Experiencia con operadoras» | https://unsplash.com/photos/y4GHs9GEFdM |
| `telcos-expertise.jpg` | Valor «Expertise certificado» | https://unsplash.com/photos/VFMhqkiL6E4 |
| `telcos-flexibilidad.jpg` | Valor «Flexibilidad y eficiencia» | https://unsplash.com/photos/Qx7A7SChpnI |
| `telcos-confianza.jpg` | Valor «Confianza y compromiso» | https://unsplash.com/photos/lZXX-QVdyXY |

`data-center.jpg`, `server-room.jpg` y `racks.jpg` salen del brochure de PROINNOVATEC.

Para cambiar cualquiera: Admin → la página correspondiente → imagen del elemento → subir una nueva.

## Aplicarlas en un servidor ya instalado

```bash
git pull && php artisan db:seed --class=SiteContentSeeder --force
```
