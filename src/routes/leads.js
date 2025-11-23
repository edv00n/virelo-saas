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
  const leads = db.prepare('SELECT * FROM leads WHERE user_id = ? ORDER BY created_at DESC').all(userId);
  res.render('leads/index', { leads });
});

router.get('/new', requireAuth, (req, res) => {
  res.render('leads/new');
});

router.post('/', requireAuth, (req, res) => {
  const userId = req.session.user.id;
  const { name, phone, email, service, source } = req.body;
  if (!name) {
    req.flash('error', 'Name is required.');
    return res.redirect('/leads/new');
  }
  const stmt = db.prepare(`
    INSERT INTO leads (user_id, name, phone, email, service, source)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  stmt.run(userId, name, phone || null, email || null, service || null, source || null);
  req.flash('success', 'Lead added.');
  res.redirect('/leads');
});

router.get('/:id', requireAuth, (req, res) => {
  const userId = req.session.user.id;
  const id = req.params.id;
  const lead = db.prepare('SELECT * FROM leads WHERE id = ? AND user_id = ?').get(id, userId);
  if (!lead) {
    req.flash('error', 'Lead not found.');
    return res.redirect('/leads');
  }
  const messages = db.prepare('SELECT * FROM messages WHERE lead_id = ? ORDER BY created_at ASC').all(id);
  res.render('leads/show', { lead, messages });
});

router.post('/:id/status', requireAuth, (req, res) => {
  const userId = req.session.user.id;
  const id = req.params.id;
  const { status } = req.body;
  const lead = db.prepare('SELECT * FROM leads WHERE id = ? AND user_id = ?').get(id, userId);
  if (!lead) {
    req.flash('error', 'Lead not found.');
    return res.redirect('/leads');
  }
  db.prepare('UPDATE leads SET status = ? WHERE id = ?').run(status || 'new', id);
  req.flash('success', 'Status updated.');
  res.redirect(`/leads/${id}`);
});

router.post('/:id/messages', requireAuth, (req, res) => {
  const userId = req.session.user.id;
  const id = req.params.id;
  const { content, sender } = req.body;
  const lead = db.prepare('SELECT * FROM leads WHERE id = ? AND user_id = ?').get(id, userId);
  if (!lead) {
    req.flash('error', 'Lead not found.');
    return res.redirect('/leads');
  }
  if (!content) {
    req.flash('error', 'Message cannot be empty.');
    return res.redirect(`/leads/${id}`);
  }
  db.prepare('INSERT INTO messages (lead_id, sender, content) VALUES (?, ?, ?)')
    .run(id, sender || 'business', content);
  req.flash('success', 'Message added.');
  res.redirect(`/leads/${id}`);
});

module.exports = router;

