import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

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
    <header className={scrolled ? 'nav scrolled' : 'nav'}>
      <div className="wrap">
        <Link className="brand" to="/" onClick={() => setOpen(false)}><span className="logo"><span>☀</span></span> Astrology Talk</Link>
        <button className="burger" type="button" aria-label="Menu" onClick={() => setOpen((v) => !v)}>☰</button>
        <nav>
          <ul className={open ? 'nav-links open' : 'nav-links'} onClick={() => setOpen(false)}>
            <li><NavLink to="/pricing">Plans</NavLink></li>
            {user ? <li><NavLink to={user.role === 'CLIENT' ? '/app' : '/admin'}>Portal</NavLink></li> : <li><NavLink to="/login">Sign in</NavLink></li>}
            {!user && <li><a href="/#start">Check your chart</a></li>}
          </ul>
        </nav>
      </div>
    </header>
  )
}
