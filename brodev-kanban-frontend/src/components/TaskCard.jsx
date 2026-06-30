import { useState } from 'react';

export default function TaskCard({ task, currentUser, artUsers = [], onUpdateStatus, onDelete, onUpdateTask }) {
  const [isEditingHours, setIsEditingHours] = useState(false);
  const [editHoursValue, setEditHoursValue] = useState(task.assigned_hours);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [reasonValue, setReasonValue] = useState('');

  const handleSaveHoursClick = () => {
    if (currentUser.role === 'art') {
      setShowReasonModal(true);
    } else {
      onUpdateTask(task.id, { assigned_hours: parseFloat(editHoursValue) });
      setIsEditingHours(false);
    }
  };

  const handleReasonSubmit = () => {
    if (!reasonValue.trim()) return;
    onUpdateTask(task.id, {
      assigned_hours: parseFloat(editHoursValue),
      hour_change_reason: reasonValue
    });
    setShowReasonModal(false);
    setIsEditingHours(false);
    setReasonValue('');
  };

  const handleAssignChange = (e) => {
    onUpdateTask(task.id, { assigned_to: e.target.value || null });
  };

  return (
    <div className={`task-card ${task.status}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="task-title">{task.title}</div>
        {currentUser.role === 'owner' && (
          <button
            style={{ background: 'none', border: 'none', color: '#e53e3e', cursor: 'pointer', fontSize: '1.2rem', padding: '0' }}
            onClick={() => onDelete(task.id)}
            title="Hapus Tugas"
          >
            🗑️
          </button>
        )}
      </div>

      {task.description && <div className="task-desc">{task.description}</div>}

      {/* Badge Assignee */}
      <div style={{ marginTop: '0.5rem' }}>
        {currentUser.role === 'owner' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.78rem', opacity: 0.7 }}>📌</span>
            <select
              value={task.assigned_to || ''}
              onChange={handleAssignChange}
              style={{
                fontSize: '0.78rem', padding: '0.2rem 0.5rem', borderRadius: '6px',
                border: '1px solid rgba(0,0,0,0.12)', background: 'rgba(255,255,255,0.6)',
                cursor: 'pointer', maxWidth: '160px'
              }}
            >
              <option value="">(Tidak Ditugaskan)</option>
              {artUsers.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
        ) : (
          task.assigned_to_name && (
            <span style={{
              display: 'inline-block', fontSize: '0.75rem', fontWeight: '700',
              padding: '0.2rem 0.6rem', borderRadius: '20px',
              background: 'rgba(99,102,241,0.12)', color: '#4c51bf'
            }}>
              📌 {task.assigned_to_name}
            </span>
          )
        )}
      </div>

      <div className="task-meta">
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          🕒
          {!isEditingHours ? (
            <span
              style={{ cursor: 'pointer', textDecoration: 'underline' }}
              onClick={() => setIsEditingHours(true)}
              title="Klik untuk ubah jam"
            >
              {task.assigned_hours} jam
            </span>
          ) : (
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <input
                type="number"
                step="0.5"
                min="0"
                value={editHoursValue}
                onChange={e => setEditHoursValue(e.target.value)}
                style={{ width: '60px', padding: '0.2rem' }}
              />
              <button onClick={handleSaveHoursClick} style={{ padding: '0.2rem 0.5rem', cursor: 'pointer' }}>✓</button>
              <button onClick={() => setIsEditingHours(false)} style={{ padding: '0.2rem 0.5rem', cursor: 'pointer' }}>✗</button>
            </div>
          )}
        </span>
        <span>{new Date(task.created_at).toLocaleDateString('id-ID')}</span>
      </div>

      {task.hour_change_reason && (
        <div style={{ fontSize: '0.8rem', color: '#dd6b20', marginTop: '0.5rem', background: '#feebc8', padding: '0.5rem', borderRadius: '4px' }}>
          <strong>Alasan ubah jam:</strong> {task.hour_change_reason}
        </div>
      )}

      <div className="task-actions">
        {task.status === 'todo' && (
          <button className="btn btn-start" onClick={() => onUpdateStatus(task.id, 'in_progress')}>
            Mulai Kerjakan
          </button>
        )}
        {task.status === 'in_progress' && (
          <button className="btn btn-done" onClick={() => onUpdateStatus(task.id, 'done')}>
            ✔️ Selesai
          </button>
        )}
      </div>

      {/* Reason Modal */}
      {showReasonModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 100
        }}>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', width: '90%', maxWidth: '400px' }}>
            <h3 style={{ marginTop: 0 }}>Alasan Ubah Jam</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
              Anda (ART) diwajibkan mengisi alasan kenapa merubah jam tugas ini.
            </p>
            <textarea
              rows="3"
              style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem', boxSizing: 'border-box' }}
              placeholder="Contoh: Pekerjaan lebih sulit dari biasanya..."
              value={reasonValue}
              onChange={e => setReasonValue(e.target.value)}
            />
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setShowReasonModal(false)}>Batal</button>
              <button
                className="btn btn-primary"
                disabled={!reasonValue.trim()}
                onClick={handleReasonSubmit}
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
