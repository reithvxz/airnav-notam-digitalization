# AirNav NOTAM & Manajemen Shift System

Sistem digitalisasi terpadu untuk pengelolaan **Notice to Airmen (NOTAM)** dan **Manajemen Operasional Shift** berbasis web yang dikembangkan khusus untuk internal **AirNav Indonesia Cabang Surabaya**. Aplikasi ini merevolusi proses pengajuan manual menjadi terpusat, analitis, dan digital seutuhnya.

## Pembaruan Terbaru (Update Database, UI & Analitik)
- 📊 **Visualisasi Dashboard Ekstensif (BARU!)**: Admin Dashboard sekarang dirombak total menjadi 2 pilar utama dengan **12 Grafik Interaktif** menggunakan *Recharts*!
  - **NOTAM (6 Grafik)**: Distribusi Status, Distribusi Jenis, Distribusi Kategori (Aerodrome/En-route), Aktivitas per Personil, Tren Penerbitan Harian, dan Komparasi Aktif vs Selesai.
  - **Pre/Post-Shift (6 Grafik)**: Komparasi Pre vs Post per Shift, Distribusi Shift, Rasio Keterangan/Anomali Tambahan, Aktivitas per Supervisor, Aktivitas Harian, dan Tren Kepatuhan Pengumpulan Mingguan.
  - Dilengkapi dengan 10 Kartu Metrik Interaktif (*clickable*) untuk navigasi cepat.
- 📝 **Pre-Shift & Post-Shift Dinamis**: Fitur pembuatan Form *Pre-Shift Briefing* dan *Post-Shift Review* dengan UI *checklist* yang sangat cerdas (transisi otomatis ke mode teks untuk mencatat anomali), beserta pengaturan *default* waktu otomatis.
- ✨ **Custom UI Pickers & Modals**: Menghapus tampilan *default browser* secara menyeluruh dan menggantinya dengan komponen Pop-Up *custom* bergaya premium untuk *Date Picker*, *Time Picker*, *Custom Select*, serta Modal konfirmasi penghapusan.
- 🗄️ **Full-Stack MySQL**: Didukung oleh backend *Express.js* dan *MySQL* via *Sequelize ORM* untuk pengolahan relasional yang stabil.
- 🔐 **Manajemen Akun Terpusat**: Manager (Admin) memegang penuh kendali pembuatan akun untuk anggota tim operasi beserta dengan unggahan foto tanda tangan digital.
- 🎨 **Modern Glassmorphism UI**: Antarmuka *Login* dan tata letak *Sidebar* yang dikustomisasi dengan estetika *Glassmorphism*, palet biru premium, dan responsivitas halus.
- 🔒 **Tanda Tangan & Header Otomatis**: Generator PDF menggunakan `html2pdf.js` untuk mencetak dokumen siap rilis yang secara otomatis dibubuhi kop surat, *layout* standar, dan pindaian tanda tangan personil yang mengajukan.
- 📅 **Sistem Kalender Interaktif**: Modul kalender dengan peringatan cerdas (menggunakan `@fullcalendar/react`). Mendeteksi hari libur nasional, menampilkan *Upcoming Reminders* (H-3, H-1), dan pencatatan agenda berkategori warna.

## Fitur Utama

Aplikasi ini mendistribusikan akses berdasarkan Role pengguna:

1. **Admin / Manajemen Operasi**
   - **Dashboard Terintegrasi**: Mengakses 12 Grafik visualisasi kaya data untuk memantau aktivitas pembuatan NOTAM dan kepatuhan pengumpulan laporan pergantian Shift bulanan.
   - **Modul NOTAM**: Pembuatan form digital lengkap (termasuk *Assessment Only*), siklus manajemen *Replace* & *Cancel* terhubung, dan ekspor langsung ke format PDF baku.
   - **Modul Manajemen Shift**: Pengajuan *Pre-Shift* dan *Post-Shift* dengan fitur otomatisasi waktu dan *checklist* interaktif yang menangkap temuan operasional.
   - **Modul Pengguna**: Mengatur akun sistem dan memverifikasi tanda tangan digital karyawan.
   - **Modul Kalender**: Merencanakan agenda dengan pengingat dan penanda libur otomatis.

2. **Karyawan Biasa**
   - **Dashboard Karyawan**: Melihat seluruh dokumen (NOTAM dan Shift) yang telah diterbitkan dengan format kartu yang rapi.
   - **Filter Waktu & Status Pintar**: Memungkinkan pencarian dokumen yang kuat berdasarkan waktu, status, pembuat, dan jenis.
   - **PDF Viewer Built-in**: Fitur pratinjau dokumen langsung di dalam aplikasi (tanpa membuka *tab* baru) untuk pengalaman yang instan.

## Teknologi yang Digunakan

- **Frontend**: [React.js](https://reactjs.org/) + [Vite](https://vitejs.dev/) + Vanilla CSS.
- **Backend**: Node.js + Express.js.
- **Database**: MySQL 8.0+ dengan Sequelize ORM.
- **Visualisasi & Ikon**: Recharts & Lucide React.
- **PDF Generation**: `html2pdf.js`.

## Persiapan & Menjalankan Project Locally

Pastikan kamu sudah menginstal [Node.js](https://nodejs.org/) dan **XAMPP (MySQL)** di komputermu.

1. **Clone repository ini:**
   ```bash
   git clone https://github.com/reithvxz/airnav-notam-digitalization.git
   cd airnav-notam-digitalization
   ```

2. **Setup Database (MySQL):**
   - Buka XAMPP dan jalankan modul **MySQL**.
   - Buka phpMyAdmin (`http://localhost/phpmyadmin`) dan buat database baru bernama `airnav_db`.

3. **Install *dependencies* Backend & Frontend:**
   ```bash
   # Install dependensi backend
   cd backend
   npm install

   # Kembali ke folder utama dan install dependensi frontend
   cd ..
   npm install
   ```

4. **Jalankan Seed Data (Opsional, untuk membuat akun Manager awal):**
   ```bash
   cd backend
   node seed.js
   ```

5. **Jalankan Aplikasi:**
   Dibutuhkan dua terminal terpisah untuk menjalankan Backend dan Frontend.
   
   **Terminal 1 (Backend Server):**
   ```bash
   cd backend
   node server.js
   # Server akan berjalan di http://localhost:3000
   ```

   **Terminal 2 (Frontend Client):**
   ```bash
   npm run dev
   # Akses web di http://localhost:5173
   ```
