import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Brand from '../components/Brand'
import { api, clearTab, moneyMinor, spokenDate } from '../api'

// --- Skeleton Loaders ---
function SkeletonRow({ cols = 4 }) {
  return (
    <tr className="sk-tr">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i}>
          <div className="skeleton-line" style={{ width: i === 0 ? '70%' : i === cols - 1 ? '40%' : '85%' }} />
        </td>
      ))}
    </tr>
  )
}

function SkeletonTable({ cols = 5, rows = 5 }) {
  return (
    <div className="skeleton-table-wrap">
      <div className="skeleton-table-head" />
      <table>
        <thead>
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i}><div className="skeleton-line head-col" style={{ width: '60%' }} /></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonRow key={i} cols={cols} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SkeletonCard({ lines = 3 }) {
  return (
    <div className="card skeleton-card">
      <div className="skeleton-line" style={{ width: '45%', height: '22px', marginBottom: '14px' }} />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skeleton-line" style={{ width: `${85 - i * 15}%`, height: '14px', marginBottom: '10px' }} />
      ))}
    </div>
  )
}

function SkeletonOverview() {
  return (
    <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))' }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <article className="card skeleton-stat" key={i}>
          <div className="skeleton-line" style={{ width: '50px', height: '32px', marginBottom: '8px' }} />
          <div className="skeleton-line" style={{ width: '80px', height: '14px' }} />
        </article>
      ))}
    </div>
  )
}

// --- Logout Confirmation Dialog ---
function LogoutModal({ onConfirm, onCancel, loggingOut }) {
  return (
    <div className="logout-modal-backdrop" onClick={loggingOut ? undefined : onCancel}>
      <div className="logout-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="logout-modal-icon">⚠️</div>
        <h3>Confirm Sign Out</h3>
        <p>Are you sure you want to log out of the admin portal?</p>
        <div className="logout-modal-actions">
          <button type="button" className="btn sm ghost" onClick={onCancel} disabled={loggingOut}>
            Cancel
          </button>
          <button
            type="button"
            className="btn sm logout-confirm-btn btn-with-loader"
            onClick={onConfirm}
            disabled={loggingOut}
          >
            {loggingOut ? (
              <>
                <span className="btn-spinner white" aria-hidden="true" />
                <span>Signing out…</span>
              </>
            ) : (
              'Yes, Sign out'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminApp() {
  const nav = useNavigate()
  const [me, setMe] = useState(null)
  const [tab, setTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    api('/api/auth/me')
      .then((u) => { if (u.role === 'CLIENT') nav('/app'); else setMe(u) })
      .catch(() => nav('/login'))
  }, [])

  if (!me) {
    return (
      <div className="admin-initial-loader">
        <div className="admin-loader-spinner" />
        <p>Loading admin portal…</p>
      </div>
    )
  }

  const tabs = [
    ['overview', 'Overview'],
    ['customers', 'Customers'],
    ['employees', 'Employees'],
    ['consults', 'Consultations'],
    ['questions', 'Questions'],
    ['plans', 'Plans'],
    ['reports', 'Reports & Commission'],
    ['notes', 'Notifications'],
    ['settings', 'Settings']
  ]

  async function handleLogout() {
    setLoggingOut(true)
    try { await api('/api/auth/logout', { method: 'POST' }) } catch { clearTab() }
    nav('/')
  }

  const currentTabName = tabs.find(([id]) => id === tab)?.[1]
  return (
    <div className={`admin-shell portal-shell ${sidebarOpen ? 'sidebar-open' : ''}`}>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="admin-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <LogoutModal
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutConfirm(false)}
          loggingOut={loggingOut}
        />
      )}

      {/* Header */}
      <header className="portal-head">
        <div className="portal-head-left">
          <button
            type="button"
            className="portal-burger"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Toggle navigation menu"
            aria-expanded={sidebarOpen}
          >
            <span className="burger-icon" />
          </button>
          <div className="portal-brand-wrap">
            <Brand to="/admin" />
          </div>
        </div>

        <div className="portal-head-right">
          <div className="portal-user-badge">
            <span className="user-avatar" aria-hidden="true">
              {me.fullName ? me.fullName.charAt(0).toUpperCase() : 'A'}
            </span>
            <span className="user-name">{me.fullName || 'Admin'}</span>
          </div>
          <button className="btn sm ghost portal-logout-btn" type="button" onClick={() => setShowLogoutConfirm(true)}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign out
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`admin-side ${sidebarOpen ? 'open' : ''}`}>
        <button
          type="button"
          className="admin-side-close"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        >
          ✕
        </button>

        <nav className="admin-nav" aria-label="Admin Navigation">
          {tabs.map(([id, label]) => {
            const isRestricted = (id === 'employees' || id === 'questions' || id === 'plans' || id === 'settings') && me.role !== 'ADMIN'
            if (isRestricted) return null
            return (
              <button
                key={id}
                type="button"
                className={`admin-nav-item ${tab === id ? 'on' : ''}`}
                onClick={() => {
                  setTab(id)
                  setSidebarOpen(false)
                }}
              >
                <span className="nav-label">{label}</span>
              </button>
            )
          })}
        </nav>

        <div className="admin-side-footer">
          <button className="side-out-btn" type="button" onClick={() => setShowLogoutConfirm(true)}>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        <div className="admin-main-container">
          {tab === 'overview' && <Overview />}
          {tab === 'customers' && <Customers me={me} />}
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
        </div>
      </main>
    </div>
  )
}

function Overview() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [customers, setCustomers] = useState([])
  const [consultations, setConsultations] = useState([])
  const [commRecords, setCommRecords] = useState([])

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api('/api/admin/stats'),
      api('/api/admin/customers').catch(() => []),
      api('/api/admin/consultations').catch(() => []),
      api('/api/admin/commissions/records').catch(() => [])
    ])
      .then(([st, custs, consults, recs]) => {
        setStats(st)
        setCustomers(custs || [])
        setConsultations(consults || [])
        setCommRecords(recs || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading || !stats) return <SkeletonOverview />

  // Compute source stats
  const sources = ['YouTube', 'Instagram', 'Referral']
  const sourceStats = sources.map(src => {
    const list = customers.filter(c => c.source === src)
    const converted = list.filter(c => c.leadStatus === 'CONVERTED').length
    const convRate = list.length > 0 ? Math.round((converted / list.length) * 100) : 0
    return { source: src, total: list.length, converted, convRate }
  })

  // Compute monthly trend for the last 4 months using local timezone keys
  const months = []
  const now = new Date()
  for (let i = 3; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` // "YYYY-MM"
    const label = d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
    const custCount = customers.filter(c => (c.createdAt || '').startsWith(key)).length
    const convCount = customers.filter(c => (c.convertedAt || '').startsWith(key) || (c.leadStatus === 'CONVERTED' && (c.createdAt || '').startsWith(key))).length
    const consultCount = consultations.filter(c => (c.preferredDate || '').startsWith(key)).length
    months.push({ key, label, custCount, convCount, consultCount })
  }
  const maxMonthLeads = Math.max(...months.map(m => m.custCount), 1)

  return (
    <div>
      {/* 1. Primary KPI Stat Cards */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', marginBottom: 20 }}>
        {Object.entries(stats).map(([k, v]) => {
          const titles = {
            customers: 'Total Customers',
            employees: 'Staff Employees',
            consultations: 'Consultations',
            reports: 'Reports On File',
            convertedLeads: 'Converted Leads',
            newLeads: 'Active New Leads'
          }
          const emojis = {
            customers: '👥',
            employees: '👔',
            consultations: '📅',
            reports: '📄',
            convertedLeads: '🎯',
            newLeads: '🌟'
          }
          return (
            <article className="card" key={k} style={{ padding: '16px 18px', borderTop: '3px solid var(--orange)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.4rem' }}>{emojis[k] || '📊'}</span>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--ink-soft)', fontWeight: 700 }}>
                  {titles[k] || k}
                </span>
              </div>
              <h3 style={{ margin: '8px 0 0', fontSize: '1.8rem', color: 'var(--o-900)' }}>{v}</h3>
            </article>
          )
        })}
      </div>

      {/* 2. Visual Charts & Trends Dashboard Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20, marginBottom: 20 }}>
        {/* Monthly Intake & Conversion Trend */}
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--ink)' }}>📈 Monthly Intake & Conversion Trend</h4>
            <span style={{ fontSize: '0.72rem', color: 'var(--ink-soft)' }}>Past 4 Months</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {months.map(m => {
              const leadWidth = Math.round((m.custCount / maxMonthLeads) * 100)
              const convWidth = Math.round((m.convCount / maxMonthLeads) * 100)
              return (
                <div key={m.key} style={{ fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <strong>{m.label}</strong>
                    <span style={{ color: 'var(--ink-soft)' }}>
                      <strong>{m.custCount}</strong> leads · <span style={{ color: '#166534', fontWeight: 600 }}>{m.convCount} converted</span>
                    </span>
                  </div>
                  {/* Stacked bar visualization */}
                  <div style={{ height: 10, background: '#f3f4f6', borderRadius: 5, overflow: 'hidden', display: 'flex', gap: 2 }}>
                    <div
                      style={{
                        width: `${leadWidth}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, var(--orange), #ff4800)',
                        borderRadius: 5,
                        transition: 'width 0.4s ease'
                      }}
                      title={`${m.custCount} Total Leads`}
                    />
                    <div
                      style={{
                        width: `${convWidth}%`,
                        height: '100%',
                        background: '#166534',
                        borderRadius: 5,
                        transition: 'width 0.4s ease'
                      }}
                      title={`${m.convCount} Converted`}
                    />
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 14, fontSize: '0.75rem', color: 'var(--ink-soft)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 10, height: 10, background: 'var(--orange)', borderRadius: 2 }} /> Leads
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 10, height: 10, background: '#166534', borderRadius: 2 }} /> Converted
            </span>
          </div>
        </div>

        {/* Source Conversion Breakdown & Performance */}
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--ink)' }}>🎯 Source Conversion Rates</h4>
            <span style={{ fontSize: '0.72rem', color: 'var(--ink-soft)' }}>By Acquisition Channel</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {sourceStats.map(s => (
              <div key={s.source} style={{ padding: '10px 14px', background: '#faf8f6', borderRadius: 8, border: '1px solid var(--o-150)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{s.source}</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: s.convRate > 25 ? '#166534' : 'var(--orange)' }}>
                    {s.convRate}% Conv. Rate
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--ink-soft)' }}>
                  <span>{s.total} Total Registered</span>
                  <span><strong>{s.converted}</strong> Converted Leads</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Customers({ me }) {
  const [rows, setRows] = useState([])
  const [employees, setEmployees] = useState([])
  const [plans, setPlans] = useState([])
  const [open, setOpen] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterSource, setFilterSource] = useState('ALL')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [filterEmployee, setFilterEmployee] = useState('ALL')
  const [showChart, setShowChart] = useState(false)

  function load() {
    setLoading(true)
    Promise.all([
      api('/api/admin/customers'),
      api('/api/admin/employees').catch(() => []),
      api('/api/plans').then(d => d.plans || []).catch(() => [])
    ])
      .then(([custs, emps, plns]) => {
        setRows(custs || [])
        setEmployees(emps || [])
        setPlans(plns || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(load, [])

  async function handleAssign(customerId, employeeId) {
    try {
      await api(`/api/admin/customers/${customerId}/assign`, {
        method: 'PATCH',
        body: { employeeId: employeeId || null }
      })
      load()
    } catch (e) {
      alert(e.message)
    }
  }

  async function handleLeadUpdate(customerId, leadStatus, selectedPlan) {
    try {
      const planObj = plans.find(p => p.code === selectedPlan)
      await api(`/api/admin/customers/${customerId}/lead`, {
        method: 'PATCH',
        body: {
          leadStatus,
          selectedPlan: selectedPlan || null,
          selectedPlanName: planObj ? planObj.name : null
        }
      })
      load()
    } catch (e) {
      alert(e.message)
    }
  }

  const query = searchQuery.trim().toLowerCase()
  const filteredRows = rows.filter(u => {
    if (filterSource !== 'ALL' && (u.source || 'Direct') !== filterSource) return false
    if (filterStatus !== 'ALL' && (u.leadStatus || 'NEW') !== filterStatus) return false
    if (filterEmployee !== 'ALL') {
      if (filterEmployee === 'UNASSIGNED' && u.assignedTo) return false
      if (filterEmployee !== 'UNASSIGNED' && u.assignedTo !== filterEmployee) return false
    }
    if (query) {
      const matchName = (u.fullName || '').toLowerCase().includes(query)
      const matchEmail = (u.email || '').toLowerCase().includes(query)
      const matchPhone = (u.phone || '').toLowerCase().includes(query)
      const matchSource = (u.source || '').toLowerCase().includes(query)
      const matchPlan = (u.selectedPlanName || u.selectedPlan || '').toLowerCase().includes(query)
      if (!matchName && !matchEmail && !matchPhone && !matchSource && !matchPlan) return false
    }
    return true
  })

  // Summary counts for chart
  const sourceBreakdown = {
    YouTube: rows.filter(u => u.source === 'YouTube').length,
    Instagram: rows.filter(u => u.source === 'Instagram').length,
    Referral: rows.filter(u => u.source === 'Referral').length,
    Other: rows.filter(u => !['YouTube', 'Instagram', 'Referral'].includes(u.source)).length,
  }
  const statusBreakdown = {
    NEW: rows.filter(u => (u.leadStatus || 'NEW') === 'NEW').length,
    CONTACTED: rows.filter(u => u.leadStatus === 'CONTACTED').length,
    CONVERTED: rows.filter(u => u.leadStatus === 'CONVERTED').length,
    CLOSED: rows.filter(u => u.leadStatus === 'CLOSED').length,
  }
  const maxSourceCount = Math.max(...Object.values(sourceBreakdown), 1)
  const maxStatusCount = Math.max(...Object.values(statusBreakdown), 1)

  if (loading) return <SkeletonTable cols={7} rows={6} />

  return (
    <section>
      {/* Search & Filter Header Bar */}
      <div className="card" style={{ marginBottom: 14, padding: '12px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
            {/* Search input for admin customer search */}
            <div style={{ position: 'relative', minWidth: 220, flex: 1, maxWidth: 320 }}>
              <input
                type="search"
                placeholder="🔍 Search customers by name, email, phone..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  fontSize: '0.82rem',
                  padding: '6px 10px',
                  borderRadius: 8,
                  border: '1px solid var(--o-200)',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>Source:</span>
              <select
                style={{ fontSize: '0.76rem', padding: '4px 8px', borderRadius: 6, border: '1px solid var(--o-200)' }}
                value={filterSource}
                onChange={e => setFilterSource(e.target.value)}
              >
                <option value="ALL">All Sources</option>
                <option value="YouTube">YouTube</option>
                <option value="Instagram">Instagram</option>
                <option value="Referral">Referral</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>Status:</span>
              <select
                style={{ fontSize: '0.76rem', padding: '4px 8px', borderRadius: 6, border: '1px solid var(--o-200)' }}
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="NEW">New Lead</option>
                <option value="CONTACTED">Contacted</option>
                <option value="CONVERTED">Converted</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            {me.role === 'ADMIN' && (
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>Assigned:</span>
                <select
                  style={{ fontSize: '0.76rem', padding: '4px 8px', borderRadius: 6, border: '1px solid var(--o-200)' }}
                  value={filterEmployee}
                  onChange={e => setFilterEmployee(e.target.value)}
                >
                  <option value="ALL">All Assignments</option>
                  <option value="UNASSIGNED">Unassigned</option>
                  <option value={me.id}>My Leads ({me.fullName})</option>
                  {employees.filter(e => e.id !== me.id).map(e => (
                    <option key={e.id} value={e.id}>{e.fullName}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              type="button"
              className={`btn sm ${showChart ? '' : 'ghost'}`}
              onClick={() => setShowChart(!showChart)}
              style={{ fontSize: '0.78rem', padding: '4px 10px' }}
            >
              📊 {showChart ? 'Hide Summary Chart' : 'View Customer Chart'}
            </button>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--ink)' }}>
              ({filteredRows.length} found)
            </span>
          </div>
        </div>

        {/* Customer Chart & Analytics View */}
        {showChart && (
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--o-100)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {/* Source Distribution Bar Chart */}
            <div style={{ padding: '12px 14px', background: '#faf8f6', borderRadius: 10, border: '1px solid var(--o-150)' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: '0.85rem', color: 'var(--ink)' }}>Lead Sources Breakdown</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {Object.entries(sourceBreakdown).map(([src, count]) => {
                  const pct = Math.round((count / (rows.length || 1)) * 100)
                  const barWidth = Math.round((count / maxSourceCount) * 100)
                  return (
                    <div key={src} style={{ fontSize: '0.78rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                        <span><strong>{src}</strong> ({count})</span>
                        <span style={{ color: 'var(--ink-soft)' }}>{pct}%</span>
                      </div>
                      <div style={{ height: 8, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${barWidth}%`, height: '100%', background: 'var(--orange)', borderRadius: 4, transition: 'width 0.4s ease' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Lead Status Funnel Chart */}
            <div style={{ padding: '12px 14px', background: '#faf8f6', borderRadius: 10, border: '1px solid var(--o-150)' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: '0.85rem', color: 'var(--ink)' }}>Lead Status Conversion Funnel</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {Object.entries(statusBreakdown).map(([st, count]) => {
                  const pct = Math.round((count / (rows.length || 1)) * 100)
                  const barWidth = Math.round((count / maxStatusCount) * 100)
                  const color = st === 'CONVERTED' ? '#166534' : st === 'CONTACTED' ? '#0284c7' : st === 'CLOSED' ? '#6b7280' : 'var(--orange)'
                  return (
                    <div key={st} style={{ fontSize: '0.78rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                        <span><strong>{st}</strong> ({count})</span>
                        <span style={{ color: 'var(--ink-soft)' }}>{pct}%</span>
                      </div>
                      <div style={{ height: 8, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${barWidth}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.4s ease' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      <table>
        <thead>
          <tr>
            <th>Customer</th>
            <th>Source</th>
            <th>Lead Status</th>
            <th>Selected Plan</th>
            <th>Assigned To</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredRows.length === 0 ? (
            <tr><td colSpan={7} style={{ textAlign: 'center', padding: '24px' }}>No customers match the current filter.</td></tr>
          ) : (
            filteredRows.map((u) => {
              const isAssignedToMe = me.id === u.assignedTo
              const canAssign = me.role === 'ADMIN' || !u.assignedTo || isAssignedToMe
              return (
                <tr key={u.id}>
                  <td>
                    <strong>{u.fullName}</strong>
                    <br />
                    <small style={{ color: 'var(--ink-soft)' }}>{u.email}</small>
                    {u.phone && <><br /><small style={{ color: 'var(--o-700)' }}>{u.phone}</small></>}
                  </td>
                  <td>
                    <span className="search-badge" style={{ fontSize: '0.72rem' }}>
                      {u.source || 'Direct'}
                    </span>
                    {u.referralDetails && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--ink-soft)', marginTop: 2 }}>
                        Ref: {u.referralDetails}
                      </div>
                    )}
                  </td>
                  <td>
                    <select
                      value={u.leadStatus || 'NEW'}
                      onChange={(e) => handleLeadUpdate(u.id, e.target.value, u.selectedPlan)}
                      style={{
                        fontSize: '0.75rem',
                        padding: '3px 6px',
                        borderRadius: 6,
                        border: '1px solid var(--o-200)',
                        background: u.leadStatus === 'CONVERTED' ? '#dcfce7' : '#fff'
                      }}
                    >
                      <option value="NEW">New Lead</option>
                      <option value="CONTACTED">Contacted</option>
                      <option value="CONVERTED">Converted</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                    {u.convertedAt && (
                      <div style={{ fontSize: '0.68rem', color: '#166534', marginTop: 2 }}>
                        ✓ {spokenDate(u.convertedAt)}
                      </div>
                    )}
                  </td>
                  <td>
                    <select
                      value={u.selectedPlan || ''}
                      onChange={(e) => handleLeadUpdate(u.id, u.leadStatus || 'NEW', e.target.value)}
                      style={{ fontSize: '0.75rem', padding: '3px 6px', borderRadius: 6, border: '1px solid var(--o-200)', maxWidth: 140 }}
                    >
                      <option value="">No Plan</option>
                      {plans.map(p => (
                        <option key={p.code} value={p.code}>{p.name}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    {canAssign ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <select
                          value={u.assignedTo || ''}
                          onChange={(e) => handleAssign(u.id, e.target.value)}
                          style={{
                            fontSize: '0.75rem',
                            padding: '3px 6px',
                            borderRadius: 6,
                            border: '1px solid var(--o-200)',
                            background: u.assignedTo ? 'var(--o-50)' : '#fff'
                          }}
                        >
                          <option value="">Unassigned</option>
                          <option value={me.id}>Self ({me.fullName})</option>
                          {me.role === 'ADMIN' && employees.filter(e => e.id !== me.id).map(e => (
                            <option key={e.id} value={e.id}>{e.fullName}</option>
                          ))}
                        </select>
                        {!u.assignedTo && me.role !== 'ADMIN' && (
                          <button
                            type="button"
                            className="btn sm"
                            style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'var(--orange)', color: '#fff' }}
                            onClick={() => handleAssign(u.id, me.id)}
                          >
                            Claim / Self-Assign
                          </button>
                        )}
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: 'var(--ink)' }}>
                        {u.assignedToName || 'Unassigned'}
                      </span>
                    )}
                  </td>
                  <td><small>{spokenDate(u.createdAt)}</small></td>
                  <td>
                    <button
                      className="btn sm"
                      style={{ padding: '3px 9px', fontSize: '0.75rem' }}
                      onClick={() => api('/api/admin/customers/' + u.id).then(setOpen)}
                    >
                      Chart
                    </button>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>

      {open && (
        <div className="card" style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h3 style={{ margin: 0 }}>Full Chart & Record: {open.user.fullName}</h3>
            <button className="btn sm ghost" onClick={() => setOpen(null)} style={{ padding: '2px 8px' }}>Close</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginBottom: 12, fontSize: '0.82rem' }}>
            <div><strong>Email:</strong> {open.user.email}</div>
            <div><strong>Phone:</strong> {open.user.phone || '—'}</div>
            <div><strong>Lead Source:</strong> {open.user.source || 'Direct'}</div>
            <div><strong>Lead Status:</strong> {open.user.leadStatus || 'NEW'}</div>
            <div><strong>Selected Plan:</strong> {open.user.selectedPlanName || open.user.selectedPlan || 'None'}</div>
            <div><strong>Assigned To:</strong> {open.user.assignedToName || 'Unassigned'}</div>
          </div>
          <h4>Birth Profiles & Cusps</h4>
          <ul>{open.profiles.map((p) => <li key={p.id}><strong>{p.relation}:</strong> {p.fullName} · {spokenDate(p.dob)} {p.tob} · {p.city} (Lat: {p.lat}, Lon: {p.lon})</li>)}</ul>
          <p style={{ margin: '6px 0 0', fontSize: '0.8rem', color: 'var(--ink-soft)' }}>{open.reports.length} report(s) on file.</p>
        </div>
      )}
    </section>
  )
}

function Employees() {
  const [rows, setRows] = useState([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [permissions, setPermissions] = useState(['overview', 'customers', 'consults', 'reports', 'notes'])
  const [made, setMade] = useState(null)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(true)

  const availableSections = [
    { key: 'overview', label: 'Overview' },
    { key: 'customers', label: 'Customers' },
    { key: 'consults', label: 'Consultations' },
    { key: 'reports', label: 'Reports & Commission' },
    { key: 'notes', label: 'Notifications' },
    { key: 'questions', label: 'Questions' },
    { key: 'plans', label: 'Plans' },
  ]

  function load() {
    setLoading(true)
    api('/api/admin/employees')
      .then((res) => { setRows(res); setLoading(false) })
      .catch(() => setLoading(false))
  }
  useEffect(load, [])

  function togglePerm(key) {
    if (permissions.includes(key)) {
      setPermissions(permissions.filter(p => p !== key))
    } else {
      setPermissions([...permissions, key])
    }
  }

  async function add(e) {
    e.preventDefault()
    setErr('')
    try {
      setMade(await api('/api/admin/employees', { method: 'POST', body: { fullName: name, email, permissions } }))
      setName('')
      setEmail('')
      load()
    } catch (ex) { setErr(ex.message) }
  }

  return (
    <section>
      <p className="info">Staff accounts can access designated portal sections. Temporary password is generated on creation.</p>
      {made && <p className="ok">Employee {made.email} created. Temporary password: <strong>{made.temporaryPassword}</strong></p>}
      {err && <p className="err">{err}</p>}
      <form onSubmit={add} style={{ marginBottom: 20, padding: '16px', background: '#fff', borderRadius: 12, border: '1px solid var(--o-200)' }}>
        <h3 style={{ margin: '0 0 12px', fontSize: '1rem', color: 'var(--ink)' }}>Add New Staff Employee</h3>
        <div className="row" style={{ marginBottom: 14 }}>
          <input placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required style={{ flex: 1 }} />
          <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ flex: 1 }} />
          <button className="btn sm" type="submit">Create Employee</button>
        </div>
        <div style={{ marginTop: 8 }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--ink-soft)', display: 'block', marginBottom: 8 }}>
            Assigned Section Permissions:
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {availableSections.map(s => (
              <label key={s.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={permissions.includes(s.key)}
                  onChange={() => togglePerm(s.key)}
                />
                {s.label}
              </label>
            ))}
          </div>
        </div>
      </form>
      {loading ? (
        <SkeletonTable cols={3} rows={4} />
      ) : (
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Sections</th></tr></thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={3} style={{ textAlign: 'center', padding: '20px' }}>No employees added yet.</td></tr>
            ) : (
              rows.map((u) => (
                <tr key={u.id}>
                  <td><strong>{u.fullName}</strong></td>
                  <td>{u.email}</td>
                  <td><span className="search-badge" style={{ fontSize: '0.72rem' }}>{(u.permissions || []).join(', ') || 'Standard'}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </section>
  )
}

function Consults() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('future') // 'future', 'other'
  const [statusFilter, setStatusFilter] = useState('all')

  function load() {
    setLoading(true)
    api('/api/admin/consultations')
      .then((res) => { setRows(res); setLoading(false) })
      .catch(() => setLoading(false))
  }
  useEffect(load, [])

  async function save(c, patch) {
    await api('/api/admin/consultations/' + c.id, { method: 'PATCH', body: patch })
    load()
  }

  if (loading) {
    return (
      <section className="consults-section">
        <div className="skeleton-line" style={{ width: '220px', height: '28px', marginBottom: '14px' }} />
        <SkeletonCard lines={5} />
        <div style={{ marginTop: 14 }}><SkeletonCard lines={5} /></div>
      </section>
    )
  }

  const readings = rows.filter((c) => c.intake)
  const other = rows.filter((c) => !c.intake)

  const currentList = activeTab === 'future' ? readings : other
  const filteredList = currentList.filter((c) => {
    if (statusFilter === 'all') return true
    return c.status === statusFilter
  })

  return (
    <section className="consults-section">
      {/* Header Banner */}
      <div className="consults-header-row">
        <div className="consults-header-info">
          <h2 className="consults-main-title">Consultations & Future Readings</h2>
          <p className="consults-main-subtitle">
            Review customer questionnaires, schedule live video calls, and dispatch Google Meet links.
          </p>
        </div>
      </div>

      {/* Tabs & Filter Bar */}
      <div className="consults-nav-bar">
        <div className="consults-pill-group">
          <button
            type="button"
            className={`consult-pill ${activeTab === 'future' ? 'active' : ''}`}
            onClick={() => setActiveTab('future')}
          >
            Future Readings ({readings.length})
          </button>
          <button
            type="button"
            className={`consult-pill ${activeTab === 'other' ? 'active' : ''}`}
            onClick={() => setActiveTab('other')}
          >
            Direct Sessions ({other.length})
          </button>
        </div>

        <div className="consults-status-filter">
          <label className="filter-select-label">Status: </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select-input"
          >
            <option value="all">All Statuses</option>
            <option value="requested">Requested</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Future Readings Card List */}
      {activeTab === 'future' && (
        <div className="consults-cards-list">
          {filteredList.length === 0 ? (
            <div className="consult-empty-box">
              <span className="empty-icon">📅</span>
              <p>No consultations found matching your filter.</p>
            </div>
          ) : (
            filteredList.map((c) => (
              <article className="consult-card" key={c.id}>
                {/* Header */}
                <div className="consult-card-top">
                  <div className="consult-user-block">
                    <div className="consult-avatar">
                      {c.customerName ? c.customerName.charAt(0).toUpperCase() : 'C'}
                    </div>
                    <div>
                      <h3 className="consult-user-name">{c.customerName || 'Customer'}</h3>
                      <div className="consult-contact-links">
                        <a href={`mailto:${c.customerEmail}`} className="contact-link">
                          ✉️ {c.customerEmail}
                        </a>
                        {c.customerPhone && (
                          <a href={`tel:${c.customerPhone}`} className="contact-link">
                            📞 {c.customerPhone}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="consult-status-box">
                    <select
                      className={`status-select-tag status-${c.status}`}
                      value={c.status}
                      onChange={(e) => save(c, { status: e.target.value })}
                    >
                      {['requested', 'confirmed', 'completed', 'cancelled'].map((s) => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Plan & Schedule Highlights */}
                <div className="consult-meta-grid">
                  <div className="meta-item">
                    <span className="meta-label">Selected Plan</span>
                    <strong className="meta-value">{c.planName || 'Consultation'}</strong>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Date & Time</span>
                    <strong className="meta-value">
                      {spokenDate(c.preferredDate)} · {c.preferredTime || 'Flexible'}
                    </strong>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Amount Paid</span>
                    <strong className="meta-value amount">
                      {moneyMinor(c.currency, c.totalMinor)}
                    </strong>
                  </div>
                </div>

                {/* Customer Answers / Intake */}
                {c.intake && (
                  <div className="consult-intake-section">
                    <span className="intake-heading">Customer Answers & Notes:</span>
                    <div className="consult-intake-box">
                      {c.intake}
                    </div>
                  </div>
                )}

                {/* Meeting Link Action Form */}
                <div className="consult-action-box">
                  <form
                    className="consult-meet-form"
                    onSubmit={(e) => {
                      e.preventDefault()
                      save(c, {
                        meetingLink: new FormData(e.target).get('link'),
                        status: 'confirmed',
                      })
                    }}
                  >
                    <div className="meet-input-wrap">
                      <span className="meet-prefix-icon">🎥</span>
                      <input
                        name="link"
                        defaultValue={c.meetingLink || ''}
                        placeholder="Paste Google Meet link (e.g. https://meet.google.com/abc-defg-hij)"
                        className="meet-url-input"
                        required
                      />
                    </div>
                    <button className="btn sm meet-submit-btn" type="submit">
                      {c.meetingLink ? 'Update Link' : 'Send Link & Connect'}
                    </button>
                  </form>
                </div>
              </article>
            ))
          )}
        </div>
      )}

      {/* Other Sessions Table */}
      {activeTab === 'other' && (
        <div className="consults-table-container">
          {filteredList.length === 0 ? (
            <div className="consult-empty-box">
              <span className="empty-icon">📅</span>
              <p>No direct sessions found.</p>
            </div>
          ) : (
            <table className="consults-data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Plan & Duration</th>
                  <th>Scheduled Time</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Google Meet Link</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <strong>{c.customerName || 'Customer'}</strong>
                      <br />
                      <small className="muted-email">{c.customerEmail}</small>
                    </td>
                    <td>
                      {c.planName}
                      <br />
                      <small className="muted-email">{c.durationMin || 60} mins</small>
                    </td>
                    <td>
                      {spokenDate(c.preferredDate)}
                      <br />
                      <small className="muted-email">{c.preferredTime}</small>
                    </td>
                    <td><strong>{moneyMinor(c.currency, c.totalMinor)}</strong></td>
                    <td>
                      <select
                        className={`status-select-tag status-${c.status}`}
                        value={c.status}
                        onChange={(e) => save(c, { status: e.target.value })}
                      >
                        {['requested', 'confirmed', 'completed', 'cancelled'].map((s) => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <form
                        className="row meet-inline-form"
                        onSubmit={(e) => {
                          e.preventDefault()
                          save(c, {
                            meetingLink: new FormData(e.target).get('link'),
                            status: 'confirmed',
                          })
                        }}
                      >
                        <input
                          name="link"
                          defaultValue={c.meetingLink || ''}
                          placeholder="https://meet.google.com/…"
                          className="meet-inline-input"
                        />
                        <button className="btn sm" type="submit">Save</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </section>
  )
}

function Questions() {
  const [rows, setRows] = useState([])
  const [prompt, setPrompt] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(true)

  function load() {
    setLoading(true)
    api('/api/admin/questions')
      .then((res) => { setRows(res); setLoading(false) })
      .catch(() => setLoading(false))
  }
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
      <form onSubmit={add} className="row" style={{ marginBottom: 16 }}>
        <label style={{ flex: 1 }}>New question<input value={prompt} onChange={(e) => setPrompt(e.target.value)} required /></label>
        <button className="btn" type="submit">Add</button>
      </form>
      {err && <p className="err">{err}</p>}
      {loading ? (
        <div style={{ marginTop: 14 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton-line" style={{ height: '38px', marginBottom: '8px', borderRadius: '8px' }} />
          ))}
        </div>
      ) : (
        <ol style={{ paddingLeft: 20 }}>
          {rows.length === 0 ? (
            <p>No questions defined yet.</p>
          ) : (
            rows.map((q) => <li key={q.id} style={{ marginBottom: 8 }}>{q.prompt} <button className="btn ghost sm" type="button" onClick={() => remove(q.id)}>Remove</button></li>)
          )}
        </ol>
      )}
    </section>
  )
}

function Reports({ me }) {
  const [activeTab, setActiveTab] = useState('leads') // 'leads' | 'monthly' | 'commission' | 'files'
  const [customers, setCustomers] = useState([])
  const [employees, setEmployees] = useState([])
  const [reports, setReports] = useState([])
  const [commRates, setCommRates] = useState([])
  const [commRecords, setCommRecords] = useState([])
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [savingRate, setSavingRate] = useState(false)

  // Rate edit states
  const [rateEdits, setRateEdits] = useState({ YouTube: 10, Instagram: 20, Referral: 15 })

  // Filters for Converted Leads
  const [filterSource, setFilterSource] = useState('ALL')
  const [filterPlan, setFilterPlan] = useState('ALL')
  const [filterEmployee, setFilterEmployee] = useState('ALL')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  function load() {
    setLoading(true)
    Promise.all([
      api('/api/admin/reports'),
      api('/api/admin/customers'),
      api('/api/admin/commissions/rates').catch(() => []),
      api('/api/admin/commissions/records').catch(() => []),
      api('/api/admin/employees').catch(() => []),
      api('/api/plans').then(d => d.plans || []).catch(() => [])
    ])
      .then(([reps, custs, rates, records, emps, plns]) => {
        setReports(reps || [])
        setCustomers(custs || [])
        setCommRates(rates || [])
        setCommRecords(records || [])
        setEmployees(emps || [])
        setPlans(plns || [])

        if (rates && rates.length > 0) {
          const map = { ...rateEdits }
          rates.forEach(r => { map[r.source] = r.ratePercent })
          setRateEdits(map)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(load, [])

  async function handleSaveRate(source) {
    const rawVal = rateEdits[source]
    if (rawVal === '' || rawVal === null || isNaN(parseFloat(rawVal))) {
      alert('Please enter a valid commission rate percentage.')
      return
    }
    const val = parseFloat(rawVal)
    if (val < 0 || val > 100) {
      alert('Commission rate must be between 0% and 100%.')
      return
    }
    setSavingRate(true)
    try {
      await api(`/api/admin/commissions/rates/${source}`, {
        method: 'PUT',
        body: { ratePercent: val }
      })
      setMsg(`Updated ${source} commission rate to ${val}%. Applied to future calculations.`)
      load()
    } catch (e) {
      alert(e.message)
    } finally {
      setSavingRate(false)
    }
  }

  async function upload(e) {
    e.preventDefault()
    const data = new FormData(e.target)
    await api('/api/admin/reports', { method: 'POST', body: data })
    setMsg('Uploaded to the customer’s My Reports.')
    e.target.reset()
    load()
  }

  // Calculate Lead Stats
  const convertedLeads = customers.filter(c => c.leadStatus === 'CONVERTED')
  const filteredConvertedLeads = convertedLeads.filter(c => {
    if (filterSource !== 'ALL' && (c.source || 'Direct') !== filterSource) return false
    if (filterPlan !== 'ALL' && (c.selectedPlan || 'None') !== filterPlan) return false
    if (filterEmployee !== 'ALL') {
      if (filterEmployee === 'UNASSIGNED' && c.assignedTo) return false
      if (filterEmployee !== 'UNASSIGNED' && c.assignedTo !== filterEmployee) return false
    }
    if (startDate) {
      const reg = (c.createdAt || '').substring(0, 10)
      if (reg && reg < startDate) return false
    }
    if (endDate) {
      const reg = (c.createdAt || '').substring(0, 10)
      if (reg && reg > endDate) return false
    }
    return true
  })

  // Monthly Counts by Source Breakdown
  const monthsMap = {}
  customers.forEach(c => {
    const month = (c.createdAt || '').substring(0, 7) || 'Unknown'
    if (!monthsMap[month]) {
      monthsMap[month] = { YouTube: 0, Instagram: 0, Referral: 0, Other: 0, converted: 0, total: 0 }
    }
    const src = ['YouTube', 'Instagram', 'Referral'].includes(c.source) ? c.source : 'Other'
    monthsMap[month][src]++
    monthsMap[month].total++
    if (c.leadStatus === 'CONVERTED') {
      monthsMap[month].converted++
    }
  })
  const sortedMonths = Object.keys(monthsMap).sort().reverse()

  // Group commission by Source & Month
  const totalCommBySource = {
    YouTube: commRecords.filter(r => r.source === 'YouTube').reduce((acc, r) => acc + (r.commissionAmountMinor || 0), 0),
    Instagram: commRecords.filter(r => r.source === 'Instagram').reduce((acc, r) => acc + (r.commissionAmountMinor || 0), 0),
    Referral: commRecords.filter(r => r.source === 'Referral').reduce((acc, r) => acc + (r.commissionAmountMinor || 0), 0),
  }

  if (loading) return <SkeletonTable cols={6} rows={6} />

  return (
    <section>
      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <button
          type="button"
          className={`btn sm ${activeTab === 'leads' ? '' : 'ghost'}`}
          onClick={() => setActiveTab('leads')}
        >
          📊 Converted Leads Report
        </button>
        <button
          type="button"
          className={`btn sm ${activeTab === 'monthly' ? '' : 'ghost'}`}
          onClick={() => setActiveTab('monthly')}
        >
          📅 Monthly Counts by Source
        </button>
        <button
          type="button"
          className={`btn sm ${activeTab === 'commission' ? '' : 'ghost'}`}
          onClick={() => setActiveTab('commission')}
        >
          💰 Source Commission & Rates
        </button>
        <button
          type="button"
          className={`btn sm ${activeTab === 'files' ? '' : 'ghost'}`}
          onClick={() => setActiveTab('files')}
        >
          📁 Customer Report Uploads
        </button>
      </div>

      {msg && <p className="ok" style={{ marginBottom: 14 }}>{msg}</p>}

      {/* 1. Converted Leads Report with Full Filtering */}
      {activeTab === 'leads' && (
        <div>
          {/* Summary KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginBottom: 14 }}>
            <div className="card" style={{ padding: '10px 14px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--ink-soft)', textTransform: 'uppercase', fontWeight: 700 }}>Total Leads</span>
              <h3 style={{ margin: '4px 0 0', fontSize: '1.4rem' }}>{customers.length}</h3>
            </div>
            <div className="card" style={{ padding: '10px 14px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--ink-soft)', textTransform: 'uppercase', fontWeight: 700 }}>Converted Leads</span>
              <h3 style={{ margin: '4px 0 0', fontSize: '1.4rem', color: 'var(--orange)' }}>{convertedLeads.length}</h3>
            </div>
            <div className="card" style={{ padding: '10px 14px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--ink-soft)', textTransform: 'uppercase', fontWeight: 700 }}>Filtered Matches</span>
              <h3 style={{ margin: '4px 0 0', fontSize: '1.4rem', color: '#166534' }}>{filteredConvertedLeads.length}</h3>
            </div>
          </div>

          {/* Full Filter Bar: Source, Plan, Employee, Date Range */}
          <div className="card" style={{ marginBottom: 14, padding: '12px 14px', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>Source:</span>
              <select
                style={{ fontSize: '0.76rem', padding: '4px 8px', borderRadius: 6, border: '1px solid var(--o-200)' }}
                value={filterSource}
                onChange={e => setFilterSource(e.target.value)}
              >
                <option value="ALL">All Sources</option>
                <option value="YouTube">YouTube</option>
                <option value="Instagram">Instagram</option>
                <option value="Referral">Referral</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>Plan:</span>
              <select
                style={{ fontSize: '0.76rem', padding: '4px 8px', borderRadius: 6, border: '1px solid var(--o-200)' }}
                value={filterPlan}
                onChange={e => setFilterPlan(e.target.value)}
              >
                <option value="ALL">All Plans</option>
                {plans.map(p => (
                  <option key={p.code} value={p.code}>{p.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>Employee:</span>
              <select
                style={{ fontSize: '0.76rem', padding: '4px 8px', borderRadius: 6, border: '1px solid var(--o-200)' }}
                value={filterEmployee}
                onChange={e => setFilterEmployee(e.target.value)}
              >
                <option value="ALL">All Employees</option>
                <option value="UNASSIGNED">Unassigned</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.fullName}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>From:</span>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                style={{ fontSize: '0.76rem', padding: '3px 6px', borderRadius: 6, border: '1px solid var(--o-200)' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>To:</span>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                style={{ fontSize: '0.76rem', padding: '3px 6px', borderRadius: 6, border: '1px solid var(--o-200)' }}
              />
            </div>

            {(filterSource !== 'ALL' || filterPlan !== 'ALL' || filterEmployee !== 'ALL' || startDate || endDate) && (
              <button
                type="button"
                className="btn sm ghost"
                style={{ padding: '3px 8px', fontSize: '0.74rem' }}
                onClick={() => {
                  setFilterSource('ALL')
                  setFilterPlan('ALL')
                  setFilterEmployee('ALL')
                  setStartDate('')
                  setEndDate('')
                }}
              >
                Reset Filters
              </button>
            )}
          </div>

          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Source</th>
                <th>Selected Plan</th>
                <th>Assigned Owner</th>
                <th>Registered</th>
                <th>Converted On</th>
              </tr>
            </thead>
            <tbody>
              {filteredConvertedLeads.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '24px' }}>No converted leads match this filter.</td></tr>
              ) : (
                filteredConvertedLeads.map(c => (
                  <tr key={c.id}>
                    <td>
                      <strong>{c.fullName}</strong>
                      <br /><small>{c.email}</small>
                    </td>
                    <td>
                      <span className="search-badge" style={{ fontSize: '0.72rem' }}>
                        {c.source || 'Direct'}
                      </span>
                      {c.referralDetails && <div style={{ fontSize: '0.68rem', color: 'var(--ink-soft)' }}>Ref: {c.referralDetails}</div>}
                    </td>
                    <td><strong>{c.selectedPlanName || c.selectedPlan || 'General Consultation'}</strong></td>
                    <td>{c.assignedToName || 'Unassigned'}</td>
                    <td><small>{spokenDate(c.createdAt)}</small></td>
                    <td><small style={{ color: '#166534', fontWeight: 600 }}>{spokenDate(c.convertedAt || c.createdAt)}</small></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 2. Monthly Counts by Source Breakdown */}
      {activeTab === 'monthly' && (
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ margin: '0 0 6px', fontSize: '1rem' }}>📅 Month-by-Month Lead Acquisition & Conversion</h3>
            <p style={{ margin: '0 0 14px', fontSize: '0.78rem', color: 'var(--ink-soft)' }}>
              Breakdown of registered customer leads by channel and monthly conversion outcomes.
            </p>
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>YouTube</th>
                  <th>Instagram</th>
                  <th>Referral</th>
                  <th>Total Leads</th>
                  <th>Converted Leads</th>
                  <th>Conversion %</th>
                </tr>
              </thead>
              <tbody>
                {sortedMonths.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>No monthly records found.</td></tr>
                ) : (
                  sortedMonths.map(m => {
                    const data = monthsMap[m]
                    const convRate = data.total > 0 ? ((data.converted / data.total) * 100).toFixed(1) : '0.0'
                    return (
                      <tr key={m}>
                        <td><strong>{m}</strong></td>
                        <td><span style={{ fontWeight: 600 }}>{data.YouTube}</span></td>
                        <td><span style={{ fontWeight: 600 }}>{data.Instagram}</span></td>
                        <td><span style={{ fontWeight: 600 }}>{data.Referral}</span></td>
                        <td><strong>{data.total}</strong></td>
                        <td><strong style={{ color: '#166534' }}>{data.converted}</strong></td>
                        <td><span className="search-badge" style={{ fontSize: '0.74rem' }}>{convRate}%</span></td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Source-wise Commission & Editable Rates */}
      {activeTab === 'commission' && (
        <div>
          {/* Rate Editor (Admin) */}
          {me.role === 'ADMIN' && (
            <div className="card" style={{ marginBottom: 16 }}>
              <h3 style={{ margin: '0 0 6px', fontSize: '1rem' }}>⚙️ Configure Source Commission Rates</h3>
              <p style={{ margin: '0 0 12px', fontSize: '0.78rem', color: 'var(--ink-soft)' }}>
                Rates apply to future conversions (0% to 100%). Historical commissions retain the exact percentage applied at calculation time.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                {['YouTube', 'Instagram', 'Referral'].map(src => (
                  <div key={src} style={{ background: 'var(--o-50)', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--o-200)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 6 }}>{src}</div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={rateEdits[src] ?? ''}
                        onChange={e => setRateEdits({ ...rateEdits, [src]: e.target.value })}
                        style={{ width: '80px', padding: '4px 6px', fontSize: '0.82rem', borderRadius: 6, border: '1px solid var(--o-200)' }}
                      />
                      <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>%</span>
                      <button
                        type="button"
                        className="btn sm"
                        style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                        onClick={() => handleSaveRate(src)}
                        disabled={savingRate}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Monthly Commission Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginBottom: 14 }}>
            <div className="card" style={{ padding: '10px 14px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--ink-soft)', textTransform: 'uppercase', fontWeight: 700 }}>YouTube Commission</span>
              <h3 style={{ margin: '4px 0 0', fontSize: '1.2rem', color: 'var(--orange)' }}>
                ₹{(totalCommBySource.YouTube / 100).toFixed(2)}
              </h3>
            </div>
            <div className="card" style={{ padding: '10px 14px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--ink-soft)', textTransform: 'uppercase', fontWeight: 700 }}>Instagram Commission</span>
              <h3 style={{ margin: '4px 0 0', fontSize: '1.2rem', color: 'var(--orange)' }}>
                ₹{(totalCommBySource.Instagram / 100).toFixed(2)}
              </h3>
            </div>
            <div className="card" style={{ padding: '10px 14px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--ink-soft)', textTransform: 'uppercase', fontWeight: 700 }}>Referral Commission</span>
              <h3 style={{ margin: '4px 0 0', fontSize: '1.2rem', color: 'var(--orange)' }}>
                ₹{(totalCommBySource.Referral / 100).toFixed(2)}
              </h3>
            </div>
          </div>

          {/* Locked Historical Records */}
          <h4>Locked Commission Calculations</h4>
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Source</th>
                <th>Plan</th>
                <th>Locked Rate</th>
                <th>Commission Amount</th>
                <th>Month</th>
                <th>Calculated Date</th>
              </tr>
            </thead>
            <tbody>
              {commRecords.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>No commission records calculated yet.</td></tr>
              ) : (
                commRecords.map(r => (
                  <tr key={r.id}>
                    <td><strong>{r.customerName}</strong></td>
                    <td><span className="search-badge" style={{ fontSize: '0.72rem' }}>{r.source}</span></td>
                    <td>{r.planName || r.planCode || '—'}</td>
                    <td><strong>{r.appliedRatePercent}%</strong></td>
                    <td style={{ color: 'var(--o-700)', fontWeight: 700 }}>₹{(r.commissionAmountMinor / 100).toFixed(2)}</td>
                    <td>{r.monthKey}</td>
                    <td><small>{spokenDate(r.createdAt)}</small></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. Customer Report Files */}
      {activeTab === 'files' && (
        <div>
          <form onSubmit={upload} className="card" style={{ marginBottom: 20 }}>
            <label>Customer
              <select name="userId" required>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.fullName} · {c.email}</option>)}
              </select>
            </label>
            <label>Title<input name="title" required /></label>
            <label>Fulfill an existing request (optional)<input name="reportId" placeholder="rep_…" /></label>
            <label>File<input name="file" type="file" required /></label>
            <button className="btn" type="submit" style={{ marginTop: 8 }}>Upload to their account</button>
          </form>

          <table>
            <thead><tr><th>Title</th><th>Customer</th><th>Status</th></tr></thead>
            <tbody>
              {reports.length === 0 ? (
                <tr><td colSpan={3} style={{ textAlign: 'center', padding: '20px' }}>No reports uploaded yet.</td></tr>
              ) : (
                reports.map((r) => <tr key={r.id}><td>{r.title}<br /><small>{r.id}</small></td><td>{r.userId}</td><td>{r.status}</td></tr>)
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function Notes() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api('/api/admin/notifications')
      .then((res) => { setRows(res); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <SkeletonTable cols={5} rows={5} />

  return (
    <table>
      <thead><tr><th>Channel</th><th>To</th><th>Subject</th><th>Status</th><th>Detail</th></tr></thead>
      <tbody>
        {rows.length === 0 ? (
          <tr><td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>No notification logs found.</td></tr>
        ) : (
          rows.map((n) => <tr key={n.id}><td>{n.channel}</td><td>{n.toAddr}</td><td>{n.subject}</td><td>{n.status}</td><td>{n.error}</td></tr>)
        )}
      </tbody>
    </table>
  )
}

function Plans() {
  const [data, setData] = useState(null)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(true)
  const [showNewPlanModal, setShowNewPlanModal] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all') // 'all', 'active', 'hidden'

  function load() {
    setLoading(true)
    api('/api/admin/settings')
      .then((res) => { setData(res); setLoading(false) })
      .catch(() => setLoading(false))
  }
  useEffect(load, [])

  if (loading || !data) {
    return (
      <section className="plans-admin-section">
        <div className="skeleton-line" style={{ width: '160px', height: '28px', marginBottom: '14px' }} />
        <div className="plans-cards-grid">
          <SkeletonCard lines={6} />
          <SkeletonCard lines={6} />
        </div>
      </section>
    )
  }

  async function add(e) {
    e.preventDefault()
    setErr(''); setMsg('')
    const form = new FormData(e.target)
    try {
      await api('/api/admin/plans', { method: 'POST', body: planBody(form) })
      setMsg('Plan added successfully.')
      e.target.reset()
      setShowNewPlanModal(false)
      load()
    } catch (ex) { setErr(ex.message) }
  }

  async function save(p, e) {
    e.preventDefault()
    setErr(''); setMsg('')
    const form = new FormData(e.target)
    try {
      await api('/api/admin/plans/' + p.code, { method: 'PUT', body: planBody(form) })
      setMsg(`"${p.name}" updated successfully.`)
      load()
    } catch (ex) { setErr(ex.message) }
  }

  async function toggleActive(p) {
    try {
      await api('/api/admin/plans/' + p.code, { method: 'PUT', body: { active: !p.active } })
      setMsg(p.active ? `"${p.name}" is now hidden.` : `"${p.name}" is now visible.`)
      load()
    } catch (ex) { setErr(ex.message) }
  }

  const filteredPlans = (data.plans || []).filter((p) => {
    if (activeFilter === 'active') return p.active
    if (activeFilter === 'hidden') return !p.active
    return true
  })

  return (
    <section className="plans-admin-section">
      {/* Top Banner / Actions Header */}
      <div className="plans-header-row">
        <div className="plans-header-info">
          <h2 className="plans-main-title">Consultation Plans</h2>
          <p className="plans-main-subtitle">
            Manage your pricing tiers and consultation plans. Changes reflect immediately in user booking.
          </p>
        </div>
        <button
          className="btn plans-create-btn"
          type="button"
          onClick={() => setShowNewPlanModal(true)}
        >
          <span>＋</span> Add New Plan
        </button>
      </div>

      {msg && <p className="ok plans-feedback">{msg}</p>}
      {err && <p className="err plans-feedback">{err}</p>}

      {/* Filter Tabs & Stats Bar */}
      <div className="plans-filter-bar">
        <div className="plans-pills">
          <button
            type="button"
            className={`plan-pill ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All Plans ({data.plans?.length || 0})
          </button>
          <button
            type="button"
            className={`plan-pill ${activeFilter === 'active' ? 'active' : ''}`}
            onClick={() => setActiveFilter('active')}
          >
            Live ({data.plans?.filter(p => p.active).length || 0})
          </button>
          <button
            type="button"
            className={`plan-pill ${activeFilter === 'hidden' ? 'active' : ''}`}
            onClick={() => setActiveFilter('hidden')}
          >
            Hidden ({data.plans?.filter(p => !p.active).length || 0})
          </button>
        </div>
      </div>

      {/* New Plan Slide/Modal */}
      {showNewPlanModal && (
        <div className="modal-backdrop" onClick={() => setShowNewPlanModal(false)}>
          <div className="modal-dialog plan-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Create New Plan</h3>
                <p className="modal-subtitle">Configure pricing, duration and features for the new plan</p>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowNewPlanModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={add} className="plan-form-modal">
              <PlanFields />
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn ghost sm"
                  onClick={() => setShowNewPlanModal(false)}
                >
                  Cancel
                </button>
                <button className="btn sm" type="submit">
                  Publish Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Plans Card Grid */}
      <div className="plans-cards-grid">
        {filteredPlans.map((p) => (
          <form
            key={p.code}
            onSubmit={(e) => save(p, e)}
            className={`plan-item-card ${!p.active ? 'plan-hidden' : ''}`}
          >
            {/* Card Header */}
            <div className="plan-item-header">
              <div className="plan-header-title-box">
                <h3 className="plan-card-name">{p.name || 'Untitled Plan'}</h3>
                <span className="plan-card-code">#{p.code}</span>
              </div>
              <div className="plan-header-badges">
                {p.recommended && <span className="plan-badge rec">⭐ Recommended</span>}
                {p.family && <span className="plan-badge fam">👥 Family</span>}
                <span className={`plan-badge ${p.active ? 'live' : 'draft'}`}>
                  {p.active ? '● Live' : '○ Hidden'}
                </span>
              </div>
            </div>

            {/* Quick Price/Duration Strip */}
            <div className="plan-stats-strip">
              <div className="plan-stat-cell">
                <span className="stat-label">Duration</span>
                <strong className="stat-value">{p.minutes || 60} mins</strong>
              </div>
              <div className="plan-stat-cell">
                <span className="stat-label">India Price</span>
                <strong className="stat-value">₹{p.priceInr?.toLocaleString('en-IN') ?? '0'}</strong>
              </div>
              <div className="plan-stat-cell">
                <span className="stat-label">Global Price</span>
                <strong className="stat-value">${p.priceUsd ?? '0'}</strong>
              </div>
            </div>

            {/* Form Fields Accordion / Body */}
            <div className="plan-item-fields">
              <PlanFields plan={p} />
            </div>

            {/* Card Action Buttons */}
            <div className="plan-card-footer">
              <button className="btn sm plan-save-btn" type="submit">
                💾 Save Changes
              </button>
              <button
                className={`btn sm ghost plan-toggle-btn ${p.active ? 'to-hide' : 'to-show'}`}
                type="button"
                onClick={() => toggleActive(p)}
              >
                {p.active ? 'Hide from Site' : 'Make Live'}
              </button>
            </div>
          </form>
        ))}
      </div>
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
    <div className="plan-form-layout">
      <div className="plan-field-group full-width">
        <label className="field-label">Plan Name</label>
        <input
          name="name"
          required
          placeholder="e.g. Guru Darshina"
          defaultValue={plan?.name || ''}
          className="field-input"
        />
      </div>

      <div className="plan-field-group full-width">
        <label className="field-label">Short Tagline</label>
        <input
          name="tagline"
          placeholder="e.g. A focused first look at the main cusps"
          defaultValue={plan?.tagline || ''}
          className="field-input"
        />
      </div>

      <div className="plan-field-row-3">
        <div className="plan-field-group">
          <label className="field-label">Minutes</label>
          <input
            name="minutes"
            type="number"
            min="15"
            max="480"
            required
            defaultValue={plan?.minutes || 60}
            className="field-input"
          />
        </div>
        <div className="plan-field-group">
          <label className="field-label">Price (INR ₹)</label>
          <input
            name="inr"
            type="number"
            min="0"
            required
            placeholder="500"
            defaultValue={plan?.priceInr ?? ''}
            className="field-input"
          />
        </div>
        <div className="plan-field-group">
          <label className="field-label">Price (USD $)</label>
          <input
            name="usd"
            type="number"
            min="0"
            required
            placeholder="9"
            defaultValue={plan?.priceUsd ?? ''}
            className="field-input"
          />
        </div>
      </div>

      <div className="plan-field-group full-width">
        <label className="field-label">
          What is included <small className="field-help">(one point per line)</small>
        </label>
        <textarea
          name="features"
          rows={4}
          placeholder="• Main cusp analysis&#10;• 30-minute live session on Google Meet"
          defaultValue={(plan?.features || []).join('\n')}
          className="field-textarea"
        />
      </div>

      <div className="plan-checkbox-row">
        <label className="checkbox-custom-label">
          <input
            type="checkbox"
            name="recommended"
            defaultChecked={plan?.recommended}
            className="checkbox-custom-input"
          />
          <span className="checkbox-custom-text">Highlight as Recommended plan</span>
        </label>
        <label className="checkbox-custom-label">
          <input
            type="checkbox"
            name="family"
            defaultChecked={plan?.family}
            className="checkbox-custom-input"
          />
          <span className="checkbox-custom-text">Family Plan (up to 4 people)</span>
        </label>
      </div>
    </div>
  )
}

function Settings() {
  const [data, setData] = useState(null)
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api('/api/admin/settings')
      .then((res) => { setData(res); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading || !data) {
    return (
      <section>
        <SkeletonCard lines={4} />
      </section>
    )
  }

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
