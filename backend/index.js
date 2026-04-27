const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Route Modules ─────────────────────────────────────────────────────────────
const authRoutes       = require('./routes/auth');
const userRoutes       = require('./routes/users');
const classRoutes      = require('./routes/classes');
const cartRoutes       = require('./routes/cart');
const paymentRoutes    = require('./routes/payments');
const enrolledRoutes   = require('./routes/enrolled');
const instructorRoutes = require('./routes/instructors');

app.use('/auth',        authRoutes);
app.use('/users',       userRoutes);
app.use('/classes',     classRoutes);
app.use('/cart',        cartRoutes);
app.use('/payments',    paymentRoutes);
app.use('/enrolled',    enrolledRoutes);
app.use('/instructors', instructorRoutes);

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get('/', (_req, res) => res.json({ message: 'Yoga Master API is running 🧘' }));

// ─── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: true, message: err.message || 'Internal server error' });
});

app.listen(port, () => console.log(`Server running on port ${port}`));