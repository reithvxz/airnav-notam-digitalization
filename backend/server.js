const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { initDb, User, Notam } = require('./database');

const app = express();
app.use(cors());
app.use(express.json());
// Serve static files from signatures folder
app.use('/signatures', express.static(path.join(__dirname, 'signatures')));

// Ensure signatures directory exists
const sigDir = path.join(__dirname, 'signatures');
if (!fs.existsSync(sigDir)) {
  fs.mkdirSync(sigDir);
}

// Multer config for signature upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'signatures/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
});
const upload = multer({ storage: storage });

// API: Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log(`[LOGIN ATTEMPT] username: ${username}, password: ${password}`);
    
    // Find user (MySQL default is case-insensitive, so we check exactly in JS or use BINARY)
    const user = await User.findOne({ where: { initial: username, password } });
    
    if (user) {
      // Enforce case sensitivity in JS
      if (user.initial !== username) {
        console.log(`[LOGIN FAILED] Case mismatch. Expected ${user.initial}, got ${username}`);
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
      
      console.log(`[LOGIN SUCCESS] User: ${user.initial}`);
      res.json({ success: true, user });
    } else {
      console.log(`[LOGIN FAILED] User not found or wrong password`);
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    console.error(`[LOGIN ERROR]`, err);
    res.status(500).json({ error: err.message });
  }
});

// API: Create User (PT MANAGER)
app.post('/api/users', upload.single('tanda_tangan_file'), async (req, res) => {
  try {
    const { initial, nama, jabatan, password } = req.body;
    let tanda_tangan = null;
    if (req.file) {
      tanda_tangan = req.file.filename;
    }
    
    const newUser = await User.create({
      initial,
      nama,
      jabatan,
      password: password || 'password123',
      role: 'admin',
      tanda_tangan
    });
    res.json({ success: true, user: newUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Change Password
app.put('/api/users/password', async (req, res) => {
  try {
    const { initial, oldPassword, newPassword } = req.body;
    const user = await User.findOne({ where: { initial, password: oldPassword } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Password lama salah' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Password baru minimal 8 karakter' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password berhasil diubah' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Get All Notams
app.get('/api/notams', async (req, res) => {
  try {
    const notams = await Notam.findAll({
      order: [['createdAt', 'DESC']]
    });
    // Parse formData back to JSON
    const parsedNotams = notams.map(n => {
      const data = n.toJSON();
      data.formData = JSON.parse(data.formData);
      return data;
    });
    res.json(parsedNotams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Create Notam
app.post('/api/notams', async (req, res) => {
  try {
    const { id, formNo, jenis, lokasi, waktuMulai, waktuSelesai, formData, createdBy } = req.body;
    const newNotam = await Notam.create({
      id,
      formNo,
      jenis,
      lokasi,
      waktuMulai,
      waktuSelesai,
      formData: JSON.stringify(formData),
      createdBy
    });
    
    // Parse back for response
    const responseData = newNotam.toJSON();
    responseData.formData = JSON.parse(responseData.formData);
    
    res.json({ success: true, notam: responseData });
  } catch (err) {
    console.error("Error creating NOTAM:", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3000;
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
});
