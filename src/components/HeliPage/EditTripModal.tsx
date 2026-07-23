import { useState, useEffect, useRef } from 'react';
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
  CircularProgress,
  Alert,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Paper,
  IconButton
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Close } from '@mui/icons-material';
import type { Passenger, Trip } from '../../types';
import { API_ENDPOINTS } from '../../config/api';

// Helper function to normalize dates (fix timezone issues)
const normalizeDate = (dateString: string) => {
  // Parse the date in local time but ignore timezone offset
  const [year, month, day] = dateString.split('T')[0].split('-').map(Number);
  return new Date(year, month - 1, day);
};

interface EditTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  passengers: Passenger[];
  trip: Trip | null;
  currentLocation: string;
  onUpdate: (updatedTrip: Trip) => void;
  onDelete: (tripId: string) => void;
}

const locations = ['Ogle', 'NTM', 'NSC', 'NDT', 'NBD', 'STC'];

export default function EditTripModal({
  isOpen,
  onClose,
  passengers,
  trip,
  onUpdate,
  onDelete
}: EditTripModalProps) {
  const [passengerSearch, setPassengerSearch] = useState('');
  const [selectedPassenger, setSelectedPassenger] = useState<Passenger | null>(null);
  const [fromOrigin, setFromOrigin] = useState('NTM');
  const [toDestination, setToDestination] = useState('NSC');
  const [tripDate, setTripDate] = useState<Date | null>(new Date());
  const [confirmed, setConfirmed] = useState(false);
  const [numberOfPassengers, setNumberOfPassengers] = useState<number | ''>('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (trip) {
      const passenger = passengers.find(p => p._id === trip.passengerId);
      setPassengerSearch(
        passenger ? `${passenger.firstName} ${passenger.lastName} - ${passenger.jobRole}` : ''
      );
      setSelectedPassenger(passenger || null);
      setFromOrigin(trip.fromOrigin);
      setToDestination(trip.toDestination);
      // Use the normalizeDate helper to avoid timezone issues
      setTripDate(trip.tripDate ? normalizeDate(trip.tripDate) : new Date());
      setConfirmed(trip.confirmed || false);
      // Set numberOfPassengers from trip data, handle null/undefined
      setNumberOfPassengers(trip.numberOfPassengers ?? '');
    }
    
    return () => {
      setPassengerSearch('');
      setSelectedPassenger(null);
      setFromOrigin('NTM');
      setToDestination('NSC');
      setTripDate(new Date());
      setConfirmed(false);
      setNumberOfPassengers('');
      setError(null);
      setIsUpdating(false);
      setIsDeleting(false);
      setShowDropdown(false);
    };
  }, [trip, passengers]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isUpdating || !trip || !tripDate) return;
    setIsUpdating(true);
    setError(null);
    
    if (!selectedPassenger) {
      setError('Please select a passenger');
      setIsUpdating(false);
      return;
    }
    if (fromOrigin === toDestination) {
      setError('Origin and destination cannot be the same');
      setIsUpdating(false);
      return;
    }

    // Format the date as YYYY-MM-DD without timezone conversion
    const formattedDate = format(tripDate, 'yyyy-MM-dd');

    const updatedTrip = {
      ...trip,
      passengerId: selectedPassenger._id,
      fromOrigin,
      toDestination,
      tripDate: formattedDate,
      confirmed,
      // Only include numberOfPassengers if it's a valid number, otherwise set to null
      numberOfPassengers: numberOfPassengers !== '' ? Number(numberOfPassengers) : null
    };

    try {
      // Use environment-based URL
      const response = await fetch(API_ENDPOINTS.TRIP_BY_ID(trip._id), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTrip),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update trip');
      }

      const data = await response.json();
      onUpdate(data);
      onClose();
    } catch (error) {
      console.error('Error updating trip:', error);
      setError(error instanceof Error ? error.message : 'Failed to update trip. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting || !trip) return;
    
    setIsDeleting(true);
    setError(null);
    
    try {
      // Use environment-based URL
      const response = await fetch(API_ENDPOINTS.TRIP_BY_ID(trip._id), {
        method: 'DELETE',
      });

      if (!response.ok && response.status !== 404) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete trip');
      }

      onDelete(trip._id);
      onClose();
    } catch (error) {
      console.error('Error deleting trip:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete trip. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle number input changes
  const handlePassengerCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string or positive integers
    if (value === '' || (/^\d+$/.test(value) && parseInt(value) > 0)) {
      setNumberOfPassengers(value === '' ? '' : parseInt(value));
    }
  };

  // Custom search logic - same as AddTripModal
  const filteredPassengers = passengers.filter(passenger => {
    const searchLower = passengerSearch.toLowerCase().trim();
    
    if (!searchLower) return false;
    
    const firstName = passenger.firstName.toLowerCase();
    const lastName = passenger.lastName.toLowerCase();
    const jobRole = passenger.jobRole.toLowerCase();
    const fullName = `${firstName} ${lastName}`;
    
    // Split search into words to handle multiple terms
    const searchWords = searchLower.split(/\s+/).filter(word => word.length > 0);
    
    // If only one search word, check individual fields
    if (searchWords.length === 1) {
      const word = searchWords[0];
      return firstName.includes(word) || 
             lastName.includes(word) || 
             jobRole.includes(word) ||
             fullName.includes(word);
    }
    
    // If multiple search words, require ALL words to match somewhere
    return searchWords.every(word => 
      firstName.includes(word) || 
      lastName.includes(word) || 
      jobRole.includes(word) ||
      fullName.includes(word)
    );
  });

  const handlePassengerSelect = (passenger: Passenger) => {
    setSelectedPassenger(passenger);
    setPassengerSearch(`${passenger.firstName} ${passenger.lastName} - ${passenger.jobRole}`);
    setShowDropdown(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassengerSearch(value);
    setSelectedPassenger(null);
    setShowDropdown(value.length > 0);
  };

  const handleSearchFocus = () => {
    if (passengerSearch.length > 0) {
      setShowDropdown(true);
    }
  };

  if (!isOpen || !trip) return null;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Edit Trip
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleUpdate}>
            {/* Passenger Selection with custom dropdown - same as AddTripModal */}
            <FormControl fullWidth margin="normal">
              <Box sx={{ flex: 1, position: 'relative' }} ref={searchRef}>
                <TextField
                  label="Search Passenger"
                  value={passengerSearch}
                  onChange={handleSearchChange}
                  onFocus={handleSearchFocus}
                  required
                  helperText="Search by first name, last name, or job role"
                  fullWidth
                  placeholder="Type to search passengers..."
                />
                
                {/* Custom Dropdown - same as AddTripModal */}
                {showDropdown && (
                  <Paper 
                    sx={{ 
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      zIndex: 1000,
                      maxHeight: 200,
                      overflow: 'auto',
                      mt: 0.5,
                      boxShadow: 3
                    }}
                  >
                    <List dense>
                      {filteredPassengers.length > 0 ? (
                        filteredPassengers.map((passenger) => (
                          <ListItem
                            key={passenger._id}
                            onClick={() => handlePassengerSelect(passenger)}
                            sx={{
                              cursor: 'pointer',
                              '&:hover': {
                                backgroundColor: 'action.hover'
                              }
                            }}
                          >
                            <ListItemText
                              primary={`${passenger.firstName} ${passenger.lastName}`}
                              secondary={passenger.jobRole}
                            />
                          </ListItem>
                        ))
                      ) : (
                        <ListItem>
                          <ListItemText 
                            primary="No passengers found"
                            secondary="Try a different search term"
                          />
                        </ListItem>
                      )}
                    </List>
                  </Paper>
                )}
              </Box>
            </FormControl>

            <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
              <FormControl fullWidth margin="normal">
                <DatePicker
                  label="Trip Date"
                  value={tripDate}
                  onChange={(newValue) => setTripDate(newValue)}
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

            {/* Add Number of Passengers Field */}
            <FormControl fullWidth margin="normal">
              <TextField
                label="Number of Passengers (Optional)"
                type="number"
                value={numberOfPassengers}
                onChange={handlePassengerCountChange}
                inputProps={{ 
                  min: 1,
                  step: 1
                }}
                helperText="Leave empty if not applicable"
                placeholder="Enter number of passengers"
              />
            </FormControl>

            {fromOrigin === toDestination && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Origin and destination cannot be the same
              </Alert>
            )}

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            <DialogActions sx={{ mt: 2 }}>
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                color="error"
                variant="outlined"
              >
                {isDeleting ? <CircularProgress size={24} /> : 'Delete Trip'}
              </Button>
              <Button
                type="submit"
                disabled={!selectedPassenger || fromOrigin === toDestination || isUpdating || !tripDate}
                variant="contained"
              >
                {isUpdating ? <CircularProgress size={24} /> : 'Update Trip'}
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </LocalizationProvider>
  );
}