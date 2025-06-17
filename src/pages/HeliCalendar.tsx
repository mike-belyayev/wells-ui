import { useState, useEffect } from 'react';
import { format, addWeeks, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import LocationDropdown from './LocationDropdown';
import PassengerCard from './PassengerCard';

interface Passenger {
  _id: string;
  firstName: string;
  lastName: string;
  jobRole: string;
}

interface Trip {
  _id: string;
  passengerId: string;
  fromOrigin: string;
  toDestination: string;
  tripDate: string;
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

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Fetch passengers and trips data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching data...');
        
        const [passengersRes, tripsRes] = await Promise.all([
          fetch('https://wells-api.vercel.app/api/passengers'),
          fetch('https://wells-api.vercel.app/api/trips')
        ]);
        
        if (!passengersRes.ok) throw new Error('Failed to fetch passengers');
        if (!tripsRes.ok) throw new Error('Failed to fetch trips');
        
        const passengersData = await passengersRes.json();
        const tripsData = await tripsRes.json();
        
        console.log('Passengers data:', passengersData);
        console.log('Trips data:', tripsData);
        
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

  // Generate weeks data when location or trips change
  useEffect(() => {
    if (!trips.length || !passengers.length) return;

    console.log('Generating weeks data...');
    
    const generateWeeks = (): DayData[][] => {
      return Array.from({ length: 3 }, (_, weekIndex) => {
        const weekStart = startOfWeek(addWeeks(currentDate, weekIndex));
        const weekEnd = endOfWeek(weekStart);
        const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
        
        return days.map(date => {
          const dateStr = format(date, 'yyyy-MM-dd');
          
          // Normalize trip data in case of field name inconsistencies
          const normalizedTrips = trips.map(trip => ({
            ...trip,
            fromOrigin: trip.fromOrigin || trip.fromOrigin, // Handle typo
            toDestination: trip.toDestination || trip.toDestination
          }));
          
          // Filter trips for this date and current location
          const relevantTrips = normalizedTrips.filter(trip => trip.tripDate === dateStr);
          
          // Separate into incoming and outgoing based on current location
          const incoming = relevantTrips.filter(trip => 
            trip.toDestination === currentLocation
          );
          const outgoing = relevantTrips.filter(trip => 
            trip.fromOrigin === currentLocation
          );
          
          console.log(`Date: ${dateStr}, Incoming: ${incoming.length}, Outgoing: ${outgoing.length}`);
          
          return {
            date,
            incoming,
            outgoing,
            pob: Math.floor(Math.random() * 50) + 100 // Random POB between 100-150
          };
        });
      });
    };

    const newWeeksData = generateWeeks();
    console.log('Generated weeks data:', newWeeksData);
    setWeeksData(newWeeksData);
  }, [trips, passengers, currentLocation, currentDate]);

  const getPassengerById = (passengerId: string): Passenger | undefined => {
    return passengers.find(p => p._id === passengerId);
  };

  if (loading) {
    return <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh'
    }}>Loading dashboard data...</div>;
  }

  if (error) {
    return <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      color: 'red'
    }}>Error: {error}</div>;
  }

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      margin: 0,
      padding: '10px',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      backgroundColor: '#f5f5f5',
      fontFamily: 'Arial, sans-serif',
      position: 'relative'
    }}>
      <h2 style={{ 
        margin: '0 0 10px 0', 
        textAlign: 'center',
        fontSize: '1.5rem'
      }}>
        Helicopter Passenger Dashboard
      </h2>
      
      <LocationDropdown 
        currentLocation={currentLocation} 
        onLocationChange={setCurrentLocation} 
      />
      
      {/* Column Headers - Days of Week */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '80px repeat(7, 1fr)',
        height: '40px',
        backgroundColor: '#2c3e50',
        color: 'white',
        fontWeight: 'bold'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRight: '1px solid #3d5166'
        }}>
          {/* Empty corner cell */}
        </div>
        {daysOfWeek.map((day, index) => (
          <div key={index} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRight: index < 6 ? '1px solid #3d5166' : 'none',
            fontSize: '0.9rem'
          }}>
            {day}
          </div>
        ))}
      </div>
      
      {/* Week Rows */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        border: '1px solid #ddd'
      }}>
        {weeksData.length > 0 ? (
          weeksData.map((week, weekIndex) => (
            <div key={weekIndex} style={{
              display: 'grid',
              gridTemplateColumns: '40px repeat(7, 1fr)',
              height: '33.33%',
              minHeight: '200px',
              borderBottom: weekIndex < 2 ? '1px solid #ddd' : 'none'
            }}>
              {/* Row Header - Incoming/Outgoing Labels */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#ecf0f1',
                borderRight: '1px solid #ddd'
              }}>
                <div style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#e6f7e6',
                  borderBottom: '1px solid #ddd',
                  fontWeight: 'bold',
                  color: '#2e7d32',
                  fontSize: '0.85rem',
                  writingMode: 'vertical-rl',
                  transform: 'rotate(180deg)'
                }}>
                  INCOMING
                </div>
                <div style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#e6f3f7',
                  fontWeight: 'bold',
                  color: '#1565c0',
                  fontSize: '0.85rem',
                  writingMode: 'vertical-rl',
                  transform: 'rotate(180deg)'
                }}>
                  OUTGOING
                </div>
              </div>
              
              {/* Day Columns */}
              {week.map((day, dayIndex) => (
                <div key={dayIndex} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  borderRight: dayIndex < 6 ? '1px solid #ddd' : 'none',
                  backgroundColor: 'white'
                }}>
                  {/* Date Header */}
                  <div style={{
                    padding: '5px',
                    textAlign: 'center',
                    borderBottom: '1px solid #eee',
                    fontWeight: 'bold',
                    fontSize: '0.8rem',
                    backgroundColor: '#f8f9fa'
                  }}>
                    {format(day.date, 'MMM d')}
                  </div>
                  
                  {/* Passenger Lists */}
                  <div style={{ flex: 1 }}>
                    {/* Incoming Section */}
                    <div style={{
                      height: '50%',
                      padding: '5px',
                      borderBottom: '1px solid #eee',
                      backgroundColor: 'rgba(230, 247, 230, 0.3)',
                      overflowY: 'auto'
                    }}>
                      {day.incoming.map((trip, i) => {
                        const passenger = getPassengerById(trip.passengerId);
                        if (!passenger) {
                          console.warn(`Passenger not found for ID: ${trip.passengerId}`);
                          return null;
                        }
                        
                        return (
                          <PassengerCard
                            key={i}
                            firstName={passenger.firstName}
                            lastName={passenger.lastName}
                            jobRole={passenger.jobRole}
                            fromOrigin={trip.fromOrigin}
                            toDestination={trip.toDestination}
                          />
                        );
                      })}
                    </div>
                    
                    {/* Outgoing Section */}
                    <div style={{
                      height: '50%',
                      padding: '5px',
                      backgroundColor: 'rgba(230, 243, 247, 0.3)',
                      overflowY: 'auto'
                    }}>
                      {day.outgoing.map((trip, i) => {
                        const passenger = getPassengerById(trip.passengerId);
                        if (!passenger) {
                          console.warn(`Passenger not found for ID: ${trip.passengerId}`);
                          return null;
                        }
                        
                        return (
                          <PassengerCard
                            key={i}
                            firstName={passenger.firstName}
                            lastName={passenger.lastName}
                            jobRole={passenger.jobRole}
                            fromOrigin={trip.fromOrigin}
                            toDestination={trip.toDestination}
                          />
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* POB Footer */}
                  <div style={{
                    padding: '3px',
                    textAlign: 'center',
                    borderTop: '1px solid #eee',
                    fontSize: '0.75rem',
                    backgroundColor: '#f8f9fa',
                    fontWeight: '500'
                  }}>
                    POB: {day.pob}
                  </div>
                </div>
              ))}
            </div>
          ))
        ) : (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            color: '#666'
          }}>
            No trip data available for the selected location and date range
          </div>
        )}
      </div>
    </div>
  );
}