import { NavLink } from 'react-router'
import { useAuth } from '../../contexts/AuthContext'

const roleActions = {
  viewer: ['Read vehicle records'],
  analyst: ['Add vehicle (coming soon)', 'Estimate price (coming soon)'],
  admin: ['Add vehicle (coming soon)', 'Estimate price (coming soon)', 'Administration (coming soon)'],
}

/** Main navigation plus role-aware previews of future actions. */
export default function Sidebar() {
  const { role } = useAuth()

  return (
    <aside className="sidebar" aria-label="Primary navigation">
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
          <span className="nav-icon" aria-hidden="true">⌂</span>
          Dashboard
        </NavLink>
        <NavLink to="/vehicles" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
          <span className="nav-icon" aria-hidden="true">◇</span>
          Vehicles
        </NavLink>
      </nav>

      <div className="sidebar-actions">
        <p className="sidebar-label">Your workspace</p>
        <ul>
          {(roleActions[role] || []).map((action) => <li key={action}>{action}</li>)}
        </ul>
        <p className="security-note">Permissions shown here are for guidance. The API enforces every action.</p>
      </div>
    </aside>
  )
}
