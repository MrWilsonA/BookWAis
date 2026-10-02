import type { Session } from "../types/session"
import type { Reservation } from "../types/reservation"

const apiUrl = import.meta.env.VITE_API_URL

export async function getSessions(): Promise<Session[]> {
    const response = await fetch(`${apiUrl}/Sessions`)

    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
    }

    return response.json()
}

export async function createReservation(userId: number, sessionId: number) {
    const response = await fetch(`${apiUrl}/Reservations`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, sessionId }),
    })

    if (!response.ok) {
        const message = await response.text()
        throw new Error(message || `Request failed with status ${response.status}`)
    }

    return response.json()
}

export async function getReservations(): Promise<Reservation[]> {
    const response = await fetch(`${apiUrl}/Reservations`)

    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
    }

    return response.json()
}

export async function deleteReservation(id: number) {
    const response = await fetch(`${apiUrl}/Reservations/${id}`, {
        method: "DELETE",
    })

    if (!response.ok) {
        const message = await response.text()
        throw new Error(message || `Request failed with status ${response.status}`)
    }
}

export async function createSession(session: Omit<Session, "id" | "remainingSeats">) {
    const response = await fetch(`${apiUrl}/Sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(session),
    })

    if (!response.ok) {
        throw new Error(await response.text())
    }

    return response.json()
}

export async function updateSession(id: number, session: Omit<Session, "id" | "remainingSeats">) {
    const response = await fetch(`${apiUrl}/Sessions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(session),
    })

    if (!response.ok) {
        throw new Error(await response.text())
    }

    return response.json()
}

export async function deleteSession(id: number) {
    const response = await fetch(`${apiUrl}/Sessions/${id}`, { method: "DELETE" })

    if (!response.ok) {
        throw new Error(await response.text())
    }
}
