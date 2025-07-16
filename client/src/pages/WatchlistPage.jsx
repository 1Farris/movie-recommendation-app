import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const WatchlistPage = () => {
  const [watchlists, setWatchlists] = useState([]);
  const [newListName, setNewListName] = useState('');
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  // ✅ Fetch watchlists (memoized)
  const fetchWatchlists = useCallback(async () => {
    try {
      const res = await fetch('https://movie-backend-epcf.onrender.com/api/watchlists', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load watch‑lists');
      const data = await res.json();
      setWatchlists(data);
    } catch (err) {
      setError(err.message);
    }
  }, [token]);

  // ✅ Load watchlists on mount
  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else {
      fetchWatchlists();
    }
  }, [token, navigate, fetchWatchlists]);

  // ✅ Create new watchlist
  const handleCreate = async () => {
    if (!newListName.trim()) {
      alert('Please enter a list name');
      return;
    }
    try {
      const res = await fetch('https://movie-backend-epcf.onrender.com/api/watchlists/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newListName }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create list');
      }

      setNewListName('');
      fetchWatchlists(); // refresh
    } catch (err) {
      alert(err.message);
    }
  };

  // ✅ Remove movie from watchlist
  const handleRemove = async (listName, movieMongoId) => {
    if (!window.confirm('Remove this movie from the list?')) return;
    try {
      const res = await fetch(
        `https://movie-backend-epcf.onrender.com/api/watchlists/${encodeURIComponent(
          listName
        )}/remove/${movieMongoId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to remove');
      }

      fetchWatchlists(); // refresh
    } catch (err) {
      alert(err.message);
    }
  };
  // ✅ Delete watchlist
  const handleDeleteWatchlist = async (name) => {
  if (!window.confirm(`Delete the list "${name}"?`)) return;
  try {
    const res = await fetch(`https://movie-backend-epcf.onrender.com/api/watchlists/${encodeURIComponent(name)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Delete failed');
    alert(data.message);
    fetchWatchlists(); // refresh
  } catch (err) {
    alert(err.message);
  }
};


  // ✅ UI
  return (
    <div style={{ padding: '20px' }}>
      <h1>📂 Your Watch‑lists</h1>

      {error && <p style={{ color: 'red' }}>❌ {error}</p>}

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="New watch‑list name"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          style={{ padding: '6px 10px', marginRight: '10px' }}
        />
        <button onClick={handleCreate}>➕ Create</button>
      </div>

      {watchlists.length === 0 ? (
        <p>No watch‑lists yet. Create one above!</p>
      ) : (
        watchlists.map((list) => (
          <div
            key={list._id}
            style={{
              border: '1px solid #ddd',
              borderRadius: '6px',
              padding: '15px',
              marginBottom: '15px',
            }}
          >
            <h3 style={{ marginTop: 0 }}>{list.name}</h3>
            {list.movies.length === 0 ? (
              <p><em>Empty list</em></p>
            ) : (
              <ul>
                {list.movies.map((m) => (
                  <li key={m._id} style={{ marginBottom: '8px' }}>
                    {m.title}{' '}
                    <button
                      onClick={() => handleRemove(list.name, m._id)}
                      style={{
                        marginLeft: 10,
                        background: '#e74c3c',
                        color: '#fff',
                        border: 'none',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      🗑️ Remove
                    </button>

                    <button onClick={() => handleDeleteWatchlist(list.name)}
                       style={{
                        marginLeft: 10,
                        background: '#e74c3c',
                        color: '#fff',
                        border: 'none',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                       🗑️ Delete List
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default WatchlistPage;
