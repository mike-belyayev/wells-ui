// pages/ForgotPassword.tsx
import { useState, type FormEvent } from 'react';
import { Box, TextField, Button, Typography, Paper, Alert } from '@mui/material';
import { useAuth } from '../context/AuthContext';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');
  const { requestPasswordReset } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await requestPasswordReset(email);
      setIsSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset failed');
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
          Reset Password
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {isSent ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            Password reset email sent. Please check your inbox.
          </Alert>
        ) : (
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
            >
              Send Reset Link
            </Button>
          </form>
        )}
      </Paper>
    </Box>
  );
}