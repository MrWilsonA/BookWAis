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
            .catch(() => setError("Failed to fetch data session"))
            .finally(() => setLoading(false))
    }, [])

    if (loading) {
        return <p>Memuat session...</p>
    }

    if (error) {
        return <p>{error}</p>
    }

    return (
        <main>
            <h1>Available Sessions</h1>

            {sessions.map((session) => (
                <article key={session.id}>
                    <h2>{session.title}</h2>
                    <p>Room: {session.room}</p>
                    <p>
                        {new Date(session.startTime).toLocaleString()} -{" "}
                        {new Date(session.endTime).toLocaleString()}
                    </p>
                    <p>
                        Seats: {session.remainingSeats} / {session.capacity}
                    </p>
                    <button disabled={session.remainingSeats === 0}>
                        Reserve
                    </button>
                </article>
            ))}
        </main>
    )
}