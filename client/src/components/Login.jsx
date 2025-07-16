import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // ✅ Import navigate

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // ✅ useNavigate hook

  const handleLogin = async () => {
    try {
      const res = await axios.post('https://movie-backend-epcf.onrender.com/api/auth/login', {
        username,
        password
      });
      
      localStorage.setItem('token', res.data.token); // ✅ Save token
      alert('Login successful!');
      navigate('/saved'); // ✅ Redirect to Saved Movies
    } catch (error) {
      alert('Login failed! Please check your credentials.');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <input
        type="text"
        placeholder="Username"
        onChange={(e) => setUsername(e.target.value)}
      /><br />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      /><br />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default Login;
