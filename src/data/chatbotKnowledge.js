export const chatbotCategories = [
  { id: 'notam', label: '📄 Seputar NOTAM' },
  { id: 'preshift', label: '☀️ Pre-Shift' },
  { id: 'postshift', label: '🌙 Post-Shift' },
  { id: 'preduty', label: '💼 Preduty' }
];

export const chatbotTemplates = {
  notam: [
    {
      q: "Bagaimana cara membuat NOTAM baru?",
      a: "Untuk membuat NOTAM baru, navigasikan ke menu 'NOTAM' di sidebar kiri. Klik tombol biru '+ Buat NOTAM Baru' di pojok kanan atas. Isi form mulai dari Series, AFTN, hingga Item E. Jika hanya ingin uji coba, centang 'Assessment Only'."
    },
    {
      q: "Apa bedanya status Replace dan Cancel?",
      a: "Status 'Replace' digunakan ketika Anda ingin mengganti NOTAM yang sudah ada dengan versi perbaikan/terbaru. Status 'Cancel' digunakan untuk membatalkan NOTAM secara permanen sebelum masa berlakunya (Item C) habis."
    },
    {
      q: "Siapa yang bisa menyetujui NOTAM?",
      a: "Saat ini, NOTAM yang di-submit akan langsung tersimpan di sistem. Namun untuk operasional aslinya, Approval biasanya dilakukan oleh Supervisor atau Manager On Duty yang memiliki kewenangan."
    }
  ],
  preshift: [
    {
      q: "Kapan saya harus mengisi Pre-Shift?",
      a: "Pre-Shift Briefing wajib diisi dan disubmit sebelum Anda memulai dinas/shift Anda (Pagi, Siang, atau Malam) untuk memastikan kesiapan operasional."
    },
    {
      q: "Bagaimana jika ada fasilitas yang rusak?",
      a: "Di form Pre-Shift, pada bagian 'Kesiapan Fasilitas', ubah status fasilitas yang rusak dari 'Normal' menjadi 'Lainnya'. Anda akan diminta mengetikkan detail kendala atau kerusakan tersebut."
    }
  ],
  postshift: [
    {
      q: "Kapan Post-Shift diisi?",
      a: "Post-Shift Review diisi di akhir shift Anda untuk melaporkan seluruh kejadian penting, traffic, cuaca, dan anomali fasilitas yang terjadi selama Anda bertugas."
    },
    {
      q: "Apakah harus upload gambar lagi?",
      a: "Upload gambar personel dan weather/traffic pada Post-Shift sangat disarankan jika ada kejadian signifikan, namun beberapa form mungkin mengizinkan pengosongan gambar jika situasi normal. Lihat tanda bintang (*) merah pada form."
    }
  ],
  preduty: [
    {
      q: "Apa itu Preduty Briefing?",
      a: "Preduty Briefing adalah form pelaporan kesiapan kerja awal sebelum masuk ke tahap Pre-Shift yang lebih mendetail. Berfokus pada kesiapan personel dan brief cuaca/traffic dasar."
    },
    {
      q: "Bagaimana cara cetak PDF Preduty?",
      a: "Setelah men-submit Preduty, Anda dapat melihat laporannya di halaman Dashboard. Klik icon mata (Preview) pada dokumen Preduty, lalu klik tombol 'Export PDF' berwarna oranye."
    }
  ]
};

// Fallback keyword matching for free-text
export function getBotResponse(text) {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('pdf') || lowerText.includes('cetak') || lowerText.includes('print')) {
    return "Untuk mencetak dokumen menjadi PDF, buka dokumen yang diinginkan dari Dashboard (icon mata), lalu klik tombol 'Export PDF' yang tersedia di bagian atas atau bawah pop-up.";
  }
  if (lowerText.includes('password') || lowerText.includes('sandi')) {
    return "Anda bisa mengubah password dengan menekan inisial nama Anda di pojok kiri bawah sidebar, lalu pilih menu 'Ganti Password'.";
  }
  if (lowerText.includes('error') || lowerText.includes('bug') || lowerText.includes('rusak')) {
    return "Jika Anda menemukan error atau bug pada sistem, mohon catat pesannya dan segera laporkan ke Admin/IT Operasional.";
  }
  if (lowerText.includes('halo') || lowerText.includes('hai') || lowerText.includes('pagi') || lowerText.includes('siang')) {
    return "Halo! Ada yang bisa saya bantu hari ini? Silakan pilih kategori pertanyaan atau ketik langsung keluhan Anda.";
  }
  
  // Default fallback
  return "Maaf, saya belum mengerti pertanyaan tersebut. Coba gunakan kata kunci lain, atau silakan pilih dari menu kategori di atas. Jika mendesak, hubungi Admin Operasional.";
}
