const router = require('express').Router();
const { Preduty } = require('../database');

router.get('/', async (req, res) => {
  try {
    const preduties = await Preduty.findAll({ order: [['createdAt', 'DESC']] });
    const parsed = preduties.map(p => {
      const data = p.toJSON();
      if (data.managerOnDutyInfo) data.managerOnDutyInfo = JSON.parse(data.managerOnDutyInfo);
      if (data.fasilitasData) data.fasilitasData = JSON.parse(data.fasilitasData);
      if (data.othersData) data.othersData = JSON.parse(data.othersData);
      return data;
    });
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const preduty = await Preduty.findByPk(req.params.id);
    if (!preduty) return res.status(404).json({ error: 'Not found' });
    const data = preduty.toJSON();
    if (data.managerOnDutyInfo) data.managerOnDutyInfo = JSON.parse(data.managerOnDutyInfo);
    if (data.fasilitasData) data.fasilitasData = JSON.parse(data.fasilitasData);
    if (data.othersData) data.othersData = JSON.parse(data.othersData);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { id, date, time, managerOnDuty, managerOnDutyInfo, shift, personelImage, fasilitasData, notamText, trafficImage, weatherImage, othersData, reminderText, instructionText, createdBy } = req.body;
    const newPreduty = await Preduty.create({
      id,
      date,
      time,
      managerOnDuty,
      managerOnDutyInfo: managerOnDutyInfo ? JSON.stringify(managerOnDutyInfo) : null,
      shift,
      personelImage,
      fasilitasData: fasilitasData ? JSON.stringify(fasilitasData) : null,
      notamText,
      trafficImage,
      weatherImage,
      othersData: othersData ? JSON.stringify(othersData) : null,
      reminderText,
      instructionText,
      createdBy
    });
    const responseData = newPreduty.toJSON();
    if (responseData.fasilitasData) responseData.fasilitasData = JSON.parse(responseData.fasilitasData);
    if (responseData.othersData) responseData.othersData = JSON.parse(responseData.othersData);
    res.json({ success: true, preduty: responseData });
  } catch (err) {
    console.error('Error creating preduty:', err);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const preduty = await Preduty.findByPk(req.params.id);
    if (!preduty) return res.status(404).json({ error: 'Not found' });
    await preduty.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
