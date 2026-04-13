import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth, API } from '../context/AuthContext'

/**
 * Register — STATEFUL page component (2-step: form → OTP → success)
 * Step 1: name / email / password form → POST /api/auth/register → OTP sent
 * Step 2: 6-digit OTP input → POST /api/auth/verify-otp → JWT issued
 */
export default function Register() {
  const [step,    setStep]    = useState(1)   // 1 = form, 2 = OTP
  const [form,    setForm]    = useState({ name: '', email: '', password: '', confirm: '' })
  const [otp,     setOtp]     = useState('')
  const [pendingEmail, setPendingEmail] = useState('')
  const [errors,  setErrors]  = useState({})
  const [status,  setStatus]  = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const { login } = useAuth()
  const navigate   = useNavigate()

  const validateStep1 = () => {
    const e = {}
    if (!form.name.trim())                          e.name    = 'Name is required.'
    if (!/^\S+@\S+\.\S+$/.test(form.email))         e.email   = 'Enter a valid email.'
    // Collect password errors — show FIRST failing condition only
    if (form.password.length < 8)                   e.password = 'Min 8 characters.'
    else if (!/[A-Z]/.test(form.password))          e.password = 'Must include uppercase letter.'
    else if (!/[0-9]/.test(form.password))          e.password = 'Must include a number.'
    else if (!/[^A-Za-z0-9]/.test(form.password))   e.password = 'Must include a special character.'
    if (form.password !== form.confirm)              e.confirm  = 'Passwords do not match.'
    return e
  }

  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    setErrors(er => ({ ...er, [name]: '' }))
  }

  /* Step 1 — Submit registration */
  const handleRegister = async (e) => {
    e.preventDefault()
    const errs = validateStep1()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true); setStatus('')
    try {
      const res  = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      })
      const data = await res.json()
      if (res.ok) {
        setPendingEmail(form.email)
        setStep(2)
        setStatus(data.message)
      } else {
        const msg = data.errors ? data.errors.map(e => e.msg).join(' ') : data.error
        setStatus(msg)
      }
    } catch { setStatus('Server not reachable. Is the backend running?') }
    setLoading(false)
  }

  /* Step 2 — Verify OTP */
  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    if (otp.length !== 6) { setErrors({ otp: 'Enter the 6-digit OTP.' }); return }
    setLoading(true); setStatus('')
    try {
      const res  = await fetch(`${API}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingEmail, otp, type: 'registration' }),
      })
      const data = await res.json()
      if (res.ok) {
        login(data.user, data.token)
        navigate('/profile')
      } else {
        setStatus(data.error)
      }
    } catch { setStatus('Verification failed.') }
    setLoading(false)
  }

  /* Resend OTP */
  const resendOTP = async () => {
    try {
      const res  = await fetch(`${API}/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingEmail, type: 'registration' }),
      })
      const data = await res.json()
      setStatus(data.message || data.error)
    } catch { setStatus('Could not resend. Try again.') }
  }

  return (
    <main>
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a4144 0%, #2d6b50 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ background: '#f5f1ce', borderRadius: 16, padding: '40px 36px', width: '100%', maxWidth: 460, boxShadow: '0 20px 60px rgba(0,0,0,.3)' }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <h1 style={{ color: '#1a4144', margin: 0 }}>LEAF<span style={{ color: '#5cba7d' }}>LINK</span></h1>
            <p style={{ color: '#666', fontSize: 14, margin: 0 }}>Create your account</p>
          </div>

          {/* Progress indicator */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
            {['Account Details', 'Verify Email'].map((s, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{
                  height: 4, borderRadius: 2, marginBottom: 6,
                  background: step > i ? '#5cba7d' : '#ccc',
                  transition: 'background .3s',
                }} />
                <span style={{ fontSize: 11, color: step > i ? '#5cba7d' : '#999', fontWeight: 600 }}>{s}</span>
              </div>
            ))}
          </div>

          {/* ── Step 1: Registration form ── */}
          {step === 1 && (
            <form onSubmit={handleRegister} noValidate>
              {[
                { label: 'Full Name',        name: 'name',     type: 'text',     placeholder: 'John Doe' },
                { label: 'Email Address',    name: 'email',    type: 'email',    placeholder: 'john@example.com' },
              ].map(({ label, name, type, placeholder }) => (
                <div key={name} style={{ marginBottom: 16 }}>
                  <label className="ll-label">{label}</label>
                  <input className="ll-input" name={name} type={type} value={form[name]} onChange={handleChange} placeholder={placeholder} />
                  {errors[name] && <span className="ll-err">{errors[name]}</span>}
                </div>
              ))}

              <div style={{ marginBottom: 16, position: 'relative' }}>
                <label className="ll-label">Password</label>
                <input className="ll-input" name="password" type={showPass ? 'text' : 'password'} value={form.password} onChange={handleChange} placeholder="Min 8 chars, uppercase, number, symbol" />
                <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: 12, top: 34, background: 'none', border: 'none', cursor: 'pointer', color: '#1a4144' }}>
                  {showPass ? '🙈' : '👁️'}
                </button>
                {errors.password && <span className="ll-err">{errors.password}</span>}
              </div>

              <div style={{ marginBottom: 20 }}>
                <label className="ll-label">Confirm Password</label>
                <input className="ll-input" name="confirm" type="password" value={form.confirm} onChange={handleChange} placeholder="Re-enter password" />
                {errors.confirm && <span className="ll-err">{errors.confirm}</span>}
              </div>

              {status && <p className="ll-status" style={{ color: '#c0392b' }}>{status}</p>}

              <button className="ll-btn" type="submit" disabled={loading}>
                {loading ? 'Sending OTP…' : 'Create Account →'}
              </button>

              <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14 }}>
                Already have an account? <Link to="/login" style={{ color: '#5cba7d', fontWeight: 700 }}>Login</Link>
              </p>
            </form>
          )}

          {/* ── Step 2: OTP verification ── */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP}>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ fontSize: 48 }}>📧</div>
                <p style={{ color: '#1a4144', fontWeight: 600 }}>OTP sent to</p>
                <p style={{ color: '#5cba7d', fontWeight: 800, fontSize: '1.1rem' }}>{pendingEmail}</p>
                <p style={{ color: '#666', fontSize: 13 }}>Check your inbox (and spam folder). Valid for 10 minutes.</p>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label className="ll-label" style={{ textAlign: 'center', display: 'block' }}>Enter 6-Digit OTP</label>
                <input
                  className="ll-input"
                  type="text" inputMode="numeric" maxLength={6}
                  value={otp} onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); setErrors({}) }}
                  placeholder="• • • • • •"
                  style={{ textAlign: 'center', fontSize: '1.8rem', fontWeight: 800, letterSpacing: 12 }}
                />
                {errors.otp && <span className="ll-err">{errors.otp}</span>}
              </div>

              {status && <p className="ll-status" style={{ color: status.includes('sent') ? '#27ae60' : '#c0392b' }}>{status}</p>}

              <button className="ll-btn" type="submit" disabled={loading}>
                {loading ? 'Verifying…' : 'Verify OTP ✓'}
              </button>

              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <button type="button" onClick={resendOTP} style={{ background: 'none', border: 'none', color: '#5cba7d', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
                  Resend OTP
                </button>
                <span style={{ color: '#999', margin: '0 8px' }}>|</span>
                <button type="button" onClick={() => { setStep(1); setOtp(''); setStatus('') }} style={{ background: 'none', border: 'none', color: '#1a4144', cursor: 'pointer', fontSize: 14 }}>
                  ← Change email
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}
