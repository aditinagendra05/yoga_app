const express = require('express');
const { ObjectId } = require('mongodb');
const { connectDB } = require('../config/db');
const { verifyJWT, verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// ── POST /users  ──  Create new user ──────────────────────────────────────────
router.post('/', async (req, res, next) => {
  try {
    const db = await connectDB();
    const result = await db.collection('users').insertOne(req.body);
    res.status(201).json(result);
  } catch (err) { next(err); }
});

// ── GET /users  ──  All users (admin only) ────────────────────────────────────
router.get('/', verifyJWT, verifyAdmin, async (_req, res, next) => {
  try {
    const db = await connectDB();
    const users = await db.collection('users').find().toArray();
    res.json(users);
  } catch (err) { next(err); }
});

// ── GET /users/email/:email  ──  User by email ────────────────────────────────
router.get('/email/:email', verifyJWT, async (req, res, next) => {
  try {
    const db = await connectDB();
    const user = await db.collection('users').findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ error: true, message: 'User not found' });
    res.json(user);
  } catch (err) { next(err); }
});

// ── GET /users/:id  ──  User by ID ────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const db = await connectDB();
    const user = await db.collection('users').findOne({ _id: new ObjectId(req.params.id) });
    if (!user) return res.status(404).json({ error: true, message: 'User not found' });
    res.json(user);
  } catch (err) { next(err); }
});

// ── PUT /users/:id  ──  Update user (admin only) ──────────────────────────────
router.put('/:id', verifyJWT, verifyAdmin, async (req, res, next) => {
  try {
    const db = await connectDB();
    const { name, email, role, address, phone, about, photoUrl, skills } = req.body;
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { name, email, role, address, phone, about, photoUrl, skills: skills ?? null } },
      { upsert: true }
    );
    res.json(result);
  } catch (err) { next(err); }
});

// ── DELETE /users/:id  ──  Delete user (admin only) ───────────────────────────
router.delete('/:id', verifyJWT, verifyAdmin, async (req, res, next) => {
  try {
    const db = await connectDB();
    const result = await db.collection('users').deleteOne({ _id: new ObjectId(req.params.id) });
    res.json(result);
  } catch (err) { next(err); }
});

module.exports = router;