const mongoose = require('mongoose');

const WatchlistSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. "Favorites"
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  movies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }], // 🔗 Reference movie documents
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Watchlist', WatchlistSchema);
