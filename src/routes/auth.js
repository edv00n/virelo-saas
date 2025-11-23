const express = require('express');
const bcrypt = require('bcrypt');
const { getDb } = require('../db');

const router = express.Router();
const db = getDb();

function requireGuest(req, res, next) {
  if (req.session.user) return res.redirect('/dashboard');
  next();
}

function requireAuth(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  next();
}

router.get('/signup', requireGuest, (req, res) => {
  res.render('auth/signup');
});

router.post('/signup', requireGuest, async (req, res) => {
  const { email, password, name, business_name } = req.body;
  if (!email || !password) {
    req.flash('error', 'Email and password are required.');
    return res.redirect('/signup');
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const stmt = db.prepare(`
      INSERT INTO users (email, password_hash, name, business_name)
      VALUES (?, ?, ?, ?)
    `);
    const info = stmt.run(email, hash, name || null, business_name || null);
    req.session.user = {
      id: info.lastInsertRowid,
      email,
      name,
      business_name
    };
    req.flash('success', 'Account created. Welcome to Virelo!');
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      req.flash('error', 'That email is already in use.');
    } else {
      req.flash('error', 'Something went wrong creating your account.');
    }
    res.redirect('/signup');
  }
});

router.get('/login', requireGuest, (req, res) => {
  res.render('auth/login');
});

router.post('/login', requireGuest, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    req.flash('error', 'Email and password required.');
    return res.redirect('/login');
  }
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) {
    req.flash('error', 'Invalid email or password.');
    return res.redirect('/login');
  }
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    req.flash('error', 'Invalid email or password.');
    return res.redirect('/login');
  }
  req.session.user = {
    id: user.id,
    email: user.email,
    name: user.name,
    business_name: user.business_name
  };
  req.flash('success', 'Welcome back to Virelo!');
  res.redirect('/dashboard');
});

router.post('/logout', requireAuth, (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

module.exports = router;

