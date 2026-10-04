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

## Installation

Restore the backend dependencies:

```text
cd backend/BookWAis.Api
dotnet restore
```

Install the frontend dependencies:

```text
cd frontend
npm install
```

Restore the load-test dependencies:

```text
cd tests/BookWAis.LoadTests
dotnet restore
```

For local execution, configure the PostgreSQL connection string with .NET User Secrets before running the backend. For Docker execution, Docker Compose creates and configures the PostgreSQL service automatically.

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
cd tests/BookWAis.LoadTests
dotnet run -- browse
```

Select a scenario with the command argument:

```text
dotnet run -- browse
dotnet run -- booking <session-id>
dotnet run -- capacity <session-id> <new-capacity>
dotnet run -- cancellation <session-id>
```

`browse` sends 1,000 session requests. `booking` sends 50 booking requests. `capacity` runs booking requests while updating the selected session capacity. `cancellation` runs cancellation and booking requests at the same time. Replace `<session-id>` with an existing session ID. The selected session must be prepared for the scenario before running the test.

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
