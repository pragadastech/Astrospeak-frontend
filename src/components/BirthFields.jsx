import { useEffect, useState } from 'react'
import { api, spokenDate, to24 } from '../api'

const empty = { dob: '', hour: '6', minute: '30', ap: 'AM', city: '', lat: '', lon: '', tz: '', tzName: '' }

export function birthPayload(b) {
  return { dob: b.dob, tob: to24(b.hour, b.minute, b.ap), city: b.city, lat: Number(b.lat), lon: Number(b.lon), tz: Number(b.tz), tzName: b.tzName }
}

export function useBirth(initial) {
  const [birth, setBirth] = useState({ ...empty, ...initial })
  return [birth, setBirth]
}

export default function BirthFields({ value, onChange, label = 'Birth details' }) {
  const [hits, setHits] = useState([])
  const [hint, setHint] = useState('Type a village, town or city, then pick it from the list.')

  useEffect(() => {
    const q = value.city.trim()
    if (q.length < 2 || value.lat) return
    const t = setTimeout(async () => {
      try { setHits(await api('/api/places?q=' + encodeURIComponent(q))) } catch { setHits([]) }
    }, 350)
    return () => clearTimeout(t)
  }, [value.city, value.lat])

  async function pick(hit) {
    const next = { ...value, city: hit.label, lat: hit.lat, lon: hit.lon }
    onChange(next)
    setHits([])
    if (!value.dob) { setHint(hit.label + ' — enter the date of birth for the exact UTC offset.'); return }
    try {
      const tz = await api(`/api/tz?lat=${hit.lat}&lon=${hit.lon}&dob=${value.dob}&tob=${to24(value.hour, value.minute, value.ap)}`)
      onChange({ ...next, tz: tz.tz, tzName: tz.tzName })
      setHint(`${hit.label} · ${tz.label} on the birth date`)
    } catch (e) { setHint(e.message) }
  }

  function set(patch) {
    const next = { ...value, ...patch }
    if ('city' in patch) { next.lat = ''; next.lon = ''; next.tz = ''; next.tzName = '' }
    onChange(next)
  }

  return (
    <fieldset className="birth">
      <legend>{label}</legend>
      <div className="grid-2">
        <label>Date of birth
          <input type="date" min="1900-01-01" max={new Date().toISOString().slice(0, 10)} value={value.dob} required onChange={(e) => set({ dob: e.target.value, lat: '', tz: '' })} />
          <small>{value.dob ? spokenDate(value.dob) : 'Shown as day, month and year so the order is clear.'}</small>
        </label>
        <label>Time of birth
          <span className="time-row">
            <select value={value.hour} onChange={(e) => set({ hour: e.target.value })}>{Array.from({ length: 12 }, (_, i) => <option key={i + 1}>{i + 1}</option>)}</select>
            <select value={value.minute} onChange={(e) => set({ minute: e.target.value })}>{Array.from({ length: 60 }, (_, i) => <option key={i}>{String(i).padStart(2, '0')}</option>)}</select>
            <select value={value.ap} onChange={(e) => set({ ap: e.target.value })}><option>AM</option><option>PM</option></select>
          </span>
          <small>12-hour clock with AM / PM. Seconds are taken as 00.</small>
        </label>
        <label className="span-2">Birth place
          <input value={value.city} autoComplete="off" placeholder="Start typing a place…" required onChange={(e) => set({ city: e.target.value })} />
          {hits.length > 0 && (
            <div className="suggest">
              {hits.map((h) => <button type="button" key={h.label + h.lat} onClick={() => pick(h)}>{h.label}</button>)}
            </div>
          )}
          <small>{hint}</small>
        </label>
      </div>
    </fieldset>
  )
}

export { empty as emptyBirth }
