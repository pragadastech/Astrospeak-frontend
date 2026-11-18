import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import Brand from './Brand'

export default function Nav({ user }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <>
      <header className={scrolled ? 'nav scrolled' : 'nav'}>
        <div className="wrap nav-wrap">
          <Brand onClick={() => setOpen(false)} />
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

      {/* Mobile Menu Dropdown & Backdrop */}
      {open && (
        <div className="mobile-nav-layer">
          <div className="mobile-nav-backdrop" onClick={() => setOpen(false)} />
          <div className="mobile-nav-panel">
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
