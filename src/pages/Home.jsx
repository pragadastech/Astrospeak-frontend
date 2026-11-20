import { useEffect, useState } from 'react'
import { api } from '../api'
import Nav from '../components/Nav'
import PlanGrid from '../components/PlanGrid'
import Start from '../components/Start'
import Wheel, { NAKSHATRAS } from '../components/Wheel'
import { Count, Reveal, tilt, untilt } from '../components/Motion'
import { Wordmark } from '../components/Brand'

export default function Home() {
  const [plans, setPlans] = useState([])
  const [user, setUser] = useState(null)
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
            <Reveal><span className="eyebrow"><i /> Vedic astrology</span></Reveal>
            <Reveal delay={120}>
              <h1><Wordmark /><span className="hero-idea">Vedic astrology, daily wishes & <span className="grad">expert guidance</span></span></h1>
            </Reveal>
            <Reveal delay={240}><p className="lede">Vedic astrology, daily wishes and expert guidance. Your chart is drawn from the birth details you share, then an astrologer meets you live when you want a reading.</p></Reveal>
            <Reveal delay={360}>
              <div className="row">
                <a className="btn pulse" href="#start">Get your Vedic chart</a>
                <a className="btn ghost" href="#future">Ask for guidance</a>
              </div>
            </Reveal>
            <Reveal delay={480}>
              <div className="hero-stats" id="stats">
                <div id="stat-nakshatras"><Count to={27} /><span>Nakshatras</span></div>
                <div id="stat-rashis"><Count to={12} /><span>Rashis</span></div>
                <div id="stat-grahas"><Count to={9} /><span>Grahas</span></div>
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
            <Reveal><span className="tag">How it works</span><h2>From a Vedic chart to expert guidance</h2><div className="divider" /></Reveal>
          </div>
          <div className="steps">
            {[
              ['1', 'Your details', 'Name, phone, email and birth details. The account is created for you, and the sign-in details arrive by email.'],
              ['2', 'Vedic chart', 'The chart is drawn from sidereal positions, nakshatras, cusps and the period running today.'],
              ['3', 'Daily wishes', 'Share what you want guidance on. Those wishes go with you into the reading.'],
              ['4', 'Expert guidance', 'Book a date and time. The astrologer confirms the session and sends the meeting link.'],
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
            <Reveal><span className="tag">What you receive</span><h2>Vedic astrology, daily wishes and expert guidance</h2><div className="divider" /></Reveal>
          </div>
          <div className="feature-grid">
            {[
              ['Vedic chart', 'Rashis, nakshatras and house cusps, drawn on a chart and listed in tables.'],
              ['Daily wishes', 'The period running today, and the questions you want the astrologer to answer.'],
              ['Expert guidance', 'Every consultation plan is a live session. Length and depth depend on the plan you pick.'],
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
              <h2>Choose your guidance</h2>
              <div className="divider" />
              <p>Choose India or the United States to see that country’s price.</p>
            </Reveal>
          </div>
          <PlanGrid plans={plans} />
        </div>
      </section>
      <footer>
        <div className="wrap footer-content">
          <p>© {new Date().getFullYear()} <Wordmark /> · Vedic astrology, daily wishes & expert guidance.</p>
          <p className="footer-credit">Powered by Amrutha Varahi Universal Solutions Pvt. Ltd.</p>
        </div>
      </footer>
    </>
  )
}
