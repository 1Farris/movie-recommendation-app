import React, { useState, useEffect } from 'react';

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [watchlists, setWatchlists] = useState([]);
  const [selectedLists, setSelectedLists] = useState({});
  const [ratings, setRatings] = useState({});
  const [comments, setComments] = useState({});
  const [genre, setGenre] = useState('');
  const [year, setYear] = useState('');
  const [rating, setRating] = useState('');
  const [sortBy, setSortBy] = useState('popularity.desc');

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchWatchlists = async () => {
      if (!token) return;
      try {
        const res = await fetch('https://movie-backend-epcf.onrender.com/api/watchlists', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setWatchlists(data);
      } catch (err) {
        console.error('Failed to load watchlists:', err);
      }
    };
    fetchWatchlists();
  }, [token]);

  const handleSearch = async () => {
    if (!searchTerm && !genre && !year && !rating) {
      setError('Please enter a search term or choose filters.');
      return;
    }
    try {
      const queryParams = new URLSearchParams({
        query: searchTerm,
        genre,
        year,
        rating,
        sortBy,
      });
      const res = await fetch(`https://movie-backend-epcf.onrender.com/api/movies/discover?${queryParams}`);
      if (!res.ok) throw new Error('Failed to fetch movies');
      const data = await res.json();
      setResults(data.results || []);
      setError('');
    } catch (err) {
      console.error(err.message);
      setError('Failed to fetch movies. Please try again.');
    }
  };

  const handleSave = async (movie) => {
    if (!token) {
      alert('You must be logged in to save movies.');
      return;
    }
    try {
      const res = await fetch('https://movie-backend-epcf.onrender.com/api/movies/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: movie.id,
          title: movie.title,
          release_date: movie.release_date,
          overview: movie.overview,
          poster_path: movie.poster_path,
        }),
      });
      const data = await res.json();
      alert(data.message || 'Movie saved!');
    } catch (err) {
      console.error('Save failed:', err.message);
      alert('Failed to save movie.');
    }
  };

  const handleWatchlistChange = (movieId, listName) =>
    setSelectedLists((prev) => ({ ...prev, [movieId]: listName }));

  const handleAssign = async (movie) => {
    const listName = selectedLists[movie.id];
    if (!listName) {
      alert('Please select a watchlist.');
      return;
    }

    let savedMovie;

    try {
      const saveRes = await fetch('https://movie-backend-epcf.onrender.com/api/movies/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: movie.id,
          title: movie.title,
          release_date: movie.release_date,
          overview: movie.overview,
          poster_path: movie.poster_path,
        }),
      });

      const saveData = await saveRes.json();

      if (saveRes.ok) {
        savedMovie = saveData.movie || saveData;
      } else if (saveData.error === 'Movie already saved in Favorites') {
        const fetchRes = await fetch(`https://movie-backend-epcf.onrender.com/api/movies/${movie.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const fetchedData = await fetchRes.json();
        if (!fetchRes.ok) throw new Error(fetchedData.error || 'Failed to fetch saved movie');
        savedMovie = fetchedData;
      } else {
        throw new Error(saveData.error || 'Failed to save movie');
      }

      const assignRes = await fetch(
        `https://movie-backend-epcf.onrender.com/api/watchlists/${encodeURIComponent(listName)}/add`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id: savedMovie.id,
            title: savedMovie.title,
            release_date: savedMovie.release_date,
            overview: savedMovie.overview,
            poster_path: savedMovie.poster_path,
          }),
        }
      );

      const assignData = await assignRes.json();
      if (!assignRes.ok) throw new Error(assignData.error || 'Failed to assign movie');

      alert('🎉 Movie assigned to watchlist!');
    } catch (err) {
      console.error('Assign error:', err.message);
      alert(err.message);
    }
  };

  const handleSubmitReview = async (movieId) => {
    const rating = ratings[movieId];
    const comment = comments[movieId];

    if (!rating) {
      alert('Please select a rating (1‑5 stars)');
      return;
    }

    try {
      const res = await fetch('https://movie-backend-epcf.onrender.com/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ movieId, rating, comment }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit review');

      alert('✅ Review submitted');
      setRatings((prev) => ({ ...prev, [movieId]: '' }));
      setComments((prev) => ({ ...prev, [movieId]: '' }));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>🎬 Search Movies</h1>
      <input
        type="text"
        placeholder="Enter movie name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ padding: '8px', width: '250px', marginRight: '10px' }}
      />

      <div style={{ marginTop: '10px' }}>
        <input
          type="text"
          placeholder="Enter year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          style={{ marginRight: '8px', padding: '6px' }}
        />
        <input
          type="number"
          placeholder="Minimum rating (1-10)"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          style={{ marginRight: '8px', padding: '6px' }}
        />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: '6px' }}>
          <option value="popularity.desc">Popularity</option>
          <option value="vote_average.desc">Rating</option>
          <option value="release_date.desc">Latest</option>
        </select>
        <select value={genre} onChange={(e) => setGenre(e.target.value)} style={{ padding: '6px', marginLeft: '8px' }}>
          <option value="">🎭 All Genres</option>
          <option value="28">Action</option>
          <option value="35">Comedy</option>
          <option value="18">Drama</option>
          <option value="27">Horror</option>
          <option value="10749">Romance</option>
        </select>
      </div>

      <button onClick={handleSearch} style={{ padding: '8px', marginTop: '10px' }}>
        Search
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ marginTop: '20px' }}>
        {results.length === 0 && !error && <p>No results yet. Try searching!</p>}
        <ul>
          {results.map((movie) => (
            <li key={movie.id} style={{ marginBottom: '20px' }}>
              <strong>{movie.title}</strong> ({movie.release_date})
              <br />
              <button
                onClick={() => handleSave(movie)}
                style={{ marginTop: '5px', marginBottom: '10px' }}
              >
                💾 Save
              </button>

              {token && (
                <>
                  <div>
                    <select
                      value={selectedLists[movie.id] || ''}
                      onChange={(e) => handleWatchlistChange(movie.id, e.target.value)}
                      style={{ marginRight: '8px' }}
                    >
                      <option value="">📂 Select a Watchlist</option>
                      {watchlists.map((wl) => (
                        <option key={wl._id} value={wl.name}>
                          {wl.name}
                        </option>
                      ))}
                    </select>
                    <button onClick={() => handleAssign(movie)}>📌 Assign</button>
                  </div>

                  <div style={{ marginTop: '10px' }}>
                    <label>
                      ⭐ Rating:{' '}
                      <select
                        value={ratings[movie.id] || ''}
                        onChange={(e) =>
                          setRatings((prev) => ({
                            ...prev,
                            [movie.id]: Number(e.target.value),
                          }))
                        }
                      >
                        <option value="">Select</option>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <option key={star} value={star}>
                            {star}
                          </option>
                        ))}
                      </select>
                    </label>
                    <br />
                    <textarea
                      rows="2"
                      placeholder="Write your review..."
                      value={comments[movie.id] || ''}
                      onChange={(e) =>
                        setComments((prev) => ({
                          ...prev,
                          [movie.id]: e.target.value,
                        }))
                      }
                      style={{ width: '100%', marginTop: '5px' }}
                    />
                    <button
                      onClick={() => handleSubmitReview(movie.id)}
                      style={{ marginTop: '5px' }}
                    >
                      📝 Submit Review
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SearchPage;
