import { spokenDate } from '../api'

const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
const SHORT = ['Ar', 'Ta', 'Ge', 'Cn', 'Le', 'Vi', 'Li', 'Sc', 'Sg', 'Cp', 'Aq', 'Pi']

/** North Indian diamond. House 1 is the top kite; houses continue clockwise. */
const DIAMOND = {
  1: [[200, 16], [292, 108], [200, 200], [108, 108]],
  2: [[200, 16], [384, 16], [292, 108]],
  3: [[292, 108], [384, 16], [384, 200]],
  4: [[292, 108], [384, 200], [292, 292], [200, 200]],
  5: [[384, 200], [384, 384], [292, 292]],
  6: [[292, 292], [384, 384], [200, 384]],
  7: [[200, 200], [292, 292], [200, 384], [108, 292]],
  8: [[108, 292], [200, 384], [16, 384]],
  9: [[16, 200], [108, 292], [16, 384]],
  10: [[108, 108], [200, 200], [108, 292], [16, 200]],
  11: [[16, 16], [108, 108], [16, 200]],
  12: [[16, 16], [200, 16], [108, 108]],
}

function mid(pts) {
  return [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length]
}

function span(a, b) {
  return ((b - a) % 360 + 360) % 360
}

function polar(lon, asc, radius) {
  const d = span(asc, lon)
  const a = -Math.PI / 2 - (d * Math.PI) / 180
  return [200 + radius * Math.cos(a), 200 + radius * Math.sin(a)]
}

function list(values) {
  return values && values.length ? values.join(', ') : '—'
}

function Wheel({ chart }) {
  const asc = chart.cusps[0].longitude
  const rings = [196, 168, 78]
  const cusps = chart.cusps.map((c, i) => {
    const next = chart.cusps[(i + 1) % 12].longitude
    const [x1, y1] = polar(c.longitude, asc, 78)
    const [x2, y2] = polar(c.longitude, asc, 168)
    const [nx, ny] = polar(c.longitude + span(c.longitude, next) / 2, asc, 90)
    return { i, x1, y1, x2, y2, nx, ny }
  })
  const placed = [...chart.planets].sort((a, b) => span(asc, a.longitude) - span(asc, b.longitude))
  let last = -40
  let slot = 0
  const planets = placed.map((p) => {
    const ang = span(asc, p.longitude)
    if (ang - last < 16) slot += 1
    else slot = 0
    last = ang
    const [x, y] = polar(p.longitude, asc, 126 + (slot % 3) * 16)
    return { ...p, x, y }
  })
  return (
    <svg className="astro-wheel" viewBox="0 0 400 400" role="img" aria-label="Circular chart">
      {rings.map((r) => <circle key={r} cx="200" cy="200" r={r} fill={r === 196 ? '#fffdf8' : 'none'} stroke="#e7c9a4" />)}
      {cusps.map((c) => (
        <g key={c.i}>
          <line x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2} stroke={c.i === 0 ? '#c2410c' : '#f0b27a'} strokeWidth={c.i === 0 ? 2.4 : 1} />
          <text x={c.nx} y={c.ny} textAnchor="middle" dominantBaseline="middle" className="house-no">{c.i + 1}</text>
        </g>
      ))}
      {SIGNS.map((name, i) => {
        const [x, y] = polar(i * 30 + 15, asc, 182)
        return <text key={name} x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="sign-lab">{SHORT[i]}</text>
      })}
      {planets.map((p) => (
        <text key={p.name} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" className="planet-lab">
          {p.abbr}{p.retrograde ? 'ᴿ' : ''}
        </text>
      ))}
      <circle cx="200" cy="200" r="28" fill="#fff7ed" stroke="#ea580c" />
      <text x="200" y="196" textAnchor="middle" className="core-lab">As</text>
      <text x="200" y="212" textAnchor="middle" className="core-sub">{SHORT[chart.ascendant.signIdx]}</text>
    </svg>
  )
}

function Diamond({ chart }) {
  const byHouse = Array.from({ length: 12 }, () => [])
  chart.planets.forEach((p) => { if (p.house) byHouse[p.house - 1].push(p.abbr + (p.retrograde ? 'ᴿ' : '')) })
  return (
    <svg className="astro-diamond" viewBox="0 0 400 400" role="img" aria-label="Diamond chart">
      {Object.entries(DIAMOND).map(([house, pts]) => {
        const h = Number(house)
        const sign = (chart.ascendant.signIdx + h - 1) % 12
        const [x, y] = mid(pts)
        return (
          <g key={house}>
            <polygon points={pts.map((p) => p.join(',')).join(' ')} className={h === 1 ? 'lagna' : ''} />
            <text x={x} y={y - 8} textAnchor="middle" className="sign-lab">{SHORT[sign]} {h}</text>
            <text x={x} y={y + 10} textAnchor="middle" className="planet-lab">{byHouse[h - 1].join(' ')}</text>
          </g>
        )
      })}
    </svg>
  )
}

function SheetTable({ heads, rows }) {
  return (
    <div className="tbl-wrap">
      <table>
        <thead><tr>{heads.map((h) => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className={row.on ? 'running' : ''}>{row.cells.map((c, i) => <td key={heads[i]}>{c}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function PeriodTable({ rows, current }) {
  return (
    <SheetTable
      heads={['Lord', 'From', 'To']}
      rows={(rows || []).map((r) => ({
        key: r.lord + r.start,
        on: r.lord === current,
        cells: [r.lord, spokenDate(r.start), spokenDate(r.end)],
      }))}
    />
  )
}

export default function ChartSheet({ chart, profile }) {
  const rp = chart.rulingPlanets || {}
  const current = chart.currentDasha || {}
  const md = (chart.dasha.periods || []).find((p) => p.lord === current.mahadasha)
  const ad = md && (md.antardashas || []).find((p) => p.lord === current.antardasha)
  return (
    <div className="sheet">
      <div className="section-head">
        <h2>Scientific Chart{profile ? ` — ${profile.fullName}` : ''}</h2>
        <div className="divider" />
        {profile && <p>{spokenDate(profile.dob)} · {profile.tob} · {profile.city}</p>}
        <p>{chart.ascendant.sign} rising {chart.ascendant.dms} · Moon in {chart.moonSign}, {chart.nakshatra} · Sun in {chart.sunSign}</p>
      </div>

      <div className="chart-pair">
        <figure>
          <Wheel chart={chart} />
          <figcaption>Circular chart · ascendant at the top</figcaption>
        </figure>
        <figure>
          <Diamond chart={chart} />
          <figcaption>Diamond chart · house 1 is the ascendant</figcaption>
        </figure>
      </div>

      <section>
        <h3>Ruling planets</h3>
        <p className="center muted">Day lord {rp.dayLord}</p>
        <div className="rp-grid">
          <div className="rp-card">
            <h4>Ascendant</h4>
            <p>Sign lord <b>{rp.ascSignLord}</b></p>
            <p>Star lord <b>{rp.ascStarLord}</b></p>
            <p>Sub lord <b>{rp.ascSubLord}</b></p>
          </div>
          <div className="rp-card">
            <h4>Moon</h4>
            <p>Sign lord <b>{rp.moonSignLord}</b></p>
            <p>Star lord <b>{rp.moonStarLord}</b></p>
            <p>Sub lord <b>{rp.moonSubLord}</b></p>
          </div>
        </div>
      </section>

      <section>
        <h3>Vimshottari dasha</h3>
        <p className="center"><span className="tag">Running {current.label}</span></p>
        <h4>Mahadasha</h4>
        <PeriodTable rows={chart.dasha.periods} current={current.mahadasha} />
        {md && <><h4>Antardasha inside {md.lord}</h4><PeriodTable rows={md.antardashas} current={current.antardasha} /></>}
        {ad && <><h4>Pratyantar inside {ad.lord}</h4><PeriodTable rows={ad.pratyantars} current={current.pratyantar} /></>}
      </section>

      <section>
        <h3>Planets</h3>
        <SheetTable
          heads={['Planet', 'Sign', 'Degree', 'Star', 'Pada', 'Sign lord', 'Star lord', 'Sub lord', 'Sub sub lord']}
          rows={chart.planets.map((p) => ({
            key: p.name,
            cells: [`${p.name}${p.retrograde ? ' (R)' : ''}`, p.sign, p.dms, p.nakshatra, p.pada, p.signLord, p.starLord, p.subLord, p.subSubLord],
          }))}
        />
      </section>

      <section>
        <h3>Houses</h3>
        <SheetTable
          heads={['Cusp', 'Sign', 'Degree', 'Star', 'Pada', 'Sign lord', 'Star lord', 'Sub lord', 'Sub sub lord']}
          rows={chart.cusps.map((c) => ({
            key: c.house,
            cells: [c.house, c.sign, c.dms, c.nakshatra, c.pada, c.signLord, c.starLord, c.subLord, c.subSubLord],
          }))}
        />
      </section>

      <section>
        <h3>Significators of planets</h3>
        <p className="center muted">A is the house the star lord occupies. B is the house the planet occupies. C is the houses the star lord owns. D is the houses the planet owns.</p>
        <SheetTable
          heads={['Planet', 'A', 'B', 'C', 'D']}
          rows={chart.significators.map((s) => ({
            key: s.planet,
            cells: [s.planet, list(s.A), list(s.B), list(s.C), list(s.D)],
          }))}
        />
      </section>

      <section>
        <h3>Significators of houses</h3>
        <SheetTable
          heads={['House', 'A', 'B', 'C', 'D']}
          rows={chart.houseSignificators.map((h) => ({
            key: h.house,
            cells: [h.house, list(h.A), list(h.B), list(h.C), list(h.D)],
          }))}
        />
      </section>
    </div>
  )
}
