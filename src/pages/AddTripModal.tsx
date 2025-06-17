import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import type { Passenger } from './HeliDashboard';

// Define proper CSSProperties for all style objects
const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000
};

const modalContentStyle: React.CSSProperties = {
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: '8px',
  width: '400px',
  maxWidth: '90%'
};

const modalHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px'
};

const closeButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  fontSize: '1.2rem',
  cursor: 'pointer'
};

const formGroupStyle: React.CSSProperties = {
  marginBottom: '15px'
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '5px',
  fontWeight: '500'
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px',
  borderRadius: '4px',
  border: '1px solid #ddd'
};

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px',
  borderRadius: '4px',
  border: '1px solid #ddd',
  backgroundColor: 'white'
};

const passengerListStyle: React.CSSProperties = {
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  maxHeight: '200px',
  overflowY: 'auto',
  border: '1px solid #ddd',
  backgroundColor: 'white',
  zIndex: 1001,
  borderRadius: '0 0 4px 4px'
};

const passengerItemStyle: React.CSSProperties = {
  padding: '8px',
  cursor: 'pointer'
};

const submitButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px',
  backgroundColor: '#2c3e50',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer'
};

const submitButtonDisabledStyle: React.CSSProperties = {
  ...submitButtonStyle,
  backgroundColor: '#cccccc',
  cursor: 'not-allowed'
};

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
  const [showPassengerList, setShowPassengerList] = useState(false);

  // Reset form when selectedDate changes
  useEffect(() => {
    setTripDate(selectedDate);
    setFromOrigin(tripType === 'outgoing' ? currentLocation : 'NTM');
    setToDestination(tripType === 'incoming' ? currentLocation : 'NSC');
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
      tripDate: format(tripDate, 'yyyy-MM-dd')
    });
  };

  if (!isOpen) return null;

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <div style={modalHeaderStyle}>
          <h3>Add New Trip</h3>
          <button onClick={onClose} style={closeButtonStyle}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={formGroupStyle}>
            <label style={labelStyle}>Passenger</label>
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
                style={inputStyle}
              />
              {showPassengerList && (
                <div style={passengerListStyle}>
                  {filteredPassengers.map(passenger => (
                    <div
                      key={passenger._id}
                      onClick={() => {
                        setSelectedPassenger(passenger);
                        setPassengerSearch(`${passenger.firstName} ${passenger.lastName}`);
                        setShowPassengerList(false);
                      }}
                      style={{
                        ...passengerItemStyle,
                        backgroundColor: selectedPassenger?._id === passenger._id ? '#f0f0f0' : 'white'
                      }}
                    >
                      {passenger.firstName} {passenger.lastName}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Trip Date</label>
            <input
              type="date"
              value={format(tripDate, 'yyyy-MM-dd')}
              onChange={(e) => {
                const selected = new Date(e.target.value);
                // Ensure we maintain the same timezone as the original date
                selected.setHours(selectedDate.getHours());
                selected.setMinutes(selectedDate.getMinutes());
                setTripDate(selected);
              }}
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>From</label>
              <select
                value={fromOrigin}
                onChange={(e) => setFromOrigin(e.target.value)}
                style={selectStyle}
              >
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>To</label>
              <select
                value={toDestination}
                onChange={(e) => setToDestination(e.target.value)}
                style={selectStyle}
              >
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>

          {fromOrigin === toDestination && (
            <div style={{ color: 'red', marginBottom: '15px' }}>
              Warning: Origin and destination cannot be the same
            </div>
          )}

          <button
            type="submit"
            disabled={!selectedPassenger || fromOrigin === toDestination}
            style={!selectedPassenger || fromOrigin === toDestination ? submitButtonDisabledStyle : submitButtonStyle}
          >
            Add Trip
          </button>
        </form>
      </div>
    </div>
  );
}