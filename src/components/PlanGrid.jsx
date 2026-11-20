import { useState } from 'react'
import { Link } from 'react-router-dom'
import { inr, usd } from '../api'
import { Reveal, tilt, untilt } from './Motion'

export default function PlanGrid({ plans, onPick, region, onRegion }) {
  const [local, setLocal] = useState('IN')
  const current = region || local
  function choose(next) {
    setLocal(next)
    if (onRegion) onRegion(next)
  }
  if (!plans.length) return <p className="muted">Loading plans…</p>
  return (
    <>
      <div className="region-switch" role="group" aria-label="Country">
        <button type="button" className={current === 'IN' ? 'on' : ''} onClick={() => choose('IN')}>India</button>
        <button type="button" className={current === 'US' ? 'on' : ''} onClick={() => choose('US')}>United States</button>
      </div>
      <p className="region-note">
        {current === 'IN'
          ? 'Prices in rupees. The total includes 18% GST: 9% CGST + 9% SGST inside the business state, or 18% IGST in another Indian state.'
          : 'Prices in US dollars. Indian GST is not added.'}
      </p>
      <div className="plan-grid">
        {plans.map((p, i) => (
          <Reveal key={p.code} delay={i * 80} as="article" id={`plan-${(p.code || '').toLowerCase()}`} className={p.recommended ? 'plan-card featured hoverable zoom' : 'plan-card hoverable'}>
            {p.recommended && (
              <div className="sticker-badge" aria-label="Recommended plan">
                <span>⭐ RECOMMENDED</span>
              </div>
            )}
            <div className="plan-card-inner" onPointerMove={tilt} onPointerLeave={untilt}>
              <div className="plan-card-body">
                <h3 className="plan-title">{p.name}</h3>
                <p className="tagline">{p.tagline}</p>
                <div className="plan-pricing-box">
                  <p className="price">{current === 'IN' ? inr(p.priceInr) : usd(p.priceUsd)}</p>
                  {current === 'IN' && <p className="gst">Total {inr(p.inrTotal)} including 18% GST</p>}
                </div>
                <ul className="plan-features">
                  {p.features.map((f) => <li key={f}>{f}</li>)}
                </ul>
              </div>
              <div className="plan-card-cta">
                {onPick ? (
                  <button className="btn plan-btn" type="button" onClick={() => onPick(p)}>
                    Choose this plan
                  </button>
                ) : (
                  <Link className="btn plan-btn" to={{ pathname: '/', hash: '#future' }}>
                    Get started
                  </Link>
                )}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </>
  )
}
