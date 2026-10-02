const participantIdKey = "bookwais-participant-id"

export function getParticipantId() {
    const storedId = Number(localStorage.getItem(participantIdKey))
    return storedId > 0 ? storedId : 1
}

export function saveParticipantId(id: number) {
    if (id > 0) localStorage.setItem(participantIdKey, String(id))
}
