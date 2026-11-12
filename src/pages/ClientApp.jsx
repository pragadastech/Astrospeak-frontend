import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { api, clearTab, inr, moneyMinor, spokenDate, to24, usd } from '../api'
import BirthFields, { birthPayload, emptyBirth } from '../components/BirthFields'
import PlanGrid from '../components/PlanGrid'
import ChartSheet from '../components/ChartSheet'

const TABS = [['home', 'Dashboard'], ['chat', 'Ask'], ['reports', 'My Reports'], ['profiles', 'Family'], ['chart', 'Scientific Chart'], ['consult', 'Live session'], ['account', 'My Profile']]

export default function ClientApp() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const [user, setUser] = useState(null)
  const [dash, setDash] = useState(null)
  const [tab, setTab] = useState(params.get('tab') || 'home')
  const [profileId, setProfileId] = useState('')
  const [err, setErr] = useState('')

  async function load() {
    const me = await api('/api/auth/me')
    if (me.role !== 'CLIENT') { nav('/admin'); return }
    setUser(me)
    const d = await api('/api/my/dashboard')
    setDash(d)
    if (!profileId && d.profiles[0]) setProfileId(d.profiles[0].id)
  }
  useEffect(() => { load().catch(() => nav('/login')) }, [])

  if (!dash) return <p className="wrap">Loading your account…</p>
  const profiles = dash.profiles || []

  return (
    <div className="wrap">
      <header className="row" style={{ justifyContent: 'space-between', paddingTop: 18 }}>
        <Link className="brand" to="/"><span className="logo">☀</span> Astrology Talk</Link>
        <span className="muted">{user.fullName} · {user.accountType === 'FAMILY' ? 'Family account' : 'Individual account'}</span>
      </header>
      <div className="tabs">
        {TABS.map(([id, label]) => <button key={id} className={tab === id ? 'on' : ''} onClick={() => { setErr(''); setTab(id) }}>{label}</button>)}
      </div>
      {profiles.length > 1 && tab !== 'account' && tab !== 'consult' && (
        <label>Person
          <select value={profileId} onChange={(e) => setProfileId(e.target.value)}>
            {profiles.map((p) => <option key={p.id} value={p.id}>{p.fullName} · {p.relation}</option>)}
          </select>
        </label>
      )}
      {err && <p className="err">{err}</p>}
      {tab === 'home' && <Home dash={dash} />}
      {tab === 'chat' && <Chat profileId={profileId} />}
      {tab === 'reports' && <Reports dash={dash} profileId={profileId} reload={load} />}
      {tab === 'profiles' && <Profiles reload={load} />}
      {tab === 'chart' && <ChartTab profileId={profileId} profile={profiles.find((p) => p.id === profileId)} />}
      {tab === 'consult' && <Consult user={user} profiles={profiles} dash={dash} reload={load} />}
      {tab === 'account' && <Account user={user} />}
    </div>
  )
}

function Home({ dash }) {
  return (
    <section>
      <h2>Hello, {dash.user.fullName}</h2>
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <article className="card"><h3>{dash.profiles.length}</h3><p>Profiles</p></article>
        <article className="card"><h3>{dash.reports.length}</h3><p>Reports</p></article>
        <article className="card"><h3>{dash.consultations.length}</h3><p>Sessions</p></article>
      </div>
    </section>
  )
}

function Chat({ profileId }) {
  const [state, setState] = useState(null)
  const [text, setText] = useState('')
  useEffect(() => { if (profileId) api('/api/my/chat?profileId=' + profileId).then(setState).catch(() => {}) }, [profileId])
  async function send(e) {
    e.preventDefault()
    const message = text
    setText('')
    setState(await api('/api/my/chat', { method: 'POST', body: { profileId, message } }))
  }
  if (!state) return <p>Opening the conversation…</p>
  return (
    <div className="chat">
      {state.messages.map((m) => <div key={m.id} className={m.role === 'user' ? 'bubble mine' : 'bubble'}>{m.text}</div>)}
      <form className="chat-form" onSubmit={send}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Why are you consulting?" />
        <button className="btn" type="submit">Send</button>
      </form>
    </div>
  )
}

function Reports({ dash, profileId, reload }) {
  const [topic, setTopic] = useState('')
  const [msg, setMsg] = useState('')
  async function ask(e) {
    e.preventDefault()
    await api('/api/my/reports', { method: 'POST', body: { profileId, topic } })
    setTopic('')
    setMsg('Requested. It will show here when the team uploads it.')
    reload()
  }
  return (
    <section>
      <h2>My Reports</h2>
      <p className="muted">Reports prepared for you can be downloaded from this page.</p>
      {msg && <p className="ok">{msg}</p>}
      <form onSubmit={ask} className="row">
        <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="What should the report cover?" required />
        <button className="btn sm" type="submit">Request report</button>
      </form>
      <table>
        <thead><tr><th>Report</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {dash.reports.map((r) => (
            <tr key={r.id}><td>{r.title}</td><td>{r.status}</td><td>{r.status === 'ready' && <a href={'/api/my/reports/' + r.id + '/file'}>Download</a>}</td></tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

function Profiles({ reload }) {
  const [birth, setBirth] = useState(emptyBirth)
  const [meta, setMeta] = useState({ fullName: '', relation: 'Spouse', gender: '' })
  const [msg, setMsg] = useState('')
  async function add(e) {
    e.preventDefault()
    setMsg('')
    await api('/api/my/profiles', { method: 'POST', body: { ...meta, ...birthPayload(birth) } })
    setMsg('Profile added.')
    setBirth(emptyBirth)
    reload()
  }
  return (
    <section>
      <h2>Family profiles</h2>
      <form onSubmit={add}>
        {msg && <p className="ok">{msg}</p>}
        <div className="grid-2">
          <label>Name<input value={meta.fullName} onChange={(e) => setMeta({ ...meta, fullName: e.target.value })} required /></label>
          <label>Relation
            <select value={meta.relation} onChange={(e) => setMeta({ ...meta, relation: e.target.value })}>
              {['Spouse', 'Son', 'Daughter', 'Mother', 'Father', 'Brother', 'Sister', 'Friend', 'Other'].map((r) => <option key={r}>{r}</option>)}
            </select>
          </label>
        </div>
        <BirthFields label="Their birth details" value={birth} onChange={setBirth} />
        <button className="btn" type="submit">Add profile</button>
      </form>
    </section>
  )
}

function ChartTab({ profileId, profile }) {
  const [chart, setChart] = useState(null)
  const [err, setErr] = useState('')
  useEffect(() => {
    if (!profileId) return
    setChart(null)
    api('/api/my/chart?profileId=' + profileId).then(setChart).catch((e) => setErr(e.message))
  }, [profileId])
  if (err) return <p className="err">{err}</p>
  if (!chart) return <p>Calculating the chart…</p>
  return <ChartSheet chart={chart} profile={profile} />
}

function Consult({ user, profiles, dash, reload }) {
  const [plans, setPlans] = useState([])
  const [plan, setPlan] = useState(null)
  const [when, setWhen] = useState({ date: '', hour: '10', minute: '00', ap: 'AM' })
  const [topic, setTopic] = useState('')
  const [ids, setIds] = useState([])
  const [currency, setCurrency] = useState('INR')
  const [state, setState] = useState(user.billingState || 'Telangana')
  const [states, setStates] = useState([])
  const [quote, setQuote] = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  useEffect(() => { api('/api/plans').then((d) => setPlans(d.plans || [])); api('/api/config').then((c) => setStates(c.states || [])); api('/api/questions').then(setQuestions).catch(() => {}) }, [])
  useEffect(() => {
    if (!plan) return
    const billing = currency === 'USD' ? 'Outside India' : state
    api(`/api/plans/${plan.code}/quote?billingState=${encodeURIComponent(billing)}&currency=${currency}`).then(setQuote).catch((e) => setErr(e.message))
  }, [plan, currency, state])

  function toggle(id) { setIds((list) => list.includes(id) ? list.filter((x) => x !== id) : [...list, id]) }

  async function book(e) {
    e.preventDefault()
    setErr(''); setMsg('')
    try {
      await api('/api/my/consultations', { method: 'POST', body: {
        planCode: plan.code, preferredDate: when.date, preferredTime: to24(when.hour, when.minute, when.ap),
        topic, profileIds: ids, currency, billingState: currency === 'USD' ? 'Outside India' : state,
        answers: questions.map((q) => ({ question: q.prompt, answer: (answers[q.id] || '').trim() })),
      } })
      setMsg('Request received. A confirmation email and WhatsApp message are queued. No money is taken until payments are connected. The meeting link arrives after the admin confirms the session.')
      reload()
    } catch (ex) { setErr(ex.message) }
  }

  return (
    <section>
      <div className="section-head"><span className="tag">Live session</span><h2>Choose your consultation plan</h2><p>Pick a plan, then a date and time. Each plan has its own length and what is covered.</p></div>
      <PlanGrid plans={plans} onPick={setPlan} onRegion={(r) => setCurrency(r === 'US' ? 'USD' : 'INR')} />
      {plan && (
        <form onSubmit={book} style={{ marginTop: 18 }}>
          <h3>{plan.name}</h3>
          <ul>{plan.features.map((f) => <li key={f}>{f}</li>)}</ul>
          {plan.family && (
            <fieldset>
              <legend>Members in this session (up to 4)</legend>
              {profiles.map((p) => <label key={p.id}><input type="checkbox" checked={ids.includes(p.id)} onChange={() => toggle(p.id)} /> {p.fullName} · {p.relation}</label>)}
            </fieldset>
          )}
          <div className="grid-2">
            <label>Preferred date
              <input type="date" required min={new Date().toISOString().slice(0, 10)} value={when.date} onChange={(e) => setWhen({ ...when, date: e.target.value })} />
              <small>{spokenDate(when.date)}</small>
            </label>
            <label>Preferred time
              <span className="time-row">
                <select value={when.hour} onChange={(e) => setWhen({ ...when, hour: e.target.value })}>{Array.from({ length: 12 }, (_, i) => <option key={i + 1}>{i + 1}</option>)}</select>
                <select value={when.minute} onChange={(e) => setWhen({ ...when, minute: e.target.value })}>{['00', '15', '30', '45'].map((m) => <option key={m}>{m}</option>)}</select>
                <select value={when.ap} onChange={(e) => setWhen({ ...when, ap: e.target.value })}><option>AM</option><option>PM</option></select>
              </span>
            </label>
            {currency === 'INR' && (
              <label>Billing state
                <select value={state} onChange={(e) => setState(e.target.value)}>{states.filter((s) => s !== 'Outside India').map((s) => <option key={s}>{s}</option>)}</select>
              </label>
            )}
            <label className="span-2">What do you want to cover?<input value={topic} onChange={(e) => setTopic(e.target.value)} /></label>
          </div>
          {questions.length > 0 && (
            <>
              <h3>Questions from the astrologer</h3>
              {questions.map((q) => (
                <label key={q.id}>{q.prompt}
                  <textarea required rows={3} value={answers[q.id] || ''} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} />
                </label>
              ))}
            </>
          )}
          {quote && <p className="info">{quote.note} Total {quote.currency === 'USD' ? usd(quote.total) : inr(quote.total)}.</p>}
          {err && <p className="err">{err}</p>}
          {msg && <p className="ok">{msg}</p>}
          <button className="btn" type="submit">Request this session</button>
        </form>
      )}
      <h3>Your requests</h3>
      <table>
        <thead><tr><th>Plan</th><th>When</th><th>Status</th><th>Total</th><th>Link</th></tr></thead>
        <tbody>{dash.consultations.map((c) => <tr key={c.id}><td>{c.planName}</td><td>{spokenDate(c.preferredDate)} {c.preferredTime}</td><td>{c.status}</td><td>{moneyMinor(c.currency, c.totalMinor)}</td><td>{c.meetingLink || '—'}</td></tr>)}</tbody>
      </table>
    </section>
  )
}

function Account({ user }) {
  const nav = useNavigate()
  const [cur, setCur] = useState('')
  const [next, setNext] = useState('')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  async function save(e) {
    e.preventDefault()
    setErr(''); setMsg('')
    try {
      await api('/api/auth/password', { method: 'POST', body: { current: cur, next } })
      setMsg('Password changed.')
      setCur(''); setNext('')
    } catch (ex) { setErr(ex.message) }
  }
  async function logout() {
    try { await api('/api/auth/logout', { method: 'POST' }) } catch { clearTab() }
    nav('/')
  }
  return (
    <section>
      <h2>My Profile</h2>
      <p>{user.email}</p>
      <form onSubmit={save}>
        {err && <p className="err">{err}</p>}
        {msg && <p className="ok">{msg}</p>}
        <label>Current password<input type="password" value={cur} onChange={(e) => setCur(e.target.value)} required /></label>
        <label>New password<input type="password" minLength={8} value={next} onChange={(e) => setNext(e.target.value)} required /></label>
        <div className="row"><button className="btn" type="submit">Change password</button><button className="btn ghost" type="button" onClick={logout}>Log out</button></div>
      </form>
    </section>
  )
}
