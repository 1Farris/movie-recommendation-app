const express = require('express');
const axios = require('axios');
const router = express.Router();
const Movie = require('../models/Movie');
const authenticateToken = require('../middleware/auth');

const TMDB_API = process.env.TMDB_API;
const TMDB_KEY = process.env.TMDB_KEY;

console.log('📁 TMDB routes loaded');
console.log('🔑 TMDB_API:', TMDB_API ? 'Loaded ✅' : 'Missing ❌');
console.log('🔑 TMDB_KEY:', TMDB_KEY ? 'Loaded ✅' : 'Missing ❌');

// ✅ Save a movie to Favorites (prevent duplicates, store necessary fields only)
router.post('/save', authenticateToken, async (req, res) => {
  try {
    const { id, title, release_date, overview, poster_path } = req.body;
    const userId = req.user.userId;

    if (!id || !title) {
      return res.status(400).json({ error: 'Missing required movie fields' });
    }

    const exists = await Movie.findOne({ id, userId, watchlist: { $exists: false } });
    if (exists) {
      return res.status(400).json({ error: 'Movie already saved in Favorites' });
    }

    const movie = new Movie({
      id,
      title,
      release_date,
      overview,
      poster_path,
      userId,
    });

    await movie.save();
    res.status(201).json({ message: '✅ Movie saved successfully' });
  } catch (err) {
    console.error('❌ Save movie error:', err.message);
    res.status(500).json({ error: 'Failed to save movie' });
  }
});

// ✅ Get all saved movies (Favorites) for logged-in user
router.get('/saved', authenticateToken, async (req, res) => {
  try {
    const movies = await Movie.find({ userId: req.user.userId, watchlist: { $exists: false } });
    res.json(movies);
  } catch (err) {
    console.error('❌ Fetch saved movies error:', err.message);
    res.status(500).json({ error: 'Failed to fetch saved movies' });
  }
});

// ✅ Delete a movie by Mongo ID (only if it belongs to the user)
router.delete('/delete/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Movie.findOneAndDelete({
      _id: id,
      userId: req.user.userId,
      watchlist: { $exists: false },
    });

    if (!deleted) {
      return res.status(404).json({ error: 'Movie not found or not authorized' });
    }

    res.json({ message: `🗑️ Movie "${deleted.title}" deleted successfully` });
  } catch (err) {
    console.error('❌ Delete movie error:', err.message);
    res.status(500).json({ error: 'Failed to delete movie' });
  }
});

// ✅ Search movies using TMDB
router.get('/search', async (req, res) => {
  const query = req.query.query;

  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  try {
    const response = await axios.get(`${TMDB_API}/search/movie`, {
      params: {
        api_key: TMDB_KEY,
        query,
      },
    });

    res.json({ results: response.data.results });
  } catch (err) {
    console.error('❌ TMDB API error:', err.message);
    res.status(500).json({ error: 'Something went wrong searching movies' });
  }
});

// ✅ Health check
router.get('/ping', (req, res) => {
  res.send('pong');
});

// --------------------------------------------------
// Submit or update a review and rating for a saved movie
// POST /api/movies/:id/review
// Body: { rating, review }
// --------------------------------------------------
router.post('/:id/review', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { rating, review } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  try {
    const movie = await Movie.findOne({ _id: id, userId: req.user.userId });

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found or unauthorized' });
    }

    movie.rating = rating;
    movie.review = review;
    await movie.save();

    res.json({ message: '✅ Review and rating submitted', movie });
  } catch (err) {
    console.error('❌ Review error:', err.message);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

// --------------------------------------------------
// Get all movies with reviews for the current user
// GET /api/movies/reviews
// --------------------------------------------------
router.get('/reviews', authenticateToken, async (req, res) => {
  try {
    const ratedMovies = await Movie.find({
      userId: req.user.userId,
      rating: { $exists: true },
    });
    res.json(ratedMovies);
  } catch (err) {
    console.error('❌ Fetch rated movies error:', err.message);
    res.status(500).json({ error: 'Failed to fetch rated movies' });
  }
});

// 🔍 Advanced Discover route with filters
router.get('/discover', async (req, res) => {
  const { genre, year, rating, sortBy } = req.query;

  try {
    const response = await axios.get(`${TMDB_API}/discover/movie`, {
      params: {
        api_key: TMDB_KEY,
        with_genres: genre,
        primary_release_year: year,
        vote_average_gte: rating,
        sort_by: sortBy || 'popularity.desc',
      },
    });

    res.json({ results: response.data.results });
  } catch (err) {
    console.error('❌ Discover API error:', err.message);
    res.status(500).json({ error: 'Failed to fetch filtered movies' });
  }
});

router.delete('/delete/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const deleted = await Movie.findOneAndDelete({ _id: id, userId: req.user.userId });
  if (!deleted) return res.status(404).json({ error: 'Movie not found' });
  res.json({ message: '🗑️ Movie deleted' });
});



module.exports = router;
