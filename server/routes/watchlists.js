// server/routes/watchlists.js
const express = require('express');
const router  = express.Router();

const Watchlist        = require('../models/Watchlist');
const Movie            = require('../models/Movie');
const authenticateToken = require('../middleware/auth');

/* --------------------------------------------------
   1) CREATE  ‑  POST /api/watchlists/create
-------------------------------------------------- */
router.post('/create', authenticateToken, async (req, res) => {
  const { name } = req.body;
  try {
    const exists = await Watchlist.findOne({ name, userId: req.user.userId });
    if (exists) return res.status(400).json({ error: 'Watchlist already exists' });

    const list = await Watchlist.create({ name, userId: req.user.userId, movies: [] });
    res.status(201).json({ message: 'Watchlist created', list });
  } catch (err) {
    console.error('❌ Create watchlist error:', err.message);
    res.status(500).json({ error: 'Failed to create watchlist' });
  }
});

/* --------------------------------------------------
   2) ADD MOVIE  ‑  POST /api/watchlists/:name/add
-------------------------------------------------- */
router.post('/:name/add', authenticateToken, async (req, res) => {
  const { name } = req.params;
  const { id, title, release_date, overview, poster_path } = req.body;
  const userId = req.user.userId;

  if (!id || !title) return res.status(400).json({ error: 'Missing required movie fields' });

  try {
    const list = await Watchlist.findOne({ name, userId });
    if (!list) return res.status(404).json({ error: 'Watchlist not found' });

    const duplicate = await Movie.findOne({ id, userId, watchlist: list._id });
    if (duplicate) return res.status(400).json({ error: 'Movie already in this watchlist' });

    const movie = await Movie.create({
      id,
      title,
      release_date,
      overview,
      poster_path,
      userId,
      watchlist: list._id,
    });

    list.movies.push(movie._id);
    await list.save();

    res.status(201).json({ message: '🎉 Movie added to watchlist', movie });
  } catch (err) {
    console.error('❌ Add‑movie error:', err.message);
    res.status(500).json({ error: 'Failed to add movie' });
  }
});

/* --------------------------------------------------
   3) GET ALL  ‑  GET /api/watchlists
-------------------------------------------------- */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const lists = await Watchlist
      .find({ userId: req.user.userId })
      .populate('movies')
      .sort({ createdAt: -1 });
    res.json(lists);
  } catch (err) {
    console.error('❌ Fetch watchlists error:', err.message);
    res.status(500).json({ error: 'Failed to fetch watchlists' });
  }
});

/* --------------------------------------------------
   4) REMOVE MOVIE  ‑  DELETE /api/watchlists/:name/remove/:movieId
-------------------------------------------------- */
router.delete('/:name/remove/:movieId', authenticateToken, async (req, res) => {
  const { name, movieId } = req.params;

  try {
    const list = await Watchlist.findOne({ name, userId: req.user.userId });
    if (!list) return res.status(404).json({ error: 'Watchlist not found' });

    list.movies = list.movies.filter((id) => id.toString() !== movieId);
    await list.save();

    await Movie.deleteOne({ _id: movieId, userId: req.user.userId });

    // Return updated list so UI can refresh easily
    const updated = await Watchlist.findOne({ _id: list._id }).populate('movies');
    res.json({ message: '🗑️ Movie removed', list: updated });
  } catch (err) {
    console.error('❌ Remove‑movie error:', err.message);
    res.status(500).json({ error: 'Failed to remove movie' });
  }
});

/* --------------------------------------------------
   5) DELETE WATCHLIST  ‑  DELETE /api/watchlists/:name
-------------------------------------------------- */
router.delete('/:name', authenticateToken, async (req, res) => {
  const { name } = req.params;

  try {
    // 1) Find the list
    const list = await Watchlist.findOne({ name, userId: req.user.userId });
    if (!list) return res.status(404).json({ error: 'Watchlist not found' });

    // 2) Delete all movies tied to this list
    await Movie.deleteMany({ watchlist: list._id, userId: req.user.userId });

    // 3) Delete the list itself
    await list.deleteOne();

    res.json({ message: '🗑️ Watchlist deleted' });
  } catch (err) {
    console.error('❌ Delete‑watchlist error:', err.message);
    res.status(500).json({ error: 'Failed to delete watchlist' });
  }
});

module.exports = router;
