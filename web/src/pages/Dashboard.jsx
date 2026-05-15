import { useAuth } from '../context/AuthContext';
import { logout } from '../services/authService';
import { useNavigate } from 'react-router-dom';

// Phase 5 will replace this with the full dashboard.
export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <main style={{ fontFamily: 'sans-serif', textAlign: 'center', padding: '4rem' }}>
      <h1>Dashboard</h1>
      <p>Logged in as: {user?.email}</p>
      <button onClick={handleLogout}>Log out</button>
    </main>
  );
}
