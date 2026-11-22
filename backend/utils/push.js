const webpush = require('web-push');
require('dotenv').config();

webpush.setVapidDetails(
  'mailto:' + (process.env.VAPID_EMAIL || 'test@example.com'),
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

module.exports = (subscription, payload) =>
  webpush.sendNotification(subscription, JSON.stringify(payload));