import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Início' },
  { to: '/instructors', label: 'Instrutores' },
  { to: '/lessons', label: 'Aulas' },
  { to: '/bookings', label: 'Reservas' },
]

const Navbar = () => (
  <header className="navbar">
    <div className="navbar-inner container">
      <div className="brand">
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
      </nav>
    </div>
  </header>
)

export default Navbar
