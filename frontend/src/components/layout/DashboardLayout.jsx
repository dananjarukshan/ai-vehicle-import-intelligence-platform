import { Outlet } from 'react-router'
import DynamicCarBackground from '../common/DynamicCarBackground'
import Header from './Header'
import Sidebar from './Sidebar'

/** Shared shell for authenticated dashboard pages. */
export default function DashboardLayout() {
  return (
    <div className="dashboard-shell">
      <DynamicCarBackground />
      <Header />
      <Sidebar />
      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  )
}
