const jwt = require('jsonwebtoken');
const { connectDB } = require('../config/db');

// ── Verify JWT ────────────────────────────────────────────────────────────────
function verifyJWT(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: true, message: 'No token provided' });

  const token = auth.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: true, message: 'Invalid or expired token' });
    req.decoded = decoded;
    next();
  });
}

// ── Verify Admin ──────────────────────────────────────────────────────────────
async function verifyAdmin(req, res, next) {
  try {
    const db = await connectDB();
    const user = await db.collection('users').findOne({ email: req.decoded.email });
    if (user?.role === 'admin') return next();
    res.status(403).json({ error: true, message: 'Admin access required' });
  } catch (err) {
    next(err);
  }
}

// ── Verify Instructor (or Admin) ──────────────────────────────────────────────
async function verifyInstructor(req, res, next) {
  try {
    const db = await connectDB();
    const user = await db.collection('users').findOne({ email: req.decoded.email });
    if (user?.role === 'instructor' || user?.role === 'admin') return next();
    res.status(403).json({ error: true, message: 'Instructor access required' });
  } catch (err) {
    next(err);
  }
}

module.exports = { verifyJWT, verifyAdmin, verifyInstructor };