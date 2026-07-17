import { useState } from 'react'
import AuthForm from './components/AuthForm'
import KanbanBoard from './components/KanbanBoard'

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('kanban_user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem('kanban_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('kanban_user');
  };

  return (
    <>
      {!currentUser ? (
        <AuthForm onLogin={handleLogin} />
      ) : (
        <KanbanBoard currentUser={currentUser} onLogout={handleLogout} />
      )}
      <footer style={{ textAlign: 'center', opacity: 0.6, marginTop: '20px', padding: '10px', fontSize: '0.9rem' }}>
        © 2026 Aditya Briananto & Brodev Gemini AI. All rights reserved.
      </footer>
    </>
  )
}

export default App
