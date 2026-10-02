# BookWAis

Workshop booking application for conferences and training events.

## Features

Participant:

- Browse sessions and remaining seats
- Reserve a seat
- View and cancel reservations

Admin:

- Manage sessions, speakers, schedules, rooms, and capacity
- Monitor registered participants and session capacity

## Stack

- Frontend: React, TypeScript, Vite
- Backend: .NET 10 ASP.NET Core Web API
- Database: PostgreSQL with Entity Framework Core
- Load testing: NBomber

## Project Structure

```text
backend/BookWAis.Api       ASP.NET Core API
frontend                   React application
tests/BookWAis.LoadTests   Load and concurrency tests
```

## Requirements

- .NET 10 SDK
- Node.js
- PostgreSQL

## Run Backend

Configure the PostgreSQL connection string with .NET User Secrets, then run:

```text
cd backend/BookWAis.Api
dotnet ef database update
dotnet run
```

The API runs at `http://localhost:5011`.

## Run Frontend

Create `frontend/.env`:

```text
VITE_API_URL=http://localhost:5011/api
```

Then run:

```text
cd frontend
npm install
npm run dev
```

## Frontend Pages

- `/sessions` participant session list and booking
- `/reservations` participant reservations
- `/admin/sessions` session management
- `/admin/speakers` speaker management
- `/admin/dashboard` booking monitoring

## Concurrency Control

Booking, capacity updates, and cancellation use a database transaction with PostgreSQL `FOR UPDATE` on the session row.

The booking flow locks the session, checks duplicate reservations and capacity, saves the reservation, and commits the transaction.

The database also enforces a unique `(UserId, SessionId)` constraint and an index on `Reservations.SessionId`.

## Load Tests

Run from `tests/BookWAis.LoadTests` while the backend is running:

```text
dotnet run
```

Scenarios:

- 1,000 simultaneous session reads
- 50 booking requests for the final 5 seats
- Booking while capacity is decreased
- Cancellation while new bookings are submitted

Expected results: no overbooking, no duplicate reservations, consistent capacity updates, and appropriate success or conflict responses.

## Run with Docker

Install Docker Desktop, then run from the project root:

```text
docker compose up --build
```

Open `http://localhost:5173`. The Compose setup starts PostgreSQL, applies migrations through the backend, and starts the frontend with `VITE_API_URL` from the Compose environment.
