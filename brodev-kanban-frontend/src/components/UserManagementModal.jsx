import { useState } from 'react';

const API_URL = "http://localhost:3000/api";

export default function UserManagementModal({ currentUser, users, onClose, onUsersChanged }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('art');
  const [newPassword, setNewPassword] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [resetUserId, setResetUserId] = useState(null);
  const [resetPassword, setResetPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAddUser = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!newName || !newEmail || !newPassword) {
      setError('Nama, Email, dan Password wajib diisi');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          role: newRole,
          password: newPassword,
          phone_number: newPhone || null
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(`Pengguna "${newName}" berhasil ditambahkan!`);
      setNewName(''); setNewEmail(''); setNewRole('art'); setNewPassword(''); setNewPhone('');
      setShowAddForm(false);
      onUsersChanged();
    } catch (err) {
      setError(err.message || 'Gagal menambahkan pengguna');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Hapus pengguna "${userName}"? Semua tugas yang ditugaskan ke mereka akan dilepas.`)) return;
    setError(''); setSuccess('');
    try {
      const res = await fetch(`${API_URL}/users/${userId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(`Pengguna "${userName}" berhasil dihapus.`);
      onUsersChanged();
    } catch (err) {
      setError(err.message || 'Gagal menghapus pengguna');
    }
  };

  const handleResetPassword = async (userId) => {
    if (!resetPassword) { setError('Password baru wajib diisi'); return; }
    setError(''); setSuccess('');
    try {
      const res = await fetch(`${API_URL}/users/${userId}/reset-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: resetPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(data.message);
      setResetUserId(null);
      setResetPassword('');
    } catch (err) {
      setError(err.message || 'Gagal mereset password');
    }
  };

  const overlayStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(6px)'
  };

  const modalStyle = {
    background: 'white', borderRadius: '16px', width: '95%', maxWidth: '600px',
    maxHeight: '85vh', overflowY: 'auto', padding: '2rem',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
  };

  const inputStyle = {
    padding: '0.65rem 1rem', borderRadius: '8px',
    border: '1px solid #e2e8f0', fontSize: '0.95rem', width: '100%',
    boxSizing: 'border-box'
  };

  const badgeStyle = (role) => ({
    fontSize: '0.72rem', fontWeight: '700', padding: '0.2rem 0.6rem',
    borderRadius: '20px', textTransform: 'uppercase',
    background: role === 'owner' ? '#ebf4ff' : '#f0fff4',
    color: role === 'owner' ? '#3182ce' : '#276749'
  });

  return (
    <div style={overlayStyle} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={modalStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.3rem' }}>👥 Kelola Pengguna</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#999' }}>✕</button>
        </div>

        {error && <div style={{ background: '#fff5f5', color: '#c53030', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}
        {success && <div style={{ background: '#f0fff4', color: '#276749', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>{success}</div>}

        {/* Daftar Pengguna */}
        <div style={{ marginBottom: '1.5rem' }}>
          {users.map(user => (
            <div key={user.id} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.85rem 1rem', borderRadius: '10px',
              background: '#f8fafc', marginBottom: '0.5rem',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{user.name}</div>
                <div style={{ fontSize: '0.8rem', color: '#718096' }}>{user.email}</div>
                {user.phone_number && (
                  <div style={{ fontSize: '0.78rem', color: '#4a5568', marginTop: '0.1rem' }}>
                    📞 {user.phone_number}
                  </div>
                )}
              </div>
              <span style={badgeStyle(user.role)}>{user.role}</span>

              {/* Jangan izinkan owner hapus/reset diri sendiri */}
              {user.id !== currentUser.id && (
                <>
                  {resetUserId === user.id ? (
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <input
                        type="password"
                        placeholder="Password baru"
                        value={resetPassword}
                        onChange={e => setResetPassword(e.target.value)}
                        style={{ ...inputStyle, width: '130px', padding: '0.4rem 0.6rem' }}
                      />
                      <button
                        onClick={() => handleResetPassword(user.id)}
                        style={{ padding: '0.4rem 0.7rem', background: '#4299e1', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}
                      >Simpan</button>
                      <button
                        onClick={() => { setResetUserId(null); setResetPassword(''); }}
                        style={{ padding: '0.4rem 0.5rem', background: '#e2e8f0', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}
                      >✕</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                      <button
                        onClick={() => setResetUserId(user.id)}
                        title="Reset Password"
                        style={{ padding: '0.4rem 0.6rem', background: '#ebf4ff', color: '#3182ce', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}
                      >🔑 Reset</button>
                      <button
                        onClick={() => handleDeleteUser(user.id, user.name)}
                        title="Hapus Pengguna"
                        style={{ padding: '0.4rem 0.6rem', background: '#fff5f5', color: '#c53030', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
                      >🗑️</button>
                    </div>
                  )}
                </>
              )}
              {user.id === currentUser.id && (
                <span style={{ fontSize: '0.78rem', color: '#a0aec0', fontStyle: 'italic' }}>Anda</span>
              )}
            </div>
          ))}
        </div>

        {/* Form Tambah Pengguna */}
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            style={{
              width: '100%', padding: '0.85rem', borderRadius: '10px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white', border: 'none', cursor: 'pointer',
              fontWeight: '700', fontSize: '0.95rem'
            }}
          >
            + Tambah Pengguna Baru
          </button>
        ) : (
          <form onSubmit={handleAddUser} style={{ background: '#f8fafc', borderRadius: '10px', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 1rem', color: '#4a5568' }}>Tambah Pengguna Baru</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input type="text" placeholder="Nama Lengkap *" value={newName} onChange={e => setNewName(e.target.value)} style={inputStyle} />
              <input type="email" placeholder="Email *" value={newEmail} onChange={e => setNewEmail(e.target.value)} style={inputStyle} />
              <input type="text" placeholder="Nomor WhatsApp (Contoh: 08123456789)" value={newPhone} onChange={e => setNewPhone(e.target.value)} style={inputStyle} />
              <select value={newRole} onChange={e => setNewRole(e.target.value)} style={inputStyle}>
                <option value="art">ART (Asisten Rumah Tangga)</option>
                <option value="owner">Owner (Pemilik Rumah)</option>
              </select>
              <input type="password" placeholder="Password Awal *" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={inputStyle} />
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="submit" style={{ flex: 1, padding: '0.75rem', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}>
                  Simpan
                </button>
                <button type="button" onClick={() => { setShowAddForm(false); setError(''); }} style={{ flex: 1, padding: '0.75rem', background: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                  Batal
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
