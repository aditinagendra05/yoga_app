const express = require('express');
const { connectDB } = require('../config/db');
const { verifyJWT, verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// ── GET /instructors  ──  All instructors (public) ────────────────────────────
router.get('/', async (_req, res, next) => {
  try {
    const db = await connectDB();
    const instructors = await db.collection('users').find({ role: 'instructor' }).toArray();
    res.json(instructors);
  } catch (err) { next(err); }
});

// ── GET /instructors/popular  ──  Top 6 instructors by total enrollments ──────
router.get('/popular', async (_req, res, next) => {
  try {
    const db = await connectDB();
    const result = await db.collection('classes').aggregate([
      { $group: { _id: '$instructorEmail', totalEnrolled: { $sum: '$totalEnrolled' } } },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'email',
          as: 'instructor',
        },
      },
      { $project: { _id: 0, instructor: { $arrayElemAt: ['$instructor', 0] }, totalEnrolled: 1 } },
      { $sort: { totalEnrolled: -1 } },
      { $limit: 6 },
    ]).toArray();
    res.json(result);
  } catch (err) { next(err); }
});

// ── GET /instructors/admin-stats  ──  Dashboard stats for admin ───────────────
router.get('/admin-stats', verifyJWT, verifyAdmin, async (_req, res, next) => {
  try {
    const db = await connectDB();
    const [approvedClasses, pendingClasses, totalClasses, instructors, totalEnrolled] = await Promise.all([
      db.collection('classes').countDocuments({ status: 'approved' }),
      db.collection('classes').countDocuments({ status: 'pending' }),
      db.collection('classes').countDocuments(),
      db.collection('users').countDocuments({ role: 'instructor' }),
      db.collection('enrolled').countDocuments(),
    ]);
    res.json({ approvedClasses, pendingClasses, totalClasses, instructors, totalEnrolled });
  } catch (err) { next(err); }
});

// ── POST /instructors/apply  ──  Apply to become an instructor ────────────────
router.post('/apply', async (req, res, next) => {
  try {
    const db = await connectDB();
    if (!req.body?.email) return res.status(400).json({ error: true, message: 'Email is required' });
    const result = await db.collection('applied').insertOne({ ...req.body, appliedAt: new Date() });
    res.status(201).json(result);
  } catch (err) { next(err); }
});

// ── GET /instructors/apply/:email  ──  Check if email has applied ─────────────
router.get('/apply/:email', async (req, res, next) => {
  try {
    const db = await connectDB();
    const application = await db.collection('applied').findOne({ email: req.params.email });
    res.json(application ?? { applied: false });
  } catch (err) { next(err); }
});

module.exports = router;