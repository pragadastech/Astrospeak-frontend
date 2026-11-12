import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, clearTab, moneyMinor, spokenDate } from '../api'

export default function AdminApp() {
  const nav = useNavigate()
  const [me, setMe] = useState(null)
  const [tab, setTab] = useState('overview')
  useEffect(() => { api('/api/auth/me').then((u) => { if (u.role === 'CLIENT') nav('/app'); else setMe(u) }).catch(() => nav('/login')) }, [])
  if (!me) return <p className="wrap">Loading the admin portal…</p>
  const tabs = [['overview', 'Overview'], ['customers', 'Customers'], ['employees', 'Employees'], ['consults', 'Consultations'], ['questions', 'Questions'], ['plans', 'Plans'], ['reports', 'Reports'], ['notes', 'Notifications'], ['settings', 'Settings']]
  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <Link className="brand" to="/"><span className="logo"><span>☀</span></span> Astrology Talk</Link>
        <p className="side-who">{me.fullName}<br /><small>{me.role}</small></p>
        <nav>
          {tabs.map(([id, label]) => <button key={id} type="button" className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>{label}</button>)}
        </nav>
        <button className="side-out" type="button" onClick={async () => { try { await api('/api/auth/logout', { method: 'POST' }) } catch { clearTab() } nav('/') }}>Log out</button>
      </aside>
      <main className="admin-main">
        {tab === 'overview' && <Overview />}
        {tab === 'customers' && <Customers />}
        {tab === 'employees' && me.role === 'ADMIN' && <Employees />}
        {tab === 'employees' && me.role !== 'ADMIN' && <p>Only the administrator can add employees.</p>}
        {tab === 'consults' && <Consults />}
        {tab === 'questions' && me.role === 'ADMIN' && <Questions />}
        {tab === 'questions' && me.role !== 'ADMIN' && <p>Only the administrator can change the questions.</p>}
      {tab === 'plans' && me.role === 'ADMIN' && <Plans />}
      {tab === 'plans' && me.role !== 'ADMIN' && <p>Only the administrator can add plans.</p>}
        {tab === 'reports' && <Reports me={me} />}
        {tab === 'notes' && <Notes />}
        {tab === 'settings' && me.role === 'ADMIN' && <Settings />}
        {tab === 'settings' && me.role !== 'ADMIN' && <p>Only the administrator can change prices and the business state.</p>}
      </main>
    </div>
  )
}

function Overview() {
  const [stats, setStats] = useState(null)
  useEffect(() => { api('/api/admin/stats').then(setStats) }, [])
  if (!stats) return null
  return <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))' }}>{Object.entries(stats).map(([k, v]) => <article className="card" key={k}><h3>{v}</h3><p>{k}</p></article>)}</div>
}

function Customers() {
  const [rows, setRows] = useState([])
  const [open, setOpen] = useState(null)
  useEffect(() => { api('/api/admin/customers').then(setRows) }, [])
  return (
    <section>
      <table>
        <thead><tr><th>Name</th><th>Email</th><th>Account</th><th>State</th><th></th></tr></thead>
        <tbody>{rows.map((u) => <tr key={u.id}><td>{u.fullName}</td><td>{u.email}</td><td>{u.accountType}</td><td>{u.billingState}</td><td><button className="btn sm" onClick={() => api('/api/admin/customers/' + u.id).then(setOpen)}>Open</button></td></tr>)}</tbody>
      </table>
      {open && (
        <div className="card" style={{ marginTop: 12 }}>
          <h3>{open.user.fullName}</h3>
          <ul>{open.profiles.map((p) => <li key={p.id}>{p.relation}: {p.fullName} · {spokenDate(p.dob)} · {p.city}</li>)}</ul>
          <p>{open.reports.length} report(s)</p>
        </div>
      )}
    </section>
  )
}

function Employees() {
  const [rows, setRows] = useState([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [made, setMade] = useState(null)
  const [err, setErr] = useState('')
  function load() { api('/api/admin/employees').then(setRows) }
  useEffect(load, [])
  async function add(e) {
    e.preventDefault()
    setErr('')
    try {
      setMade(await api('/api/admin/employees', { method: 'POST', body: { fullName: name, email } }))
      setName(''); setEmail(''); load()
    } catch (ex) { setErr(ex.message) }
  }
  return (
    <section>
      <p className="info">The temporary password is shown once on this screen. It is not sent by email.</p>
      {made && <p className="ok">Employee {made.email}. Temporary password: <strong>{made.temporaryPassword}</strong></p>}
      {err && <p className="err">{err}</p>}
      <form onSubmit={add} className="row">
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <button className="btn sm" type="submit">Add employee</button>
      </form>
      <table><thead><tr><th>Name</th><th>Email</th></tr></thead><tbody>{rows.map((u) => <tr key={u.id}><td>{u.fullName}</td><td>{u.email}</td></tr>)}</tbody></table>
    </section>
  )
}

function Consults() {
  const [rows, setRows] = useState([])
  function load() { api('/api/admin/consultations').then(setRows) }
  useEffect(load, [])
  async function save(c, patch) {
    await api('/api/admin/consultations/' + c.id, { method: 'PATCH', body: patch })
    load()
  }
  const readings = rows.filter((c) => c.intake)
  const other = rows.filter((c) => !c.intake)
  return (
    <section>
      <h2>Future readings</h2>
      <p className="muted">These people answered the questions and booked a slot. Email or call them, then send the Google Meet link to connect the session.</p>
      {readings.length === 0 && <p>No future-reading bookings yet.</p>}
      <div className="connect-list">
        {readings.map((c) => (
          <article className="card connect-card" key={c.id}>
            <header>
              <h3>{c.customerName || 'Customer'}</h3>
              <span className="tag">{c.status}</span>
            </header>
            <p>
              <a href={'mailto:' + c.customerEmail}>{c.customerEmail}</a>
              {c.customerPhone && <> · <a href={'tel:' + c.customerPhone}>{c.customerPhone}</a></>}
            </p>
            <p><b>{c.planName}</b> · {spokenDate(c.preferredDate)} {c.preferredTime} · {moneyMinor(c.currency, c.totalMinor)}</p>
            <pre className="intake">{c.intake}</pre>
            <form className="row" onSubmit={(e) => { e.preventDefault(); save(c, { meetingLink: new FormData(e.target).get('link'), status: 'confirmed' }) }}>
              <input name="link" defaultValue={c.meetingLink || ''} placeholder="https://meet.google.com/…" required />
              <button className="btn sm" type="submit">Send link and connect</button>
            </form>
          </article>
        ))}
      </div>
      {other.length > 0 && (
        <>
          <h3>Other sessions</h3>
          <table>
            <thead><tr><th>Customer</th><th>Plan</th><th>When</th><th>Total</th><th>Status</th><th>Google Meet link</th></tr></thead>
            <tbody>
              {other.map((c) => (
                <tr key={c.id}>
                  <td>{c.customerName}<br /><small>{c.customerEmail}</small></td>
                  <td>{c.planName}<br /><small>{c.durationMin} min</small></td>
                  <td>{spokenDate(c.preferredDate)} {c.preferredTime}</td>
                  <td>{moneyMinor(c.currency, c.totalMinor)}</td>
                  <td>
                    <select defaultValue={c.status} onChange={(e) => save(c, { status: e.target.value })}>
                      {['requested', 'confirmed', 'completed', 'cancelled'].map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td>
                    <form className="row" onSubmit={(e) => { e.preventDefault(); save(c, { meetingLink: new FormData(e.target).get('link'), status: 'confirmed' }) }}>
                      <input name="link" defaultValue={c.meetingLink || ''} placeholder="https://meet.google.com/…" />
                      <button className="btn sm" type="submit">Save</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </section>
  )
}

function Questions() {
  const [rows, setRows] = useState([])
  const [prompt, setPrompt] = useState('')
  const [err, setErr] = useState('')
  function load() { api('/api/admin/questions').then(setRows) }
  useEffect(load, [])
  async function add(e) {
    e.preventDefault()
    setErr('')
    try { await api('/api/admin/questions', { method: 'POST', body: { prompt } }); setPrompt(''); load() }
    catch (ex) { setErr(ex.message) }
  }
  async function remove(id) { await api('/api/admin/questions/' + id, { method: 'DELETE' }); load() }
  return (
    <section>
      <p>These questions are shown to someone who wants to know about their future, before they book a session.</p>
      <form onSubmit={add} className="row">
        <label style={{ flex: 1 }}>New question<input value={prompt} onChange={(e) => setPrompt(e.target.value)} required /></label>
        <button className="btn" type="submit">Add</button>
      </form>
      {err && <p className="err">{err}</p>}
      <ol>{rows.map((q) => <li key={q.id}>{q.prompt} <button className="btn ghost sm" type="button" onClick={() => remove(q.id)}>Remove</button></li>)}</ol>
    </section>
  )
}

function Reports() {
  const [customers, setCustomers] = useState([])
  const [reports, setReports] = useState([])
  const [msg, setMsg] = useState('')
  function load() { api('/api/admin/reports').then(setReports); api('/api/admin/customers').then(setCustomers) }
  useEffect(load, [])
  async function upload(e) {
    e.preventDefault()
    const data = new FormData(e.target)
    await api('/api/admin/reports', { method: 'POST', body: data })
    setMsg('Uploaded to the customer’s My Reports.')
    e.target.reset()
    load()
  }
  return (
    <section>
      <form onSubmit={upload}>
        {msg && <p className="ok">{msg}</p>}
        <label>Customer
          <select name="userId" required>{customers.map((c) => <option key={c.id} value={c.id}>{c.fullName} · {c.email}</option>)}</select>
        </label>
        <label>Title<input name="title" required /></label>
        <label>Fulfill an existing request (optional)<input name="reportId" placeholder="rep_…" /></label>
        <label>File<input name="file" type="file" required /></label>
        <button className="btn" type="submit">Upload to their account</button>
      </form>
      <table>
        <thead><tr><th>Title</th><th>Customer</th><th>Status</th></tr></thead>
        <tbody>{reports.map((r) => <tr key={r.id}><td>{r.title}<br /><small>{r.id}</small></td><td>{r.userId}</td><td>{r.status}</td></tr>)}</tbody>
      </table>
    </section>
  )
}

function Notes() {
  const [rows, setRows] = useState([])
  useEffect(() => { api('/api/admin/notifications').then(setRows) }, [])
  return (
    <table>
      <thead><tr><th>Channel</th><th>To</th><th>Subject</th><th>Status</th><th>Detail</th></tr></thead>
      <tbody>{rows.map((n) => <tr key={n.id}><td>{n.channel}</td><td>{n.toAddr}</td><td>{n.subject}</td><td>{n.status}</td><td>{n.error}</td></tr>)}</tbody>
    </table>
  )
}

function Plans() {
  const [data, setData] = useState(null)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  function load() { api('/api/admin/settings').then(setData) }
  useEffect(load, [])
  if (!data) return null
  async function add(e) {
    e.preventDefault()
    setErr(''); setMsg('')
    const form = new FormData(e.target)
    try {
      await api('/api/admin/plans', { method: 'POST', body: planBody(form) })
      setMsg('Plan added. It now appears on the site.')
      e.target.reset()
      load()
    } catch (ex) { setErr(ex.message) }
  }
  async function save(p, e) {
    e.preventDefault()
    setErr(''); setMsg('')
    const form = new FormData(e.target)
    try {
      await api('/api/admin/plans/' + p.code, { method: 'PUT', body: planBody(form) })
      setMsg(p.name + ' saved.')
      load()
    } catch (ex) { setErr(ex.message) }
  }
  async function hide(p) {
    await api('/api/admin/plans/' + p.code, { method: 'PUT', body: { active: !p.active } })
    setMsg(p.active ? p.name + ' is hidden from the site.' : p.name + ' is visible again.')
    load()
  }
  return (
    <section>
      <h2>Plans</h2>
      <p className="muted">Add a consultation plan here. It shows on the landing page and in booking as soon as it is saved.</p>
      {msg && <p className="ok">{msg}</p>}
      {err && <p className="err">{err}</p>}
      <form onSubmit={add} className="card">
        <h3>New plan</h3>
        <PlanFields />
        <button className="btn" type="submit">Add plan</button>
      </form>
      {data.plans.map((p) => (
        <form key={p.code} onSubmit={(e) => save(p, e)} className="card" style={{ marginTop: 14 }}>
          <h3>{p.name}{!p.active && ' · hidden'}</h3>
          <PlanFields plan={p} />
          <div className="row">
            <button className="btn sm" type="submit">Save</button>
            <button className="btn ghost sm" type="button" onClick={() => hide(p)}>{p.active ? 'Hide from the site' : 'Show on the site'}</button>
          </div>
        </form>
      ))}
    </section>
  )
}

function planBody(form) {
  return {
    name: form.get('name'),
    tagline: form.get('tagline'),
    minutes: Number(form.get('minutes')),
    priceInr: Number(form.get('inr')),
    priceUsd: Number(form.get('usd')),
    features: String(form.get('features') || ''),
    recommended: form.get('recommended') === 'on',
    family: form.get('family') === 'on',
  }
}

function PlanFields({ plan }) {
  return (
    <>
      <div className="grid-2">
        <label>Name<input name="name" required defaultValue={plan?.name || ''} /></label>
        <label>Short line<input name="tagline" defaultValue={plan?.tagline || ''} /></label>
        <label>Minutes<input name="minutes" type="number" min="15" max="480" required defaultValue={plan?.minutes || 60} /></label>
        <label>Price in rupees<input name="inr" type="number" min="0" required defaultValue={plan?.priceInr ?? ''} /></label>
        <label>Price in dollars<input name="usd" type="number" min="0" required defaultValue={plan?.priceUsd ?? ''} /></label>
      </div>
      <label>What is included, one point per line
        <textarea name="features" rows={4} defaultValue={(plan?.features || []).join('\n')} />
      </label>
      <label><input type="checkbox" name="recommended" defaultChecked={plan?.recommended} /> Show as recommended</label>
      <label><input type="checkbox" name="family" defaultChecked={plan?.family} /> Family plan, up to 4 people</label>
    </>
  )
}

function Settings() {
  const [data, setData] = useState(null)
  const [msg, setMsg] = useState('')
  useEffect(() => { api('/api/admin/settings').then(setData) }, [])
  if (!data) return null
  async function saveState(e) {
    e.preventDefault()
    const businessState = new FormData(e.target).get('businessState')
    await api('/api/admin/settings', { method: 'PUT', body: { businessState } })
    setMsg('Business state saved. GST split uses this state.')
  }
  return (
    <section>
      <p className="info">{data.smtp} WhatsApp sends are recorded as skipped until a token is added. Consultation plans are managed under Plans.</p>
      {msg && <p className="ok">{msg}</p>}
      <form onSubmit={saveState} className="row">
        <label>Business state for GST
          <select name="businessState" defaultValue={data.businessState}>{data.states.filter((s) => s !== 'Outside India').map((s) => <option key={s}>{s}</option>)}</select>
        </label>
        <button className="btn sm" type="submit">Save state</button>
      </form>
      <p className="muted">Consultation plans are added and edited under Plans.</p>
    </section>
  )
}
