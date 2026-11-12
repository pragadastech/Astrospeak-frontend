const GLYPHS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓']

function ring(radius, count, step) {
  return Array.from({ length: count }, (_, i) => {
    const a = ((i * step + (count === 12 ? 15 : 0) - 90) * Math.PI) / 180
    return { x: 200 + radius * Math.cos(a), y: 200 + radius * Math.sin(a), a }
  })
}

export default function Wheel() {
  const glyphs = ring(172, 12, 30)
  const spokes = ring(1, 12, 30).map((_, i) => {
    const b = ((i * 30 - 90) * Math.PI) / 180
    return { x1: 200 + 150 * Math.cos(b), y1: 200 + 150 * Math.sin(b), x2: 200 + 195 * Math.cos(b), y2: 200 + 195 * Math.sin(b) }
  })
  const stars = ring(170, 27, 360 / 27)
  return (
    <div className="wheel-box" aria-hidden="true">
      <svg className="wheel" viewBox="0 0 400 400">
        <defs>
          <linearGradient id="wheelGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ea580c" />
            <stop offset="1" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
        <circle cx="200" cy="200" r="195" fill="none" stroke="url(#wheelGrad)" strokeWidth="4" />
        <circle cx="200" cy="200" r="150" fill="none" stroke="#fdba74" strokeWidth="2" strokeDasharray="4 6" />
        {spokes.map((s, i) => <line key={i} {...s} stroke="#fdba74" strokeWidth="2" />)}
        {glyphs.map((g, i) => <text key={i} x={g.x} y={g.y} fontSize="26" fill="#c2410c" textAnchor="middle" dominantBaseline="middle">{GLYPHS[i]}</text>)}
      </svg>
      <svg className="wheel inner" viewBox="0 0 400 400">
        <circle cx="200" cy="200" r="195" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray="2 10" />
        {stars.map((s, i) => <text key={i} x={s.x} y={s.y} fontSize="15" fill="#9a3412" textAnchor="middle" dominantBaseline="middle">✦</text>)}
      </svg>
      <div className="wheel-core">Chart</div>
      <div className="orbit-dot" />
    </div>
  )
}

export const NAKSHATRAS = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati']
