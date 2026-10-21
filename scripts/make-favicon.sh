#!/usr/bin/env bash
# Genera el favicon del sitio: solo el icono hexagonal del logo, dentro de un marco.
# Requiere ImageMagick (`magick`). Uso:  bash scripts/make-favicon.sh
#
# Edita las variables de abajo para cambiar el marco y vuelve a ejecutarlo.
# (Un favicon subido desde el panel, en «Datos de la empresa», tiene prioridad sobre estos archivos.)
set -euo pipefail
cd "$(dirname "$0")/.."

SOURCE="public/brand/logo-light.png"   # logo completo; se recorta solo el icono (lado izquierdo)
ICON_WIDTH=300                         # ancho en px del icono dentro del logo original

FRAME_COLOR="#11285c"                  # fondo del marco
BORDER_COLOR="#06c2f0"                 # borde del marco
BORDER=24                              # grosor del borde (sobre una base de 512 px)
RADIUS=120                             # redondeo de las esquinas
ICON_SIZE=350                          # tamaño del icono dentro del marco (más grande = menos aire)

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# 1) Icono solo (recortado al contenido, fondo transparente)
magick "$SOURCE" -crop "${ICON_WIDTH}x+0+0" +repage -trim +repage "public/brand/icon.png"

# 2) Marco de 512x512
magick -size 512x512 xc:none \
  -fill "$FRAME_COLOR" -draw "roundrectangle 0,0 511,511 $RADIUS,$RADIUS" \
  -fill none -stroke "$BORDER_COLOR" -strokewidth "$BORDER" \
  -draw "roundrectangle $((BORDER / 2)),$((BORDER / 2)) $((511 - BORDER / 2)),$((511 - BORDER / 2)) $((RADIUS - 10)),$((RADIUS - 10))" \
  "$TMP/frame.png"

# 3) Icono centrado dentro del marco
magick "public/brand/icon.png" -resize "${ICON_SIZE}x${ICON_SIZE}" "$TMP/icon.png"
magick "$TMP/frame.png" "$TMP/icon.png" -gravity center -composite "$TMP/favicon-512.png"

# 4) Tamaños
magick "$TMP/favicon-512.png" -resize 512x512 public/favicon-512.png
magick "$TMP/favicon-512.png" -resize 192x192 public/favicon-192.png
magick "$TMP/favicon-512.png" -resize 180x180 public/apple-touch-icon.png
magick "$TMP/favicon-512.png" -resize 32x32 public/favicon-32.png
magick "$TMP/favicon-512.png" -define icon:auto-resize=48,32,16 public/favicon.ico

echo "Favicon generado en public/ (favicon.ico, favicon-32/192/512.png, apple-touch-icon.png)"
