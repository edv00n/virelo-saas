const express = require('express');
const { getDb } = require('../db');

const router = express.Router();
const db = getDb();

function requireAuth(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  next();
}

router.get('/', requireAuth, (req, res) => {
  const userId = req.session.user.id;

  const leadCount = db.prepare('SELECT COUNT(*) as count FROM leads WHERE user_id = ?').get(userId).count;
  const newLeads = db.prepare("SELECT COUNT(*) as count FROM leads WHERE user_id = ? AND status = 'new'").get(userId).count;
  const bookedLeads = db.prepare("SELECT COUNT(*) as count FROM leads WHERE user_id = ? AND status = 'booked'").get(userId).count;
  const recentLeads = db.prepare('SELECT * FROM leads WHERE user_id = ? ORDER BY created_at DESC LIMIT 5').all(userId);

  res.render('dashboard/index', {
    stats: { leadCount, newLeads, bookedLeads },
    recentLeads
  });
});

module.exports = router;

