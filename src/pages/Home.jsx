import { useEffect, useState } from 'react'
import { api } from '../api'
import Nav from '../components/Nav'
import PlanGrid from '../components/PlanGrid'
import Start from '../components/Start'
import Wheel, { NAKSHATRAS } from '../components/Wheel'
import { Count, Reveal, tilt, untilt, useTyped } from '../components/Motion'

const TYPED = ['second', 'sub lord', 'star lord', 'cusp', 'dasha']

export default function Home() {
  const [plans, setPlans] = useState([])
  const [user, setUser] = useState(null)
  const typed = useTyped(TYPED)
  useEffect(() => {
    api('/api/plans').then((d) => setPlans(d.plans || [])).catch(() => {})
    api('/api/auth/me').then(setUser).catch(() => {})
  }, [])
  return (
    <>
      <Nav user={user} />
      <header className="hero">
        <div className="wrap hero-grid">
          <div>
            <Reveal><span className="eyebrow"><i /> Scientific Chart · Sidereal</span></Reveal>
            <Reveal delay={120}>
              <h1>Your <span className="grad">scientific chart</span>,<br />calculated to the <span className="typed">{typed}</span></h1>
            </Reveal>
            <Reveal delay={240}><p className="lede">Sidereal positions, Placidus cusps, star lords, sub lords and the running period — then a live session on Google Meet when you are ready.</p></Reveal>
            <Reveal delay={360}>
              <div className="row">
                <a className="btn pulse" href="#start">Check your scientific chart</a>
                <a className="btn ghost" href="#future">Ask about your future</a>
              </div>
            </Reveal>
            <Reveal delay={480}>
              <div className="hero-stats">
                <div><Count to={249} /><span>Sub divisions</span></div>
                <div><Count to={12} /><span>Placidus cusps</span></div>
                <div><Count to={120} /><span>Year period cycle</span></div>
              </div>
            </Reveal>
          </div>
          <Reveal className="zoom" delay={200}><Wheel /></Reveal>
        </div>
      </header>
      <div className="marquee"><div>{[...NAKSHATRAS, ...NAKSHATRAS].map((w, i) => <span key={i}>{w}</span>)}</div></div>
      <Start />
      <section>
        <div className="wrap">
          <div className="section-head">
            <Reveal><span className="tag">How it works</span><h2>From birth details to a live session</h2><div className="divider" /></Reveal>
          </div>
          <div className="steps">
            {[
              ['1', 'Your details', 'Name, phone, email and birth details. The account is created for you, and the sign-in details arrive by email.'],
              ['2', 'Chart', 'The scientific chart is drawn with sidereal positions, cusps, significators and the running period.'],
              ['3', 'Questions', 'If you want to know about your future, you answer the questions the astrologer has set.'],
              ['4', 'Live session', 'Book a date and time. The astrologer confirms the session and sends the meeting link.'],
            ].map(([n, title, text], i) => (
              <Reveal key={n} delay={i * 120} as="article" className="card hoverable step">
                <div onPointerMove={tilt} onPointerLeave={untilt}>
                  <div className="num"><span>{n}</span></div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="soft">
        <div className="wrap">
          <div className="section-head">
            <Reveal><span className="tag">What a session covers</span><h2>Clear work, not a blank card</h2><div className="divider" /></Reveal>
          </div>
          <div className="feature-grid">
            {[
              ['Cusps and planets', 'Sign, star and sub-lord for each planet and house cusp, shown on a chart diagram as well as in tables.'],
              ['Running period', 'Mahadasha, antardasha and pratyantar, with the period that is running today marked at each level.'],
              ['Live session', 'Every consultation plan is a Google Meet session. Length and depth depend on the plan you pick.'],
              ['Family', 'A family account holds spouse and children. The Family Pack reads up to four members in one sitting.'],
            ].map(([title, text], i) => (
              <Reveal key={title} delay={(i % 3) * 100} as="article" className="card hoverable flip">
                <div onPointerMove={tilt} onPointerLeave={untilt}>
                  <div className="icon">✦</div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section id="plans">
        <div className="wrap">
          <div className="section-head">
            <Reveal>
              <span className="tag">Pricing</span>
              <h2>Choose your consultation plan</h2>
              <div className="divider" />
              <p>Choose India or the United States to see that country’s price.</p>
            </Reveal>
          </div>
          <PlanGrid plans={plans} />
        </div>
      </section>
      <footer><div className="wrap">© {new Date().getFullYear()} Astrology Talk · Guidance from the chart, not a substitute for professional advice.</div></footer>
    </>
  )
}
