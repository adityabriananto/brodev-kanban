import { useState } from 'react'
import ProfileSelection from './components/ProfileSelection'
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
        <ProfileSelection onLogin={handleLogin} />
      ) : (
        <KanbanBoard currentUser={currentUser} onLogout={handleLogout} />
      )}
    </>
  )
}

export default App
