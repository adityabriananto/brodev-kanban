# Business Requirements Document (BRD)
**Project Name:** Brodev Household Kanban Board
**Document Version:** 1.0
**Date:** 2026-06-30

## 1. Executive Summary
Brodev Household Kanban Board adalah aplikasi manajemen tugas internal rumah tangga yang dirancang untuk menjembatani komunikasi dan ekspektasi kerja antara Pemilik Rumah (Suami/Istri) dan Asisten Rumah Tangga (ART). Sistem ini dibuat untuk menggantikan instruksi lisan atau *chat* berantakan menjadi sistem pelacakan visual yang terstruktur dan bekerja secara *real-time*.

## 2. Business Objectives
- **Meningkatkan Efisiensi:** Memastikan ART selalu tahu apa yang harus dikerjakan tanpa harus terus-menerus bertanya.
- **Transparansi Waktu & Tugas:** Pemilik rumah dapat melacak tugas yang sedang dikerjakan dan mencatatkan "jam" kerja/ekstra pada kartu tugas tertentu.
- **Mengurangi Miskomunikasi:** Segala perubahan status tugas disinkronkan secara langsung di kedua perangkat (Pemilik dan ART).

## 3. Target Audience / Personas
1. **Pemilik Rumah (Bapak/Ibu):**
   - **Karakteristik:** Sibuk bekerja, membutuhkan pemantauan cepat terhadap kondisi pekerjaan rumah.
   - **Kebutuhan Utama:** Menambahkan tugas baru, memberikan estimasi jam, memantau *progress*.
2. **Asisten Rumah Tangga (ART):**
   - **Karakteristik:** Membutuhkan instruksi yang sangat jelas, tidak terbiasa dengan UI aplikasi perusahaan (Enterprise) yang rumit.
   - **Kebutuhan Utama:** Melihat tugas apa yang harus diselesaikan hari ini, memindahkan kartu tugas ke "Selesai" dengan mudah.

## 4. Scope of Work (Phased Approach)
- **Phase 1:** Fondasi & UI "Pilih Profil" sederhana, Manajemen Kartu Kanban dasar.
- **Phase 2:** Sinkronisasi *Real-Time* (Socket.io).
- **Phase 3:** Pelacakan penambahan jam dan Notifikasi *In-App*.
- **Phase 4:** Cloud Deployment (Fly.io) dan Notifikasi Eksternal (WhatsApp/Telegram).

## 5. Success Metrics (KPIs)
- **Adopsi ART:** ART dapat menggunakan aplikasi tanpa kebingungan di hari pertama.
- **Zero Refresh:** Semua pembaruan tugas harus muncul di perangkat lain dalam waktu kurang dari 1 detik tanpa perlu *refresh* halaman.
