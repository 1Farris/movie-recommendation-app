// server/routes/reviews.js 
const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const authenticateToken = require('../middleware/auth');

/**
 * --------------------------------------------------
 * POST  /api/reviews
 * Body: { movieId, rating, comment }
 * Creates (or updates) a review from the logged‑in user
 * --------------------------------------------------
 */
router.post('/', authenticateToken, async (req, res) => {
  const { movieId, rating, comment } = req.body;

  if (!movieId || !rating) {
    return res.status(400).json({ error: 'movieId and rating are required' });
  }
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'rating must be 1‑5' });
  }

  try {
    const review = await Review.findOneAndUpdate(
      { movieId, userId: req.user.userId },
      {
        movieId,
        rating,
        comment,
        userId: req.user.userId,
        username: req.user.username,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({ message: 'Review saved', review });
  } catch (err) {
    console.error('❌ Review save error:', err.message);
    res.status(500).json({ error: 'Failed to save review' });
  }
});

/**
 * --------------------------------------------------
 * GET  /api/reviews/my
 * Returns all reviews by the logged‑in user
 * --------------------------------------------------
 */
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    console.error('❌ Fetch my reviews error:', err.message);
    res.status(500).json({ error: 'Failed to fetch your reviews' });
  }
});

/**
 * --------------------------------------------------
 * GET  /api/reviews/:movieId
 * Returns all reviews for a given TMDB movie ID
 * --------------------------------------------------
 */
router.get('/:movieId', async (req, res) => {
  try {
    const reviews = await Review.find({ movieId: req.params.movieId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    console.error('❌ Fetch reviews error:', err.message);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});



/**
 * Optional: Keep or remove this
 * GET /api/reviews/user/me — legacy, same as /my
 */
router.get('/user/me', authenticateToken, async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    console.error('❌ Fetch user reviews error:', err.message);
    res.status(500).json({ error: 'Failed to fetch your reviews' });
  }
});

module.exports = router;
