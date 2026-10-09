// src/components/HeliPage/RefreshControls.tsx
import { Button, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Refresh } from '@mui/icons-material';

interface RefreshControlsProps {
  timeLeft: number;
  onRefresh: () => void;
  loading?: boolean;
}

// Orange pill badge for the countdown
const TimerBadge = styled(Box)(() => ({
  backgroundColor: '#f57c00',
  color: '#fff',
  padding: '4px 10px',
  borderRadius: '4px',
  fontSize: '0.75rem',
  fontWeight: 'bold',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '75px',
  letterSpacing: 0.5,
}));

// Helper: seconds → "14:59"
const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

export default function RefreshControls({ timeLeft, onRefresh, loading = false }: RefreshControlsProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Button
        variant="contained"
        size="small"
        startIcon={<Refresh />}
        onClick={onRefresh}
        disabled={loading}
        sx={{
          backgroundColor: '#1976d2',
          '&:hover': { backgroundColor: '#115293' },
          textTransform: 'none',
          color: 'white',
        }}
      >
        Refresh Data
      </Button>

      <TimerBadge>
        Auto: {formatTime(timeLeft)}
      </TimerBadge>
    </Box>
  );
}