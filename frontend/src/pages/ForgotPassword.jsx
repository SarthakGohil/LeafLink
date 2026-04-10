import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API } from '../context/AuthContext'

/**
 * ForgotPassword — 3-step password reset flow
 *  Step 1: Enter email  → POST /api/auth/forgot-password
 *  Step 2: Enter OTP    → POST /api/auth/reset-password (with new password)
 *  Step 3: Success      → redirect to /login
 */
export default function ForgotPassword() {
  const [step,       setStep]       = useState(1)           // 1 | 2 | 3
  const [email,      setEmail]      = useState('')
  const [otp,        setOtp]        = useState('')
  const [newPass,    setNewPass]    = useState('')
  const [confirmPass,setConfirmPass]= useState('')
  const [showPass,   setShowPass]   = useState(false)
  const [status,     setStatus]     = useState({ msg: '', ok: false })
  const [loading,    setLoading]    = useState(false)
  const [devOtp,     setDevOtp]     = useState(null)   // shown only in dev mode

  const navigate = useNavigate()

  /* ── Step 1: Request OTP ───────────────────────────────────────── */
  const handleRequestOtp = async (e) => {
    e.preventDefault()
    if (!email) { setStatus({ msg: 'Please enter your email address.', ok: false }); return }
    setLoading(true); setStatus({ msg: '', ok: false })
    try {
      const res  = await fetch(`${API}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus({ msg: data.message, ok: true })
        if (data.devOtp) setDevOtp(data.devOtp)   // dev mode only
        setStep(2)
      } else {
        setStatus({ msg: data.error || 'Something went wrong.', ok: false })
      }
    } catch {
      setStatus({ msg: 'Server not reachable. Please try again.', ok: false })
    }
    setLoading(false)
  }

  /* ── Step 2: Verify OTP + set new password ─────────────────────── */
  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (!otp || !newPass || !confirmPass) {
      setStatus({ msg: 'All fields are required.', ok: false }); return
    }
    if (newPass !== confirmPass) {
      setStatus({ msg: 'Passwords do not match.', ok: false }); return
    }
    setLoading(true); setStatus({ msg: '', ok: false })
    try {
      const res  = await fetch(`${API}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword: newPass }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus({ msg: data.message, ok: true })
        setStep(3)
        setTimeout(() => navigate('/login'), 2500)
      } else {
        // Show first validation error or generic error
        const errMsg = data.errors ? data.errors[0].msg : (data.error || 'Reset failed.')
        setStatus({ msg: errMsg, ok: false })
      }
    } catch {
      setStatus({ msg: 'Server not reachable. Please try again.', ok: false })
    }
    setLoading(false)
  }

  /* ── Shared card style ─────────────────────────────────────────── */
  const card = {
    background: '#f5f1ce',
    borderRadius: 16,
    padding: '40px 36px',
    width: '100%',
    maxWidth: 440,
    boxShadow: '0 20px 60px rgba(0,0,0,.3)',
  }
  const wrap = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a4144 0%, #2d6b50 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
  }

  return (
    <main>
      <div style={wrap}>
        <div style={card}>

          {/* ── Logo ── */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <h1 style={{ color: '#1a4144', margin: 0 }}>
              LEAF<span style={{ color: '#5cba7d' }}>LINK</span>
            </h1>
            <p style={{ color: '#666', fontSize: 14, margin: '6px 0 0' }}>
              {step === 1 && 'Reset your password 🔒'}
              {step === 2 && 'Enter OTP & new password 🌿'}
              {step === 3 && 'Password reset! ✅'}
            </p>
          </div>

          {/* ── Step indicator ── */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 28 }}>
            {[1, 2, 3].map(s => (
              <div key={s} style={{
                width: 32, height: 6, borderRadius: 99,
                background: s <= step ? '#5cba7d' : '#ccc',
                transition: 'background .3s',
              }} />
            ))}
          </div>

          {/* ── STEP 1: Email ── */}
          {step === 1 && (
            <form onSubmit={handleRequestOtp} noValidate>
              <p style={{ color: '#555', fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
                Enter the email address linked to your account. We'll send you a one-time password (OTP) to reset your password.
              </p>
              <div style={{ marginBottom: 20 }}>
                <label className="ll-label">Email Address</label>
                <input
                  className="ll-input"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  autoFocus
                />
              </div>

              {status.msg && (
                <p className="ll-status" style={{ color: status.ok ? '#2d6b50' : '#c0392b' }}>
                  {status.msg}
                </p>
              )}

              <button className="ll-btn" type="submit" disabled={loading}>
                {loading ? 'Sending OTP…' : 'Send OTP →'}
              </button>
            </form>
          )}

          {/* ── STEP 2: OTP + New Password ── */}
          {step === 2 && (
            <form onSubmit={handleResetPassword} noValidate>
              <p style={{ color: '#555', fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
                An OTP was sent to <strong>{email}</strong>. Enter it below along with your new password.
              </p>

              {/* Dev mode OTP hint */}
              {devOtp && (
                <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13 }}>
                  🛠️ <strong>Dev Mode OTP:</strong> {devOtp}
                  <br /><span style={{ color: '#888' }}>(Email not configured — OTP shown here in dev mode only)</span>
                </div>
              )}

              <div style={{ marginBottom: 16 }}>
                <label className="ll-label">OTP Code</label>
                <input
                  className="ll-input"
                  type="text"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  placeholder="6-digit OTP"
                  maxLength={6}
                  style={{ letterSpacing: 6, fontSize: 20, textAlign: 'center' }}
                  autoFocus
                />
              </div>

              <div style={{ marginBottom: 16, position: 'relative' }}>
                <label className="ll-label">New Password</label>
                <input
                  className="ll-input"
                  type={showPass ? 'text' : 'password'}
                  value={newPass}
                  onChange={e => setNewPass(e.target.value)}
                  placeholder="Min 8 chars, 1 uppercase, 1 number, 1 special"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  style={{ position: 'absolute', right: 12, top: 34, background: 'none', border: 'none', cursor: 'pointer', color: '#1a4144' }}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label className="ll-label">Confirm New Password</label>
                <input
                  className="ll-input"
                  type={showPass ? 'text' : 'password'}
                  value={confirmPass}
                  onChange={e => setConfirmPass(e.target.value)}
                  placeholder="Re-enter new password"
                />
              </div>

              {status.msg && (
                <p className="ll-status" style={{ color: status.ok ? '#2d6b50' : '#c0392b' }}>
                  {status.msg}
                </p>
              )}

              <button className="ll-btn" type="submit" disabled={loading}>
                {loading ? 'Resetting…' : 'Reset Password →'}
              </button>

              <p style={{ textAlign: 'center', marginTop: 14, fontSize: 13, color: '#888' }}>
                Didn't receive OTP?{' '}
                <button
                  type="button"
                  onClick={() => { setStep(1); setStatus({ msg: '', ok: false }); setDevOtp(null) }}
                  style={{ background: 'none', border: 'none', color: '#5cba7d', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}
                >
                  Resend
                </button>
              </p>
            </form>
          )}

          {/* ── STEP 3: Success ── */}
          {step === 3 && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
              <h3 style={{ color: '#1a4144', marginBottom: 8 }}>Password Reset!</h3>
              <p style={{ color: '#555', fontSize: 14 }}>
                Your password has been reset successfully.<br />
                Redirecting you to login…
              </p>
              {status.msg && (
                <p style={{ color: '#2d6b50', fontWeight: 600, marginTop: 12 }}>{status.msg}</p>
              )}
            </div>
          )}

          {/* ── Back to login ── */}
          {step !== 3 && (
            <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14 }}>
              Remember your password?{' '}
              <Link to="/login" style={{ color: '#5cba7d', fontWeight: 700 }}>Log in</Link>
            </p>
          )}

        </div>
      </div>
    </main>
  )
}
