import { BrowserRouter, Route, Routes } from "react-router-dom"
import SessionsPage from "./pages/SessionsPage"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SessionsPage />} />
        <Route path="/sessions" element={<SessionsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App