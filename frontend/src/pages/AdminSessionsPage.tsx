import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { createSession, deleteSession, getSessions, updateSession } from "../api/sessions"
import type { Session } from "../types/session"

type SessionForm = {
    title: string
    speakerId: number
    room: string
    startTime: string
    endTime: string
    capacity: number
}

const emptyForm: SessionForm = {
    title: "",
    speakerId: 1,
    room: "",
    startTime: "",
    endTime: "",
    capacity: 1,
}

function toInputDate(value: string) {
    const date = new Date(value)
    const offset = date.getTimezoneOffset() * 60000
    return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

export default function AdminSessionsPage() {
    const [sessions, setSessions] = useState<Session[]>([])
    const [form, setForm] = useState<SessionForm>(emptyForm)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(true)

    async function loadSessions() {
        setSessions(await getSessions())
    }

    useEffect(() => {
        loadSessions()
            .catch(() => setMessage("Failed to load sessions"))
            .finally(() => setLoading(false))
    }, [])

    function updateField<K extends keyof SessionForm>(field: K, value: SessionForm[K]) {
        setForm((current) => ({ ...current, [field]: value }))
    }

    function editSession(session: Session) {
        setEditingId(session.id)
        setForm({
            title: session.title,
            speakerId: session.speakerId,
            room: session.room,
            startTime: toInputDate(session.startTime),
            endTime: toInputDate(session.endTime),
            capacity: session.capacity,
        })
        setMessage("")
    }

    function resetForm() {
        setEditingId(null)
        setForm(emptyForm)
    }

    async function submit(event: FormEvent) {
        event.preventDefault()
        setMessage("")

        const payload = {
            ...form,
            startTime: new Date(form.startTime).toISOString(),
            endTime: new Date(form.endTime).toISOString(),
        }

        try {
            if (editingId === null) {
                await createSession(payload)
                setMessage("Session created")
            } else {
                await updateSession(editingId, payload)
                setMessage("Session updated")
            }
            resetForm()
            await loadSessions()
        } catch (submitError) {
            setMessage(submitError instanceof Error ? submitError.message : "Request failed")
        }
    }

    async function removeSession(id: number) {
        if (!window.confirm("Delete this session?")) return

        try {
            await deleteSession(id)
            setSessions((current) => current.filter((session) => session.id !== id))
            setMessage("Session deleted")
        } catch (deleteError) {
            setMessage(deleteError instanceof Error ? deleteError.message : "Delete failed")
        }
    }

    if (loading) {
        return <main className="sessions-page"><p className="status-message">Loading sessions...</p></main>
    }

    return (
        <main className="sessions-page">
            <header className="page-header">
                <p className="eyebrow">Admin area</p>
                <h1>Manage sessions</h1>
                <p>Create, update, and remove workshop sessions.</p>
            </header>

            <form className="admin-form" onSubmit={submit}>
                <h2>{editingId === null ? "Create session" : "Edit session"}</h2>
                <div className="form-grid">
                    <label>Title<input required value={form.title} onChange={(event) => updateField("title", event.target.value)} /></label>
                    <label>Speaker ID<input required min="1" type="number" value={form.speakerId} onChange={(event) => updateField("speakerId", Number(event.target.value))} /></label>
                    <label>Room<input required value={form.room} onChange={(event) => updateField("room", event.target.value)} /></label>
                    <label>Capacity<input required min="1" type="number" value={form.capacity} onChange={(event) => updateField("capacity", Number(event.target.value))} /></label>
                    <label>Start time<input required type="datetime-local" value={form.startTime} onChange={(event) => updateField("startTime", event.target.value)} /></label>
                    <label>End time<input required type="datetime-local" value={form.endTime} onChange={(event) => updateField("endTime", event.target.value)} /></label>
                </div>
                <div className="form-actions">
                    <button className="reserve-button" type="submit">{editingId === null ? "Create session" : "Save changes"}</button>
                    {editingId !== null && <button className="secondary-button" type="button" onClick={resetForm}>Cancel</button>}
                </div>
                {message && <p className="booking-message">{message}</p>}
            </form>

            <section className="admin-list">
                {sessions.map((session) => (
                    <article className="admin-row" key={session.id}>
                        <div>
                            <h2>{session.title}</h2>
                            <p>{session.room} · {session.remainingSeats} seats left of {session.capacity}</p>
                        </div>
                        <div className="row-actions">
                            <button className="secondary-button" onClick={() => editSession(session)}>Edit</button>
                            <button className="danger-button" onClick={() => removeSession(session.id)}>Delete</button>
                        </div>
                    </article>
                ))}
            </section>
        </main>
    )
}
