import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Paper, Alert } from '@mui/material';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { verifyEmail, user, isLoading } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsVerifying(true);
    
    try {
      const userExists = await verifyEmail(email);
      
      if (userExists) {
        // User found in database - proceed to appropriate page
        navigate(user?.isAdmin ? '/admin' : '/heli');
      } else {
        // New user flow (optional)
        navigate('/register'); // Or wherever you want new users to go
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsVerifying(false);
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
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
            textAlign: 'center',
            color: 'primary.main',
            fontWeight: 600
          }}
        >
          Enter Your Email
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
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
            InputProps={{
              sx: { borderRadius: 1 }
            }}
          />
          <Button 
            type="submit" 
            variant="contained" 
            fullWidth 
            sx={{ 
              mt: 3,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              borderRadius: 1
            }}
            disabled={isLoading || isVerifying}
          >
            {isLoading || isVerifying ? 'Verifying...' : 'Continue'}
          </Button>
        </form>

        <Typography variant="body2" sx={{ mt: 3, textAlign: 'center', color: 'text.secondary' }}>
          We'll check if you have an existing account.
        </Typography>
      </Paper>
    </Box>
  );
}