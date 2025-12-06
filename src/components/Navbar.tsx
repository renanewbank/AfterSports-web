import { NavLink, useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from '../auth/AuthContext'

const links = [
  { to: '/', label: 'Início' },
  { to: '/instructors', label: 'Instrutores' },
  { to: '/lessons', label: 'Aulas' },
  { to: '/bookings', label: 'Reservas' },
]

const Navbar = () => {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  return (
    <header className="navbar">
      <div className="navbar-inner container">
        <div className="brand" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          <span className="brand-dot" />
          <span>AfterSports</span>
        </div>
        <nav className="nav-links">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'nav-link-active' : ''}`
              }
              end={link.to === '/'}
            >
              {link.label}
            </NavLink>
          ))}
          {user ? (
            <>
              <span className="chip">Olá, {user.name}</span>
              <button
                className="ghost-btn"
                onClick={() => {
                  logout()
                  navigate('/entrar')
                }}
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <NavLink to="/entrar" className="nav-link">
                Entrar
              </NavLink>
              <NavLink to="/cadastrar" className="nav-link">
                Cadastrar
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Navbar
