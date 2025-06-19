// src/pages/AdminPage.tsx
import { useAuth } from '../auth/AuthContext';

const AdminPage = () => {
  const { user, logout } = useAuth();

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome, Admin {user?.firstName}!</p>
      <button onClick={logout}>Logout</button>
      {/* Your admin page content */}
    </div>
  );
};

export default AdminPage;  // Default export