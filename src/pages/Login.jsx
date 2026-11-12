import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'

export default function Login() {
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  async function submit(e) {
    e.preventDefault()
    setErr('')
    try {
      const user = await api('/api/auth/login', { method: 'POST', body: { email, password } })
      nav(user.role === 'CLIENT' ? '/app' : '/admin')
    } catch (ex) { setErr(ex.message) }
  }
  return (
    <div className="auth-page">
      <div className="auth-art"><div><h1>Astrology Talk</h1><p>Sign in to your chart, your family profiles, and your reports.</p></div></div>
      <div className="auth-form">
        <form className="login-card" onSubmit={submit}>
          <h2>Sign in</h2>
          {err && <p className="err">{err}</p>}
          <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" /></label>
          <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" /></label>
          <button className="btn" type="submit">Sign in</button>
          <p className="foot">New here? <Link to="/#start">Check your scientific chart</Link></p>
        </form>
      </div>
    </div>
  )
}
