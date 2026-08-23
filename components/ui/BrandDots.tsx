// 4 puces de marque, une par couleur du logo cadeau — même composant que sur
// le site vitrine (src/components/ui/BrandDots.tsx), utilisé comme accent
// discret juste au-dessus d'un titre.
export default function BrandDots({ style }: { style?: React.CSSProperties }) {
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 10, ...style }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF8406" }} />
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#CB2033" }} />
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#8DB92F" }} />
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#0294D2" }} />
    </div>
  )
}
