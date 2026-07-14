# AirNav NOTAM Digitalization

Sistem digitalisasi pengelolaan **Notice to Airmen (NOTAM)** berbasis web yang dikembangkan khusus untuk keperluan internal **AirNav Indonesia Cabang Surabaya**. Aplikasi ini menggantikan proses pengajuan dan pencetakan NOTAM manual menjadi proses digital yang terpusat, cepat, dan mudah dipantau.

## Fitur Utama

Aplikasi ini memiliki dua Role pengguna utama:

1. **Admin / Manajemen Operasi**
   - **Dashboard Statistik**: Visualisasi data surat NOTAM yang masuk, aktif, dan akan datang pada bulan berjalan.
   - **Pembuatan NOTAM (Create)**: Form digital lengkap untuk pengajuan NOTAM baru. Mendukung *auto-generation* Nomor Surat Kegiatan.
   - **NOTAM Replace & Cancel**: Manajemen siklus hidup NOTAM untuk memperbarui atau membatalkan NOTAM yang sudah ada.
   - **Cetak PDF Otomatis**: Generator dokumen PDF standar AirNav secara *on-the-fly* berdasarkan data form yang disubmit.

2. **Karyawan Biasa**
   - **Dashboard Karyawan**: Akses untuk melihat seluruh dokumen NOTAM yang sudah diterbitkan.
   - **Filter Waktu**: Memungkinkan pencarian dan penyaringan surat NOTAM berdasarkan Waktu Mulai dan Waktu Selesai Pelaksanaan.
   - **Viewer & Downloader PDF**: Fitur melihat langsung dokumen PDF NOTAM di dalam aplikasi (tanpa perlu membuka tab baru) dan mengunduhnya.

## Teknologi yang Digunakan

- **Frontend Framework**: [React.js](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Styling**: Vanilla CSS dengan variabel terpusat untuk kemudahan kustomisasi tema.
- **Routing**: React Router DOM.
- **State Management**: React Context API & LocalStorage (untuk versi prototype ini).
- **PDF Generation**: `html2pdf.js` & `jspdf` untuk me-render komponen React menjadi format A4 cetak siap pakai.

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

## Struktur Proyek
- `/src/components` - Komponen UI *reusable* (Modal PDF, Template PDF, dll).
- `/src/pages` - Komponen halaman utama (Login, Dashboard Admin, Create NOTAM, Dashboard Karyawan).
- `/src/context` - Konfigurasi Context API (Auth & Data NOTAM).
- `/src/utils` - Fungsi-fungsi utilitas pendukung (seperti generator PDF).

## Catatan Kolaborasi (Untuk Teman Kelompok)
- Data *dummy* untuk keperluan testing login dan NOTAM di-handle melalui LocalStorage agar mudah dicoba tanpa *backend* selama fase prototype.
- Jika ada *update* logika atau tampilan UI, pastikan untuk melakukan `git pull` secara rutin agar sinkron.
