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
        React migration skeleton. Reports, charts and decision forms will be added as subsequent slices.
      </p>
      <button onClick={() => void logout()}>Sign out</button>
    </main>
  );
}
