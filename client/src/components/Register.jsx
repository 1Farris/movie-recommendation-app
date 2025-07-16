import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      const res = await axios.post('https://movie-backend-epcf.onrender.com/api/auth/register', {
        username,
        password,
      });

      alert(res.data.message || 'Registration successful!');
      navigate('/login'); // Redirect to login after success
    } catch (error) {
      console.error('Register error:', error.response?.data?.error || error.message);
      alert(error.response?.data?.error || 'Registration failed.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>📝 Register</h2>
      <input
        type="text"
        placeholder="Choose a username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ marginBottom: '10px', display: 'block' }}
      />
      <input
        type="password"
        placeholder="Choose a password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ marginBottom: '10px', display: 'block' }}
      />
      <button onClick={handleRegister}>Register</button>
    </div>
  );
};

export default Register;
