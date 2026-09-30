# BookWAis
BookWAis is a simple workshhop booking web application for conferences or training event


## Features
### Participant
- View available workshop sessions
- View session information
- View remaining seat availability
- Reserve a seat
- View current reservations
- Cancel a reservation
- Receive a clear response when a session is full
- Prevent duplicate booking for the same session

### Admin
- Create, update, and delete sessions
- Manage session title, room, time, speaker, and capacity
- Create, update, and delete speakers
- View the number of participants registered for each session
- Increase or decrease session capacity
- Monitor booking status from the admin dashboard


## Pages
### Participant
- Sessions (Browse sessions, view availability, and reserve a seat)
- My Reservations (View and cancel existing reservation)

### Admin
- Dashboard (Monitor current bookings and session capacity)
- Manage Sessions (CUD sessions and change capacity)
- Manage Speakers (CUD speaker information)


## Technology
### Frontend
- React
- Typescript
- Vite

### Backend
- .NET 10
- ASP.NET Core Web API
- Entity Framework Core

### Database
- PostgreSQL

### Testing
- xUnit
- Integration Testing
- Load / Concurrency Testing


## Main Rules
- A participant cannot book the same session more than once
- Reservations cannot exceed session capacity
- Cancelled reservations make seats available again
- Capacity cannot be reduced below current reservations