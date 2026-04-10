const API_BASE = 'http://localhost:3000/api';

/**
 * FormValidator — OOJS class encapsulating form validation state.
 * Validates each field and renders inline error messages.
 */
class FormValidator {
  constructor(formEl) {
    this.form   = formEl;
    this.errors = {};
  }

  showError(fieldId, msg) {
    const errEl = document.getElementById(`err-${fieldId}`);
    if (errEl) {
      errEl.textContent = msg;
      errEl.style.color = '#c0392b';
      errEl.style.fontSize = '13px';
      errEl.style.display = 'block';
    }
    this.errors[fieldId] = msg;
  }

  clearErrors() {
    this.errors = {};
    this.form.querySelectorAll('.field-error').forEach(el => {
      el.textContent = '';
    });
  }

  validate(data) {
    this.clearErrors();

    if (!data.fullName || data.fullName.trim().length < 2) {
      this.showError('fullName', 'Full name must be at least 2 characters.');
    }
    if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email)) {
      this.showError('email', 'Please enter a valid email address.');
    }
    if (!data.phone || !/^[\d\s\+\-\(\)]{7,20}$/.test(data.phone)) {
      this.showError('phone', 'Please enter a valid phone number.');
    }
    if (!data.coverLetter || data.coverLetter.trim().length < 50) {
      this.showError('coverLetter', 'Cover letter must be at least 50 characters.');
    }

    return Object.keys(this.errors).length === 0;
  }

  isValid() {
    return Object.keys(this.errors).length === 0;
  }
}

/**
 * JobApplicationForm — OOJS class that orchestrates form submission.
 * Uses FormValidator for field-level validation, then POSTs to Express API.
 */
class JobApplicationForm {
  constructor(formId) {
    this.form      = document.getElementById(formId);
    this.statusEl  = document.getElementById('formStatus');
    this.submitBtn = document.getElementById('submitBtn');
    this.validator = new FormValidator(this.form);

    if (this.form) {
      this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
  }

  setStatus(msg, color = '#27ae60') {
    if (this.statusEl) {
      this.statusEl.textContent = msg;
      this.statusEl.style.color = color;
    }
  }

  async handleSubmit(e) {
    e.preventDefault();

    const formData = {
      fullName:    document.getElementById('fullName').value,
      email:       document.getElementById('email').value,
      phone:       document.getElementById('phone').value,
      coverLetter: document.getElementById('coverLetter').value,
      resumeFileName: (() => {
        const f = document.getElementById('resume').files[0];
        return f ? f.name : null;
      })(),
    };

    const isValid = this.validator.validate(formData);
    if (!isValid) return;

    this.submitBtn.disabled = true;
    this.setStatus('Submitting your application...', '#888');

    try {
      const res = await fetch(`${API_BASE}/jobs/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        this.setStatus(data.message || 'Application submitted!', '#27ae60');
        this.form.reset();
      } else {
        this.setStatus(data.error || 'Submission failed. Please try again.', '#c0392b');
        this.submitBtn.disabled = false;
      }
    } catch (err) {
      this.setStatus('Backend not reachable. Please try again later.', '#c0392b');
      this.submitBtn.disabled = false;
    }
  }
}

// Auto-init
document.addEventListener('DOMContentLoaded', () => {
  window._jobForm = new JobApplicationForm('applicationForm');
});
