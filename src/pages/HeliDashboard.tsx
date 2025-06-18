import { useState, useEffect } from 'react';
import { format, addWeeks, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import LocationDropdown from './LocationDropdown';
import PassengerCard from './PassengerCard';
import AddTripModal from './AddTripModal';
import EditTripModal from './EditTripModal';
import './HeliDashboard.css';

export interface Passenger {
  _id: string;
  firstName: string;
  lastName: string;
  jobRole: string;
}

export interface Trip {
  _id: string;
  passengerId: string;
  fromOrigin: string;
  toDestination: string;
  tripDate: string;
  confirmed: boolean;
}

interface DayData {
  date: Date;
  incoming: Trip[];
  outgoing: Trip[];
  pob: number;
}

export default function HeliDashboard() {
  const [currentDate] = useState(new Date());
  const [currentLocation, setCurrentLocation] = useState('NTM');
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [weeksData, setWeeksData] = useState<DayData[][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCellDate, setSelectedCellDate] = useState<Date>(new Date());
  const [tripType, setTripType] = useState<'incoming' | 'outgoing'>('outgoing');
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [passengersRes, tripsRes] = await Promise.all([
          fetch('https://wells-api.vercel.app/api/passengers'),
          fetch('https://wells-api.vercel.app/api/trips')
        ]);
        
        if (!passengersRes.ok) throw new Error('Failed to fetch passengers');
        if (!tripsRes.ok) throw new Error('Failed to fetch trips');
        
        const passengersData = await passengersRes.json();
        const tripsData = await tripsRes.json();
        
        setPassengers(passengersData);
        setTrips(tripsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!trips.length || !passengers.length) return;
    
    const generateWeeks = (): DayData[][] => {
      return Array.from({ length: 4 }, (_, weekIndex) => {
        const weekStart = startOfWeek(addWeeks(currentDate, weekIndex - 1));
        const weekEnd = endOfWeek(weekStart);
        const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
        
        return days.map(date => {
          const dateStr = format(date, 'yyyy-MM-dd');
          const relevantTrips = trips.filter(trip => trip.tripDate === dateStr);
          
          return {
            date,
            incoming: relevantTrips.filter(trip => trip.toDestination === currentLocation),
            outgoing: relevantTrips.filter(trip => trip.fromOrigin === currentLocation),
            pob: Math.floor(Math.random() * 50) + 100
          };
        });
      });
    };

    setWeeksData(generateWeeks());
  }, [trips, passengers, currentLocation, currentDate]);

  const getPassengerById = (passengerId: string): Passenger | undefined => {
    return passengers.find(p => p._id === passengerId);
  };

  const handleAddTrip = async (tripData: {
    passengerId: string;
    fromOrigin: string;
    toDestination: string;
    tripDate: string;
  }) => {
    try {
      const response = await fetch('https://wells-api.vercel.app/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tripData),
      });

      if (!response.ok) throw new Error('Failed to add trip');

      const newTrip = await response.json();
      setTrips([...trips, newTrip]);
      setModalOpen(false);
    } catch (error) {
      console.error('Error adding trip:', error);
    }
  };

  const handleUpdateTrip = async (updatedTrip: Trip) => {
    try {
      const response = await fetch(`https://wells-api.vercel.app/api/trips/${updatedTrip._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTrip),
      });

      if (!response.ok) throw new Error('Failed to update trip');

      setTrips(trips.map(t => t._id === updatedTrip._id ? updatedTrip : t));
    } catch (error) {
      console.error('Error updating trip:', error);
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    try {
      // Optimistically update the UI first
      setTrips(prevTrips => prevTrips.filter(t => t._id !== tripId));
      
      // Then make the API call
      const response = await fetch(`https://wells-api.vercel.app/api/trips/${tripId}`, {
        method: 'DELETE',
      });

      if (!response.ok && response.status !== 404) {
        // If API fails, revert the optimistic update
        const tripsRes = await fetch('https://wells-api.vercel.app/api/trips');
        if (tripsRes.ok) {
          const tripsData = await tripsRes.json();
          setTrips(tripsData);
        }
        throw new Error('Failed to delete trip');
      }
    } catch (error) {
      console.error('Error deleting trip:', error);
    }
  };

  if (loading) {
    return <div className="loading-container">Loading dashboard data...</div>;
  }

  if (error) {
    return <div className="error-container">Error: {error}</div>;
  }

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-header">
        Helicopter Passenger Dashboard
      </h2>
      
      <LocationDropdown 
        currentLocation={currentLocation} 
        onLocationChange={setCurrentLocation} 
      />
      
      {/* Column Headers - Days of Week */}
      <div className="days-header">
        <div className="corner-cell">
          {/* Empty corner cell */}
        </div>
        {daysOfWeek.map((day, index) => (
          <div key={index} className="day-cell" style={{ 
            borderRight: index < 6 ? '1px solid #3d5166' : 'none'
          }}>
            {day}
          </div>
        ))}
      </div>
      
      {/* Week Rows */}
      <div className="week-container">
        {weeksData.length > 0 ? (
          weeksData.map((week, weekIndex) => (
            <div key={weekIndex} className="week-row" style={{
              borderBottom: weekIndex < 2 ? '1px solid #ddd' : 'none'
            }}>
              {/* Row Header - Incoming/Outgoing Labels */}
              <div className="row-header">
                <div className="incoming-label">
                  INCOMING
                </div>
                <div className="outgoing-label">
                  OUTGOING
                </div>
              </div>
              
              {/* Day Columns */}
              {week.map((day, dayIndex) => (
                <div key={dayIndex} className="day-column" style={{
                  borderRight: dayIndex < 6 ? '1px solid #ddd' : 'none'
                }}>
                  {/* Date Header */}
                  <div className="date-header">
                    {format(day.date, 'MMM d')}
                  </div>
                  
                  {/* Passenger Lists */}
                  <div className="passenger-lists">
                    {/* Incoming Section */}
                    <div className="incoming-section">
                      {day.incoming.map((trip, i) => (
                        <div 
                          key={i}
                          onClick={() => setEditingTrip(trip)}
                          className="passenger-card-container"
                        >
                          <PassengerCard
                            firstName={getPassengerById(trip.passengerId)?.firstName || ''}
                            lastName={getPassengerById(trip.passengerId)?.lastName || ''}
                            jobRole={getPassengerById(trip.passengerId)?.jobRole || ''}
                            fromOrigin={trip.fromOrigin}
                            toDestination={trip.toDestination}
                            type='incoming'
                          />
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          setSelectedCellDate(day.date);
                          setModalOpen(true);
                          setTripType('incoming');
                        }}
                        className="add-button"
                        title="Add incoming passenger"
                      >
                        +
                      </button>
                    </div>
                    
                    {/* Outgoing Section */}
                    <div className="outgoing-section">
                      {day.outgoing.map((trip, i) => (
                        <div 
                          key={i}
                          onClick={() => setEditingTrip(trip)}
                          className="passenger-card-container"
                        >
                          <PassengerCard
                            firstName={getPassengerById(trip.passengerId)?.firstName || ''}
                            lastName={getPassengerById(trip.passengerId)?.lastName || ''}
                            jobRole={getPassengerById(trip.passengerId)?.jobRole || ''}
                            fromOrigin={trip.fromOrigin}
                            toDestination={trip.toDestination}
                            type='outgoing'
                          />
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          setSelectedCellDate(day.date);
                          setModalOpen(true);
                          setTripType('outgoing');
                        }}
                        className="add-button"
                        title="Add outgoing passenger"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  {/* POB Footer */}
                  <div className="pob-footer">
                    POB: {day.pob}
                  </div>
                </div>
              ))}
            </div>
          ))
        ) : (
          <div className="no-data-message">
            No trip data available for the selected location and date range
          </div>
        )}
      </div>

      {/* Modals */}
      <AddTripModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        passengers={passengers}
        selectedDate={selectedCellDate}
        tripType={tripType}
        currentLocation={currentLocation}
        onSubmit={handleAddTrip}
      />
      <EditTripModal
        isOpen={editingTrip !== null}
        onClose={() => setEditingTrip(null)}
        passengers={passengers}
        trip={editingTrip}
        currentLocation={currentLocation}
        onUpdate={handleUpdateTrip}
        onDelete={handleDeleteTrip}
      />
    </div>
  );
}