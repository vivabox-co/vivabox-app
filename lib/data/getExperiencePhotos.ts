import { Experience } from "@/lib/data/types"

export function getExperiencePhotos(exp: Pick<Experience, "image" | "gallery">): string[] {
  const photos = [exp.image, ...(exp.gallery || [])].filter(
    (src, i, arr) => !!src && arr.indexOf(src) === i
  )
  return photos.length > 0 ? photos : ["/images/placeholder.jpg"]
}
