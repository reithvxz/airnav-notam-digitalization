const router = require('express').Router();
const { Briefing } = require('../database');

// API: Get All Briefings
router.get('/', async (req, res) => {
  try {
    const briefings = await Briefing.findAll({ order: [['createdAt', 'DESC']] });
    const parsed = briefings.map(b => {
      const data = b.toJSON();
      data.checklistData = JSON.parse(data.checklistData);
      data.incomingManager = JSON.parse(data.incomingManager);
      data.outgoingManager = JSON.parse(data.outgoingManager);
      return data;
    });
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Get Single Briefing
router.get('/:id', async (req, res) => {
  try {
    const briefing = await Briefing.findByPk(req.params.id);
    if (!briefing) return res.status(404).json({ error: 'Not found' });
    const data = briefing.toJSON();
    data.checklistData = JSON.parse(data.checklistData);
    data.incomingManager = JSON.parse(data.incomingManager);
    data.outgoingManager = JSON.parse(data.outgoingManager);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Create Briefing
router.post('/', async (req, res) => {
  try {
    const { id, date, time, managerOnDuty, shift, checklistData, incomingManager, outgoingManager, createdBy } = req.body;
    const newBriefing = await Briefing.create({
      id,
      date,
      time,
      managerOnDuty,
      shift,
      checklistData: JSON.stringify(checklistData),
      incomingManager: JSON.stringify(incomingManager),
      outgoingManager: JSON.stringify(outgoingManager),
      createdBy
    });
    const responseData = newBriefing.toJSON();
    responseData.checklistData = JSON.parse(responseData.checklistData);
    responseData.incomingManager = JSON.parse(responseData.incomingManager);
    responseData.outgoingManager = JSON.parse(responseData.outgoingManager);
    res.json({ success: true, briefing: responseData });
  } catch (err) {
    console.error('Error creating briefing:', err);
    res.status(500).json({ error: err.message });
  }
});

// API: Delete Briefing
router.delete('/:id', async (req, res) => {
  try {
    const briefing = await Briefing.findByPk(req.params.id);
    if (!briefing) return res.status(404).json({ error: 'Not found' });
    await briefing.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Update Briefing
router.put('/:id', async (req, res) => {
  try {
    const briefing = await Briefing.findByPk(req.params.id);
    if (!briefing) return res.status(404).json({ error: 'Briefing not found' });
    
    const { date, time, managerOnDuty, shift, checklistData, incomingManager, outgoingManager } = req.body;
    
    await briefing.update({
      date: date || briefing.date,
      time: time || briefing.time,
      managerOnDuty: managerOnDuty || briefing.managerOnDuty,
      shift: shift || briefing.shift,
      checklistData: checklistData ? JSON.stringify(checklistData) : briefing.checklistData,
      incomingManager: incomingManager ? JSON.stringify(incomingManager) : briefing.incomingManager,
      outgoingManager: outgoingManager ? JSON.stringify(outgoingManager) : briefing.outgoingManager
    });
    
    const responseData = briefing.toJSON();
    responseData.checklistData = JSON.parse(responseData.checklistData);
    responseData.incomingManager = JSON.parse(responseData.incomingManager);
    responseData.outgoingManager = JSON.parse(responseData.outgoingManager);
    
    res.json({ success: true, briefing: responseData });
  } catch (err) {
    console.error('Error updating briefing:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
