import { Format } from "@/lib/data/types"

export const formatLabel = (format: Format) => ({
  solo: "1 persona",
  duo: "2 personas",
}[format])
