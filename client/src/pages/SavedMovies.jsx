import React, { useEffect, useState } from 'react';

const SavedMovies = () => {
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token'); // ✅ Get token

  // 🔄 Load saved movies
  const fetchSavedMovies = async () => {
    if (!token) {
      setError('You must be logged in to view saved movies.');
      return;
    }

    try {
      const response = await fetch('${process.env.REACT_APP_API_URL}/api/movies/saved', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch saved movies');
      }

      const data = await response.json();
      setMovies(data);
    } catch (err) {
      console.error(err.message);
      setError('Could not load saved movies.');
    }
  };

  // ❌ Delete a movie
  const handleDelete = async (id) => {
    if (!token) {
      alert('You must be logged in to delete movies.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this movie?')) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/movies/delete/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || 'Movie deleted!');
        setMovies((prev) => prev.filter((movie) => movie._id !== id));
      } else {
        throw new Error(data.error || 'Failed to delete movie');
      }
    } catch (err) {
      console.error(err.message);
      alert('Failed to delete movie.');
    }
  };

  useEffect(() => {
  if (!token) {
    alert('Please login to view saved movies.');
    window.location.href = '/login';
  } else {
    fetchSavedMovies();
  }
}, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>💾 Saved Movies</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!token ? (
        <p>Please log in to view your saved movies.</p>
      ) : movies.length === 0 && !error ? (
        <p>No saved movies yet.</p>
      ) : (
        <ul>
          {movies.map((movie) => (
            <li key={movie._id} style={{ marginBottom: '10px' }}>
              <strong>{movie.title}</strong> ({movie.release_date})
              <br />
              <button
                onClick={() => handleDelete(movie._id)}
                style={{
                  marginTop: '5px',
                  background: '#e74c3c',
                  color: '#fff',
                  border: 'none',
                  padding: '6px 10px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                🗑️ Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SavedMovies;
