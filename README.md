# Forex Community App

A secure, invite-only community platform for Forex traders. Built as a full-stack portfolio project representing a real-world production system — not a tutorial clone.

Inspired by the lack of trust and verification in most trading communities on Telegram and Discord, this app treats access control, identity verification, and moderation as first-class concerns.

---

## The Problem

Most Forex trading communities live in public Telegram groups or unmoderated Discord servers. The result:

- Unverified users and rampant impersonation
- No moderation or accountability
- Sensitive trading discussions exposed to anyone
- Zero control over who joins or what gets shared

This project is an attempt to build what those platforms should have been.

---

## Features

- **Invite-only access** — users must register, verify via email OTP, and gain admin approval before entering
- **Role-based access control** — admins manage users, moderate content, and control community access
- **Private community chat** — structured discussions in a closed, verified environment
- **JWT authentication** — stateless, token-based auth with secure session handling
- **Security-first design** — no secrets in the codebase, environment-based config, unauthorised access blocked at every layer

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT, OTP via email |
| Frontend | React, Tailwind CSS, Vite |
| HTTP client | Axios |
| Config | dotenv |

---

## Project Structure
backend/
├── controllers/      # Route logic
├── models/           # Mongoose schemas
├── routes/           # API endpoints
├── middleware/       # Auth guards, error handling
├── utils/            # Helpers (email, token generation)
└── server.js
frontend/
├── src/
│   ├── components/   # Reusable UI
│   ├── pages/        # Route-level views
│   ├── context/      # Global auth state
│   ├── services/     # Axios API calls
│   └── App.jsx

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Backend
```bash
cd backend
npm install
```

Create a `.env` file:
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

```bash
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies API calls to the backend on port 5000.

---

## Roadmap

- **Real-time messaging** — replace polling with WebSockets via Socket.io for live chat
- **Moderation tools** — message flagging, user suspension, audit logs for admins
- **Trade signal channels** — structured channels for sharing setups with image and chart support
- **Two-factor authentication** — TOTP-based 2FA as a second layer beyond email OTP
- **Rate limiting and brute-force protection** — lockout policies on auth endpoints
- **End-to-end encryption** — encrypted messages so even the server cannot read private discussions
- **Mobile app** — React Native client sharing the same backend API
- **Production deployment** — Dockerised deployment to Railway or Render with CI/CD via GitHub Actions

---

## Why This Project

Most portfolio projects are todo apps with a login screen. This one starts from a real problem — the absence of trust in online trading communities — and builds a system designed around that constraint.

It demonstrates full-stack architecture, security thinking, role-based system design, and the ability to scope and build a non-trivial product from scratch.

---

## Status

Active development. Core authentication, user management, and architecture are complete. Chat and moderation features are in progress.
