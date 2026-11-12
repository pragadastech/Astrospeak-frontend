import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, inr, spokenDate, to24, usd } from '../api'
import BirthFields, { birthPayload, emptyBirth } from './BirthFields'
import PlanGrid from './PlanGrid'

function intentFromHash() {
  const hash = window.location.hash
  if (hash === '#future') return 'future'
  if (hash === '#start' || hash === '#chart') return 'chart'
  return null
}

export default function Start() {
  const nav = useNavigate()
  const [intent, setIntent] = useState(intentFromHash() || 'chart')
  const [step, setStep] = useState('form')
  const [form, setForm] = useState({ fullName: '', phone: '', email: '' })
  const [birth, setBirth] = useState(emptyBirth)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [plans, setPlans] = useState([])
  const [plan, setPlan] = useState(null)
  const [region, setRegion] = useState('IN')
  const [when, setWhen] = useState({ date: '', hour: '10', minute: '00', ap: 'AM' })
  const [quote, setQuote] = useState(null)
  const [done, setDone] = useState(null)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const onHash = () => {
      const next = intentFromHash()
      if (!next) return
      setIntent(next)
      setStep('form')
      setDone(null)
      document.getElementById('start')?.scrollIntoView({ behavior: 'smooth' })
    }
    window.addEventListener('hashchange', onHash)
    if (intentFromHash()) document.getElementById('start')?.scrollIntoView()
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => { api('/api/questions').then(setQuestions).catch(() => {}) }, [])

  useEffect(() => {
    if (!plan) return
    const currency = region === 'US' ? 'USD' : 'INR'
    const billing = currency === 'USD' ? 'Outside India' : 'Telangana'
    api(`/api/plans/${plan.code}/quote?billingState=${encodeURIComponent(billing)}&currency=${currency}`).then(setQuote).catch((e) => setErr(e.message))
  }, [plan, region])

  function choose(next) {
    setIntent(next)
    setStep('form')
    setDone(null)
    setErr('')
    window.history.replaceState(null, '', next === 'future' ? '#future' : '#start')
  }

  async function createAccount(e) {
    e.preventDefault()
    setErr('')
    if (!birth.lat || birth.tz === '') { setErr('Pick the birth place from the suggestions so the time zone is set.'); return }
    setBusy(true)
    try {
      const created = await api('/api/auth/start', { method: 'POST', body: { ...form, birth: birthPayload(birth) } })
      if (intent === 'chart') {
        setDone(created)
        setStep('done')
      } else {
        setDone(created)
        const list = await api('/api/plans')
        setPlans(list.plans || [])
        setStep(questions.length ? 'questions' : 'book')
      }
    } catch (ex) { setErr(ex.message) }
    finally { setBusy(false) }
  }

  function answersReady(e) {
    e.preventDefault()
    setErr('')
    setStep('book')
  }

  async function book(e) {
    e.preventDefault()
    setErr('')
    if (!plan) { setErr('Choose a consultation plan.'); return }
    setBusy(true)
    try {
      await api('/api/my/consultations', { method: 'POST', body: {
        planCode: plan.code,
        preferredDate: when.date,
        preferredTime: to24(when.hour, when.minute, when.ap),
        currency: region === 'US' ? 'USD' : 'INR',
        billingState: region === 'US' ? 'Outside India' : 'Telangana',
        topic: 'Future reading',
        answers: questions.map((q) => ({ question: q.prompt, answer: (answers[q.id] || '').trim() })),
      } })
      setStep('done')
    } catch (ex) { setErr(ex.message) }
    finally { setBusy(false) }
  }

  return (
    <section id="start">
      <div className="wrap">
        <div className="section-head">
          <span className="tag">Begin</span>
          <h2>Check your scientific chart</h2>
          <div className="divider" />
          <p>Enter your name, phone, email and birth details here. The account is created for you, and the sign-in details are emailed.</p>
        </div>
        {step === 'form' && (
          <form className="form-card" onSubmit={createAccount}>
            <div className="choice" role="group" aria-label="What you want">
              <button type="button" className={intent === 'chart' ? 'on' : ''} onClick={() => choose('chart')}>Check your chart</button>
              <button type="button" className={intent === 'future' ? 'on' : ''} onClick={() => choose('future')}>Ask about your future</button>
            </div>
            <div className="grid-2">
              <label>Full name<input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required /></label>
              <label>Phone number<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" required /></label>
              <label className="span-2">Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label>
            </div>
            <BirthFields value={birth} onChange={setBirth} />
            {err && <p className="err">{err}</p>}
            <button className="btn" type="submit" disabled={busy}>{busy ? 'Creating your account…' : intent === 'future' ? 'Continue' : 'See my chart'}</button>
          </form>
        )}
        {step === 'questions' && (
          <form className="form-card" onSubmit={answersReady}>
            <h3>A few questions before the session</h3>
            <p className="muted">The astrologer set these questions. Your answers go with the booking.</p>
            {questions.map((q) => (
              <label key={q.id}>{q.prompt}
                <textarea required rows={3} value={answers[q.id] || ''} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} />
              </label>
            ))}
            {err && <p className="err">{err}</p>}
            <button className="btn" type="submit">Continue to booking</button>
          </form>
        )}
        {step === 'book' && (
          <div>
            <div className="section-head"><h3>Book a slot with the astrologer</h3><p>Choose a plan, then a date and time for the live session.</p></div>
            <PlanGrid plans={plans} onPick={setPlan} region={region} onRegion={setRegion} />
            {plan && (
              <form className="form-card" onSubmit={book} style={{ marginTop: 18 }}>
                <h3>{plan.name}</h3>
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
                </div>
                {quote && <p className="info">{quote.note} Total {quote.currency === 'USD' ? usd(quote.total) : inr(quote.total)}.</p>}
                {err && <p className="err">{err}</p>}
                <button className="btn" type="submit" disabled={busy}>{busy ? 'Sending the request…' : 'Request this session'}</button>
              </form>
            )}
          </div>
        )}
        {step === 'done' && intent === 'chart' && done && (
          <div className="card">
            <h3>Your account is created</h3>
            <p>We sent an email to <b>{done.email}</b> with your sign-in details.</p>
            {done.password && <p className="info">The mailbox is not connected yet, so keep this password: <strong>{done.password}</strong></p>}
            <button className="btn" type="button" onClick={() => nav('/app?tab=chart')}>Open your scientific chart</button>
          </div>
        )}
        {step === 'done' && intent === 'future' && (
          <div className="card">
            <h3>Your session is requested</h3>
            <p>Your answers are with the astrologer. The meeting link arrives after the session is confirmed.</p>
            {done?.password && <p className="info">The mailbox is not connected yet, so keep this password: <strong>{done.password}</strong></p>}
            <Link className="btn" to="/app">Open your account</Link>
          </div>
        )}
      </div>
    </section>
  )
}
