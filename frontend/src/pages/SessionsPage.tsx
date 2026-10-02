import { useEffect, useState } from "react";
import type { Session } from "../types/session";
import { getSessions } from "../api/sessions";

export default function SessionsPage() {
    const [sessions, setSessions] = useState<Session[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        getSessions()
            .then(setSessions)
            .catch(() => setError("Failed to load sessions"))
            .finally(() => setLoading(false))
    }, [])

    if (loading) {
        return <main className="sessions-page"><p className="status-message">Loading sessions...</p></main>
    }

    if (error) {
        return <main className="sessions-page"><p className="status-message">{error}</p></main>
    }

    return (
        <main className="sessions-page">
            <header className="page-header">
                <p className="eyebrow">BookWAis workshops</p>
                <h1>Available sessions</h1>
                <p>Choose a session and reserve your seat in a few steps.</p>
            </header>

            <section className="sessions-grid">
                {sessions.map((session) => {
                    const isFull = session.remainingSeats === 0

                    return (
                        <article className="session-card" key={session.id}>
                            <h2>{session.title}</h2>
                            <div className="session-details">
                                <p className="session-detail"><strong>Room</strong><span>{session.room}</span></p>
                                <p className="session-detail"><strong>Time</strong><span>{new Date(session.startTime).toLocaleString()} - {new Date(session.endTime).toLocaleString()}</span></p>
                            </div>
                            <footer className="session-footer">
                                <span className={`seat-count${isFull ? " full" : ""}`}>
                                    {isFull ? "Session full" : `${session.remainingSeats} seats left`}
                                </span>
                                <button className="reserve-button" disabled={isFull}>
                                    {isFull ? "Full" : "Reserve"}
                                </button>
                            </footer>
                        </article>
                    )
                })}
            </section>
        </main>
    )
}
