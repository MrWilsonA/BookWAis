import type { Session } from "../types/session"

const apiUrl = import.meta.env.VITE_API_URL

export async function getSessions(): Promise<Session[]> {
    const response = await fetch(`${apiUrl}/Sessions`)

    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
    }

    return response.json()
}