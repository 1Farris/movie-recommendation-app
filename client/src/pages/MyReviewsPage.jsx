import React, { useEffect, useState } from 'react';

const MyReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch('https://movie-backend-epcf.onrender.com/api/reviews/my', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch your reviews');
        const data = await res.json();
        setReviews(data);
      } catch (err) {
        setError(err.message);
      }
    };

    if (token) fetchReviews();
  }, [token]);

  return (
    <div style={{ padding: '20px' }}>
      <h1>⭐ My Reviews</h1>
      {error && <p style={{ color: 'red' }}>❌ {error}</p>}

      {reviews.length === 0 ? (
        <p>No reviews yet. Rate a movie to see it here!</p>
      ) : (
        <ul>
          {reviews.map((rev) => (
            <li key={rev._id} style={{ marginBottom: '20px' }}>
              <h3>{rev.movieTitle || `Movie #${rev.movieId}`}</h3>
              <p>⭐ {rev.rating} / 5</p>
              <p><em>{rev.comment || 'No comment'}</em></p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyReviewsPage;
