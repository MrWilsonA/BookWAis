import { BrowserRouter, Link, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { getCurrentUser, logout } from "./api/auth"
import type { User } from "./types/user"
import SessionsPage from "./pages/SessionsPage"
import ReservationsPage from "./pages/ReservationsPage"
import AdminSessionsPage from "./pages/AdminSessionsPage"
import AdminSpeakersPage from "./pages/AdminSpeakersPage"
import AdminDashboardPage from "./pages/AdminDashboardPage"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"

function AppRoutes() {
  const location = useLocation()
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCurrentUser().then(setUser).finally(() => setLoading(false))
  }, [])

  if (loading) return <main className="auth-page"><p className="status-message">Loading...</p></main>

  if (!user && location.pathname !== "/login" && location.pathname !== "/register") {
    return <Navigate to="/login" replace />
  }

  const isAdmin = user?.role === "Admin"

  async function signOut() {
    await logout()
    setUser(null)
    navigate("/login")
  }

  return (
    <>
      {user && <nav className="main-nav">
        <div className="nav-content">
          <Link className="brand" to="/sessions">BookWAis</Link>
          <div className="nav-links">
            <Link to="/sessions">Sessions</Link>
            {!isAdmin && <Link to="/reservations">My reservations</Link>}
            {isAdmin && <>
              <Link to="/admin/sessions">Manage sessions</Link>
              <Link to="/admin/speakers">Speakers</Link>
              <Link to="/admin/dashboard">Dashboard</Link>
            </>}
            <button className="nav-logout" onClick={signOut}>Sign out</button>
          </div>
        </div>
      </nav>}
      <Routes>
        <Route path="/" element={<Navigate to={user ? "/sessions" : "/login"} replace />} />
        <Route path="/login" element={user ? <Navigate to="/sessions" replace /> : <LoginPage onLogin={setUser} />} />
        <Route path="/register" element={user ? <Navigate to="/sessions" replace /> : <RegisterPage onLogin={setUser} />} />
        <Route path="/sessions" element={<SessionsPage />} />
        <Route path="/reservations" element={!isAdmin ? <ReservationsPage /> : <Navigate to="/sessions" replace />} />
        <Route path="/admin/sessions" element={isAdmin ? <AdminSessionsPage /> : <Navigate to="/sessions" replace />} />
        <Route path="/admin/speakers" element={isAdmin ? <AdminSpeakersPage /> : <Navigate to="/sessions" replace />} />
        <Route path="/admin/dashboard" element={isAdmin ? <AdminDashboardPage /> : <Navigate to="/sessions" replace />} />
      </Routes>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
