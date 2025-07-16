// Load environment variables from .env
const dotenv = require('dotenv');
dotenv.config();

// Core packages
const express  = require('express');
const cors     = require('cors');
const mongoose = require('mongoose');

// Route files
const movieRoutes     = require('./routes/movies');
const authRoutes      = require('./routes/auth');
const watchlistRoutes = require('./routes/watchlists'); // <‑ plural & matches filename
const reviewRoutes    = require('./routes/reviews');    // <‑ new reviews route

// Create Express app
const app = express();

// ────────────────────── Middleware ──────────────────────
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// ────────────────────── Route mounting ──────────────────
app.use('/api/movies',     movieRoutes);      console.log('🎬 /api/movies mounted');
app.use('/api/auth',       authRoutes);       console.log('🔐 /api/auth mounted');
app.use('/api/watchlists', watchlistRoutes);  console.log('📂 /api/watchlists mounted');
app.use('/api/reviews',    reviewRoutes);     console.log('⭐ /api/reviews mounted');

// Optional: uncomment if you later add routes/user.js
// try {
//   const userRoutes = require('./routes/user');
//   app.use('/api/user', userRoutes);
//   console.log('👤 /api/user mounted');
// } catch {
//   console.warn('⚠️  /api/user route skipped (file not found)');
// }

// Health check
app.get('/', (_req, res) => res.send('✅ Backend is working!'));

// ────────────────────── MongoDB connection ──────────────
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('❌ MONGO_URI missing in .env'); process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err.message));

// ────────────────────── Start server ────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log('📦 TMDB_API:', process.env.TMDB_API);
  console.log('🔑 TMDB_KEY:', process.env.TMDB_KEY);
});
