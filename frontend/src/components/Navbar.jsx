import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Navbar — STATELESS component
 * Reads auth state from context (read-only, no local state).
 * Shows Login/Register when unauthenticated, Profile/Logout when authenticated.
 */
export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <nav className="navbar navbar-expand-lg ll-nav">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <span className="leaf">LEAF</span>
          <span className="link">LINK</span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navMenu"
          aria-controls="navMenu"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navMenu">
          <ul className="navbar-nav ms-auto gap-2 align-items-lg-center">
            {[
              { to: '/',         label: 'Home'     },
              { to: '/about',    label: 'About'    },
              { to: '/services', label: 'Services' },
              { to: '/gallery',  label: 'Gallery'  },
              { to: '/contact',  label: 'Contact'  },
              { to: '/jobs',     label: 'Apply 🌿' },
            ].map(({ to, label }) => (
              <li className="nav-item" key={to}>
                <NavLink className="nav-link" to={to} end={to === '/'}>
                  {label}
                </NavLink>
              </li>
            ))}

            {/* Auth links — dynamic based on login state */}
            {user ? (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/profile">
                    {user.avatar
                      ? <img src={user.avatar} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', marginRight: 6, border: '2px solid #5cba7d' }} />
                      : '👤 '}
                    {user.name.split(' ')[0]}
                  </NavLink>
                </li>
                <li className="nav-item">
                  <button className="nav-link" style={{ background: 'none', border: 'none', color: '#ff7675', fontWeight: 700, cursor: 'pointer' }} onClick={logout}>
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/login">Login</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/register" style={{ background: '#5cba7d', color: '#fff', padding: '6px 18px', borderRadius: 20, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
                    Register
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}
