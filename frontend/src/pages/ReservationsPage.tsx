import { useEffect, useState } from "react"
import { deleteReservation, getReservations, getSessions } from "../api/sessions"
import type { Reservation } from "../types/reservation"
import type { Session } from "../types/session"
import { getParticipantId, saveParticipantId } from "../utils/participant"

export default function ReservationsPage() {
    const [userId, setUserId] = useState(getParticipantId)
    const [reservations, setReservations] = useState<Reservation[]>([])
    const [sessions, setSessions] = useState<Session[]>([])
    const [loading, setLoading] = useState(true)
    const [cancelingId, setCancelingId] = useState<number | null>(null)
    const [message, setMessage] = useState("")

    useEffect(() => {
        Promise.all([getReservations(), getSessions()])
            .then(([reservationData, sessionData]) => {
                setReservations(reservationData)
                setSessions(sessionData)
            })
            .catch(() => setMessage("Failed to load reservations"))
            .finally(() => setLoading(false))
    }, [])

    const userReservations = reservations.filter((reservation) => reservation.userId === userId)

    async function cancelReservation(id: number) {
        setCancelingId(id)
        setMessage("")

        try {
            await deleteReservation(id)
            setReservations((current) => current.filter((reservation) => reservation.id !== id))
            setMessage("Reservation canceled")
        } catch (cancelError) {
            setMessage(cancelError instanceof Error ? cancelError.message : "Cancellation failed")
        } finally {
            setCancelingId(null)
        }
    }

    if (loading) {
        return <main className="sessions-page"><p className="status-message">Loading reservations...</p></main>
    }

    return (
        <main className="sessions-page">
            <header className="page-header">
                <p className="eyebrow">Participant area</p>
                <h1>My reservations</h1>
                <p>View or cancel your reserved workshop seats.</p>
            </header>

            <div className="participant-bar">
                <label htmlFor="reservation-participant-id">Participant ID</label>
                <input
                    id="reservation-participant-id"
                    min="1"
                    type="number"
                    value={userId}
                    onChange={(event) => {
                        const id = Number(event.target.value)
                        setUserId(id)
                        saveParticipantId(id)
                    }}
                />
                {message && <span className="booking-message">{message}</span>}
            </div>

            {userReservations.length === 0 ? (
                <p className="status-message">You have no reservations.</p>
            ) : (
                <section className="sessions-grid">
                    {userReservations.map((reservation) => {
                        const session = sessions.find((item) => item.id === reservation.sessionId)

                        return (
                            <article className="session-card" key={reservation.id}>
                                <h2>{session?.title ?? `Session #${reservation.sessionId}`}</h2>
                                <div className="session-details">
                                    <p className="session-detail"><strong>Reserved</strong><span>{new Date(reservation.createdAt).toLocaleString()}</span></p>
                                    {session && <p className="session-detail"><strong>Room</strong><span>{session.room}</span></p>}
                                </div>
                                <footer className="session-footer">
                                    <span className="seat-count">Reservation #{reservation.id}</span>
                                    <button
                                        className="reserve-button cancel-button"
                                        disabled={cancelingId === reservation.id}
                                        onClick={() => cancelReservation(reservation.id)}
                                    >
                                        {cancelingId === reservation.id ? "Canceling..." : "Cancel reservation"}
                                    </button>
                                </footer>
                            </article>
                        )
                    })}
                </section>
            )}
        </main>
    )
}
