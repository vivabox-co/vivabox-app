// Liseré 4 couleurs (mêmes teintes que le logo cadeau, voir VivaboxLoader) —
// même composant que sur le site vitrine (src/components/ui/BrandRibbon.tsx),
// utilisé comme repère de marque discret en haut d'un flux, jamais comme
// séparateur entre plusieurs sections comme sur le site (une seule page ici).
export default function BrandRibbon() {
  return (
    <div style={{ height: 3, display: "flex" }}>
      <span style={{ flex: 1, background: "#FF8406" }} />
      <span style={{ flex: 1, background: "#CB2033" }} />
      <span style={{ flex: 1, background: "#8DB92F" }} />
      <span style={{ flex: 1, background: "#0294D2" }} />
    </div>
  )
}
