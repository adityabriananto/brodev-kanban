import { useState, useEffect } from 'react';
import TaskCard from './TaskCard';

const API_URL = 'http://localhost:3000/api';

export default function KanbanBoard({ currentUser, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskHours, setNewTaskHours] = useState('1');

  const fetchTasks = () => {
    fetch(`${API_URL}/tasks`)
      .then(res => res.json())
      .then(data => setTasks(data))
      .catch(err => console.error('Error fetching tasks', err));
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleUpdateTask = (taskId, updates) => {
    fetch(`${API_URL}/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })
    .then(res => res.json())
    .then(updatedTask => {
      setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
    })
    .catch(err => console.error('Error updating task', err));
  };

  const handleUpdateStatus = (taskId, newStatus) => {
    handleUpdateTask(taskId, { status: newStatus });
  };

  const handleDeleteTask = (taskId) => {
    fetch(`${API_URL}/tasks/${taskId}`, { method: 'DELETE' })
      .then(() => {
        setTasks(prev => prev.filter(t => t.id !== taskId));
      })
      .catch(err => console.error('Error deleting task', err));
  };

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle) return;

    fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTaskTitle, description: newTaskDesc, assigned_hours: parseFloat(newTaskHours) || 1 })
    })
    .then(res => res.json())
    .then(newTask => {
      setTasks([newTask, ...tasks]);
      setNewTaskTitle('');
      setNewTaskDesc('');
      setNewTaskHours('1');
    });
  };

  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const doneTasks = tasks.filter(t => t.status === 'done');

  return (
    <div className="board-layout">
      <header className="board-header">
        <h2>Brodev Kanban</h2>
        <div className="user-info">
          <span>Halo, <strong>{currentUser.name}</strong></span>
          <button className="logout-btn" onClick={onLogout}>Ganti Profil</button>
        </div>
      </header>

      <div className="board-container">
        <div className="board-column">
          <div className="column-title">
            To Do <span className="task-count">{todoTasks.length}</span>
          </div>
          
          {currentUser.role === 'owner' && (
            <form className="new-task-form" onSubmit={handleCreateTask}>
              <input 
                type="text" 
                placeholder="Tugas baru..." 
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
              />
              <textarea 
                placeholder="Detail tugas (opsional)" 
                rows="2"
                value={newTaskDesc}
                onChange={e => setNewTaskDesc(e.target.value)}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label>Jam:</label>
                <input 
                  type="number" 
                  step="0.5" 
                  min="0"
                  value={newTaskHours}
                  onChange={e => setNewTaskHours(e.target.value)}
                  style={{ width: '80px' }}
                />
              </div>
              <button type="submit" className="btn btn-primary">Tambah Tugas</button>
            </form>
          )}

          {todoTasks.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              currentUser={currentUser}
              onUpdateStatus={handleUpdateStatus} 
              onDelete={handleDeleteTask}
              onUpdateTask={handleUpdateTask}
            />
          ))}
        </div>

        <div className="board-column">
          <div className="column-title">
            In Progress <span className="task-count">{inProgressTasks.length}</span>
          </div>
          {inProgressTasks.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              currentUser={currentUser}
              onUpdateStatus={handleUpdateStatus} 
              onDelete={handleDeleteTask}
            />
          ))}
        </div>

        <div className="board-column">
          <div className="column-title">
            Done <span className="task-count">{doneTasks.length}</span>
          </div>
          {doneTasks.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              currentUser={currentUser}
              onUpdateStatus={handleUpdateStatus} 
              onDelete={handleDeleteTask}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
