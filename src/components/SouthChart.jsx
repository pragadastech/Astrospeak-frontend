const ORDER = [11, 0, 1, 2, 10, null, null, 3, 9, null, null, 4, 8, 7, 6, 5]
const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']

export default function SouthChart({ chart }) {
  let center = false
  return (
    <div className="si-chart" aria-label="Scientific chart">
      {ORDER.map((sign, i) => {
        if (sign === null) {
          if (center) return null
          center = true
          return <div className="center" key="center"><div><strong>Scientific Chart</strong><small>Sidereal · Placidus</small></div></div>
        }
        return (
          <div className={sign === chart.ascendant.signIdx ? 'cell asc' : 'cell'} key={sign}>
            <small>{SIGNS[sign]}</small>
            <div>{(chart.rasi[sign] || []).map((p) => <b key={p}>{p}</b>)}</div>
          </div>
        )
      })}
    </div>
  )
}
