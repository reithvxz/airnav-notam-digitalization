const router = require('express').Router();
const fs = require('fs');
const path = require('path');

// API: Get Shift Settings
router.get('/shift', (req, res) => {
  try {
    const settingsPath = path.join(__dirname, '..', 'shift_settings.json');
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf8');
      res.json(JSON.parse(data));
    } else {
      res.json({});
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Update Shift Settings
router.post('/shift', (req, res) => {
  try {
    const settingsPath = path.join(__dirname, '..', 'shift_settings.json');
    fs.writeFileSync(settingsPath, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
