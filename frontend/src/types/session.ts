export type Session = {
    id: number;
    title: string;
    speakerId: number;
    room: string;
    startTime: string;
    endTime: string;
    capacity: number;
    remainingSeats: number;
}