const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const { initDb } = require('./database');

const app = express();
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

const PORT = 3000;
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
});
