import { BrowserRouter, Route, Routes } from "react-router-dom"
import SessionsPage from "./pages/SessionsPage"
import ReservationsPage from "./pages/ReservationsPage"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SessionsPage />} />
        <Route path="/sessions" element={<SessionsPage />} />
        <Route path="/reservations" element={<ReservationsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
