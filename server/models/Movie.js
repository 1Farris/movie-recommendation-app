// server/models/Movie.js
const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  title: { type: String, required: true },
  release_date: { type: String },
  overview: { type: String },
  poster_path: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  watchlist: { type: mongoose.Schema.Types.ObjectId, ref: 'Watchlist' }, // ✅ Optional

  // ⭐ New fields for rating and review
  rating: { type: Number, min: 1, max: 5 },
  review: { type: String },
});

const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;
