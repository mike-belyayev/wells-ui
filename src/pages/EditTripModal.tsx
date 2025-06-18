import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import type { Passenger, Trip } from './HeliDashboard';
import './AddTripModal.css';

interface EditTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  passengers: Passenger[];
  trip: Trip | null;
  currentLocation: string;
  onUpdate: (updatedTrip: Trip) => void;
  onDelete: (tripId: string) => void;
}

const locations = ['NTM', 'Ogle', 'NSC', 'NDT', 'NBD', 'STC'];

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
  const [tripDate, setTripDate] = useState(new Date());
  const [confirmed, setConfirmed] = useState(false);
  const [showPassengerList, setShowPassengerList] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (trip) {
      const passenger = passengers.find(p => p._id === trip.passengerId);
      setPassengerSearch(
        passenger ? `${passenger.firstName} ${passenger.lastName}` : ''
      );
      setSelectedPassenger(passenger || null);
      setFromOrigin(trip.fromOrigin);
      setToDestination(trip.toDestination);
      setTripDate(new Date(trip.tripDate));
      setConfirmed(trip.confirmed || false);
    }
    
    return () => {
      setPassengerSearch('');
      setSelectedPassenger(null);
      setFromOrigin('NTM');
      setToDestination('NSC');
      setTripDate(new Date());
      setConfirmed(false);
      setError(null);
      setIsUpdating(false);
      setIsDeleting(false);
    };
  }, [trip, passengers]);

  const filteredPassengers = passengers.filter(passenger =>
    `${passenger.firstName} ${passenger.lastName}`
      .toLowerCase()
      .includes(passengerSearch.toLowerCase())
  );

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isUpdating || !trip) return;
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

    const updatedTrip = {
      ...trip,
      passengerId: selectedPassenger._id,
      fromOrigin,
      toDestination,
      tripDate: format(tripDate, 'yyyy-MM-dd'),
      confirmed
    };

    try {
      const response = await fetch(`https://wells-api.vercel.app/api/trips/${trip._id}`, {
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
      const response = await fetch(`https://wells-api.vercel.app/api/trips/${trip._id}`, {
        method: 'DELETE',
      });

      if (!response.ok && response.status !== 404) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete trip');
      }

      // First notify parent about deletion
      onDelete(trip._id);
      
      // Then close the modal
      onClose();
    } catch (error) {
      console.error('Error deleting trip:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete trip. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen || !trip) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div>Edit Trip</div>
          <button onClick={onClose} className="close-button">×</button>
        </div>

        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label className="label">Passenger</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={passengerSearch}
                onChange={(e) => {
                  setPassengerSearch(e.target.value);
                  setShowPassengerList(true);
                }}
                onFocus={() => setShowPassengerList(true)}
                onBlur={() => setTimeout(() => setShowPassengerList(false), 200)}
                placeholder="Search passenger..."
                className="input"
              />
              {showPassengerList && (
                <div className="passenger-list">
                  {filteredPassengers.map(passenger => (
                    <div
                      key={passenger._id}
                      onClick={() => {
                        setSelectedPassenger(passenger);
                        setPassengerSearch(`${passenger.firstName} ${passenger.lastName}`);
                        setShowPassengerList(false);
                      }}
                      className={`passenger-item ${selectedPassenger?._id === passenger._id ? 'passenger-item-highlighted' : ''}`}
                    >
                      {passenger.firstName} {passenger.lastName}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="date-confirm-container">
            <div className="date-input">
              <label className="label">Trip Date</label>
              <input
                type="date"
                value={format(tripDate, 'yyyy-MM-dd')}
                onChange={(e) => {
                  const selected = new Date(e.target.value);
                  selected.setHours(tripDate.getHours());
                  selected.setMinutes(tripDate.getMinutes());
                  setTripDate(selected);
                }}
                className="input"
              />
            </div>
            <div className="confirm-checkbox">
              <label className="label">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="checkbox-input"
                />
                Confirmed
              </label>
            </div>
          </div>

          <div className="flex-container">
            <div className="flex-item">
              <label className="label">From</label>
              <select
                value={fromOrigin}
                onChange={(e) => setFromOrigin(e.target.value)}
                className="select"
              >
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
            <div className="flex-item">
              <label className="label">To</label>
              <select
                value={toDestination}
                onChange={(e) => setToDestination(e.target.value)}
                className="select"
              >
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>

          {fromOrigin === toDestination && (
            <div className="warning-message">
              Warning: Origin and destination cannot be the same
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="edit-modal-buttons">
            <button
              type="submit"
              disabled={!selectedPassenger || fromOrigin === toDestination || isUpdating}
              className="submit-button"
            >
              {isUpdating ? 'Updating...' : 'Update Trip'}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="delete-button"
            >
              {isDeleting ? 'Deleting...' : 'Delete Trip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}