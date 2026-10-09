// src/components/HeliPage/LastUpdated.tsx
import { Typography } from '@mui/material';
import { Refresh } from '@mui/icons-material';

interface LastUpdatedProps {
  lastUpdated: Date | null;
  onRefresh: () => void;
}

// Helper: Date → "Mon, Sep 29, 2026, 04:06:00 PM"
const formatLastUpdated = (date: Date): string => {
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
};

export default function LastUpdated({ lastUpdated, onRefresh }: LastUpdatedProps) {
  if (!lastUpdated) return null;

  return (
    <Typography
      variant="caption"
      sx={{
        color: '#4caf50',
        fontSize: '0.7rem',
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
      }}
    >
      Updated: {formatLastUpdated(lastUpdated)}
      <Refresh
        sx={{
          fontSize: '0.9rem',
          cursor: 'pointer',
          opacity: 0.7,
          '&:hover': { opacity: 1 },
        }}
        onClick={onRefresh}
      />
    </Typography>
  );
}