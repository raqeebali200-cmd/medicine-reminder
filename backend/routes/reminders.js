const router = require('express').Router();
const Reminder = require('../models/Reminder');
const User = require('../models/User');
const auth = require('../middleware/auth');

// GET all reminders
router.get('/', auth, async (req, res) => {
  try {
    const reminders = await Reminder.find({ userId: req.user.id }).populate('medicationId');
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST a new reminder
router.post('/', auth, async (req, res) => {
  try {
    const { medicationId, times } = req.body;
    if (!medicationId || !Array.isArray(times) || !times.length)
      return res.status(400).json({ error: 'medicationId and times array required' });

    const r = new Reminder({ medicationId, times, userId: req.user.id });
    await r.save();
    res.status(201).json(r);
  } catch (e) { 
    res.status(500).json({ error: e.message }); 
  }
});

// UPDATE (Edit) a reminder time
router.put('/:id', auth, async (req, res) => {
  try {
    const { times } = req.body;
    // Ensure times is an array before saving
    const timesArray = Array.isArray(times) ? times : [times];
    
    const r = await Reminder.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { times: timesArray },
      { new: true }
    );
    if (!r) return res.status(404).json({ error: 'Reminder not found' });
    res.json(r);
  } catch (e) { 
    res.status(500).json({ error: e.message }); 
  }
});

// DELETE a reminder
router.delete('/:id', auth, async (req, res) => {
  try {
    await Reminder.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// SUBSCRIBE to push notifications
router.post('/subscribe', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { pushSubscription: req.body });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;