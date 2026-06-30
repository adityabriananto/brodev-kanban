# Product Requirements Document (PRD)
**Project Name:** Brodev Household Kanban Board
**Document Version:** 1.0
**Date:** 2026-06-30

## 1. Product Overview
Sebuah *web application* berdesain premium bergaya Kanban (To Do, In Progress, Done) yang direkayasa khusus untuk kemudahan ekstra (*foolproof*), sehingga dapat dioperasikan oleh Asisten Rumah Tangga (ART) semudah memencet tombol profil di Netflix.

## 2. User Flow & Features

### 2.1. Authentication (Email & Password Login)
- Pengguna harus masuk menggunakan kombinasi **Email** dan **Password** yang telah didaftarkan oleh sistem.
- **Form Login:** Menggunakan desain *Glassmorphism* yang bersih dengan input teks besar (ramah ART).
- **Change Password:** Pengguna dapat mengubah *password* mereka kapan saja melalui tombol di sudut layar dalam aplikasi (*Board*).
- Sesi disimpan secara aman di `localStorage` agar ART tidak perlu selalu mengetik email setiap hari (tetap *login* kecuali melakukan *logout*).

### 2.2. The Kanban Board
- **Kolom:** To Do (Tugas Baru), In Progress (Sedang Dikerjakan), Done (Selesai).
- **Kartu Tugas:** Menampilkan Judul, Deskripsi singkat, dan Atribut "Jam" (waktu yang dialokasikan/ditambahkan).
- **Interaksi ART:** Cukup klik kartu dan pilih tombol besar "Kerjakan" atau "Selesai", atau gunakan fungsi *drag-and-drop* sederhana.

### 2.3. Real-Time Sync & Notifications
- Jika Pemilik Rumah menambahkan tugas baru di kantor (menggunakan profil Bapak), HP ART di rumah akan langsung memunculkan kartu tersebut secara *real-time*.
- Jika Pemilik menambahkan atribut "jam" ke dalam tugas, akan muncul *Toast Notification* di layar ART.

### 2.4. Role-Based Access Control (RBAC) & UI Restrictions
- **Profil ART:** Saat login sebagai ART, pengguna **tidak bisa** melihat tombol "Tambah Tugas" dan **tidak bisa** menghapus tugas. Namun, ART **diizinkan untuk merubah atribut "jam"**. Jika ART merubah jam, sistem **wajib** memunculkan kolom/popup yang meminta ART untuk mengisi "Alasan" (*Reason*) mengapa jam tersebut dirubah.
- **Profil Pemilik (Bapak/Ibu):** Memiliki akses penuh (Full Access) untuk membuat, mengedit, menghapus tugas, dan mengalokasikan jam tanpa batasan atau kewajiban mengisi alasan.



## 3. UI/UX & Design Guidelines (Mockups)
Desain diwajibkan menggunakan pendekatan **Mobile-First**, **Glassmorphism**, dan **High Contrast Pastel Colors**. Font harus besar dan terbaca jelas.

### Mockup 1: Halaman "Pilih Profil" (Simple Auth)
![Halaman Pilih Profil](C:\Users\adity\.gemini\antigravity\brain\47b43b15-ff00-4fb3-8dcb-e36ca02d8b3b\household_kanban_profile_mockup_1782792482240.png)
*(Catatan Desain: Tombol besar dengan avatar/ikon yang ramah)*

### Mockup 2: Halaman Kanban Board
![Kanban Board](C:\Users\adity\.gemini\antigravity\brain\47b43b15-ff00-4fb3-8dcb-e36ca02d8b3b\household_kanban_board_mockup_1782792493859.png)
*(Catatan Desain: Kartu lebar memenuhi layar HP, teks besar, kolom yang jelas).*

## 4. Technical Constraints
- **Backend:** Node.js, Express, Socket.io
- **Frontend:** React (Vite) + Vanilla CSS (No Tailwind unless explicitly required by infrastructure).
- **Database:** PostgreSQL (via Docker).
