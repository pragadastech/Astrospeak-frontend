import { moneyMinor, spokenDate, spokenTime, intakePairs, SESSION_STATUS } from '../api'

export default function SessionCard({ item, mode, onLink, onStatus }) {
  const pairs = intakePairs(item.intake)
  const when = [spokenDate(item.preferredDate), spokenTime(item.preferredTime)].filter(Boolean).join(' · ')
  const status = SESSION_STATUS[item.status] || item.status
  const initial = (item.customerName || item.planName || '?').trim().charAt(0).toUpperCase()

  return (
    <article className={'session-card status-' + (item.status || 'requested')}>
      <header>
        <span className="session-avatar" aria-hidden="true">{initial}</span>
        <div>
          <h3>{mode === 'admin' ? (item.customerName || 'Customer') : item.planName}</h3>
          {mode === 'admin' && <p>{item.planName}{item.durationMin ? ` · ${item.durationMin} min` : ''}</p>}
          {mode === 'client' && item.durationMin && <p>{item.durationMin} minutes</p>}
        </div>
        {onStatus ? (
          <label className="session-status">Status
            <select value={item.status} onChange={(e) => onStatus(e.target.value)}>
              {Object.entries(SESSION_STATUS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
            </select>
          </label>
        ) : <span className="status">{status}</span>}
      </header>

      {mode === 'admin' && (
        <div className="session-contact">
          <p>
            <a href={'mailto:' + item.customerEmail}>{item.customerEmail}</a>
            {item.customerPhone && <> · <a href={'tel:' + item.customerPhone}>{item.customerPhone}</a></>}
          </p>
          <span className="session-actions">
            <a className="btn ghost sm" href={'mailto:' + item.customerEmail}>Email</a>
            {item.customerPhone && <a className="btn ghost sm" href={'tel:' + item.customerPhone}>Call</a>}
          </span>
        </div>
      )}

      <dl className="session-facts">
        <div><dt>When</dt><dd>{when || '—'}</dd></div>
        <div><dt>Total</dt><dd>{moneyMinor(item.currency, item.totalMinor)}</dd></div>
        {item.pointsUsed > 0 && <div><dt>Points</dt><dd>{item.pointsUsed} used</dd></div>}
        {item.pointsUsed > 0 && <div><dt>To pay</dt><dd>{moneyMinor(item.currency, item.payableMinor)}</dd></div>}
        {item.topic && <div><dt>Topic</dt><dd>{item.topic}</dd></div>}
      </dl>

      {pairs.length > 0 && (
        <div className="qa">
          <h4>Answers</h4>
          {pairs.map((pair, i) => (
            <article key={i}>
              {pair.question && <strong>{pair.question}</strong>}
              <p>{pair.answer}</p>
            </article>
          ))}
        </div>
      )}

      <div className="session-link">
        {onLink ? (
          <form onSubmit={(e) => { e.preventDefault(); onLink(new FormData(e.target).get('link')) }}>
            <label>Google Meet link
              <input name="link" type="url" defaultValue={item.meetingLink || ''} placeholder="https://meet.google.com/…" required />
            </label>
            <button className="btn sm" type="submit">{item.meetingLink ? 'Update the link' : 'Send the link'}</button>
          </form>
        ) : item.meetingLink ? (
          <a className="btn sm" href={item.meetingLink} target="_blank" rel="noreferrer">Open Google Meet</a>
        ) : (
          <p className="muted">The meeting link arrives after the session is confirmed.</p>
        )}
      </div>
    </article>
  )
}
