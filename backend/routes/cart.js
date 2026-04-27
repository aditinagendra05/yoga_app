const express = require('express');
const { ObjectId } = require('mongodb');
const { connectDB } = require('../config/db');
const { verifyJWT } = require('../middleware/auth');

const router = express.Router();

// ── GET /cart/:email  ──  Get full class details in a user's cart ─────────────
router.get('/:email', verifyJWT, async (req, res, next) => {
  try {
    const db = await connectDB();
    const cartItems = await db.collection('cart')
      .find({ userMail: req.params.email }, { projection: { classId: 1 } })
      .toArray();

    const classIds = cartItems.map(item => new ObjectId(item.classId));
    const classes = await db.collection('classes')
      .find({ _id: { $in: classIds } })
      .toArray();

    res.json(classes);
  } catch (err) { next(err); }
});

// ── GET /cart/check/:classId  ──  Check if a class is in the user's cart ──────
router.get('/check/:classId', verifyJWT, async (req, res, next) => {
  try {
    const db = await connectDB();
    const item = await db.collection('cart').findOne({
      classId: req.params.classId,
      userMail: req.query.email,
    });
    res.json({ inCart: !!item, item });
  } catch (err) { next(err); }
});

// ── POST /cart  ──  Add item to cart ─────────────────────────────────────────
router.post('/', verifyJWT, async (req, res, next) => {
  try {
    const db = await connectDB();
    const { classId, userMail } = req.body;
    if (!classId || !userMail) {
      return res.status(400).json({ error: true, message: 'classId and userMail are required' });
    }
    // Prevent duplicates
    const existing = await db.collection('cart').findOne({ classId, userMail });
    if (existing) return res.status(409).json({ error: true, message: 'Already in cart' });

    const result = await db.collection('cart').insertOne(req.body);
    res.status(201).json(result);
  } catch (err) { next(err); }
});

// ── DELETE /cart/:classId  ──  Remove item from cart ─────────────────────────
router.delete('/:classId', verifyJWT, async (req, res, next) => {
  try {
    const db = await connectDB();
    const result = await db.collection('cart').deleteOne({
      classId: req.params.classId,
      userMail: req.query.email,
    });
    res.json(result);
  } catch (err) { next(err); }
});

module.exports = router;