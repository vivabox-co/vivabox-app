// 4 puces de marque, une par couleur du logo cadeau — même composant que sur
// le site vitrine (src/components/ui/BrandDots.tsx), utilisé comme accent
// discret juste au-dessus d'un titre.
const DOT_STYLE: React.CSSProperties = {
  width: 9,
  height: 9,
  borderRadius: "50%",
  boxShadow: "0 1px 2px rgba(0,0,0,0.12)",
}

export default function BrandDots({ style }: { style?: React.CSSProperties }) {
  return (
    <div style={{ display: "flex", gap: 7, marginBottom: 10, ...style }}>
      <span style={{ ...DOT_STYLE, background: "#FF8406" }} />
      <span style={{ ...DOT_STYLE, background: "#CB2033" }} />
      <span style={{ ...DOT_STYLE, background: "#8DB92F" }} />
      <span style={{ ...DOT_STYLE, background: "#0294D2" }} />
    </div>
  )
}
