## Doctors Booking System — MVP Architecture

### Goals and principles

- Start simple, optimize later. Prefer managed services and low ops burden.
- Functional services: export named functions that call shared Postgres helpers (`query`, `withTransaction`). No service classes.
- Security by default, minimal blast radius, clear layering, dev-prod parity.

### High-level components

- Frontend (Web): React + TypeScript + Vite, Tailwind CSS. React Query for server cache. Minimal global store only if needed.
- Backend API: Node.js + TypeScript with Fastify. Controllers → validators (Zod) → functional services → DB.
- Database: Postgres (local/Docker in dev, managed in prod). Typed SQL via Kysely or Prisma.
- Auth: Email/password (JWT access + refresh rotation). Roles: patient, doctor, admin. Cookies: HttpOnly, SameSite=Lax.
- Scheduling: Availability definition → generated bookable slots → booking with double-book prevention.
- Notifications: Email provider (Resend/Sendgrid) through outbox pattern for reliable delivery.
- Observability: Structured logging (pino), request IDs, basic metrics later.
- Deployment: Docker containers; Fly.io/Render/Heroku for MVP.

### Backend layering (functional)

- `src/app/http`: route registration and request handlers (no business logic).
- `src/app/validators`: Zod schemas for request/response.
- `src/app/services`: named exported functions that directly use `query`/`withTransaction`.
- `src/domain`: entities, value objects, domain types.
- `src/infra/db`: Postgres pool and helpers (`query`, `withTransaction`).
- `src/infra/email`: email sender implementation and outbox worker.
- `src/utils`: shared utilities (timezones, ids, passwords, etc.).

### API surface (v1)

- Auth: `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh`, `POST /api/v1/auth/logout`
- Doctors: `GET /api/v1/doctors`, `GET /api/v1/doctors/:id`, `GET /api/v1/doctors/:id/availability`
- Appointments: `POST /api/v1/appointments`, `GET /api/v1/appointments/:id`, `DELETE /api/v1/appointments/:id`, `GET /api/v1/me/appointments`
- Reviews: `POST /api/v1/doctors/:id/reviews`, `GET /api/v1/doctors/:id/reviews`

### Core data model (MVP)

- `users` (id, email, password_hash, role, created_at)
- `doctors` (id, user_id, name, bio, price, clinic_location, timezone, created_at)
- `patients` (id, user_id, name, created_at)
- `specialties` (id, name)
- `doctor_specialties` (doctor_id, specialty_id)
- `availability_slots` (id, doctor_id, start_time_utc, end_time_utc, is_exception, created_at)
- `appointments` (id, doctor_id, patient_id, start_time_utc, end_time_utc, status, created_at)
- `reviews` (id, doctor_id, patient_id, rating, comment, created_at)
- `notifications_outbox` (id, type, payload_json, status, attempts, next_retry_at, created_at)
- `audit_logs` (id, user_id, action, entity, entity_id, metadata_json, created_at)

Notes:

- All timestamps stored in UTC; presentation converts to client timezone.
- Enforce unique constraints to prevent double booking (doctor_id, start_time_utc, end_time_utc).

### Security and auth

- Passwords: Argon2id or bcrypt with strong parameters. Email verification v2.
- Sessions: JWT access (short-lived) + refresh tokens (rotated) in HttpOnly cookies.
- RBAC middleware: patient, doctor, admin.
- Input validation for every endpoint; centralized error handler; rate limiting.

### Scheduling flow (MVP)

1. Doctor defines recurring rules and exceptions → system materializes `availability_slots`.
2. Patient searches doctors by specialty/location/date → sees next available slots.
3. Patient books a slot → creates `appointments` with status `booked` and marks slot unavailable.
4. Emails dispatched via outbox; doctor/patient dashboards show upcoming appointments.
5. Cancellations respect policy windows; audit logs capture create/cancel actions.

### Notifications

- Outbox table ensures at-least-once delivery with retry and backoff.
- Email templates: booking confirmation, cancellation, reminders (24h and 2h before).

### Testing strategy

- Unit: functional services in isolation with test DB.
- Integration: booking flow with supertest against Fastify instance and ephemeral DB.
- E2E (later): smoke tests on staging.

### Deployment

- Single API container and one Postgres instance per environment.
- Simple CI: typecheck, lint, unit/integration tests, build, docker image, deploy.

### Non-functional requirements (MVP)

- Availability: business hours; no multi-region.
- Latency: P95 < 300ms for common reads.
- Reliability: At least-once for emails; idempotent booking where possible.

### Example backend directory layout

```
src/
  app/
    http/
    validators/
    services/
  domain/
  infra/
    db/
    email/
  utils/
```

This architecture intentionally favors clarity and speed to MVP while leaving room to evolve.
