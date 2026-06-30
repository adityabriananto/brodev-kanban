import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:3000/api';

export default function ProfileSelection({ onLogin }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');

  const fetchUsers = () => {
    fetch(`${API_URL}/users`)
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch users', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddProfile = (e) => {
    e.preventDefault();
    if (!newProfileName) return;

    fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newProfileName, role: 'art' })
    })
    .then(res => res.json())
    .then(newUser => {
      setUsers([...users, newUser]);
      setNewProfileName('');
      setShowAddForm(false);
    });
  };

  if (loading) {
    return <div className="profile-container"><h2>Memuat Profil...</h2></div>;
  }

  return (
    <div className="profile-container">
      <h1 className="profile-title">Siapa yang bertugas hari ini?</h1>
      
      <div className="profile-grid">
        {users.map(user => (
          <div key={user.id} className="profile-card" onClick={() => onLogin(user)}>
            <div className="profile-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="profile-name">{user.name}</div>
              <div className="profile-role">{user.role}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        {!showAddForm ? (
          <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
            + Tambah Profil ART
          </button>
        ) : (
          <form className="new-task-form" onSubmit={handleAddProfile} style={{ maxWidth: '300px', margin: '0 auto' }}>
            <input 
              type="text" 
              placeholder="Nama ART..." 
              value={newProfileName}
              onChange={e => setNewProfileName(e.target.value)}
            />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-primary">Simpan</button>
              <button type="button" className="btn" onClick={() => setShowAddForm(false)}>Batal</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
