import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { login } from "../api/auth"
import type { User } from "../types/user"

type Props = { onLogin: (user: User) => void }

export default function LoginPage({ onLogin }: Props) {
    const navigate = useNavigate()
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [message, setMessage] = useState("")
    const [busy, setBusy] = useState(false)

    async function submit(event: React.FormEvent) {
        event.preventDefault()
        setBusy(true)
        setMessage("")
        try {
            const user = await login(username, password)
            onLogin(user)
            navigate("/sessions")
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Login failed")
        } finally {
            setBusy(false)
        }
    }

    return (
        <main className="auth-page">
            <form className="auth-card" onSubmit={submit}>
                <p className="eyebrow">BookWAis</p>
                <h1>Welcome back</h1>
                <p className="auth-description">Sign in to reserve workshop seats.</p>
                <label>Username<input required value={username} onChange={(event) => setUsername(event.target.value)} /></label>
                <label>Password<input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
                <button className="reserve-button" disabled={busy}>{busy ? "Signing in..." : "Sign in"}</button>
                {message && <p className="auth-message">{message}</p>}
                <p className="auth-link">No account? <Link to="/register">Create one</Link></p>
            </form>
        </main>
    )
}
