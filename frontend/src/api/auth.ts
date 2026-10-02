import type { User } from "../types/user"
import { saveParticipantId } from "../utils/participant"

const apiUrl = import.meta.env.VITE_API_URL

async function readError(response: Response) {
    return (await response.text()) || `Request failed with status ${response.status}`
}

export async function getCurrentUser(): Promise<User | null> {
    const response = await fetch(`${apiUrl}/auth/me`, { credentials: "include" })
    if (response.status === 401) return null
    if (!response.ok) throw new Error(await readError(response))
    return response.json()
}

export async function login(username: string, password: string): Promise<User> {
    const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    })
    if (!response.ok) throw new Error(await readError(response))
    const user: User = await response.json()
    saveParticipantId(user.id)
    return user
}

export async function register(username: string, email: string, password: string): Promise<User> {
    const response = await fetch(`${apiUrl}/auth/register`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
    })
    if (!response.ok) throw new Error(await readError(response))
    const user: User = await response.json()
    saveParticipantId(user.id)
    return user
}

export async function logout() {
    await fetch(`${apiUrl}/auth/logout`, {
        method: "POST",
        credentials: "include",
    })
}
