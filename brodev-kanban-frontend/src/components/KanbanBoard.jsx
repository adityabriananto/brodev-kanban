import { useState, useEffect } from "react";
import TaskCard from "./TaskCard";
import UserManagementModal from "./UserManagementModal";
import WhatsAppSettingsModal from "./WhatsAppSettingsModal";
import { io } from "socket.io-client";
import toast, { Toaster } from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";

export default function KanbanBoard({ currentUser, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskHours, setNewTaskHours] = useState("1");
  const [newTaskAssignedTo, setNewTaskAssignedTo] = useState("");
  const [newTaskTargetTime, setNewTaskTargetTime] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [myTasksOnly, setMyTasksOnly] = useState(false);

  const fetchTasks = () => {
    fetch(`${API_URL}/tasks`)
      .then(res => res.json())
      .then(data => setTasks(Array.isArray(data) ? data : []))
      .catch(err => console.error("Error fetching tasks", err));
  };

  const fetchUsers = () => {
    fetch(`${API_URL}/users`)
      .then(res => res.json())
      .then(data => setUsers(Array.isArray(data) ? data : []))
      .catch(err => console.error("Error fetching users", err));
  };

  useEffect(() => {
    fetchTasks();
    fetchUsers();

    const socket = io(SOCKET_URL);
    
    socket.on("taskUpdated", () => {
      fetchTasks();
    });

    socket.on("hourChangedNotification", (data) => {
      if (data.changedBy !== currentUser.name) {
        toast(`${data.changedBy} mengubah jam pada tugas [${data.taskTitle}] menjadi ${data.newHours} jam.`, {
          icon: "🔔",
          duration: 5000
        });
        try {
          const audio = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
          audio.volume = 0.5;
          audio.play().catch(e => console.log("Audio play blocked", e));
        } catch (e) {}
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUser.name]);

  const handleUpdateTask = (taskId, updates) => {
    fetch(`${API_URL}/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...updates, changedBy: currentUser.name })
    })
    .catch(err => console.error("Error updating task", err));
  };

  const handleUpdateStatus = (taskId, newStatus) => {
    handleUpdateTask(taskId, { status: newStatus });
  };

  const handleDeleteTask = (taskId) => {
    fetch(`${API_URL}/tasks/${taskId}`, { method: "DELETE" })
      .catch(err => console.error("Error deleting task", err));
  };

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle) return;

    fetch(`${API_URL}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTaskTitle,
        description: newTaskDesc,
        assigned_hours: parseFloat(newTaskHours) || 1,
        assigned_to: newTaskAssignedTo || null,
        target_time: newTaskTargetTime || null
      })
    })
    .then(() => {
      setNewTaskTitle("");
      setNewTaskDesc("");
      setNewTaskHours("1");
      setNewTaskAssignedTo("");
      setNewTaskTargetTime("");
    });
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) return;

    fetch(`${API_URL}/auth/change-password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUser.id, oldPassword, newPassword })
    })
    .then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Password berhasil diubah!");
      setShowPasswordModal(false);
      setOldPassword("");
      setNewPassword("");
    })
    .catch(err => {
      toast.error(err.message || "Gagal mengubah password");
    });
  };

  const artUsers = users.filter(u => u.role === "art");

  const filterTask = (task) => {
    if (!myTasksOnly || currentUser.role === "owner") return true;
    return task.assigned_to === currentUser.id || task.assigned_to === null;
  };

  const todoTasks = tasks.filter(t => t.status === "todo").filter(filterTask);
  const inProgressTasks = tasks.filter(t => t.status === "in_progress").filter(filterTask);
  const doneTasks = tasks.filter(t => t.status === "done").filter(filterTask);

  return (
    <div className="board-layout">
      <Toaster position="top-right" />
      <header className="board-header">
        <h2>Brodev Kanban</h2>
        <div className="user-info">
          <span>Halo, <strong>{currentUser.name}</strong></span>

          {/* Filter Tugasku - hanya untuk ART */}
          {currentUser.role === "art" && (
            <button
              style={{
                background: myTasksOnly ? "rgba(99,102,241,0.8)" : "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.3)",
                color: "white",
                borderRadius: "20px",
                padding: "0.3rem 0.8rem",
                cursor: "pointer",
                fontSize: "0.8rem",
                fontWeight: "600",
                transition: "all 0.2s"
              }}
              onClick={() => setMyTasksOnly(v => !v)}
              title="Filter hanya tugas saya"
            >
              {myTasksOnly ? "âœ“ Tugasku" : "Semua Tugas"}
            </button>
          )}

          {/* Akses Admin - hanya untuk Owner */}
          {currentUser.role === "owner" && (
            <>
              <button
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.3rem", padding: "0 0.3rem" }}
                onClick={() => setShowWhatsAppModal(true)}
                title="Koneksi WhatsApp"
              >
                💬
              </button>
              <button
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.3rem", padding: "0 0.3rem" }}
                onClick={() => setShowUserModal(true)}
                title="Kelola Pengguna"
              >
                👥
              </button>
            </>
          )}

          <button
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", padding: "0 0.3rem" }}
            onClick={() => setShowPasswordModal(true)}
            title="Ubah Password"
          >
            🔒
          </button>
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>
      </header>

      <div className="board-container">
        {/* TO DO */}
        <div className="board-column">
          <div className="column-title">
            To Do <span className="task-count">{todoTasks.length}</span>
          </div>

          {currentUser.role === "owner" && (
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
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <label>Jam:</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={newTaskHours}
                    onChange={e => setNewTaskHours(e.target.value)}
                    style={{ width: "80px" }}
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <label>Target:</label>
                  <input
                    type="time"
                    value={newTaskTargetTime}
                    onChange={e => setNewTaskTargetTime(e.target.value)}
                    style={{ padding: "0.3rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.1)", color: "inherit" }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.85rem", opacity: 0.8 }}>Tugaskan ke:</label>
                <select
                  value={newTaskAssignedTo}
                  onChange={e => setNewTaskAssignedTo(e.target.value)}
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.1)", color: "inherit" }}
                >
                  <option value="">(Tidak Ditugaskan)</option>
                  {artUsers.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn btn-primary">Tambah Tugas</button>
            </form>
          )}

          {todoTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              currentUser={currentUser}
              artUsers={artUsers}
              onUpdateStatus={handleUpdateStatus}
              onDelete={handleDeleteTask}
              onUpdateTask={handleUpdateTask}
            />
          ))}
        </div>

        {/* IN PROGRESS */}
        <div className="board-column">
          <div className="column-title">
            In Progress <span className="task-count">{inProgressTasks.length}</span>
          </div>
          {inProgressTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              currentUser={currentUser}
              artUsers={artUsers}
              onUpdateStatus={handleUpdateStatus}
              onDelete={handleDeleteTask}
              onUpdateTask={handleUpdateTask}
            />
          ))}
        </div>

        {/* DONE */}
        <div className="board-column">
          <div className="column-title">
            Done <span className="task-count">{doneTasks.length}</span>
          </div>
          {doneTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              currentUser={currentUser}
              artUsers={artUsers}
              onUpdateStatus={handleUpdateStatus}
              onDelete={handleDeleteTask}
              onUpdateTask={handleUpdateTask}
            />
          ))}
        </div>
      </div>

      {/* Modal Ubah Password */}
      {showPasswordModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center",
          justifyContent: "center", zIndex: 100, backdropFilter: "blur(5px)"
        }}>
          <div style={{ background: "rgba(255, 255, 255, 0.95)", padding: "2rem", borderRadius: "12px", width: "90%", maxWidth: "350px", boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}>
            <h3 style={{ marginTop: 0, textAlign: "center" }}>🔒 Ubah Password</h3>
            <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <input
                type="password"
                placeholder="Password Lama"
                value={oldPassword}
                onChange={e => setOldPassword(e.target.value)}
                style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid #ddd" }}
              />
              <input
                type="password"
                placeholder="Password Baru"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid #ddd" }}
              />
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Simpan</button>
                <button type="button" className="btn" style={{ flex: 1 }} onClick={() => setShowPasswordModal(false)}>Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Kelola Pengguna */}
      {showUserModal && (
        <UserManagementModal
          currentUser={currentUser}
          users={users}
          onClose={() => setShowUserModal(false)}
          onUsersChanged={fetchUsers}
        />
      )}

      {/* Modal Koneksi WhatsApp */}
      {showWhatsAppModal && (
        <WhatsAppSettingsModal onClose={() => setShowWhatsAppModal(false)} />
      )}
    </div>
  );
}
