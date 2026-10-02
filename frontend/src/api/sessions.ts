import type { Session } from "../types/session"
import type { Reservation } from "../types/reservation"

const apiUrl = import.meta.env.VITE_API_URL

async function getErrorMessage(response: Response) {
    const body = await response.text()

    try {
        const problem = JSON.parse(body) as { title?: string; errors?: Record<string, string[]> }
        const validationMessage = problem.errors
            ? Object.values(problem.errors).flat()[0]
            : undefined
        return validationMessage ?? problem.title ?? body
    } catch {
        return body
    }
}

export async function getSessions(): Promise<Session[]> {
    const response = await fetch(`${apiUrl}/Sessions`)

    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
    }

    return response.json()
}

export async function createReservation(sessionId: number) {
    const response = await fetch(`${apiUrl}/Reservations`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId }),
    })

    if (!response.ok) {
        throw new Error((await getErrorMessage(response)) || `Request failed with status ${response.status}`)
    }

    return response.json()
}

export async function getReservations(): Promise<Reservation[]> {
    const response = await fetch(`${apiUrl}/Reservations`, { credentials: "include" })

    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
    }

    return response.json()
}

export async function deleteReservation(id: number) {
    const response = await fetch(`${apiUrl}/Reservations/${id}`, {
        method: "DELETE",
        credentials: "include",
    })

    if (!response.ok) {
        const message = await response.text()
        throw new Error(message || `Request failed with status ${response.status}`)
    }
}

export async function createSession(session: Omit<Session, "id" | "remainingSeats">) {
    const response = await fetch(`${apiUrl}/Sessions`, {
        method: "POST",
        credentials: "include",
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
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(session),
    })

    if (!response.ok) {
        throw new Error(await response.text())
    }

    return response.json()
}

export async function deleteSession(id: number) {
    const response = await fetch(`${apiUrl}/Sessions/${id}`, { method: "DELETE", credentials: "include" })

    if (!response.ok) {
        throw new Error(await response.text())
    }
}
