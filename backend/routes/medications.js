const router = require('express').Router();
const Medication = require('../models/Medication');
const auth = require('../middleware/auth');

// GET all medications
router.get('/', auth, async (req, res) => {
  try {
    const meds = await Medication.find({ userId: req.user.id });
    res.json(meds);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST a new medication
router.post('/', auth, async (req, res) => {
  try {
    const { name, dosage } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });
    
    const med = new Medication({ name, dosage, userId: req.user.id });
    await med.save();
    res.status(201).json(med);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE (Edit) a medication
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, dosage } = req.body;
    const med = await Medication.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { name, dosage },
      { new: true }
    );
    if (!med) return res.status(404).json({ error: 'Medication not found' });
    res.json(med);
  } catch (e) { 
    res.status(500).json({ error: e.message }); 
  }
});

// DELETE a medication
router.delete('/:id', auth, async (req, res) => {
  try {
    await Medication.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;