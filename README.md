# AirNav NOTAM System

Sistem digitalisasi pengelolaan **Notice to Airmen (NOTAM)** berbasis web yang dikembangkan khusus untuk keperluan internal **AirNav Indonesia Cabang Surabaya**. Aplikasi ini menggantikan proses pengajuan dan pencetakan NOTAM manual menjadi proses digital yang terpusat, cepat, dan mudah dipantau.

## Pembaruan Terbaru (Update Database & UI)
- 📝 **Pre-Shift & Post-Shift Interaktif**: Fitur pembuatan Form Pre-Shift Briefing dan Post-Shift Review baru dengan UI checklist yang sangat dinamis (memungkinkan transisi otomatis dari format centang ke keterangan teks), serta pengaturan dinamis untuk default waktu shift.
- ✨ **Custom UI Pickers**: Menghapus tampilan *default browser* dan menggantinya dengan komponen Pop-Up *custom* bergaya premium untuk pemilih Tanggal (*Date Picker*), Waktu (*Time Picker*), dan pilihan Manager.
- 🗄️ **Migrasi ke MySQL**: Aplikasi kini telah didukung oleh backend (Express.js) dan database relasional (MySQL) menggunakan Sequelize ORM.
- 🔐 **Manajemen Akun Terpusat**: Manager (Admin) sekarang dapat membuat akun untuk anggota tim (PT MANAGER OPERASI APP-TWR) secara langsung melalui menu Manajemen Akun.
- 🎨 **Modern Login Page**: Halaman login dirombak total menggunakan efek *Glassmorphism*, dukungan ganti kata sandi mandiri, serta *case-sensitive username*.
- 🔄 **Opsi Operational Assessment**: Tersedia opsi untuk murni mencetak 1 halaman Form Operational Assessment terpisah dari Permohonan Penerbitan NOTAM.
- 📊 **Visualisasi Data Kaya**: Admin Dashboard sekarang dilengkapi dengan 3 Grafik interaktif: Statistik Bulanan, Distribusi Jenis, dan Distribusi Status NOTAM.
- 🔒 **Tanda Tangan Otomatis**: Form cetak PDF akan secara otomatis membubuhkan nama dan pindaian tanda tangan milik pembuat surat (diambil dari profil akun yang *login*).
- 📅 **Sistem Kalender Pribadi (Baru!)**: Modul kalender interaktif (menggunakan `@fullcalendar/react`) untuk mencatat agenda, *meeting*, dan *deadline*. Dilengkapi fitur deteksi hari libur nasional otomatis, panel "Upcoming Reminders" cerdas (H-1, H-3, dll.), dan filter list berdasar kategori warna-warni yang vibran.
- 🎨 **Custom Alert & Modals**: Konfirmasi penghapusan dan *alert* sistem menggunakan komponen modal *custom* yang cantik (menggantikan *default pop-up browser* kaku).
## Fitur Utama

Aplikasi ini memiliki dua Role pengguna utama:

1. **Admin / Manajemen Operasi**
   - **Dashboard Statistik**: Visualisasi data surat NOTAM yang masuk, aktif, dan akan datang secara interaktif melalui *charts*.
   - **Pembuatan NOTAM (Create)**: Form digital lengkap untuk pengajuan NOTAM baru (termasuk *Assessment Only*). 
   - **Manajemen Akun**: Penambahan akun karyawan baru, lengkap dengan *upload* file tanda tangan.
   - **NOTAM Replace & Cancel**: Manajemen siklus hidup NOTAM untuk memperbarui atau membatalkan NOTAM. NOTAM yang direplace/cancel otomatis terhubung dengan surat referensinya dan memperbarui statusnya.
   - **Cetak PDF Otomatis**: Generator dokumen PDF standar AirNav secara *on-the-fly* berdasarkan data form yang disubmit.
   - **Personal Calendar & Reminders**: Kalender untuk merencanakan agenda internal, ditandai dengan deteksi hari libur otomatis. Memiliki panel notifikasi yang melacak *event* dalam kurun waktu 7 hari ke depan.

2. **Karyawan Biasa**
   - **Dashboard Karyawan**: Akses untuk melihat seluruh dokumen NOTAM yang sudah diterbitkan dalam format kartu yang estetik.
   - **Filter Waktu & Status**: Memungkinkan pencarian dan penyaringan surat NOTAM berdasarkan Waktu Mulai, Status (Terbit, Incoming, Selesai), dan Jenis NOTAM (New, Replace, Cancel, Assessment).
   - **Viewer & Downloader PDF**: Fitur melihat langsung dokumen PDF NOTAM di dalam aplikasi (tanpa perlu membuka tab baru) dan mengunduhnya.

## Teknologi yang Digunakan

- **Frontend**: [React.js](https://reactjs.org/) + [Vite](https://vitejs.dev/) + Vanilla CSS (Glassmorphism).
- **Backend**: Node.js + Express.js.
- **Database**: MySQL 8.0+ dengan Sequelize ORM.
- **Icons & Charts**: Lucide React & Recharts.
- **PDF Generation**: `html2pdf.js` untuk merender komponen React ke format A4.

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
