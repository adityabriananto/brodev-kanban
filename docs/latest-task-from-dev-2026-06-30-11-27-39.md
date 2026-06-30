# Dev Team Report

**Date/Time:** 2026-06-30 11:27:39
**Status:** Phase 1 & Hotfixes Completed

## Executive Summary
Sesuai instruksi dan kesepakatan *workflow* terbaru, ini adalah laporan dari tim Developer terkait penyelesaian tugas yang telah dikerjakan sejauh ini:

1. **Inisialisasi Proyek Phase 1**
   - Setup aplikasi React Vite (Frontend) di dalam folder `brodev-kanban-frontend`.
   - Setup aplikasi Node.js Express (Backend) di dalam folder `brodev-kanban-backend`.
   - Konfigurasi `docker-compose.yml` untuk memutar container PostgreSQL dan menyusun tabel `users` & `tasks` di `db/init.sql`.
   - Repository *Git* sudah diinisialisasi untuk pelacakan kode.

2. **Implementasi UI & Fitur Utama**
   - Halaman **Pilih Profil** (Login tanpa password) siap digunakan.
   - Halaman utama **Kanban Board** dengan 3 kolom (To Do, In Progress, Done) berjalan dengan UI Vanilla CSS *mobile-first* (berwarna pastel, elemen membulat, gaya modern).
   - Seluruh fungsi manajemen tugas CRUD (Create, Read, Update, Delete) sudah tersambung langsung dengan *Backend* secara nyata (*real database*).

3. **Penyelesaian RBAC (Role-Based Access Control) & Hotfixes**
   - Mengikuti *Executive Order* TPM, fitur "Hapus Tugas" dan form "Tambah Tugas baru" dibatasi secara ketat hanya untuk pengguna berstatus `owner` (Bapak/Ibu).
   - Fitur *Inline Editing* pada atribut "Jam": *Owner* bebas mengganti angka jam. Jika profil yang login adalah "ART", saat ia mengubah jam, aplikasi memunculkan *Modal* wajib isi **Alasan Ubah Jam**. Jika kolom alasan kosong, data tidak bisa disimpan.
   - Kolom `hour_change_reason` sukses disematkan pada database dan sistem penyimpanan *backend*.
   - Profil "ART" dihilangkan dari *seed data* SQL dan digantikan dengan UI "+ Tambah Profil ART" di layar awal agar pengguna (owner) bebas menambahkannya.

## Status Aplikasi Saat Ini
- Aplikasi berjalan normal di ekosistem lokal.
- Docker PostgreSQL: *Running* (di-deploy).
- API Backend: *Running* di latar belakang.
- Frontend: *Running* dan dapat diakses di `http://localhost:5174/`.

Menunggu instruksi lanjutan (seperti memulai Phase 2) dari TPM/Pengguna.
