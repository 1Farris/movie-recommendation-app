import React, { useEffect, useState } from 'react';

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('https://movie-backend-epcf.onrender.com/api/auth/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Failed to fetch profile');

        const data = await res.json();
        setProfile(data);
        setNewUsername(data.username);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchProfile();
  }, [token]);

  const handleUpdateProfile = async () => {
    try {
      const res = await fetch('https://movie-backend-epcf.onrender.com/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: newUsername,
          password: newPassword || undefined, // Only update password if provided
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');

      alert(data.message);
      setProfile((prev) => ({ ...prev, username: newUsername }));
      setEditMode(false);
      setNewPassword('');
    } catch (err) {
      alert(err.message);
    }
  };

  if (error) return <p style={{ color: 'red' }}>❌ {error}</p>;
  if (!profile) return <p>Loading profile...</p>;

  return (
    <div style={{ padding: '20px', maxWidth: '400px' }}>
      <h2>👤 User Profile</h2>

      {editMode ? (
        <>
          <label>
            Username:
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              style={{ width: '100%', padding: '6px', marginBottom: '10px' }}
            />
          </label>
          <label>
            New Password:
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Leave blank to keep current"
              style={{ width: '100%', padding: '6px', marginBottom: '10px' }}
            />
          </label>
          <button onClick={handleUpdateProfile} style={{ marginRight: '10px' }}>
            ✅ Save Changes
          </button>
          <button onClick={() => setEditMode(false)}>❌ Cancel</button>
        </>
      ) : (
        <>
          <p><strong>Username:</strong> {profile.username}</p>
          <p><strong>User ID:</strong> {profile.userId}</p>
          <button onClick={() => setEditMode(true)}>✏️ Edit Profile</button>
        </>
      )}
    </div>
  );
};

export default UserProfile;
