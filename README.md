# AirNav NOTAM System

Sistem digitalisasi pengelolaan **Notice to Airmen (NOTAM)** berbasis web yang dikembangkan khusus untuk keperluan internal **AirNav Indonesia Cabang Surabaya**. Aplikasi ini menggantikan proses pengajuan dan pencetakan NOTAM manual menjadi proses digital yang terpusat, cepat, dan mudah dipantau.

## Pembaruan Terbaru (Update UI & UX)
- 🎨 **Modern Login Page**: Halaman login dirombak total menggunakan efek *Glassmorphism* dan gradasi premium.
- 📊 **Visualisasi Data Kaya**: Admin Dashboard sekarang dilengkapi dengan 3 Grafik interaktif: Grafik Batang (Statistik Bulanan), Grafik Lingkaran (Distribusi Jenis), dan Grafik Batang Mendatar (Distribusi Status NOTAM).
- 🔄 **Pemisahan Form**: Form Permohonan Penerbitan NOTAM dan Operational Assessment sekarang telah dipisah agar lebih fleksibel sesuai dengan jenis operasi (New, Replace, Cancel).
- 🔒 **Sticky Dashboard Grid**: Tampilan kartu riwayat pada Admin Dashboard dan tabel sekarang memiliki ukuran tetap (*fixed height*) dengan sistem *scroll* mandiri, sehingga halaman web tidak akan melar tak beraturan seberapapun banyak dokumennya.

## Fitur Utama

Aplikasi ini memiliki dua Role pengguna utama:

1. **Admin / Manajemen Operasi**
   - **Dashboard Statistik**: Visualisasi data surat NOTAM yang masuk, aktif, dan akan datang pada bulan berjalan secara interaktif melalui *charts*.
   - **Pembuatan NOTAM (Create)**: Form digital lengkap untuk pengajuan NOTAM baru. Mendukung *auto-generation* Nomor Surat Kegiatan.
   - **NOTAM Replace & Cancel**: Manajemen siklus hidup NOTAM untuk memperbarui atau membatalkan NOTAM. NOTAM yang direplace/cancel otomatis terhubung dengan surat referensinya dan memperbarui statusnya.
   - **Cetak PDF Otomatis**: Generator dokumen PDF standar AirNav (lengkap dengan kop surat dan format tabel resmi) secara *on-the-fly* berdasarkan data form yang disubmit.

2. **Karyawan Biasa**
   - **Dashboard Karyawan**: Akses untuk melihat seluruh dokumen NOTAM yang sudah diterbitkan.
   - **Filter Waktu & Status**: Memungkinkan pencarian dan penyaringan surat NOTAM berdasarkan Waktu Mulai, Status (Terbit, Incoming, Selesai), dan Jenis NOTAM (New, Replace, Cancel).
   - **Viewer & Downloader PDF**: Fitur melihat langsung dokumen PDF NOTAM di dalam aplikasi (tanpa perlu membuka tab baru) dan mengunduhnya.

## Teknologi yang Digunakan

- **Frontend Framework**: [React.js](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Styling**: Vanilla CSS dengan modern *UI tokens* (Flexbox, CSS Grid, Glassmorphism).
- **Icons**: Lucide React.
- **Charts**: Recharts (PieChart, BarChart).
- **Routing**: React Router DOM.
- **State Management**: React Context API & LocalStorage (prototype).
- **PDF Generation**: `html2pdf.js` untuk merender React komponen ke format A4.

## Persiapan & Menjalankan Project Locally

Pastikan kamu sudah menginstal [Node.js](https://nodejs.org/) di komputermu.

1. **Clone repository ini:**
   ```bash
   git clone https://github.com/reithvxz/airnav-notam-digitalization.git
   cd airnav-notam-digitalization
   ```

2. **Install semua *dependencies*:**
   ```bash
   npm install
   ```

3. **Jalankan server pengembangan (Development Server):**
   ```bash
   npm run dev
   ```

4. **Buka di Browser:**
   Buka `http://localhost:5173` (atau port lain yang ditampilkan di terminal) untuk melihat aplikasi.

## Catatan Kolaborasi (Untuk Teman Kelompok)
- Demo akun: Admin (`admin/admin123`), Karyawan (`karyawan/karyawan123`).
- Jika ada *update* logika atau tampilan UI, pastikan untuk melakukan `git pull` secara rutin agar sinkron.
