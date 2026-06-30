# 🏠 Brodev Household Kanban Board

Aplikasi manajemen tugas rumah tangga berbasis Kanban yang didesain untuk memudahkan komunikasi antara **Pemilik Rumah** (Owner) dan **Asisten Rumah Tangga** (ART).

---

## ✨ Fitur Utama

- **🔐 Autentikasi Email & Password** — Login aman dengan `bcrypt` hashing. Setiap pengguna punya akun masing-masing.
- **👥 Manajemen Pengguna** — Owner dapat menambah, menghapus, dan mereset password ART langsung dari UI tanpa menyentuh kode.
- **📋 Kanban Board** — Tiga kolom: *To Do*, *In Progress*, dan *Done*.
- **📌 Penugasan Tugas** — Owner dapat menugaskan setiap kartu tugas ke ART spesifik.
- **⚡ Real-Time Sync** — Menggunakan Socket.io. Perubahan oleh satu pengguna langsung muncul di layar pengguna lain tanpa refresh.
- **🔔 Toast Notification** — Notifikasi muncul otomatis ketika ada perubahan jam pada tugas.
- **🛡️ Role-Based Access Control (RBAC)**:
  - **Owner**: Akses penuh (tambah, edit, hapus tugas, kelola pengguna).
  - **ART**: Hanya bisa menggeser status tugas & mengubah jam (wajib isi alasan).

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | React (Vite) + Vanilla CSS |
| Backend | Node.js + Express + Socket.io |
| Database | PostgreSQL (via Docker) |
| Auth | bcrypt password hashing |
| Real-time | Socket.io |

---

## 🚀 Cara Menjalankan Lokal

### Prasyarat
- [Node.js](https://nodejs.org/) v18+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Git

### 1. Clone Repository
```bash
git clone git@github.com:adityabriananto/brodev-kanban.git
cd brodev-kanban
```

### 2. Jalankan Database
```bash
docker-compose up -d
```

### 3. Jalankan Backend
```bash
cd brodev-kanban-backend
npm install
npm run dev
```
Backend berjalan di: `http://localhost:3000`

### 4. Jalankan Frontend
```bash
cd brodev-kanban-frontend
npm install
npm run dev
```
Frontend berjalan di: `http://localhost:5173`

---

## 👤 Akun Default

| Nama | Email | Password | Role |
|---|---|---|---|
| Bapak | `bapak@rumah.com` | `password123` | Owner |
| Ibu | `ibu@rumah.com` | `password123` | Owner |
| ART | `art@rumah.com` | `password123` | ART |

> ⚠️ **Penting:** Segera ubah password default setelah pertama kali login melalui tombol 🔒 di pojok kanan atas aplikasi.

---

## 📁 Struktur Proyek

```
brodev-kanban/
├── brodev-kanban-backend/     # Node.js + Express API
│   ├── server.js              # Main server & API routes
│   ├── db.js                  # PostgreSQL connection pool
│   └── package.json
├── brodev-kanban-frontend/    # React (Vite) app
│   └── src/
│       ├── components/
│       │   ├── AuthForm.jsx           # Halaman Login
│       │   ├── KanbanBoard.jsx        # Board utama
│       │   ├── TaskCard.jsx           # Kartu tugas
│       │   └── UserManagementModal.jsx # Panel kelola pengguna
│       └── App.jsx
├── db/
│   └── init.sql               # Schema & seed data PostgreSQL
├── docker-compose.yml         # PostgreSQL container config
└── docs/                      # Dokumentasi TPM & PRD
```

---

## 📄 Dokumentasi

Dokumentasi teknis dan product tersedia di folder [`docs/`](./docs/):
- `BRD.md` — Business Requirements Document
- `PRD.md` — Product Requirements Document
- `tpm-task-to-dev-*.md` — Tiket instruksi dari TPM ke Developer

---

## ©️ Copyright

© 2026 Brodev. All rights reserved.
