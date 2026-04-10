import { Link } from 'react-router-dom'

/**
 * Footer — STATELESS component
 * Renders consistent footer across all pages.
 * Pure function — no state needed.
 */
export default function Footer() {
  return (
    <footer className="ll-footer">
      <div className="container">
        <div className="row g-4">
          <div className="col-md-3">
            <h5>About LeafLink</h5>
            <p>Dedicated to preserving and managing forests for future generations.</p>
          </div>
          <div className="col-md-3">
            <h5>Quick Links</h5>
            {[
              { to: '/',         label: 'Home'     },
              { to: '/about',    label: 'About'    },
              { to: '/services', label: 'Services' },
              { to: '/gallery',  label: 'Gallery'  },
              { to: '/contact',  label: 'Contact'  },
            ].map(({ to, label }) => (
              <Link key={to} to={to}>{label}</Link>
            ))}
          </div>
          <div className="col-md-3">
            <h5>Contact Us</h5>
            <p>leaflink.in@gmail.com</p>
            <p>+91-11-20819220</p>
            <p>SVNIT Campus, Surat, Gujarat 395006</p>
          </div>
          <div className="col-md-3">
            <h5>Follow Us</h5>
            <div className="social-links">
              <a href="https://www.facebook.com/iamforestlover/" target="_blank" rel="noreferrer">𝗙</a>
              <a href="https://x.com/moefcc" target="_blank" rel="noreferrer">𝕏</a>
              <a href="https://www.instagram.com/indian_forest_official/" target="_blank" rel="noreferrer">📷</a>
            </div>
            <Link to="/jobs" style={{ color: '#5cba7d', fontWeight: 700 }}>Apply for a Job ↗</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} LeafLink. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
