import { Format } from "@/lib/data/types"

export const formatLabel = (format: Format) => ({
  solo: "Para uno",
  duo: "Para dos",
  familia: "En familia",
}[format])
