import { Outlet } from 'react-router'
import Header from './Header'
import Sidebar from './Sidebar'

/** Shared shell for authenticated dashboard pages. */
export default function DashboardLayout() {
  return (
    <div className="dashboard-shell">
      <Header />
      <Sidebar />
      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  )
}
