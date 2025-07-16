// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import SearchPage from './pages/SearchPage';
import SavedMovies from './pages/SavedMovies';
import Login from './components/Login';
import Register from './components/Register';
import UserProfile from './pages/UserProfile';
import WatchlistPage from './pages/WatchlistPage';
import MyReviewsPage from './pages/MyReviewsPage';

const App = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    alert('Logged out successfully!');
    navigate('/login');
  };

  return (
    <div style={{ padding: '1rem', fontFamily: 'Arial, sans-serif' }}>
      <nav style={{ marginBottom: '1rem' }}>
        <NavLink to="/" end style={linkStyle}>🔍 Search</NavLink>
        <NavLink to="/saved" style={linkStyle}>💾 Saved</NavLink>

        {!token && <NavLink to="/login" style={linkStyle}>🔐 Login</NavLink>}
        {!token && <NavLink to="/register" style={linkStyle}>📝 Register</NavLink>}

        {token && <NavLink to="/watchlists" style={linkStyle}>📂 Watch‑lists</NavLink>}
        {token && <NavLink to="/reviews" style={linkStyle}>📋 My Reviews</NavLink>}
        {token && <NavLink to="/profile" style={linkStyle}>👤 Profile</NavLink>}

        {token && (
          <button
            onClick={handleLogout}
            style={{
              background: '#dc3545',
              color: '#fff',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginLeft: '1rem',
            }}
          >
            🚪 Logout
          </button>
        )}
      </nav>

      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="/saved" element={<SavedMovies />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/watchlists" element={<WatchlistPage />} />
        <Route path="/reviews" element={<MyReviewsPage />} />
      </Routes>
    </div>
  );
};

// ✅ Link styling helper
const linkStyle = ({ isActive }) => ({
  marginRight: '1rem',
  textDecoration: 'none',
  color: isActive ? '#007bff' : '#333',
  fontWeight: isActive ? 'bold' : 'normal',
});

// ✅ Wrap with Router so useNavigate works
export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}
