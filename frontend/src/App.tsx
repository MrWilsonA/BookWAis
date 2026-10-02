import { BrowserRouter, Link, Route, Routes } from "react-router-dom"
import SessionsPage from "./pages/SessionsPage"
import ReservationsPage from "./pages/ReservationsPage"
import AdminSessionsPage from "./pages/AdminSessionsPage"
import AdminSpeakersPage from "./pages/AdminSpeakersPage"
import AdminDashboardPage from "./pages/AdminDashboardPage"

function App() {
  return (
    <BrowserRouter>
      <nav className="main-nav">
        <div className="nav-content">
          <Link className="brand" to="/sessions">BookWAis</Link>
          <div className="nav-links">
            <Link to="/sessions">Sessions</Link>
            <Link to="/reservations">My reservations</Link>
            <Link to="/admin/sessions">Manage sessions</Link>
            <Link to="/admin/speakers">Speakers</Link>
            <Link to="/admin/dashboard">Dashboard</Link>
          </div>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<SessionsPage />} />
        <Route path="/sessions" element={<SessionsPage />} />
        <Route path="/reservations" element={<ReservationsPage />} />
        <Route path="/admin/sessions" element={<AdminSessionsPage />} />
        <Route path="/admin/speakers" element={<AdminSpeakersPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
