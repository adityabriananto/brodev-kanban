import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export default function WhatsAppSettingsModal({ onClose }) {
  const [waStatus, setWaStatus] = useState('DISCONNECTED');
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/wa-status`);
      const data = await res.json();
      setWaStatus(data.status);
      setQrCode(data.qr);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching WA status:', err);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Poll status every 5 seconds while modal is open to dynamically catch QR scan / connection open
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    if (!window.confirm('Putuskan koneksi WhatsApp? Aplikasi tidak akan bisa mengirimkan notifikasi WA lagi.')) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/wa-logout`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to logout');
      toast.success('Koneksi WhatsApp diputuskan.');
      fetchStatus();
    } catch (err) {
      toast.error('Gagal memutuskan koneksi.');
      setLoading(false);
    }
  };

  const overlayStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(6px)'
  };

  const modalStyle = {
    background: 'white', borderRadius: '16px', width: '95%', maxWidth: '400px',
    padding: '2rem', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
  };

  const btnStyle = {
    padding: '0.75rem 1.5rem', border: 'none', borderRadius: '8px',
    fontWeight: '700', cursor: 'pointer', width: '100%', marginTop: '1.5rem'
  };

  return (
    <div style={overlayStyle} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={modalStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem' }}>💬 Koneksi WhatsApp</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#999' }}>âœ•</button>
        </div>

        {loading ? (
          <div style={{ padding: '2rem 0', color: '#666' }}>Memuat status...</div>
        ) : (
          <div>
            {waStatus === 'CONNECTED' && (
              <div style={{ padding: '1rem 0' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>âœ…</div>
                <h4 style={{ margin: '0 0 0.5rem', color: '#2f855a' }}>WhatsApp Terhubung!</h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#718096', lineHeight: '1.4' }}>
                  Aplikasi siap mengirimkan notifikasi tugas langsung ke nomor WhatsApp Owner & ART secara real-time.
                </p>
                <button
                  onClick={handleLogout}
                  style={{ ...btnStyle, background: '#fff5f5', color: '#c53030', border: '1px solid #fed7d7' }}
                >
                  Putuskan Koneksi WA
                </button>
              </div>
            )}

            {waStatus === 'QR_READY' && qrCode && (
              <div>
                <p style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: '#4a5568', lineHeight: '1.4' }}>
                  Buka WhatsApp di HP Anda â†’ **Perangkat Tertaut (Linked Devices)** â†’ **Tautkan Perangkat**, lalu scan QR Code di bawah ini:
                </p>
                <div style={{
                  background: 'white', padding: '1rem', borderRadius: '12px',
                  display: 'inline-block', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}>
                  <img src={qrCode} alt="WhatsApp QR Code" style={{ width: '220px', height: '220px', display: 'block' }} />
                </div>
                <div style={{ fontSize: '0.8rem', color: '#a0aec0', marginTop: '0.8rem', animation: 'pulse 2s infinite' }}>
                  🔄 QR Code diperbarui otomatis
                </div>
              </div>
            )}

            {(waStatus === 'DISCONNECTED' || waStatus === 'CONNECTING') && (
              <div style={{ padding: '2rem 0' }}>
                <div style={{
                  border: '4px solid #f3f3f3', borderTop: '4px solid #4f46e5',
                  borderRadius: '50%', width: '40px', height: '40px',
                  animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem'
                }} />
                <h4 style={{ margin: '0 0 0.5rem' }}>Menghubungkan ke WhatsApp...</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#718096' }}>
                  Harap tunggu, server sedang menginisialisasi modul WhatsApp.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Embedded styles for spinner animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
