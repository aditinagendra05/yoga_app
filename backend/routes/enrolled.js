const express = require('express');
const { connectDB } = require('../config/db');
const { verifyJWT } = require('../middleware/auth');

const router = express.Router();

// ── GET /enrolled/:email  ──  All enrolled classes with instructor info ────────
router.get('/:email', verifyJWT, async (req, res, next) => {
  try {
    const db = await connectDB();
    const result = await db.collection('enrolled').aggregate([
      { $match: { userEmail: req.params.email } },
      {
        $lookup: {
          from: 'classes',
          localField: 'classesId',
          foreignField: '_id',
          as: 'classes',
        },
      },
      { $unwind: '$classes' },
      {
        $lookup: {
          from: 'users',
          localField: 'classes.instructorEmail',
          foreignField: 'email',
          as: 'instructor',
        },
      },
      {
        $project: {
          _id: 0,
          classes: 1,
          instructor: { $arrayElemAt: ['$instructor', 0] },
        },
      },
    ]).toArray();

    res.json(result);
  } catch (err) { next(err); }
});

module.exports = router;