import { Category } from "@/lib/data/types"

export function categoryLabel(category: Category): string {
  switch (category) {
    case "gastro":
      return "Gastronomía"
    case "bienestar":
      return "Bienestar"
    case "aventura":
      return "Aventura"
    case "cultura":
      return "Cultura"
    case "estancias":
      return "Estancias"
    default:
      return ""
  }
}
