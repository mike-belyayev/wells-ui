import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import LandingPage from './pages/LandingPage';
import HeliCalendar from './pages/HeliCalendar';
import AdminDashboard from './pages/AdminDashboard';
import {AuthProvider} from './context/AuthContext';
import { useAuth } from './context/AuthContext';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/heli" element={<ProtectedRoute><HeliCalendar /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

// Auth protection component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user } = useAuth(); // You'll need to implement this context
  const isAdmin = user?.role === 'admin';
  
  if (!user) return <Navigate to="/" />;
  if (adminOnly && !isAdmin) return <Navigate to="/heli" />;
  return children;
};

export default App;