import { Link } from 'react-router'

/** Explain a backend-profile role restriction without ending the session. */
export default function ForbiddenPage() {
  return (
    <main className="status-page">
      <div className="status-code">403</div>
      <p className="eyebrow">Permission required</p>
      <h1>This account cannot access that page.</h1>
      <p>Your session is still active. Return to the dashboard to use the features available to your role.</p>
      <Link className="button button--primary" to="/dashboard">Back to dashboard</Link>
    </main>
  )
}
