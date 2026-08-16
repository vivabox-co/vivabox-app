import { Experience } from "@/lib/data/types"

// TEMP: exp.gallery casi nunca viene poblado desde el sheet todavía, así que
// completamos con 2 visuales de demo para poder mostrar el scroll horizontal.
// Quitar este fallback (y dejar solo exp.image + exp.gallery) una vez que el
// catálogo tenga fotos reales en `gallery`.
const DEMO_FILLER_PHOTOS = ["/image/image_activado1.jpg", "/image/image_welcome.webp"]

export function getExperiencePhotos(exp: Pick<Experience, "image" | "gallery">): string[] {
  const photos = [exp.image, ...(exp.gallery || []), ...DEMO_FILLER_PHOTOS].filter(
    (src, i, arr) => !!src && arr.indexOf(src) === i
  )
  return photos.length > 0 ? photos : ["/images/placeholder.jpg"]
}
