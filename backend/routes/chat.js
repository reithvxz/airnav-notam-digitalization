const router = require('express').Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Chatbot AI Endpoint
router.post('/', async (req, res) => {
  try {
    const { message, userName } = req.body;
    
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      return res.json({ 
        response: "Mohon maaf, sistem AI (Gemini) belum diatur. Silakan tambahkan GEMINI_API_KEY Anda ke dalam file .env di folder backend terlebih dahulu." 
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

    const systemPrompt = `Kamu adalah SIMO Bot, asisten virtual ramah dan profesional untuk aplikasi SIMO (Sistem Informasi Manajemen Operasi) AirNav Indonesia Cabang Surabaya.
Pengguna yang sedang mengajakmu bicara saat ini bernama: ${userName || 'Karyawan AirNav'}.
Aturan wajib dalam menjawab:
1. Jawab dengan sangat singkat, padat, dan langsung ke intinya (straight to the point).
2. DILARANG KERAS menggunakan simbol markdown seperti bintang (*), tebal (**), garis miring (_), atau strip panjang (—).
3. Jika pengguna bertanya siapa dirinya, sebutkan nama lengkapnya berdasarkan informasi yang diberikan di atas.
4. DILARANG menyapa atau menyebut nama pengguna di setiap awal jawaban (misalnya: "Halo Budi", "Baik Dedy"), KECUALI jika pengguna secara spesifik bertanya "siapa saya". Langsung saja berikan jawabannya.
5. Jika pengguna bertanya hal di luar konteks penerbangan, AirNav, atau aplikasi ini, tolaklah dengan halus.`;

    const result = await model.generateContent([
      { text: systemPrompt },
      { text: `User: ${message}` }
    ]);
    
    const response = await result.response;
    res.json({ response: response.text() });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ response: "Maaf, terjadi kesalahan saat menghubungi server AI. Silakan coba beberapa saat lagi." });
  }
});

module.exports = router;
