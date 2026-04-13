import { useState } from 'react'

const API = import.meta.env.VITE_API_URL || '/api'

/**
 * FormValidator — OOJS utility class used by the React component.
 * Encapsulates field validation rules and error state.
 * Demonstrates OOJS design patterns inside a React stateful component.
 */
class FormValidator {
  constructor() { this.errors = {} }

  validate({ fullName, email, phone, coverLetter }) {
    this.errors = {}
    if (!fullName || fullName.trim().length < 2)
      this.errors.fullName = 'Full name must be at least 2 characters.'
    if (!email || !/^\S+@\S+\.\S+$/.test(email))
      this.errors.email = 'Please enter a valid email address.'
    if (!phone || !/^[\d\s\+\-\(\)]{7,20}$/.test(phone))
      this.errors.phone = 'Please enter a valid phone number.'
    if (!coverLetter || coverLetter.trim().length < 50)
      this.errors.coverLetter = 'Cover letter must be at least 50 characters.'
    return Object.keys(this.errors).length === 0
  }

  getErrors() { return this.errors }
}

const validator = new FormValidator()

/**
 * JobForm — STATEFUL page component
 * Manages: form field state, validation errors, loading, status message.
 * Uses FormValidator OOJS class for field-level validation.
 * Calls POST /api/jobs/apply on the Express REST API.
 */
export default function JobForm() {
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', coverLetter: '',
  })
  const [errors,  setErrors]  = useState({})
  const [status,  setStatus]  = useState('')
  const [isError, setIsError] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    setErrors(er => ({ ...er, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const isValid = validator.validate(form)
    if (!isValid) { setErrors(validator.getErrors()); return }

    setLoading(true); setStatus(''); setIsError(false)
    try {
      const res  = await fetch(`${API}/jobs/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus(data.message)
        setIsError(false)
        setForm({ fullName: '', email: '', phone: '', coverLetter: '' })
      } else {
        const msg = data.errors ? data.errors.map(e => e.msg).join(' ') : data.error
        setStatus(msg || 'Submission failed.')
        setIsError(true)
      }
    } catch {
      setStatus('Backend not reachable. Please try again later.')
      setIsError(true)
    }
    setLoading(false)
  }

  return (
    <main>
      <div style={{ background: '#1a4144', padding: '50px 0', textAlign: 'center' }}>
        <h1 style={{ color: '#f5f1ce', fontWeight: 800 }}>Job Application</h1>
        <p style={{ color: '#5cba7d' }}>Join the LeafLink team</p>
      </div>

      <section className="py-5">
        <div className="container">
          <div className="ll-form-wrap">
            <h4 style={{ color: '#5cba7d', marginBottom: 20 }}>Apply Now</h4>
            <form onSubmit={handleSubmit} noValidate>

              <label>Full Name</label>
              <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="Enter your full name" />
              {errors.fullName && <span className="field-error">{errors.fullName}</span>}

              <label>Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com" />
              {errors.email && <span className="field-error">{errors.email}</span>}

              <label>Phone Number</label>
              <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+91-XXXXXXXXXX" />
              {errors.phone && <span className="field-error">{errors.phone}</span>}

              <label>Cover Letter</label>
              <textarea
                name="coverLetter" value={form.coverLetter} onChange={handleChange}
                placeholder="Tell us why you want to join LeafLink… (min 50 characters)"
                rows={6}
              />
              {errors.coverLetter && <span className="field-error">{errors.coverLetter}</span>}

              <button type="submit" disabled={loading}>
                {loading ? 'Submitting…' : 'Submit Application'}
              </button>
              {status && (
                <p className="form-status" style={{ color: isError ? '#ff7675' : '#5cba7d' }}>
                  {status}
                </p>
              )}
            </form>
          </div>
        </div>
      </section>
    </main>
  )
}
