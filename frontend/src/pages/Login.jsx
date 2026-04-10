import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth, API } from '../context/AuthContext'

/**
 * Login — STATEFUL page component
 * Manages: form state, loading, error/status messages.
 * Calls POST /api/auth/login → stores JWT in AuthContext.
 */
export default function Login() {
  const [form,    setForm]    = useState({ email: '', password: '' })
  const [status,  setStatus]  = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const { login } = useAuth()
  const navigate   = useNavigate()

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) { setStatus('Please enter email and password.'); return }
    setLoading(true); setStatus('')
    try {
      const res  = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        login(data.user, data.token)
        navigate('/profile')
      } else {
        setStatus(data.error || 'Login failed.')
        // If email not verified
        if (data.requiresOtp) navigate('/register')
      }
    } catch { setStatus('Server not reachable.') }
    setLoading(false)
  }

  return (
    <main>
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a4144 0%, #2d6b50 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ background: '#f5f1ce', borderRadius: 16, padding: '40px 36px', width: '100%', maxWidth: 440, boxShadow: '0 20px 60px rgba(0,0,0,.3)' }}>

          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h1 style={{ color: '#1a4144', margin: 0 }}>LEAF<span style={{ color: '#5cba7d' }}>LINK</span></h1>
            <p style={{ color: '#666', fontSize: 14, margin: '6px 0 0' }}>Welcome back 🌿</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ marginBottom: 16 }}>
              <label className="ll-label">Email Address</label>
              <input className="ll-input" name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com" />
            </div>

            <div style={{ marginBottom: 20, position: 'relative' }}>
              <label className="ll-label">Password</label>
              <input className="ll-input" name="password" type={showPass ? 'text' : 'password'} value={form.password} onChange={handleChange} placeholder="Enter password" />
              <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: 12, top: 34, background: 'none', border: 'none', cursor: 'pointer', color: '#1a4144' }}>
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>

            <div style={{ textAlign: 'right', marginTop: -12, marginBottom: 16 }}>
              <Link to="/forgot-password" style={{ color: '#5cba7d', fontSize: 13, fontWeight: 600 }}>
                Forgot password?
              </Link>
            </div>

            {status && <p className="ll-status" style={{ color: '#c0392b' }}>{status}</p>}

            <button className="ll-btn" type="submit" disabled={loading}>
              {loading ? 'Logging in…' : 'Login →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#5cba7d', fontWeight: 700 }}>Register</Link>
          </p>
        </div>
      </div>
    </main>
  )
}
