import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { register } from "../api/auth"
import type { User } from "../types/user"

type Props = { onLogin: (user: User) => void }

export default function RegisterPage({ onLogin }: Props) {
    const navigate = useNavigate()
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [message, setMessage] = useState("")
    const [busy, setBusy] = useState(false)

    async function submit(event: React.FormEvent) {
        event.preventDefault()
        setBusy(true)
        setMessage("")
        try {
            const user = await register(username, email, password)
            onLogin(user)
            navigate("/sessions")
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Registration failed")
        } finally {
            setBusy(false)
        }
    }

    return (
        <main className="auth-page">
            <form className="auth-card" onSubmit={submit}>
                <p className="eyebrow">BookWAis</p>
                <h1>Create account</h1>
                <p className="auth-description">Create a participant account to book sessions.</p>
                <label>Username<input required value={username} onChange={(event) => setUsername(event.target.value)} /></label>
                <label>Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
                <label>Password<input required minLength={6} type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
                <button className="reserve-button" disabled={busy}>{busy ? "Creating..." : "Create account"}</button>
                {message && <p className="auth-message">{message}</p>}
                <p className="auth-link">Already have an account? <Link to="/login">Sign in</Link></p>
            </form>
        </main>
    )
}
