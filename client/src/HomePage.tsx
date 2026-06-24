import { Link } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';

// Placeholder landing screen behind auth. The next migration slices (reports,
// decision forms) mount here.
export function HomePage() {
  const { user, logout } = useAuth();
  return (
    <main style={{ fontFamily: 'system-ui', margin: '2rem' }}>
      <h1>SimProX</h1>
      <p>Signed in as <strong>{user?.username}</strong>{user?.roleName ? ` (${user.roleName})` : ''}.</p>
      <p style={{ color: '#666' }}>
        React migration skeleton. Charts and decision forms will be added as subsequent slices.
      </p>
      <ul>
        <li><Link to="/reports">Reports</Link></li>
      </ul>
      <button onClick={() => void logout()}>Sign out</button>
    </main>
  );
}
