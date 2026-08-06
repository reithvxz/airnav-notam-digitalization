const router = require('express').Router();
const { PostShift } = require('../database');

// API: Get All PostShifts
router.get('/', async (req, res) => {
  try {
    const postshifts = await PostShift.findAll({ order: [['createdAt', 'DESC']] });
    const parsed = postshifts.map(p => {
      const data = p.toJSON();
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

// API: Get Single PostShift
router.get('/:id', async (req, res) => {
  try {
    const postshift = await PostShift.findByPk(req.params.id);
    if (!postshift) return res.status(404).json({ error: 'Not found' });
    const data = postshift.toJSON();
    data.checklistData = JSON.parse(data.checklistData);
    data.incomingManager = JSON.parse(data.incomingManager);
    data.outgoingManager = JSON.parse(data.outgoingManager);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Create PostShift
router.post('/', async (req, res) => {
  try {
    const { id, date, time, managerOnDuty, shift, checklistData, incomingManager, outgoingManager, createdBy } = req.body;
    const newPostShift = await PostShift.create({
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
    const responseData = newPostShift.toJSON();
    responseData.checklistData = JSON.parse(responseData.checklistData);
    responseData.incomingManager = JSON.parse(responseData.incomingManager);
    responseData.outgoingManager = JSON.parse(responseData.outgoingManager);
    res.json({ success: true, postshift: responseData });
  } catch (err) {
    console.error('Error creating postshift:', err);
    res.status(500).json({ error: err.message });
  }
});

// API: Delete PostShift
router.delete('/:id', async (req, res) => {
  try {
    const postshift = await PostShift.findByPk(req.params.id);
    if (!postshift) return res.status(404).json({ error: 'Not found' });
    await postshift.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Update PostShift
router.put('/:id', async (req, res) => {
  try {
    const postshift = await PostShift.findByPk(req.params.id);
    if (!postshift) return res.status(404).json({ error: 'PostShift not found' });
    
    const { date, time, managerOnDuty, shift, checklistData, incomingManager, outgoingManager } = req.body;
    
    await postshift.update({
      date: date || postshift.date,
      time: time || postshift.time,
      managerOnDuty: managerOnDuty || postshift.managerOnDuty,
      shift: shift || postshift.shift,
      checklistData: checklistData ? JSON.stringify(checklistData) : postshift.checklistData,
      incomingManager: incomingManager ? JSON.stringify(incomingManager) : postshift.incomingManager,
      outgoingManager: outgoingManager ? JSON.stringify(outgoingManager) : postshift.outgoingManager
    });
    
    const responseData = postshift.toJSON();
    responseData.checklistData = JSON.parse(responseData.checklistData);
    responseData.incomingManager = JSON.parse(responseData.incomingManager);
    responseData.outgoingManager = JSON.parse(responseData.outgoingManager);
    
    res.json({ success: true, postshift: responseData });
  } catch (err) {
    console.error('Error updating postshift:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
