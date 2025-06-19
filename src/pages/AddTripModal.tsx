import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import type { Passenger } from './HeliPage';
import './AddTripModal.css';

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
    confirmed: boolean; // Add confirmed to the interface
  }) => void;
}

const locations = ['NTM', 'Ogle', 'NSC', 'NDT', 'NBD', 'STC'];

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
  const [tripDate, setTripDate] = useState(selectedDate);
  const [confirmed, setConfirmed] = useState(false); // Add confirmed state
  const [showPassengerList, setShowPassengerList] = useState(false);

  useEffect(() => {
    setTripDate(selectedDate);
    setFromOrigin(tripType === 'outgoing' ? currentLocation : 'NTM');
    setToDestination(tripType === 'incoming' ? currentLocation : 'NSC');
    setConfirmed(false); // Reset confirmed when date changes
  }, [selectedDate, tripType, currentLocation]);

  const filteredPassengers = passengers.filter(passenger =>
    `${passenger.firstName} ${passenger.lastName}`
      .toLowerCase()
      .includes(passengerSearch.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPassenger || fromOrigin === toDestination) return;

    onSubmit({
      passengerId: selectedPassenger._id,
      fromOrigin,
      toDestination,
      tripDate: format(tripDate, 'yyyy-MM-dd'),
      confirmed // Include confirmed in the submission
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div>Add New Trip</div>
          <button onClick={onClose} className="close-button">×</button>
        </div>

        <form onSubmit={handleSubmit}>
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
                  selected.setHours(selectedDate.getHours());
                  selected.setMinutes(selectedDate.getMinutes());
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

          <button
            type="submit"
            disabled={!selectedPassenger || fromOrigin === toDestination}
            className="submit-button"
          >
            Add Trip
          </button>
        </form>
      </div>
    </div>
  );
}