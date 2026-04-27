const express = require('express');
const { ObjectId } = require('mongodb');
const { connectDB } = require('../config/db');
const { verifyJWT, verifyAdmin, verifyInstructor } = require('../middleware/auth');

const router = express.Router();

// ── GET /classes  ──  All approved classes (public) ───────────────────────────
router.get('/', async (_req, res, next) => {
  try {
    const db = await connectDB();
    const classes = await db.collection('classes').find({ status: 'approved' }).toArray();
    res.json(classes);
  } catch (err) { next(err); }
});

// ── GET /classes/manage  ──  All classes regardless of status (admin) ─────────
router.get('/manage', verifyJWT, verifyAdmin, async (_req, res, next) => {
  try {
    const db = await connectDB();
    const classes = await db.collection('classes').find().toArray();
    res.json(classes);
  } catch (err) { next(err); }
});

// ── GET /classes/popular  ──  Top 6 by enrollment (public) ───────────────────
router.get('/popular', async (_req, res, next) => {
  try {
    const db = await connectDB();
    const classes = await db.collection('classes')
      .find({ status: 'approved' })
      .sort({ totalEnrolled: -1 })
      .limit(6)
      .toArray();
    res.json(classes);
  } catch (err) { next(err); }
});

// ── GET /classes/instructor/:email  ──  Classes by instructor ─────────────────
router.get('/instructor/:email', verifyJWT, verifyInstructor, async (req, res, next) => {
  try {
    const db = await connectDB();
    const classes = await db.collection('classes')
      .find({ instructorEmail: req.params.email })
      .toArray();
    res.json(classes);
  } catch (err) { next(err); }
});

// ── GET /classes/:id  ──  Single class by ID (public) ────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const db = await connectDB();
    const cls = await db.collection('classes').findOne({ _id: new ObjectId(req.params.id) });
    if (!cls) return res.status(404).json({ error: true, message: 'Class not found' });
    res.json(cls);
  } catch (err) { next(err); }
});

// ── POST /classes  ──  Create new class (instructor only) ────────────────────
router.post('/', verifyJWT, verifyInstructor, async (req, res, next) => {
  try {
    const db = await connectDB();
    const newClass = {
      ...req.body,
      availableSeats: parseInt(req.body.availableSeats),
      totalEnrolled: 0,
      status: 'pending',
      submitted: new Date(),
      reason: null,
    };
    const result = await db.collection('classes').insertOne(newClass);
    res.status(201).json(result);
  } catch (err) { next(err); }
});

// ── PUT /classes/:id  ──  Update class (instructor only) ─────────────────────
router.put('/:id', verifyJWT, verifyInstructor, async (req, res, next) => {
  try {
    const db = await connectDB();
    const { name, description, price, availableSeats, videoLink } = req.body;
    const result = await db.collection('classes').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { name, description, price, availableSeats: parseInt(availableSeats), videoLink, status: 'pending' } },
      { upsert: true }
    );
    res.json(result);
  } catch (err) { next(err); }
});

// ── PATCH /classes/:id/status  ──  Approve/deny a class (admin only) ─────────
router.patch('/:id/status', verifyJWT, verifyAdmin, async (req, res, next) => {
  try {
    const db = await connectDB();
    const { status, reason } = req.body;
    if (!['approved', 'denied', 'pending'].includes(status)) {
      return res.status(400).json({ error: true, message: 'Invalid status value' });
    }
    const result = await db.collection('classes').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status, reason: reason ?? null } }
    );
    res.json(result);
  } catch (err) { next(err); }
});

module.exports = router;