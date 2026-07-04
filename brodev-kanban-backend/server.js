require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const pool = require('./db');
const wa = require('./wa');

const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize WhatsApp client
wa.initWaClient();

// ==========================================
// WHATSAPP API
// ==========================================

// Get connection status and QR code base64 (if any)
app.get('/api/auth/wa-status', (req, res) => {
  res.json(wa.getWaStatus());
});

// Logout/disconnect WhatsApp
app.post('/api/auth/wa-logout', async (req, res) => {
  try {
    await wa.logoutWa();
    res.json({ success: true, message: 'WhatsApp logged out successfully' });
  } catch (err) {
    console.error('Error logging out WhatsApp:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==========================================
// AUTH API
// ==========================================

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Email atau password salah' });
    }
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (match) {
      delete user.password_hash;
      res.json(user);
    } else {
      res.status(401).json({ error: 'Email atau password salah' });
    }
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Change Password (self)
app.put('/api/auth/change-password', async (req, res) => {
  const { userId, oldPassword, newPassword } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = result.rows[0];
    const match = await bcrypt.compare(oldPassword, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Password lama tidak sesuai' });
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashed, userId]);
    res.json({ success: true, message: 'Password berhasil diubah' });
  } catch (err) {
    console.error('Error changing password:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==========================================
// USERS API
// ==========================================

// Get all users (no password_hash)
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, role, email, phone_number FROM users ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new user (Owner only — validated client-side)
app.post('/api/users', async (req, res) => {
  const { name, role, email, password, phone_number } = req.body;
  if (!name || !role || !email || !password) {
    return res.status(400).json({ error: 'Semua field wajib diisi' });
  }
  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email sudah terdaftar' });
    }
    const password_hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, role, email, password_hash, phone_number) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, role, email, phone_number',
      [name, role, email, password_hash, phone_number || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a user (Owner only — validated client-side)
app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id, name', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User berhasil dihapus', deletedUser: result.rows[0] });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset password for a user (Owner only)
app.put('/api/users/:id/reset-password', async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;
  if (!newPassword) {
    return res.status(400).json({ error: 'Password baru wajib diisi' });
  }
  try {
    const hashed = await bcrypt.hash(newPassword, 10);
    const result = await pool.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING id, name',
      [hashed, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ success: true, message: `Password ${result.rows[0].name} berhasil direset` });
  } catch (err) {
    console.error('Error resetting password:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==========================================
// TASKS API & WHATSAPP TRIGGER HELPERS
// ==========================================

// Helper to notify all owners
async function notifyOwners(message) {
  try {
    const result = await pool.query("SELECT phone_number FROM users WHERE role = 'owner' AND phone_number IS NOT NULL");
    for (const row of result.rows) {
      await wa.sendWaMessage(row.phone_number, message);
    }
  } catch (err) {
    console.error('Error notifying owners:', err);
  }
}

// Get all tasks (with assigned user name via JOIN)
app.get('/api/tasks', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, u.name AS assigned_to_name
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      ORDER BY t.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new task
app.post('/api/tasks', async (req, res) => {
  const { title, description, assigned_hours, assigned_to } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO tasks (title, description, assigned_hours, assigned_to) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, description, assigned_hours || 0, assigned_to || null]
    );
    io.emit('taskUpdated');
    
    // Trigger WA Notification to the assigned ART
    if (assigned_to) {
      const userRes = await pool.query('SELECT name, phone_number FROM users WHERE id = $1', [assigned_to]);
      if (userRes.rows.length > 0 && userRes.rows[0].phone_number) {
        const msg = `🏠 *Tugas Baru untuk ${userRes.rows[0].name}*\n\n📌 *Tugas:* ${title}\n📄 *Detail:* ${description || '-'}\n🕒 *Alokasi:* ${assigned_hours || 1} jam\n\nSilakan buka aplikasi Kanban Brodev untuk mulai mengerjakan!`;
        await wa.sendWaMessage(userRes.rows[0].phone_number, msg);
      }
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a task
app.put('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, status, assigned_hours, hour_change_reason, changedBy, assigned_to } = req.body;
  try {
    const prevTaskResult = await pool.query('SELECT assigned_hours, title, status, assigned_to FROM tasks WHERE id = $1', [id]);
    if (prevTaskResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    const prevTask = prevTaskResult.rows[0];
    const prevHours = prevTask.assigned_hours;
    const taskTitle = prevTask.title;

    const fields = [];
    const values = [];
    let idx = 1;

    if (title !== undefined) { fields.push(`title = $${idx++}`); values.push(title); }
    if (description !== undefined) { fields.push(`description = $${idx++}`); values.push(description); }
    if (status !== undefined) { fields.push(`status = $${idx++}`); values.push(status); }
    if (assigned_hours !== undefined) { fields.push(`assigned_hours = $${idx++}`); values.push(assigned_hours); }
    if (hour_change_reason !== undefined) { fields.push(`hour_change_reason = $${idx++}`); values.push(hour_change_reason); }
    if (assigned_to !== undefined) { fields.push(`assigned_to = $${idx++}`); values.push(assigned_to || null); }
    
    fields.push(`updated_at = CURRENT_TIMESTAMP`);

    if (fields.length === 1) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    const query = `UPDATE tasks SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // 1. In-App Notification (Toast event)
    if (assigned_hours !== undefined && parseFloat(assigned_hours) !== parseFloat(prevHours)) {
      io.emit('hourChangedNotification', {
        taskId: id,
        taskTitle: title || taskTitle,
        changedBy: changedBy || 'Seseorang',
        newHours: parseFloat(assigned_hours)
      });
    }

    // 2. WhatsApp Notification: Status Change (todo -> in_progress -> done)
    if (status !== undefined && status !== prevTask.status) {
      let statusText = status === 'in_progress' ? 'mulai mengerjakan' : 'menyelesaikan';
      if (status === 'todo') statusText = 'mengembalikan ke To Do';
      
      const msg = `🔔 *Update Status Tugas*\n\n📌 *Tugas:* ${title || taskTitle}\n👤 *Oleh:* ${changedBy || 'Seseorang'}\n⚙️ *Status:* Telah *${statusText}* tugas ini.`;
      await notifyOwners(msg);
    }

    // 3. WhatsApp Notification: Hour Change by ART (with reason)
    if (assigned_hours !== undefined && parseFloat(assigned_hours) !== parseFloat(prevHours)) {
      let msg = `🕒 *Perubahan Jam Tugas*\n\n📌 *Tugas:* ${title || taskTitle}\n👤 *Oleh:* ${changedBy || 'Seseorang'}\n⏱️ *Alokasi Baru:* ${assigned_hours} jam (sebelumnya ${prevHours} jam)`;
      if (hour_change_reason) {
        msg += `\n💬 *Alasan:* ${hour_change_reason}`;
      }
      await notifyOwners(msg);
    }

    // 4. WhatsApp Notification: Re-assignment
    if (assigned_to !== undefined && assigned_to !== prevTask.assigned_to) {
      if (assigned_to) {
        const userRes = await pool.query('SELECT name, phone_number FROM users WHERE id = $1', [assigned_to]);
        if (userRes.rows.length > 0 && userRes.rows[0].phone_number) {
          const msg = `🏠 *Penugasan Tugas Baru*\n\n📌 *Tugas:* ${title || taskTitle}\n👤 *Ditugaskan ke:* ${userRes.rows[0].name}\n🕒 *Alokasi:* ${assigned_hours !== undefined ? assigned_hours : prevHours} jam\n\nSilakan cek aplikasi Kanban Brodev.`;
          await wa.sendWaMessage(userRes.rows[0].phone_number, msg);
        }
      }
    }

    io.emit('taskUpdated');
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a task
app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    io.emit('taskUpdated');
    res.json({ message: 'Task deleted successfully', deletedTask: result.rows[0] });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start Server
server.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});
