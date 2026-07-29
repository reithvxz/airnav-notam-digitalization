const router = require('express').Router();
const { Notam } = require('../database');

// API: Get All Notams
router.get('/', async (req, res) => {
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
router.post('/', async (req, res) => {
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

module.exports = router;
