// components/AddTripModal.tsx
import { useState } from 'react';
import type { Passenger } from './HeliDashboard';
import { format } from 'date-fns';

interface AddTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  passengers: Passenger[];
  selectedDate: Date;
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
  onSubmit
}: AddTripModalProps) {
  const [passengerSearch, setPassengerSearch] = useState('');
  const [selectedPassenger, setSelectedPassenger] = useState<Passenger | null>(null);
  const [fromOrigin, setFromOrigin] = useState('NTM');
  const [toDestination, setToDestination] = useState('NSC');
  const [tripDate, setTripDate] = useState(selectedDate);

  const filteredPassengers = passengers.filter(passenger =>
    `${passenger.firstName} ${passenger.lastName}`
      .toLowerCase()
      .includes(passengerSearch.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPassenger) return;

    onSubmit({
      passengerId: selectedPassenger._id,
      fromOrigin,
      toDestination,
      tripDate: format(tripDate, 'yyyy-MM-dd')
    });
  };

  if (!isOpen) return null;

  return (
    <div style={{
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
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        width: '400px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h3>Add New Trip</h3>
          <button onClick={onClose} style={{
            background: 'none',
            border: 'none',
            fontSize: '1.2rem',
            cursor: 'pointer'
          }}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Passenger
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={passengerSearch}
                onChange={(e) => setPassengerSearch(e.target.value)}
                placeholder="Search passenger..."
                style={{ flex: 1, padding: '8px' }}
              />
              <button type="button" style={{ padding: '8px 12px' }}>
                New
              </button>
            </div>
            {passengerSearch && (
              <div style={{
                maxHeight: '200px',
                overflowY: 'auto',
                border: '1px solid #ddd',
                marginTop: '5px'
              }}>
                {filteredPassengers.map(passenger => (
                  <div
                    key={passenger._id}
                    onClick={() => {
                      setSelectedPassenger(passenger);
                      setPassengerSearch(`${passenger.firstName} ${passenger.lastName}`);
                    }}
                    style={{
                      padding: '8px',
                      cursor: 'pointer',
                      backgroundColor: selectedPassenger?._id === passenger._id ? '#f0f0f0' : 'white'
                    }}
                  >
                    {passenger.firstName} {passenger.lastName}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Trip Date
            </label>
            <input
              type="date"
              value={format(tripDate, 'yyyy-MM-dd')}
              onChange={(e) => setTripDate(new Date(e.target.value))}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                From
              </label>
              <select
                value={fromOrigin}
                onChange={(e) => setFromOrigin(e.target.value)}
                style={{ width: '100%', padding: '8px' }}
              >
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                To
              </label>
              <select
                value={toDestination}
                onChange={(e) => setToDestination(e.target.value)}
                style={{ width: '100%', padding: '8px' }}
              >
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={!selectedPassenger}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: selectedPassenger ? '#2c3e50' : '#cccccc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: selectedPassenger ? 'pointer' : 'not-allowed'
            }}
          >
            Add Trip
          </button>
        </form>
      </div>
    </div>
  );
}