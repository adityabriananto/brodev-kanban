# TPM Bug Report: Missing Copyright Footer

**Date/Time:** 2026-06-30 11:34:28
**Status:** High Priority (Bug Fix)
**Reported by:** User (Homeowner/QA)
**Assigned to:** Dev Team

## 1. Issue Description
Berdasarkan hasil peninjauan (QA) langsung dari *Owner*, elemen teks **Copyright** yang diinstruksikan pada spesifikasi Phase 2 ternyata **belum terimplementasi** atau tidak muncul di UI aplikasi.

## 2. Action Items untuk Frontend (React)
Tim Dev, tolong segera hentikan sementara pekerjaan Socket.io kalian dan lakukan *hotfix* ini SEKARANG:
- [ ] Buka file komponen *layout* utama kalian (misalnya `App.jsx` atau `layout/index.jsx`).
- [ ] Sisipkan elemen `<footer>` statis di bagian paling bawah antarmuka.
- [ ] Isi teks *footer* dengan: `© 2026 Brodev. All rights reserved.`
- [ ] Berikan gaya *Vanilla CSS* agar teks berada di tengah (*text-align: center*), warna sedikit pudar (*opacity: 0.6* atau *color: gray*), dan tidak tertimpa oleh kartu Kanban.

## 3. Catatan TPM
Jangan gabungkan *commit* ini dengan fitur Socket.io. Rilis perbaikan ini sebagai *hotfix* mandiri agar *Owner* bisa segera melihat perubahannya di layar. Segera beritahu jika *hotfix* ini sudah di-*deploy*!
