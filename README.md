# Doctors Booking System

A modern web-based appointment booking system for healthcare providers. Built with React, Node.js, TypeScript, and PostgreSQL.

## 🚀 Features

- 🏥 **Doctor Profile Management** - Comprehensive doctor profiles with specialties, clinic locations, and pricing
- 📅 **Flexible Scheduling** - Advanced availability management with recurring schedules and exceptions
- 👥 **Role-Based Access Control** - Secure access for Patients, Doctors, and Admins
- 📧 **Automated Notifications** - Email confirmations, reminders, and cancellation notices
- ⭐ **Review System** - Patient reviews and ratings for completed appointments
- 🔒 **Secure Authentication** - JWT-based authentication with refresh token rotation
- 🛡️ **Double-Booking Prevention** - Robust scheduling system prevents conflicts
- 📱 **Responsive Design** - Modern UI built with React and Tailwind CSS

## 🏗️ Architecture

### Tech Stack

- **Frontend**: React + TypeScript + Vite, Tailwind CSS, React Query
- **Backend**: Node.js + TypeScript + Fastify
- **Database**: PostgreSQL with Kysely/Prisma for type-safe queries
- **Authentication**: JWT access + refresh tokens in HttpOnly cookies
- **Email**: Outbox pattern with Resend/SendGrid integration
- **Deployment**: Docker containers on Fly.io/Render/Heroku

### Design Principles

- **Functional Services**: Export named functions instead of service classes
- **Security First**: Input validation, rate limiting, RBAC enforcement
- **Reliability**: At-least-once email delivery, audit logging
- **Developer Experience**: TypeScript everywhere, structured logging

## 📋 MVP Features

### User Management

- Patient registration and authentication
- Doctor onboarding via admin invites
- Role-based access control across all endpoints

### Appointment Booking

- Search doctors by specialty, location, and availability
- Real-time slot booking with conflict prevention
- Cancellation policies with configurable windows

### Doctor Management

- Profile creation with specialties and clinic information
- Availability configuration with recurring schedules
- Appointment dashboard with upcoming bookings

### Notifications

- Booking confirmations and cancellations
- Appointment reminders (24h and 2h before)
- Reliable delivery via outbox pattern

## 🗄️ Database Schema

Key entities:

- `users` - Authentication and role management
- `doctors` / `patients` - User profiles and specializations
- `availability_slots` - Generated bookable time slots
- `appointments` - Booking records with status tracking
- `reviews` - Patient feedback and ratings
- `notifications_outbox` - Reliable email delivery queue

## 🚦 API Endpoints

### Authentication

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Token refresh
- `POST /api/v1/auth/logout` - User logout

### Doctors

- `GET /api/v1/doctors` - Search and list doctors
- `GET /api/v1/doctors/:id` - Doctor profile details
- `GET /api/v1/doctors/:id/availability` - Available time slots

### Appointments

- `POST /api/v1/appointments` - Book appointment
- `GET /api/v1/appointments/:id` - Appointment details
- `DELETE /api/v1/appointments/:id` - Cancel appointment
- `GET /api/v1/me/appointments` - User's appointments

### Reviews

- `POST /api/v1/doctors/:id/reviews` - Submit review
- `GET /api/v1/doctors/:id/reviews` - Doctor reviews

## 🏃‍♂️ Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Docker (optional)

### Development Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/doctors-booking-system.git
cd doctors-booking-system

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Set up database
npm run db:migrate
npm run db:seed

# Start development server
npm run dev
```

### Environment Variables

```env
DATABASE_URL=postgresql://user:password@localhost:5432/doctors_booking
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
EMAIL_PROVIDER_API_KEY=your-email-api-key
```

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run integration tests
npm run test:integration

# Run all tests with coverage
npm run test:coverage
```

## 📦 Deployment

### Docker

```bash
# Build image
docker build -t doctors-booking-system .

# Run container
docker run -p 3000:3000 doctors-booking-system
```

### Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] Email provider configured
- [ ] Monitoring and logging set up

## 📚 Documentation

- [Architecture Overview](docs/architecture.md) - Detailed system architecture and design decisions
- [MVP Features](docs/mvp-features.md) - Complete feature specifications and acceptance criteria
- [API Documentation](docs/api.md) - Detailed API endpoint documentation (coming soon)
- [Deployment Guide](docs/deployment.md) - Production deployment instructions (coming soon)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies and best practices
- Designed for healthcare providers and patients
- Focused on reliability, security, and user experience
