const router = require('express').Router();
const { User } = require('../database');
const upload = require('../middleware/upload');

// API: Create User (PT MANAGER)
router.post('/', upload.single('tanda_tangan_file'), async (req, res) => {
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
router.put('/password', async (req, res) => {
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

// API: Get All Users (for dropdown)
router.get('/', async (req, res) => {
  try {
    const whereClause = req.query.all ? {} : { isActive: true };
    const users = await User.findAll({
      where: whereClause,
      attributes: ['id', 'initial', 'nama', 'jabatan', 'role', 'tanda_tangan', 'isActive']
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Deactivate User
router.put('/:id/deactivate', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    // Prevent superadmin deactivation just in case
    if (['DY', 'IB', 'YD', 'AY', 'IW'].includes(user.initial)) {
      return res.status(403).json({ success: false, message: 'Super admin tidak dapat dinonaktifkan' });
    }
    
    user.isActive = false;
    await user.save();
    res.json({ success: true, message: 'Akun berhasil dinonaktifkan' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// API: Activate User
router.put('/:id/activate', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    user.isActive = true;
    await user.save();
    res.json({ success: true, message: 'Akun berhasil diaktifkan' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get User Role API
router.get('/:initial/role', async (req, res) => {
  try {
    const user = await User.findOne({ where: { initial: req.params.initial } });
    if (user) {
      // Return specific privileges based on user logic in frontend
      res.json({ isSuperAdmin: ['DY', 'IB', 'YD', 'AY', 'IW'].includes(user.initial) });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: Delete User
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    // Prevent superadmin deletion
    if (['DY', 'IB', 'YD', 'AY', 'IW'].includes(user.initial)) {
      return res.status(403).json({ success: false, message: 'Super admin tidak dapat dihapus' });
    }
    
    await user.destroy();
    res.json({ success: true, message: 'Akun berhasil dihapus permanen' });
  } catch (err) {
    // Handle foreign key constraint error (if user has created briefings)
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Gagal menghapus! Akun ini telah membuat form NOTAM/Shift. Silakan gunakan opsi Nonaktifkan saja agar data lama tidak error.' 
      });
    }
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
