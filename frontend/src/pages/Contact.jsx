import { useState } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

/**
 * Contact — STATEFUL page component
 * Manages: form field state, loading state, status message.
 * Calls POST /api/contact on the Express REST API.
 */
export default function Contact() {
  const [form,   setForm]   = useState({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('')
  const [isError, setIsError] = useState(false)
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Name must be at least 2 characters.'
    if (!/^\S+@\S+\.\S+$/.test(form.email))     e.email   = 'Valid email required.'
    if (form.message.trim().length < 10)         e.message = 'Message must be at least 10 characters.'
    return e
  }

  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    setErrors(er => ({ ...er, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true); setStatus(''); setIsError(false)
    try {
      const res  = await fetch(`${API}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus(data.message)
        setIsError(false)
        setForm({ name: '', email: '', message: '' })
      } else {
        const msg = data.errors ? data.errors.map(e => e.msg).join(' ') : data.error
        setStatus(msg || 'Failed. Please try again.')
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
        <h1 style={{ color: '#f5f1ce', fontWeight: 800 }}>Contact Us</h1>
        <p style={{ color: '#5cba7d' }}>We'd love to hear from you</p>
      </div>

      <section className="py-5">
        <div className="container">
          <div className="row g-5">
            {/* Map + details */}
            <div className="col-md-6">
              <iframe
                title="office-map"
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3720.6951570424153!2d72.7802537!3d21.1645266!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be04decf2896c81%3A0x3322696188a5d0e5!2sComputer%20Science%20and%20Engineering%20Department%20(New%20Building)!5e0!3m2!1sen!2sin!4v1711787396371"
                width="100%" height="300" style={{ border: 0, borderRadius: 10 }}
                allowFullScreen loading="lazy"
              />
              <div className="mt-4" style={{ color: '#1a4144' }}>
                <p><strong>📍</strong> 2nd Floor, COED Dept, SVNIT Campus, Surat - 395006</p>
                <p><strong>📧</strong> leaflink.in@gmail.com</p>
                <p><strong>📞</strong> +91-11-20819220</p>
              </div>
            </div>

            {/* Contact form (stateful) */}
            <div className="col-md-6">
              <div className="ll-form-wrap">
                <h4 style={{ color: '#5cba7d', marginBottom: 20 }}>Send a Message</h4>
                <form onSubmit={handleSubmit} noValidate>
                  <label>Name</label>
                  <input name="name"  value={form.name}  onChange={handleChange} placeholder="Your name" />
                  {errors.name    && <span className="field-error">{errors.name}</span>}

                  <label>Email</label>
                  <input name="email" value={form.email} onChange={handleChange} placeholder="your@email.com" type="email" />
                  {errors.email   && <span className="field-error">{errors.email}</span>}

                  <label>Message</label>
                  <textarea name="message" value={form.message} onChange={handleChange} placeholder="Your message..." />
                  {errors.message && <span className="field-error">{errors.message}</span>}

                  <button type="submit" disabled={loading}>
                    {loading ? 'Sending…' : 'Send Message'}
                  </button>
                  {status && (
                    <p className="form-status" style={{ color: isError ? '#ff7675' : '#5cba7d' }}>
                      {status}
                    </p>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
