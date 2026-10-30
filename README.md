# Valentina Cabrera · @latinwatxa — Media Kit 2026

Sitio web del media kit de Valentina Cabrera, Content Creator y Visual Designer en Montevideo, Uruguay.
Es estático: HTML, CSS y JS, sin build ni dependencias. Lo único externo es [Lenis](https://github.com/darkroomengineering/lenis) para el scroll suave en desktop, y el sitio funciona igual si no carga.

## Estructura

```
index.html                     contenido (sigue el orden del PDF)
assets/css/styles.css          estilos; medidas tomadas del lienzo 1920×1080 del PDF
assets/js/main.js              animaciones, nav, menú mobile, reels de Instagram
assets/fonts/                  Coolvetica (subconjuntos extraídos del PDF)
assets/img/                    imágenes en WebP (dos tamaños para srcset)
assets/video/                  videos propios (Cowork Prado), H.264 comprimido
assets/mediakit-…-2026.pdf     PDF descargable
```

## Probar en local

```
python -m http.server 8000
```

y abrir http://localhost:8000. Los reels de Instagram necesitan servirse por http, no por `file://`.

## Publicar con GitHub Pages

Settings → Pages → Source: *Deploy from a branch* → `main` / `/ (root)`.

## Editar contenido

- **Reels de Instagram**: en `index.html`, sección "reels destacados" (dentro de `[ 03 ] TRABAJOS`). Cada reel es un `<div class="reel" data-reel="URL">`. La URL va sin parámetros de seguimiento (`?igsh=…`). Para agregar una categoría, se suma un `<button role="tab">` y su `<div role="tabpanel">`.
- **Videos propios** (los que no están en Instagram, como Cowork Prado): cada teléfono es un `<div class="vphone">` con la portada y un botón `data-video="assets/video/….mp4"`. El video se reproduce dentro de la pantalla del teléfono y no se descarga hasta que alguien toca play. Para sumar uno nuevo, comprimirlo así:
  ```
  ffmpeg -i original.mp4 -c:v libx264 -preset slow -crf 30 -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 96k salida.mp4
  ```
- **Testimonios**: en `assets/js/main.js`, completar el array `TESTIMONIALS`. Cuando tenga datos, la sección "Marcas que confiaron en mí" los muestra solos.
- **Marcas del carrusel**: los `<span>` dentro de `.marquee__row` en `index.html`.

## Tipografía

- **Archivo** (Google Fonts, licencia OFL): textos.
- **Coolvetica** (Typodermic): títulos. Los archivos de `assets/fonts/` son los subconjuntos que venían embebidos en el PDF, así que **sólo tienen los caracteres que usa el media kit**. Todos los títulos del sitio se escribieron con esos caracteres. Si un título nuevo necesita otras letras, se ve en Archivo.
  Para la web, Typodermic pide una licencia de *embedding* ([MyFonts](https://www.myfonts.com/collections/coolvetica-font-typodermic)). Con los archivos completos alcanza con reemplazar los `.woff` de `assets/fonts/`, manteniendo los mismos nombres.
