import type { Speaker } from "../types/speaker"

const apiUrl = import.meta.env.VITE_API_URL

export async function getSpeakers(): Promise<Speaker[]> {
    const response = await fetch(`${apiUrl}/Speakers`)
    if (!response.ok) throw new Error("Failed to load speakers")
    return response.json()
}

export async function saveSpeaker(speaker: Omit<Speaker, "id">, id: number | null) {
    const response = await fetch(`${apiUrl}/Speakers${id === null ? "" : `/${id}`}`, {
        method: id === null ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(speaker),
    })
    if (!response.ok) throw new Error((await response.text()) || "Failed to save speaker")
}

export async function deleteSpeaker(id: number) {
    const response = await fetch(`${apiUrl}/Speakers/${id}`, { method: "DELETE" })
    if (!response.ok) throw new Error((await response.text()) || "Failed to delete speaker")
}
