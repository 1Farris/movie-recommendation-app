import React from 'react';
import axios from 'axios';

const MovieCard = ({ movie }) => {
  const handleSave = async () => {
    try {
      await axios.post('http://localhost:5000/api/movies/save', {
        title: movie.title,
        overview: movie.overview,
        poster_path: movie.poster_path,
        release_date: movie.release_date,
        vote_average: movie.vote_average,
      });
      alert('Movie saved!');
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save movie.');
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: 10, marginBottom: 10 }}>
      <h3>{movie.title}</h3>
      <p>{movie.overview}</p>
      <button onClick={handleSave}>💾 Save Movie</button>
    </div>
  );
};

export default MovieCard;
