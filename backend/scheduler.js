const cron = require('node-cron');
const Reminder = require('./models/Reminder');
const User = require('./models/User');
const sendPush = require('./utils/push');

// Runs every minute
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const currentTime = hh + ':' + mm;

    const due = await Reminder
      .find({ isActive: true, times: currentTime })
      .populate('medicationId');

    for (const r of due) {
      if (r.lastNotified && now - r.lastNotified < 55000) continue;

      const user = await User.findById(r.userId);
      if (!user || !user.pushSubscription) continue;

      try {
        await sendPush(user.pushSubscription, {
          title: '💊 Medication Reminder',
          body: 'Time to take ' + r.medicationId.name +
                (r.medicationId.dosage ? ' (' + r.medicationId.dosage + ')' : '')
        });
        r.lastNotified = now;
        await r.save();
        console.log('📤 Sent reminder for', r.medicationId.name);
      } catch (e) {
        console.error('Push error:', e.message);
      }
    }
  } catch (e) {
    console.error('Scheduler error:', e.message);
  }
});