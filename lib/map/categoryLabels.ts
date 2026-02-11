import { Category } from "@/lib/data/types"

export const categoryLabel = (category: Category) => ({
  gastro: "Gastronomía",
  bienestar: "Bienestar",
  aventura: "Aventura",
  cultura: "Cultura",
  estancias: "Estancias",
}[category])
