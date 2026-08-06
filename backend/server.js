const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const { initDb } = require('./database');

const app = express();

// Matikan caching agresif dari LiteSpeed/cPanel
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// Serve static files from signatures folder
app.use('/signatures', express.static(path.join(__dirname, 'signatures')));

// Ensure signatures directory exists
const sigDir = path.join(__dirname, 'signatures');
if (!fs.existsSync(sigDir)) {
  fs.mkdirSync(sigDir);
}

// Routes
app.use('/api', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/notams', require('./routes/notams'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/events', require('./routes/events'));
app.use('/api/briefings', require('./routes/briefings'));
app.use('/api/preduties', require('./routes/preduties'));
app.use('/api/postshifts', require('./routes/postshifts'));
app.use('/api/settings', require('./routes/settings'));

const PORT = process.env.PORT || 3000;

// Alat Diagnosa Database
app.get('/debug-db', async (req, res) => {
  try {
    const { User } = require('./database');
    const users = await User.findAll({ attributes: ['initial', 'password'] });
    res.json({ 
      status: 'SUKSES', 
      message: 'Koneksi database cPanel berhasil!',
      total_users: users.length,
      users: users
    });
  } catch (error) {
    res.json({ status: 'GAGAL', pesan_error: error.message, detail: error });
  }
});

// Add a simple health check route
app.get('/', (req, res) => {
  res.send('API is running successfully!');
});

app.get('/ping', (req, res) => {
  res.send('pong');
});

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to sync database:', err);
  // Still listen so Passenger doesn't return 503, but APIs might fail
  app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT} (DB Sync Failed)`);
  });
});
