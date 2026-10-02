import { useEffect, useState } from "react";
import type { Session } from "../types/session";
import { createReservation, getSessions } from "../api/sessions";
import { getSpeakers } from "../api/speakers";
import type { Speaker } from "../types/speaker";

export default function SessionsPage() {
    const [sessions, setSessions] = useState<Session[]>([])
    const [speakers, setSpeakers] = useState<Speaker[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [bookingId, setBookingId] = useState<number | null>(null)
    const [message, setMessage] = useState("")

    useEffect(() => {
        Promise.all([getSessions(), getSpeakers()])
            .then(([sessionData, speakerData]) => {
                setSessions(sessionData)
                setSpeakers(speakerData)
            })
            .catch(() => setError("Failed to load sessions"))
            .finally(() => setLoading(false))
    }, [])

    async function reserve(sessionId: number) {
        setBookingId(sessionId)
        setMessage("")

        try {
            await createReservation(sessionId)
            const updatedSessions = await getSessions()
            setSessions(updatedSessions)
            setMessage("Reservation confirmed")
        } catch (bookingError) {
            setMessage(bookingError instanceof Error ? bookingError.message : "Reservation failed")
        } finally {
            setBookingId(null)
        }
    }

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

            {message && <p className="booking-message">{message}</p>}

            <section className="sessions-grid">
                {sessions.map((session) => {
                    const isFull = session.remainingSeats === 0

                    return (
                        <article className="session-card" key={session.id}>
                            <h2>{session.title}</h2>
                            <div className="session-details">
                                <p className="session-detail"><strong>Speaker</strong><span>{speakers.find((speaker) => speaker.id === session.speakerId)?.name ?? "Unavailable"}</span></p>
                                <p className="session-detail"><strong>Room</strong><span>{session.room}</span></p>
                                <p className="session-detail"><strong>Time</strong><span>{new Date(session.startTime).toLocaleString()} - {new Date(session.endTime).toLocaleString()}</span></p>
                            </div>
                            <footer className="session-footer">
                                <span className={`seat-count${isFull ? " full" : ""}`}>
                                    {isFull ? "Session full" : `${session.remainingSeats} seats left`}
                                </span>
                                <button
                                    className="reserve-button"
                                    disabled={isFull || bookingId !== null}
                                    onClick={() => reserve(session.id)}
                                >
                                    {isFull ? "Full" : bookingId === session.id ? "Booking..." : "Reserve"}
                                </button>
                            </footer>
                        </article>
                    )
                })}
            </section>
        </main>
    )
}
