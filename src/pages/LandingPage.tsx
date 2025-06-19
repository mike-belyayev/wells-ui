import { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, Alert, Link } from '@mui/material';
import { useAuth } from '../auth/AuthContext';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [homeLocation, setHomeLocation] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const { login, register, error, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      await login(email, password);
    } else {
      await register({
        userEmail: email,
        password,
        firstName,
        lastName,
        homeLocation
      });
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      <Paper elevation={3} sx={{ 
        p: 4, 
        width: 400,
        borderRadius: 2,
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)'
      }}>
        <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', color: 'primary.main', fontWeight: 600 }}>
          {isLogin ? 'Login' : 'Register'}
        </Typography>
        
        {error && (
          <Alert severity={error.includes('successful') ? 'success' : 'error'} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Email Address"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {!isLogin && (
            <>
              <TextField
                label="First Name"
                fullWidth
                margin="normal"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              
              <TextField
                label="Last Name"
                fullWidth
                margin="normal"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
              
              <TextField
                label="Home Location"
                fullWidth
                margin="normal"
                value={homeLocation}
                onChange={(e) => setHomeLocation(e.target.value)}
                required
              />
            </>
          )}
          
          <Button 
            type="submit" 
            variant="contained" 
            fullWidth 
            sx={{ mt: 3, py: 1.5 }}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
          </Button>
        </form>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Link 
            component="button" 
            variant="body2"
            onClick={() => {
              setIsLogin(!isLogin);
              // setError('');
            }}
          >
            {isLogin ? 'Need an account? Register' : 'Have an account? Login'}
          </Link>
        </Box>
        
        {isLogin && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link 
              component="button"
              variant="body2"
              onClick={() => {
                if (email) {
                  // Implement forgot password flow
                }
              }}
            >
              Forgot password?
            </Link>
          </Box>
        )}
      </Paper>
    </Box>
  );
}