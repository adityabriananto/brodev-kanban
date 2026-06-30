require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ==========================================
// USERS API
// ==========================================

// Get all users for Profile Selection
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new user
app.post('/api/users', async (req, res) => {
  const { name, role } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO users (name, role) VALUES ($1, $2) RETURNING *',
      [name, role]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==========================================
// TASKS API
// ==========================================

// Get all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new task
app.post('/api/tasks', async (req, res) => {
  const { title, description, assigned_hours } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO tasks (title, description, assigned_hours) VALUES ($1, $2, $3) RETURNING *',
      [title, description, assigned_hours || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a task (especially for status changes)
app.put('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, status, assigned_hours, hour_change_reason } = req.body;
  try {
    // Dynamic update query depending on what's provided
    const fields = [];
    const values = [];
    let idx = 1;

    if (title !== undefined) { fields.push(`title = $${idx++}`); values.push(title); }
    if (description !== undefined) { fields.push(`description = $${idx++}`); values.push(description); }
    if (status !== undefined) { fields.push(`status = $${idx++}`); values.push(status); }
    if (assigned_hours !== undefined) { fields.push(`assigned_hours = $${idx++}`); values.push(assigned_hours); }
    if (hour_change_reason !== undefined) { fields.push(`hour_change_reason = $${idx++}`); values.push(hour_change_reason); }
    
    fields.push(`updated_at = CURRENT_TIMESTAMP`);

    if (fields.length === 1) { // only updated_at
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    const query = `UPDATE tasks SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
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
    res.json({ message: 'Task deleted successfully', deletedTask: result.rows[0] });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start Server
app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});
