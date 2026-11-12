import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

export function Stage() {
  const { pathname } = useLocation()
  const [curtain, setCurtain] = useState('in')
  const canvas = useRef(null)
  const glow = useRef(null)

  useEffect(() => {
    setCurtain('in')
    const t = setTimeout(() => setCurtain('gone'), 900)
    return () => clearTimeout(t)
  }, [pathname])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const cv = canvas.current
    const ctx = cv.getContext('2d')
    let w, h, pts, frame
    const resize = () => {
      w = cv.width = window.innerWidth
      h = cv.height = window.innerHeight
      pts = Array.from({ length: Math.min(45, Math.floor((w * h) / 30000)) }, () => ({
        x: Math.random() * w, y: Math.random() * h, r: Math.random() * 2 + 0.6,
        vy: -(Math.random() * 0.3 + 0.08), vx: (Math.random() - 0.5) * 0.15, p: Math.random() * 6.28,
      }))
    }
    resize()
    window.addEventListener('resize', resize)
    const loop = () => {
      if (!document.hidden) {
        ctx.clearRect(0, 0, w, h)
        for (const s of pts) {
          s.y += s.vy
          s.x += s.vx
          s.p += 0.03
          if (s.y < -10) { s.y = h + 10; s.x = Math.random() * w }
          ctx.globalAlpha = 0.3 + Math.sin(s.p) * 0.25
          ctx.fillStyle = '#f97316'
          ctx.beginPath()
          ctx.arc(s.x, s.y, s.r, 0, 6.283)
          ctx.fill()
        }
      }
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    const move = (e) => {
      if (!glow.current) return
      glow.current.style.left = e.clientX + 'px'
      glow.current.style.top = e.clientY + 'px'
    }
    window.addEventListener('pointermove', move)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', move)
    }
  }, [])

  return (
    <>
      <canvas id="stars" ref={canvas} />
      <div className="cursor-glow" ref={glow} />
      {curtain !== 'gone' && (
        <>
          <div className="curtain-logo"><div>Astrology Talk</div></div>
          <div className="curtain"><span /><span /><span /><span /><span /></div>
        </>
      )}
    </>
  )
}

export function Reveal({ className = '', delay = 0, children, as: Tag = 'div' }) {
  const ref = useRef(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setOn(true); io.disconnect() }
    }, { threshold: 0.12 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return <Tag ref={ref} className={`reveal ${className} ${on ? 'in' : ''}`} style={{ transitionDelay: delay + 'ms' }}>{children}</Tag>
}

export function useTyped(words) {
  const [text, setText] = useState(words[0])
  useEffect(() => {
    let wi = 0
    let ci = words[0].length
    let del = true
    const id = setInterval(() => {
      if (del) {
        ci -= 1
        if (ci <= 0) { del = false; wi = (wi + 1) % words.length }
      } else {
        ci += 1
        if (ci >= words[wi].length) setTimeout(() => { del = true }, 1400)
      }
      setText(words[wi].slice(0, Math.max(ci, 0)) || '\u00a0')
    }, 110)
    return () => clearInterval(id)
  }, [words])
  return text
}

export function Count({ to }) {
  const [n, setN] = useState(0)
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let started = false
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || started) return
      started = true
      const t0 = performance.now()
      const run = (now) => {
        const p = Math.min(1, (now - t0) / 900)
        setN(Math.round(to * (1 - Math.pow(1 - p, 3))))
        if (p < 1) requestAnimationFrame(run)
      }
      requestAnimationFrame(run)
      io.disconnect()
    }, { threshold: 0.4 })
    io.observe(el)
    return () => io.disconnect()
  }, [to])
  return <b ref={ref}>{n}</b>
}

export function tilt(e) {
  const card = e.currentTarget
  const r = card.getBoundingClientRect()
  const x = (e.clientX - r.left) / r.width - 0.5
  const y = (e.clientY - r.top) / r.height - 0.5
  card.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-8px)`
}
export function untilt(e) { e.currentTarget.style.transform = '' }
