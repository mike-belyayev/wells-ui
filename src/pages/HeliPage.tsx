import { useAuth } from '../auth/AuthContext';

const HeliPage = () => {
  const { user, logout } = useAuth();

  return (
    <div>
      <h1>Welcome to Heli Dashboard</h1>
      <p>Hello, {user?.firstName}!</p>
      <button onClick={logout}>Logout</button>
      {/* Your heli page content */}
    </div>
  );
};

export default HeliPage;  // Changed to default export