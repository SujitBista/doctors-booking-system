## Doctors Booking System — MVP Features

### Personas

- Patient: searches doctors, books/cancels appointments, leaves reviews.
- Doctor: configures profile and availability, manages appointments.
- Admin: onboards doctors, manages specialties.

### Feature list with acceptance criteria

#### 1) User accounts and roles

- Patients can register, login, logout, refresh session.
- Doctors onboard via admin invite or self-serve invite flow; complete profile.
- RBAC enforced across endpoints and UI routes.
  Acceptance:
- Given a new patient, when they register, then they can log in and see their empty appointments list.
- Given a doctor invite, when the doctor accepts and completes required profile fields, then their profile is publicly visible.

#### 2) Doctor profile and discovery

- Public doctor profiles show specialties, clinic location, bio, price, reviews.
- Search doctors by specialty, location, and date with availability.
  Acceptance:
- Given a patient filters by specialty and date, then the results show matching doctors with next available slots.
- Given a doctor profile page, then a patient can see rating and reviews list.

#### 3) Availability and scheduling

- Doctors define recurring schedules and exceptions; system generates bookable `availability_slots`.
- Double-booking prevented; lead time and cancellation windows enforced.
  Acceptance:
- Given an available slot, when a patient books it, then an appointment is created and the slot is no longer available.
- Given a doctor view, when they open the dashboard, then they see upcoming appointments for the next 14 days.

#### 4) Appointments management

- Patients: view upcoming/past, cancel within policy.
- Doctors: confirm/cancel, add private notes.
  Acceptance:
- Given a patient attempts to view another user's appointment, then access is denied.
- Given a cancellation within allowed window, then the appointment status becomes `cancelled` and an audit log entry is created.

#### 5) Notifications (email)

- Booking confirmations, cancellations, reminders (24h and 2h before).
- Outbox ensures retries on transient failures.
  Acceptance:
- Given a booking is created, then a confirmation email is queued and marked sent upon provider success.
- Given an email send fails transiently, then it is retried with backoff and eventually marked failed after max attempts.

#### 6) Reviews (basic)

- Patients can review only after attended appointment.
  Acceptance:
- Given a completed appointment, then the patient can submit a rating and comment that appears on the doctor's profile.

#### 7) Admin (minimal)

- Manage specialties taxonomy; invite and approve doctors.
  Acceptance:
- Given an admin invites a doctor, then the doctor receives an email with a one-time token to join and complete profile.

### Out of scope (MVP)

- Payments, insurance, telehealth video, SMS, mobile apps, multi-clinic large org features.

### Metrics to track

- Search result CTR, booking conversion rate, cancellation rate, email delivery success, NPS/ratings.

### Rollout plan

1. Auth + basic roles → 2) Doctor profiles + search → 3) Availability + booking → 4) Email notifications → 5) Reviews → 6) Admin invite.
