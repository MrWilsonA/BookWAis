import { useCallback, useEffect, useState } from "react"
import { getSessions } from "../api/sessions"
import type { Session } from "../types/session"

type DashboardSession = Session & { bookedCount: number }

export default function AdminDashboardPage() {
    const [items, setItems] = useState<DashboardSession[]>([])
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState("")

    const loadDashboard = useCallback(async () => {
        const sessions = await getSessions()
        setItems(sessions.map((session) => ({
            ...session,
            bookedCount: session.capacity - session.remainingSeats,
        })))
    }, [])

    useEffect(() => {
        loadDashboard()
            .catch(() => setMessage("Failed to load dashboard data"))
            .finally(() => setLoading(false))

        const intervalId = window.setInterval(() => {
            loadDashboard().catch(() => setMessage("Failed to refresh dashboard"))
        }, 5000)

        return () => window.clearInterval(intervalId)
    }, [loadDashboard])

    if (loading) {
        return <main className="sessions-page"><p className="status-message">Loading dashboard...</p></main>
    }

    return (
        <main className="sessions-page">
            <header className="page-header">
                <p className="eyebrow">Admin area</p>
                <h1>Booking dashboard</h1>
                <p>Monitor confirmed participants and available capacity for every session.</p>
                <p className="dashboard-update-note">Dashboard updates automatically every 5 seconds.</p>
            </header>

            {message && <p className="status-message">{message}</p>}

            <section className="dashboard-list">
                {items.map((session) => {
                    const percentage = session.capacity === 0 ? 0 : Math.min((session.bookedCount / session.capacity) * 100, 100)
                    const isFull = session.bookedCount >= session.capacity

                    return (
                        <article className="dashboard-card" key={session.id}>
                            <div className="dashboard-card-header">
                                <div>
                                    <p className="dashboard-session-title">{session.title}</p>
                                    <p className="dashboard-session-meta">Room {session.room}</p>
                                </div>
                                <strong className={isFull ? "capacity-full" : "capacity-open"}>
                                    {isFull ? "Full" : "Open"}
                                </strong>
                            </div>
                            <div className="capacity-summary">
                                <strong>{session.bookedCount} / {session.capacity}</strong>
                                <span>participants registered</span>
                            </div>
                            <div className="capacity-track" aria-label={`${session.bookedCount} of ${session.capacity} seats booked`}>
                                <span className="capacity-fill" style={{ width: `${percentage}%` }} />
                            </div>
                            <p className="capacity-remaining">{session.remainingSeats} seats remaining</p>
                        </article>
                    )
                })}
            </section>

            <button className="secondary-button dashboard-refresh" onClick={() => {
                setMessage("")
                loadDashboard().catch(() => setMessage("Failed to refresh dashboard"))
            }}>Refresh data</button>
        </main>
    )
}
