import React, { useState } from 'react';
import axios from 'axios';
import MovieCard from './MovieCard';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState('');

  const searchMovies = async () => {
    try {
      const res = await axios.get(`https://movie-backend-epcf.onrender.com/api/movies/search?query=${query}`);
      setMovies(res.data.results);
      setError('');
    } catch (err) {
      setError('Something went wrong while searching.');
      setMovies([]);
    }
  };

  return (
    <div>
      <h2>🔎 Search for Movies</h2>
      <input
        type="text"
        placeholder="Enter movie name..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={searchMovies}>Search</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );
};

export default SearchBar;
