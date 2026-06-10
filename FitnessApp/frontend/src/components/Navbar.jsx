import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../cssfiles/navbar.css'
function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    setIsMenuOpen(false)
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={() => setIsMenuOpen(false)}>
          <img className ="logo" src="/logo.png" alt="logo" />
          FitSphere
        </Link>
        
        <button
          className={`hamburger ${isMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <ul className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <li>
            <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
          </li>
          {!isAuthenticated ? (
            <>
              <li>
                <Link to="/pricing" onClick={() => setIsMenuOpen(false)}>Pricing</Link>
              </li>
              <li>
                <Link to="/health-tips" onClick={() => setIsMenuOpen(false)}>Health Tips</Link>
              </li>
              <li>
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>Login</Link>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/health-tips" onClick={() => setIsMenuOpen(false)}>Health Tips</Link>
              </li>
              <li>
                <Link
                  to={user?.role === 'trainer' ? '/trainer-dashboard' : '/dashboard'}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  )
}

export default Navbar

