const router = require('express').Router();
const { User } = require('../database');

// API: Login
router.post('/login', async (req, res) => {
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
      
      if (!user.isActive) {
        console.log(`[LOGIN FAILED] Account deactivated for ${user.initial}`);
        return res.status(403).json({ success: false, message: 'Akun ini telah dinonaktifkan' });
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

module.exports = router;
