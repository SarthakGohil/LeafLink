const API_BASE = 'http://localhost:3000/api';

/**
 * ContactForm — OOJS class to handle contact form submission
 * Validates input and sends data to the Express REST API.
 */
class ContactForm {
  constructor(formSelector) {
    this.form = document.querySelector(formSelector);
    this.statusEl = null;
    if (this.form) {
      this._injectStatusEl();
      this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
  }

  _injectStatusEl() {
    this.statusEl = document.createElement('p');
    this.statusEl.className = 'form-status';
    this.statusEl.style.cssText = 'margin-top:10px;font-weight:bold;text-align:center;';
    this.form.appendChild(this.statusEl);
  }

  setStatus(msg, color = 'green') {
    if (this.statusEl) {
      this.statusEl.textContent = msg;
      this.statusEl.style.color = color;
    }
  }

  validate(name, email, message) {
    if (!name.trim())  return 'Name is required.';
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) return 'A valid email is required.';
    if (!message.trim() || message.trim().length < 10)   return 'Message must be at least 10 characters.';
    return null;
  }

  async handleSubmit(e) {
    e.preventDefault();

    const nameEl    = this.form.querySelector('[name="name"]');
    const emailEl   = this.form.querySelector('[name="email"]');
    const messageEl = this.form.querySelector('[name="message"]');

    if (!nameEl || !emailEl || !messageEl) return;

    const name    = nameEl.value;
    const email   = emailEl.value;
    const message = messageEl.value;

    const error = this.validate(name, email, message);
    if (error) {
      this.setStatus(error, '#c0392b');
      return;
    }

    this.setStatus('Sending...', '#888');

    try {
      const res = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      const data = await res.json();
      if (res.ok) {
        this.setStatus(data.message || 'Message sent!', '#27ae60');
        this.form.reset();
      } else {
        this.setStatus(data.error || 'Failed to send. Try again.', '#c0392b');
      }
    } catch (err) {
      this.setStatus('Server not reachable. Please try again later.', '#c0392b');
    }
  }
}

// Auto-init when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // The contact form in the footer on contact.html
  window._contactForm = new ContactForm('.footer-section form');
});
