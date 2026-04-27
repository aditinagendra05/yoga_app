const express = require('express');
const { ObjectId } = require('mongodb');
const stripe = require('stripe')(process.env.PAYMENT_SECRET);
const { connectDB } = require('../config/db');
const { verifyJWT } = require('../middleware/auth');

const router = express.Router();

// ── POST /payments/create-intent  ──  Create Stripe payment intent ────────────
router.post('/create-intent', verifyJWT, async (req, res, next) => {
  try {
    const { price } = req.body;
    if (!price || isNaN(price)) {
      return res.status(400).json({ error: true, message: 'Valid price is required' });
    }
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(parseFloat(price) * 100),
      currency: 'usd',
      payment_method_types: ['card'],
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) { next(err); }
});

// ── POST /payments  ──  Save payment, enroll user, clear cart ─────────────────
router.post('/', verifyJWT, async (req, res, next) => {
  try {
    const db = await connectDB();
    const { classesId, userEmail, transactionId } = req.body;
    const singleClassId = req.query.classId;

    if (!classesId?.length || !userEmail || !transactionId) {
      return res.status(400).json({ error: true, message: 'classesId, userEmail, transactionId are required' });
    }

    const classObjectIds = classesId.map(id => new ObjectId(id));

    // Update seat counts and enrollment totals
    await db.collection('classes').updateMany(
      { _id: { $in: classObjectIds } },
      { $inc: { totalEnrolled: 1, availableSeats: -1 } }
    );

    // Record enrollment
    const enrolledResult = await db.collection('enrolled').insertOne({
      userEmail,
      classesId: classObjectIds,
      transactionId,
      date: new Date(),
    });

    // Save payment record
    const paymentResult = await db.collection('payments').insertOne({
      ...req.body,
      date: new Date(),
    });

    // Remove purchased items from cart
    const cartQuery = singleClassId
      ? { classId: singleClassId, userMail: userEmail }
      : { classId: { $in: classesId }, userMail: userEmail };
    const deletedResult = await db.collection('cart').deleteMany(cartQuery);

    res.status(201).json({ paymentResult, enrolledResult, deletedResult });
  } catch (err) { next(err); }
});

// ── GET /payments/:email  ──  Payment history for a user ─────────────────────
router.get('/:email', verifyJWT, async (req, res, next) => {
  try {
    const db = await connectDB();
    const payments = await db.collection('payments')
      .find({ userEmail: req.params.email })
      .sort({ date: -1 })
      .toArray();
    res.json(payments);
  } catch (err) { next(err); }
});

// ── GET /payments/:email/count  ──  Count of payments for a user ──────────────
router.get('/:email/count', verifyJWT, async (req, res, next) => {
  try {
    const db = await connectDB();
    const total = await db.collection('payments').countDocuments({ userEmail: req.params.email });
    res.json({ total });
  } catch (err) { next(err); }
});

module.exports = router;