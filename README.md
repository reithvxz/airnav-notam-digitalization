# AirNav NOTAM & Manajemen Shift System

Sistem digitalisasi terpadu untuk pengelolaan **Notice to Airmen (NOTAM)** dan **Manajemen Operasional Shift** berbasis web yang dikembangkan khusus untuk internal **AirNav Indonesia Cabang Surabaya**. Aplikasi ini merevolusi proses pengajuan manual menjadi terpusat, analitis, dan digital seutuhnya.

## Pembaruan Terbaru (Update Database, UI & Analitik)
- 📊 **Visualisasi Dashboard Ekstensif (BARU!)**: Admin Dashboard sekarang dirombak total menjadi 3 pilar utama dengan belasan Grafik Interaktif menggunakan *Recharts*!
  - **NOTAM**: Distribusi Status, Distribusi Jenis, Distribusi Kategori (Aerodrome/En-route), Aktivitas per Personil, Tren Penerbitan Harian, dan Komparasi Aktif vs Selesai.
  - **Pre/Post-Shift**: Komparasi Pre vs Post per Shift, Distribusi Shift, Rasio Keterangan/Anomali Tambahan, Aktivitas per Supervisor, Aktivitas Harian, dan Tren Kepatuhan Pengumpulan Mingguan.
  - **Preduty**: Tren Pengajuan Harian Preduty, Sebaran Waktu Shift (Pagi/Siang/Malam), Heatmap Kepadatan Kesiapan, dan Bar Chart Top Pengaju Laporan.
  - Dilengkapi dengan Kartu Metrik Interaktif (*clickable*) untuk navigasi cepat.
- 📝 **Preduty, Pre-Shift & Post-Shift Dinamis**: Fitur pembuatan Form *Preduty Briefing*, *Pre-Shift Briefing* dan *Post-Shift Review* dengan UI *checklist* yang sangat cerdas (transisi otomatis ke mode teks untuk mencatat anomali), beserta pengaturan *default* waktu otomatis dan *word-wrap* untuk PDF export. Tersedia juga **Filter Spesifik** untuk menyaring dokumen berdasarkan *Shift*, *Incoming Manager*, dan *Outgoing Manager*.
- 🤖 **SIMO Bot (Powered by Gemini AI)**: Asisten Virtual cerdas yang didukung oleh *Google Gemini 3.5 Flash*. Terintegrasi penuh ke dalam sistem untuk menjawab pertanyaan seputar operasional NOTAM, laporan shift, dan panduan penggunaan aplikasi, lengkap dengan pengenalan identitas pengguna.
- ✨ **Custom UI Pickers & Modals**: Menghapus tampilan *default browser* secara menyeluruh dan menggantinya dengan komponen Pop-Up *custom* bergaya premium untuk *Date Picker*, *Time Picker*, *Custom Select*, serta Modal konfirmasi penghapusan.
- 🕒 **Aktivitas Terbaru Lebih Komprehensif**: Fitur riwayat kini menarik pembaruan 10 aktivitas terkini dari seluruh jenis dokumen (NOTAM, Preduty, dan Manajemen Shift) secara *real-time*.
- 🗄️ **Full-Stack MySQL**: Didukung oleh backend *Express.js* dan *MySQL* via *Sequelize ORM* untuk pengolahan relasional yang stabil.
- 🔐 **Manajemen Akun Terpusat**: Manager (Admin) memegang penuh kendali pembuatan akun untuk anggota tim operasi beserta dengan unggahan foto tanda tangan digital.
- 🎨 **Modern Glassmorphism UI**: Antarmuka *Login* dan tata letak *Sidebar* yang dikustomisasi dengan estetika *Glassmorphism*, palet biru premium, dan responsivitas halus.
- 🔒 **Tanda Tangan & Header Otomatis**: Generator PDF menggunakan `html2pdf.js` untuk mencetak dokumen siap rilis yang secara otomatis dibubuhi kop surat, *layout* standar, dan pindaian tanda tangan personil yang mengajukan. Termasuk optimisasi kompresi resolusi agar ukuran file tetap ringan.
- 📅 **Sistem Kalender Interaktif**: Modul kalender dengan peringatan cerdas (menggunakan `@fullcalendar/react`). Mendeteksi hari libur nasional, menampilkan *Upcoming Reminders* (H-3, H-1), dan pencatatan agenda berkategori warna.

## Fitur Utama

Aplikasi ini mendistribusikan akses berdasarkan Role pengguna:

1. **Admin / Manajemen Operasi**
   - **Dashboard Terintegrasi**: Mengakses 12 Grafik visualisasi kaya data untuk memantau aktivitas pembuatan NOTAM dan kepatuhan pengumpulan laporan pergantian Shift bulanan.
   - **Modul NOTAM**: Pembuatan form digital lengkap (termasuk *Assessment Only*), siklus manajemen *Replace* & *Cancel* terhubung, dan ekspor langsung ke format PDF baku.
   - **Modul Manajemen Shift & Preduty**: Pengajuan *Preduty*, *Pre-Shift* dan *Post-Shift* dengan fitur otomatisasi waktu, dukungan multi-gambar otomatis dikompres, dan *checklist* interaktif yang menangkap temuan operasional. Ekspor PDF dinamis tanpa kepotong.
   - **Modul Pengguna**: Mengatur akun sistem dan memverifikasi tanda tangan digital karyawan.
   - **Modul Kalender**: Merencanakan agenda dengan pengingat dan penanda libur otomatis.

2. **Employee (Karyawan)**
   - **Dashboard Employee**: Mengakses halaman dokumen NOTAM (sebagai *landing page* default), serta melihat riwayat arsip dokumen *Preduty*, *Pre-Shift*, dan *Post-Shift*.
   - **Akses Dokumen Terbuka**: Melihat seluruh dokumen operasional yang telah diterbitkan lengkap dengan *Filter Waktu & Status Pintar* (mencari berdasarkan shift, status, pembuat, dan jenis).
   - **PDF Viewer Built-in**: Fitur pratinjau seluruh format dokumen (dengan fungsi potong multi-halaman proporsional otomatis) langsung di dalam aplikasi untuk pengalaman instan.
   - **Akses Terbatas Terjaga**: Fitur modifikasi profil seperti penggantian *password* dikunci (*disabled*) demi keamanan tata kelola akun terpusat.

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

   # Setup File Environment
   # Buat file bernama .env di dalam folder backend lalu isi dengan baris berikut:
   # GEMINI_API_KEY=KODE_API_KEY_GOOGLE_ANDA
   # (Dapatkan API Key melalui Google AI Studio)

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

6. **Login Akun Default:**
   Setelah melakukan *seed data*, Anda dapat masuk ke sistem menggunakan salah satu akun Admin/Manager default berikut:
   - **Username/Initial:** `DY`
   - **Password:** `admin`
   - (Tersedia juga initial manager lain seperti `IB`, `YD`, dll. dengan password yang sama `admin`).

> [!NOTE]
> **Catatan Keamanan (Untuk IT):** 
> 1. Secara default, kode ini menggunakan koneksi MySQL ke `localhost` dengan *username* `root` dan *password* kosong (`''`), yang merupakan standar *default* bawaan instalasi XAMPP.
> 2. Sistem *Login* saat ini dioptimalkan untuk penggunaan internal intranet kantor (tidak menggunakan *hashing* bcrypt/JWT) demi kepraktisan penerapan lokal (Local Area Network). Jika aplikasi ini akan di-hosting secara publik (Internet), disarankan untuk mengenkripsi password dan menggunakan autentikasi berbasis Token/JWT.
