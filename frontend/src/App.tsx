import { BrowserRouter, Link, Route, Routes } from "react-router-dom"
import SessionsPage from "./pages/SessionsPage"
import ReservationsPage from "./pages/ReservationsPage"

function App() {
  return (
    <BrowserRouter>
      <nav className="main-nav">
        <div className="nav-content">
          <Link className="brand" to="/sessions">BookWAis</Link>
          <div className="nav-links">
            <Link to="/sessions">Sessions</Link>
            <Link to="/reservations">My reservations</Link>
          </div>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<SessionsPage />} />
        <Route path="/sessions" element={<SessionsPage />} />
        <Route path="/reservations" element={<ReservationsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
