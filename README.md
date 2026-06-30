# 🏠 Brodev Household Kanban Board

A premium household task management application built on a Kanban-style board, designed to streamline communication between **Homeowners** and their **Household Assistants (ART)**.

---

## ✨ Key Features

- **🔐 Email & Password Authentication** — Secure login with `bcrypt` password hashing. Every user has their own account.
- **👥 User Management** — Owners can add, remove, and reset passwords for household assistants directly from the UI — no code changes needed.
- **📋 Kanban Board** — Three columns: *To Do*, *In Progress*, and *Done*.
- **📌 Task Assignment** — Owners can assign each task card to a specific household assistant.
- **⚡ Real-Time Sync** — Powered by Socket.io. Changes made by one user instantly appear on all other connected screens — no refresh needed.
- **🔔 Toast Notifications** — Automatic in-app notifications when task hours are modified.
- **🛡️ Role-Based Access Control (RBAC)**:
  - **Owner**: Full access — create, edit, delete tasks, and manage users.
  - **ART (Household Assistant)**: Can only move task status and modify hours (a reason is mandatory for hour changes).

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) + Vanilla CSS |
| Backend | Node.js + Express + Socket.io |
| Database | PostgreSQL (via Docker) |
| Auth | bcrypt password hashing |
| Real-time | Socket.io |

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Git

### 1. Clone the Repository
```bash
git clone git@github.com:adityabriananto/brodev-kanban.git
cd brodev-kanban
```

### 2. Start the Database
```bash
docker-compose up -d
```

### 3. Start the Backend
```bash
cd brodev-kanban-backend
npm install
npm run dev
```
Backend runs at: `http://localhost:3000`

### 4. Start the Frontend
```bash
cd brodev-kanban-frontend
npm install
npm run dev
```
Frontend runs at: `http://localhost:5173`

---

## 👤 Default Accounts

| Name | Email | Password | Role |
|---|---|---|---|
| Bapak | `bapak@rumah.com` | `password123` | Owner |
| Ibu | `ibu@rumah.com` | `password123` | Owner |
| ART | `art@rumah.com` | `password123` | Household Assistant |

> ⚠️ **Important:** Change your default password immediately after first login using the 🔒 button in the top-right corner of the app.

---

## 📁 Project Structure

```
brodev-kanban/
├── brodev-kanban-backend/       # Node.js + Express API
│   ├── server.js                # Main server & all API routes
│   ├── db.js                    # PostgreSQL connection pool
│   └── package.json
├── brodev-kanban-frontend/      # React (Vite) app
│   └── src/
│       ├── components/
│       │   ├── AuthForm.jsx             # Login page
│       │   ├── KanbanBoard.jsx          # Main board view
│       │   ├── TaskCard.jsx             # Individual task card
│       │   └── UserManagementModal.jsx  # User management panel
│       └── App.jsx
├── db/
│   └── init.sql                 # PostgreSQL schema & seed data
├── docker-compose.yml           # PostgreSQL container config
└── docs/                        # TPM tickets & product documentation
```

---

## 📄 Documentation

Technical and product documentation is available in the [`docs/`](./docs/) folder:
- `BRD.md` — Business Requirements Document
- `PRD.md` — Product Requirements Document
- `tpm-task-to-dev-*.md` — Developer task tickets from the TPM

---

## ©️ Copyright

© 2026 Brodev. All rights reserved.
