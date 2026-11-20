import { useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import Brand from './Brand'
import { api } from '../api'

// Fallback plans if backend api is down or empty
const FALLBACK_PLANS = [
  {
    code: 'PLAN1',
    name: 'Plan 1 — Chart Reading',
    tagline: 'A focused first look at the main cusps.',
    features: ['Main cusp analysis', '30-minute live session on Google Meet', 'Short written summary'],
  },
  {
    code: 'PLAN2',
    name: 'Guru Dakshina (In-depth Guidance)',
    tagline: 'A long live session with remedies.',
    features: ['1 hour 30 minute live session on Google Meet', 'In-depth analysis', 'Remedies and guidance'],
    recommended: true,
  },
  {
    code: 'PLAN3',
    name: 'Plan 3 — Full Birth Chart',
    tagline: 'The whole chart, relationships, and monthly questions.',
    features: ['Full birth chart analysis', '1 hour 30 minute consultation', 'Relationship analysis', '2 queries every month'],
  },
  {
    code: 'FAMILY',
    name: 'Family Pack Consultation',
    tagline: 'Four people, one in-depth live session.',
    features: ['Up to 4 family members', 'Main cusp analysis for each member', '1 hour 30 min in-depth live session'],
  },
  {
    code: 'CORPORATE',
    name: 'Corporate Cosmic Analysis',
    tagline: 'For a founder or a team.',
    features: ['Timing windows for launch/hire', 'Live session on Google Meet', 'Remedies and practical guidance'],
  },
]

const STATIC_TOPICS = [
  {
    title: 'Grahas (9 Planetary Influences)',
    path: '/#stat-grahas',
    desc: 'Surya, Chandra, Mangala, Budha, Guru, Shukra, Shani, Rahu, Ketu in Vedic astrology',
    category: 'Vedic Knowledge',
    badge: 'Grahas',
    keywords: ['grahas', 'graha', 'navagraha', 'planets', 'surya', 'chandra', 'mangala', 'budha', 'guru', 'shukra', 'shani', 'rahu', 'ketu', '9 grahas']
  },
  {
    title: 'Nakshatras (27 Lunar Mansions)',
    path: '/#stat-nakshatras',
    desc: 'Explore 27 Nakshatras from Ashwini to Revati and stellar alignments',
    category: 'Vedic Knowledge',
    badge: 'Nakshatra',
    keywords: ['nakshatra', 'nakshatras', 'ashwini', 'bharani', 'krittika', 'rohini', '27 nakshatras']
  },
  {
    title: 'Rashis (12 Zodiac Signs)',
    path: '/#stat-rashis',
    desc: 'The 12 Vedic Rashis from Mesha to Meena and sidereal house calculations',
    category: 'Vedic Knowledge',
    badge: 'Rashi',
    keywords: ['rashi', 'rashis', 'zodiac', 'mesha', 'vrishabha', 'mithuna', '12 rashis']
  },
  {
    title: 'Plans & Pricing',
    path: '/pricing',
    desc: 'Explore all Vedic astrology consultation packages, pricing and recommended plans',
    category: 'Pages',
    badge: 'Pricing',
    keywords: ['pricing', 'price', 'rates', 'plans', 'cost', 'fee', 'rupees', 'usd', 'package', 'packages']
  },
  {
    title: 'Vedic Chart Reading',
    path: '/#start',
    desc: 'Sidereal positions, nakshatras, cusps, Dasha analysis & your birth chart',
    category: 'Services',
    badge: 'Chart',
    keywords: ['vedic chart', 'chart', 'reading', 'horoscope', 'kundali', 'birth chart', 'dasha']
  },
  {
    title: 'Daily Wishes & Questions',
    path: '/#future',
    desc: 'Specific query consultation, remedies, and future guidance with astrologer',
    category: 'Services',
    badge: 'Guidance',
    keywords: ['wishes', 'future', 'questions', 'remedies', 'consultation', 'daily wishes']
  },
]

export default function Nav({ user }) {
  const nav = useNavigate()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [plans, setPlans] = useState(FALLBACK_PLANS)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    api('/api/plans')
      .then((d) => {
        if (d.plans && d.plans.length > 0) {
          setPlans(d.plans)
        }
      })
      .catch(() => {})
  }, [])

  const query = searchQuery.trim().toLowerCase()

  const filteredPlans = query
    ? plans.filter((p) => {
        const nameMatch = (p.name || '').toLowerCase().includes(query)
        const taglineMatch = (p.tagline || '').toLowerCase().includes(query)
        const codeMatch = (p.code || '').toLowerCase().includes(query)
        const featureMatch = (p.features || []).some((f) => f.toLowerCase().includes(query))
        return nameMatch || taglineMatch || codeMatch || featureMatch
      })
    : []

  const filteredTopics = query
    ? STATIC_TOPICS.filter((t) => {
        const titleMatch = t.title.toLowerCase().includes(query)
        const descMatch = t.desc.toLowerCase().includes(query)
        const kwMatch = (t.keywords || []).some((k) => k.includes(query) || query.includes(k))
        return titleMatch || descMatch || kwMatch
      })
    : []

  function highlightAndScroll(targetId) {
    setTimeout(() => {
      const el = document.getElementById(targetId)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el.classList.remove('search-highlight-target')
        // Force reflow
        void el.offsetWidth
        el.classList.add('search-highlight-target')
        setTimeout(() => {
          el.classList.remove('search-highlight-target')
        }, 3000)
      }
    }, 120)
  }

  function handleSelect(path) {
    setSearchOpen(false)
    setSearchQuery('')
    setOpen(false)

    if (path.startsWith('/#')) {
      const hashId = path.substring(2)
      if (location.pathname !== '/') {
        nav('/')
        setTimeout(() => {
          highlightAndScroll(hashId)
        }, 200)
      } else {
        window.location.hash = hashId
        highlightAndScroll(hashId)
      }
    } else {
      nav(path)
      if (path === '/pricing') {
        highlightAndScroll('pricing-section')
      }
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      setSearchOpen(false)
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      // Auto-navigate to first match if available
      if (filteredTopics.length > 0) {
        handleSelect(filteredTopics[0].path)
      } else if (filteredPlans.length > 0) {
        handleSelect('/pricing')
      } else if (query.includes('price') || query.includes('pricing') || query.includes('plan')) {
        handleSelect('/pricing')
      } else if (query.includes('graha') || query.includes('grahas')) {
        handleSelect('/#stat-grahas')
      }
    }
  }

  return (
    <>
      <header className={scrolled ? 'nav scrolled' : 'nav'}>
        <div className="wrap nav-wrap">
          <Brand onClick={() => { setOpen(false); setSearchOpen(false); }} />
          
          <div className="nav-center-search">
            <button
              type="button"
              className="nav-search-trigger"
              onClick={() => setSearchOpen(true)}
              aria-label="Search content or services"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span>Search services, plans, charts…</span>
              <kbd>/</kbd>
            </button>
          </div>

          <button
            className="burger"
            type="button"
            aria-label="Toggle Menu"
            aria-expanded={open}
            onClick={() => setOpen((prev) => !prev)}
          >
            {open ? '✕' : '☰'}
          </button>

          {/* Desktop links */}
          <div className="desktop-nav">
            <ul className="nav-links">
              <li><NavLink to="/pricing">Plans</NavLink></li>
              {user ? (
                <li><NavLink to={user.role === 'CLIENT' ? '/app' : '/admin'}>Portal</NavLink></li>
              ) : (
                <li><NavLink to="/login">Sign in</NavLink></li>
              )}
              {!user && <li><a href="/#start">Get guidance</a></li>}
            </ul>
          </div>
        </div>
      </header>

      {/* Global Search Dialog Modal */}
      {searchOpen && (
        <div className="search-modal-layer">
          <div className="search-modal-backdrop" onClick={() => setSearchOpen(false)} />
          <div className="search-modal-dialog">
            <div className="search-input-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="search"
                autoFocus
                placeholder="Search plans, services, Grahas, pricing..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button type="button" className="search-close-btn" onClick={() => setSearchOpen(false)}>Esc</button>
            </div>

            <div className="search-results-list">
              {searchQuery.trim() === '' ? (
                <div className="search-suggestions">
                  <p className="search-cat-title">Suggested Searches</p>
                  <div className="search-chips">
                    <button type="button" onClick={() => setSearchQuery('Grahas')}>🪐 9 Grahas</button>
                    <button type="button" onClick={() => setSearchQuery('Pricing')}>💎 Pricing & Plans</button>
                    <button type="button" onClick={() => setSearchQuery('Guru')}>Guru Dakshina</button>
                    <button type="button" onClick={() => setSearchQuery('Nakshatras')}>27 Nakshatras</button>
                    <button type="button" onClick={() => setSearchQuery('Chart')}>Vedic Chart</button>
                  </div>
                </div>
              ) : (
                <>
                  {filteredPlans.length === 0 && filteredTopics.length === 0 && (
                    <div className="search-empty-box">
                      <p className="search-empty">No results matching "{searchQuery}"</p>
                      <button
                        type="button"
                        className="btn ghost search-quick-btn"
                        onClick={() => handleSelect(query.includes('price') || query.includes('plan') ? '/pricing' : '/#start')}
                      >
                        Explore {query.includes('price') || query.includes('plan') ? 'Pricing Plans' : 'Vedic Guidance'}
                      </button>
                    </div>
                  )}

                  {filteredTopics.length > 0 && (
                    <div className="search-group">
                      <p className="search-cat-title">Vedic Knowledge & Pages</p>
                      {filteredTopics.map((t) => (
                        <div
                          key={t.title}
                          className="search-item"
                          onClick={() => handleSelect(t.path)}
                        >
                          <div className="search-item-info">
                            <strong>{t.title}</strong>
                            <span>{t.desc}</span>
                          </div>
                          <span className="search-badge">{t.badge || 'Topic'}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {filteredPlans.length > 0 && (
                    <div className="search-group">
                      <p className="search-cat-title">Plans & Consultations</p>
                      {filteredPlans.map((p) => (
                        <div
                          key={p.code}
                          className="search-item"
                          onClick={() => handleSelect('/pricing')}
                        >
                          <div className="search-item-info">
                            <strong>{p.name}</strong>
                            <span>{p.tagline || (p.features && p.features.join(', '))}</span>
                          </div>
                          <span className="search-badge">Plan</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Dropdown & Backdrop */}
      {open && (
        <div className="mobile-nav-layer">
          <div className="mobile-nav-backdrop" onClick={() => setOpen(false)} />
          <div className="mobile-nav-panel">
            <button
              type="button"
              className="mobile-search-btn"
              onClick={() => { setOpen(false); setSearchOpen(true); }}
            >
              🔍 Search content, plans, guidance...
            </button>
            <ul className="mobile-nav-list" onClick={() => setOpen(false)}>
              <li>
                <NavLink to="/pricing" className="mobile-nav-item">
                  <span>💎 Plans & Pricing</span>
                </NavLink>
              </li>
              <li>
                {user ? (
                  <NavLink to={user.role === 'CLIENT' ? '/app' : '/admin'} className="mobile-nav-item">
                    <span>👤 Your Portal</span>
                  </NavLink>
                ) : (
                  <NavLink to="/login" className="mobile-nav-item">
                    <span>🔑 Sign in</span>
                  </NavLink>
                )}
              </li>
              {!user && (
                <li>
                  <a href="/#start" className="mobile-nav-item highlight">
                    <span>✨ Get Guidance</span>
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </>
  )
}
