import { spokenInstant } from '../api'

const LABEL = { requested: 'Requested', ready: 'Ready' }

export default function ReportCard({ item, who, detail, busy, onDownload, onFulfill }) {
  const status = LABEL[item.status] || item.status
  const initial = (who || item.title || 'R').trim().charAt(0).toUpperCase()
  return (
    <article className={'session-card status-' + (item.status || 'requested')}>
      <header>
        <span className="session-avatar" aria-hidden="true">{initial}</span>
        <div>
          <h3>{item.title}</h3>
          {who && <p>{who}{detail ? ` · ${detail}` : ''}</p>}
        </div>
        <span className="status">{status}</span>
      </header>
      <dl className="session-facts">
        {item.topic && <div><dt>Topic</dt><dd>{item.topic}</dd></div>}
        <div><dt>{item.status === 'ready' ? 'Uploaded' : 'Requested'}</dt><dd>{spokenInstant(item.updatedAt || item.createdAt) || '—'}</dd></div>
        {item.fileName && <div><dt>File</dt><dd>{item.fileName}</dd></div>}
      </dl>
      <div className="session-link">
        {item.status === 'ready' && onDownload && (
          <button className="btn sm" type="button" disabled={busy} onClick={onDownload}>{busy ? 'Downloading…' : 'Download'}</button>
        )}
        {item.status === 'requested' && !onFulfill && <p className="muted">Waiting for the astrologer to upload the file.</p>}
        {onFulfill && (
          <button className="btn ghost sm" type="button" onClick={onFulfill}>{item.status === 'ready' ? 'Replace the file' : 'Upload the file'}</button>
        )}
      </div>
    </article>
  )
}
