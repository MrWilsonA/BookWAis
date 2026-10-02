import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { deleteSpeaker, getSpeakers, saveSpeaker } from "../api/speakers"
import { getSessions } from "../api/sessions"
import type { Speaker } from "../types/speaker"
import type { Session } from "../types/session"

const emptyForm = { name: "", profile: "", biography: "", photoUrl: "" }

export default function AdminSpeakersPage() {
    const [speakers, setSpeakers] = useState<Speaker[]>([])
    const [sessions, setSessions] = useState<Session[]>([])
    const [form, setForm] = useState(emptyForm)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)
    const [busy, setBusy] = useState(false)
    const [message, setMessage] = useState("")

    useEffect(() => {
        Promise.all([getSpeakers(), getSessions()])
            .then(([speakerData, sessionData]) => {
                setSpeakers(speakerData)
                setSessions(sessionData)
            })
            .catch(() => setMessage("Failed to load speakers and assigned sessions"))
            .finally(() => setLoading(false))
    }, [])

    function resetForm() {
        setEditingId(null)
        setForm(emptyForm)
    }

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setBusy(true)
        setMessage("")
        try {
            await saveSpeaker(form, editingId)
            setMessage(editingId === null ? "Speaker created" : "Speaker updated")
            resetForm()
            setSpeakers(await getSpeakers())
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Failed to save speaker")
        } finally {
            setBusy(false)
        }
    }

    async function removeSpeaker(id: number) {
        if (!window.confirm("Delete this speaker?")) return
        setBusy(true)
        setMessage("")
        try {
            await deleteSpeaker(id)
            setSpeakers((current) => current.filter((speaker) => speaker.id !== id))
            if (editingId === id) resetForm()
            setMessage("Speaker deleted")
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Failed to delete speaker")
        } finally {
            setBusy(false)
        }
    }

    if (loading) return <main className="sessions-page"><p className="status-message">Loading speakers...</p></main>

    return (
        <main className="sessions-page">
            <header className="page-header">
                <p className="eyebrow">Admin area</p>
                <h1>Manage speakers</h1>
                <p>Manage speaker profiles and view their assigned sessions.</p>
            </header>
            <form className="admin-form" onSubmit={submit}>
                <h2>{editingId === null ? "Create speaker" : "Edit speaker"}</h2>
                <div className="form-grid">
                    <label>Name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
                    <label>Profile<input required value={form.profile} onChange={(event) => setForm({ ...form, profile: event.target.value })} /></label>
                    <label className="speaker-large-field">Biography<textarea required rows={4} value={form.biography} onChange={(event) => setForm({ ...form, biography: event.target.value })} /></label>
                    <label className="speaker-large-field">Photo URL<input type="url" placeholder="https://example.com/photo.jpg" value={form.photoUrl} onChange={(event) => setForm({ ...form, photoUrl: event.target.value })} /></label>
                </div>
                <div className="form-actions">
                    <button className="reserve-button" disabled={busy}>{busy ? "Saving..." : editingId === null ? "Create speaker" : "Save changes"}</button>
                    {editingId !== null && <button type="button" className="secondary-button" disabled={busy} onClick={resetForm}>Cancel</button>}
                </div>
                {message && <p className="booking-message" role="status">{message}</p>}
            </form>
            <section className="admin-list">
                {speakers.length === 0 && <p className="status-message">No speakers available.</p>}
                {speakers.map((speaker) => (
                    <article className="admin-row" key={speaker.id}>
                        <div className="speaker-details">
                            {speaker.photoUrl && <img className="speaker-photo" src={speaker.photoUrl} alt={speaker.name} />}
                            <div>
                                <h2>{speaker.name}</h2>
                                <p>{speaker.profile}</p>
                                <p className="speaker-biography">{speaker.biography}</p>
                                <p>Assigned sessions: {sessions.filter((session) => session.speakerId === speaker.id).map((session) => session.title).join(", ") || "None"}</p>
                            </div>
                        </div>
                        <div className="row-actions">
                            <button className="secondary-button" disabled={busy} onClick={() => {
                                setEditingId(speaker.id)
                                setForm({ name: speaker.name, profile: speaker.profile, biography: speaker.biography, photoUrl: speaker.photoUrl })
                                setMessage("")
                            }}>Edit</button>
                            <button className="danger-button" disabled={busy} onClick={() => removeSpeaker(speaker.id)}>Delete</button>
                        </div>
                    </article>
                ))}
            </section>
        </main>
    )
}
