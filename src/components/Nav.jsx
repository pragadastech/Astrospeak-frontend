import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import Brand from './Brand'
import { api } from '../api'

export default function Nav({ user }) {
  const nav = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [plans, setPlans] = useState([])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    api('/api/plans').then((d) => setPlans(d.plans || [])).catch(() => {})
  }, [])

  const staticServices = [
    { title: 'Vedic Chart Reading', path: '/#start', desc: 'Sidereal positions, nakshatras, cusps & Dasha' },
    { title: 'Daily Wishes & Questions', path: '/#future', desc: 'Specific query consultation & astrological remedies' },
    { title: 'Family Pack Consultation', path: '/pricing', desc: 'Complete chart reading for up to 4 family members' },
    { title: 'Nakshatras & Rashis', path: '/#start', desc: 'Explore 27 Nakshatras and planetary influences' },
  ]

  const filteredPlans = searchQuery.trim()
    ? plans.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.tagline && p.tagline.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : []

  const filteredServices = searchQuery.trim()
    ? staticServices.filter((s) =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.desc.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : []

  function handleSelect(path) {
    setSearchOpen(false)
    setSearchQuery('')
    setOpen(false)
    if (path.startsWith('/#')) {
      const hash = path.substring(1)
      window.location.hash = hash
      const el = document.getElementById(hash.replace('#', ''))
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    } else {
      nav(path)
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
                placeholder="Search plans, services, Vedic charts, guidance..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setSearchOpen(false)
                }}
              />
              <button type="button" className="search-close-btn" onClick={() => setSearchOpen(false)}>Esc</button>
            </div>

            <div className="search-results-list">
              {searchQuery.trim() === '' ? (
                <div className="search-suggestions">
                  <p className="search-cat-title">Suggested Searches</p>
                  <div className="search-chips">
                    <button type="button" onClick={() => setSearchQuery('Guru')}>Guru Darshina</button>
                    <button type="button" onClick={() => setSearchQuery('Chart')}>Vedic Chart</button>
                    <button type="button" onClick={() => setSearchQuery('Family')}>Family Pack</button>
                    <button type="button" onClick={() => setSearchQuery('Wishes')}>Daily Wishes</button>
                  </div>
                </div>
              ) : (
                <>
                  {filteredPlans.length === 0 && filteredServices.length === 0 && (
                    <p className="search-empty">No results matching "{searchQuery}"</p>
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

                  {filteredServices.length > 0 && (
                    <div className="search-group">
                      <p className="search-cat-title">Services & Guidance</p>
                      {filteredServices.map((s) => (
                        <div
                          key={s.title}
                          className="search-item"
                          onClick={() => handleSelect(s.path)}
                        >
                          <div className="search-item-info">
                            <strong>{s.title}</strong>
                            <span>{s.desc}</span>
                          </div>
                          <span className="search-badge">Service</span>
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
