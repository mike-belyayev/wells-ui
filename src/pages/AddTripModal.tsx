import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Button,
  Autocomplete,
  Alert
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import type { Passenger } from './HeliPage';

interface AddTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  passengers: Passenger[];
  selectedDate: Date;
  tripType: 'incoming' | 'outgoing';
  currentLocation: string;
  onSubmit: (tripData: {
    passengerId: string;
    fromOrigin: string;
    toDestination: string;
    tripDate: string;
    confirmed: boolean;
  }) => void;
}

const locations = ['NTM', 'Ogle', 'NSC', 'NDT', 'NBD', 'STC'];

// Helper function to normalize dates (fix timezone issues)
const normalizeDate = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

export default function AddTripModal({
  isOpen,
  onClose,
  passengers,
  selectedDate,
  tripType,
  currentLocation,
  onSubmit
}: AddTripModalProps) {
  const [passengerSearch, setPassengerSearch] = useState('');
  const [selectedPassenger, setSelectedPassenger] = useState<Passenger | null>(null);
  const [fromOrigin, setFromOrigin] = useState(tripType === 'outgoing' ? currentLocation : 'NTM');
  const [toDestination, setToDestination] = useState(tripType === 'incoming' ? currentLocation : 'NSC');
  const [tripDate, setTripDate] = useState<Date | null>(normalizeDate(selectedDate));
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    setTripDate(normalizeDate(selectedDate));
    setFromOrigin(tripType === 'outgoing' ? currentLocation : 'NTM');
    setToDestination(tripType === 'incoming' ? currentLocation : 'NSC');
    setConfirmed(false);
  }, [selectedDate, tripType, currentLocation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPassenger || !tripDate || fromOrigin === toDestination) return;

    onSubmit({
      passengerId: selectedPassenger._id,
      fromOrigin,
      toDestination,
      tripDate: format(tripDate, 'yyyy-MM-dd'),
      confirmed
    });
  };

  if (!isOpen) return null;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Trip</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <FormControl fullWidth margin="normal">
              <Autocomplete
                options={passengers}
                getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
                value={selectedPassenger}
                onChange={(_, newValue) => {
                  setSelectedPassenger(newValue);
                  setPassengerSearch(newValue ? `${newValue.firstName} ${newValue.lastName}` : '');
                }}
                inputValue={passengerSearch}
                onInputChange={(_, newInputValue) => {
                  setPassengerSearch(newInputValue);
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Passenger" required />
                )}
              />
            </FormControl>

            <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
              <FormControl fullWidth margin="normal">
                <DatePicker
                  label="Trip Date"
                  value={tripDate}
                  onChange={(newValue) => setTripDate(newValue ? normalizeDate(newValue) : null)}
                  slotProps={{
                    textField: {
                      required: true
                    }
                  }}
                />
              </FormControl>
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                  />
                }
                label="Confirmed"
                style={{ marginTop: '16px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
              <FormControl fullWidth margin="normal">
                <InputLabel>From</InputLabel>
                <Select
                  value={fromOrigin}
                  onChange={(e) => setFromOrigin(e.target.value)}
                  label="From"
                >
                  {locations.map(loc => (
                    <MenuItem key={loc} value={loc}>{loc}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth margin="normal">
                <InputLabel>To</InputLabel>
                <Select
                  value={toDestination}
                  onChange={(e) => setToDestination(e.target.value)}
                  label="To"
                >
                  {locations.map(loc => (
                    <MenuItem key={loc} value={loc}>{loc}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            {fromOrigin === toDestination && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Origin and destination cannot be the same
              </Alert>
            )}

            <DialogActions sx={{ mt: 2 }}>
              <Button onClick={onClose} variant="outlined">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!selectedPassenger || fromOrigin === toDestination || !tripDate}
                variant="contained"
              >
                Add Trip
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </LocalizationProvider>
  );
}