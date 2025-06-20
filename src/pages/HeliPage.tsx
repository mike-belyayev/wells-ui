import { useState, useEffect, useCallback } from 'react';
import { format, addWeeks, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { AppBar, Toolbar, IconButton, Typography, Box, Button } from '@mui/material';
import { Settings, ChevronLeft, ChevronRight } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import LocationDropdown from './LocationDropdown';
import PassengerCard from './PassengerCard';
import AddTripModal from './AddTripModal';
import EditTripModal from './EditTripModal';
import './HeliPage.css';

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

const HeliPage = () => {
  const { logout, user } = useAuth();
  const isAdmin = user?.isAdmin || false;
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
  const [weekOffset, setWeekOffset] = useState(1);
  const [draggedTrip, setDraggedTrip] = useState<Trip | null>(null);
  const [dragType, setDragType] = useState<'incoming' | 'outgoing' | null>(null);
  const [sectionHeights, setSectionHeights] = useState<{maxIncoming: number, maxOutgoing: number}[]>([]);

  const navigate = useNavigate();

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const isToday = (date: Date) => {
    return format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  };

  const calculateMaxCardsPerWeek = (weeksData: DayData[][]) => {
    return weeksData.map(week => {
      const maxIncoming = Math.max(...week.map(day => day.incoming.length));
      const maxOutgoing = Math.max(...week.map(day => day.outgoing.length));
      return { maxIncoming, maxOutgoing };
    });
  };

  const fetchData = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const generateWeeks = useCallback(() => {
    return [-1, 0, 1].map(relativeOffset => {
      const weekStart = startOfWeek(addWeeks(new Date(), weekOffset + relativeOffset));
      const weekEnd = endOfWeek(weekStart);
      const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
      
      return days.map(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const relevantTrips = trips.filter(trip => trip.tripDate === dateStr);
        
        const sortByConfirmed = (a: Trip, b: Trip) => {
          if (a.confirmed && !b.confirmed) return -1;
          if (!a.confirmed && b.confirmed) return 1;
          return 0;
        };
        
        return {
          date,
          incoming: relevantTrips
            .filter(trip => trip.toDestination === currentLocation)
            .sort(sortByConfirmed),
          outgoing: relevantTrips
            .filter(trip => trip.fromOrigin === currentLocation)
            .sort(sortByConfirmed),
          pob: Math.floor(Math.random() * 50) + 100
        };
      });
    });
  }, [trips, currentLocation, weekOffset]);

  useEffect(() => {
    const generatedWeeks = generateWeeks();
    setWeeksData(generatedWeeks);
    if (generatedWeeks.length > 0) {
      setSectionHeights(calculateMaxCardsPerWeek(generatedWeeks));
    }
  }, [generateWeeks]);

  const getPassengerById = (passengerId: string): Passenger | undefined => {
    return passengers.find(p => p._id === passengerId);
  };

  const handleAddTrip = async (tripData: {
    passengerId: string;
    fromOrigin: string;
    toDestination: string;
    tripDate: string;
  }) => {
    if (!isAdmin) return;
    
    try {
      const response = await fetch('https://wells-api.vercel.app/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
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
    if (!isAdmin) return;
    
    try {
      const response = await fetch(`https://wells-api.vercel.app/api/trips/${updatedTrip._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify(updatedTrip),
      });

      if (!response.ok) throw new Error('Failed to update trip');

      setTrips(trips.map(t => t._id === updatedTrip._id ? updatedTrip : t));
      setEditingTrip(null);
    } catch (error) {
      console.error('Error updating trip:', error);
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (!isAdmin) return;
    
    try {
      setTrips(prevTrips => prevTrips.filter(t => t._id !== tripId));
      
      const response = await fetch(`https://wells-api.vercel.app/api/trips/${tripId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });

      if (!response.ok && response.status !== 404) {
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

  const handleDragStart = (trip: Trip, type: 'incoming' | 'outgoing') => {
    if (!isAdmin) return;
    setDraggedTrip(trip);
    setDragType(type);
  };

  const handleDragOver = (e: React.DragEvent, _date: Date, type: 'incoming' | 'outgoing') => {
    if (!isAdmin) return;
    if (dragType === type) {
      e.preventDefault();
      e.currentTarget.classList.add('drop-target');
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('drop-target');
  };

  const handleDrop = async (e: React.DragEvent, date: Date, type: 'incoming' | 'outgoing') => {
    if (!isAdmin) return;
    
    e.currentTarget.classList.remove('drop-target');
    
    if (!draggedTrip || dragType !== type) return;

    try {
      const updatedTrip = {
        ...draggedTrip,
        tripDate: format(date, 'yyyy-MM-dd')
      };

      await handleUpdateTrip(updatedTrip);
    } catch (error) {
      console.error('Error moving trip:', error);
    }
  };

  const handlePrevWeek = () => {
    setWeekOffset(prev => prev - 1);
  };

  const handleNextWeek = () => {
    setWeekOffset(prev => prev + 1);
  };

  const handleToday = () => {
    setWeekOffset(1);
  };

  const getWeekRangeDisplay = () => {
    if (weeksData.length === 0) return '';
    const firstWeek = weeksData[0][0].date;
    const lastWeek = weeksData[weeksData.length - 1][6].date;
    return `${format(firstWeek, 'MMM d')} - ${format(lastWeek, 'MMM d, yyyy')}`;
  };

  if (loading) {
    return <div className="loading-container">Loading dashboard data...</div>;
  }

  if (error) {
    return <div className="error-container">Error: {error}</div>;
  }

return (
  <div className="dashboard-container">
<AppBar 
  position="static" 
  sx={{ 
    backgroundColor: '#121212', // Dark background
    color: 'white', // Light text
    backgroundImage: 'none', // Remove default gradient
    boxShadow: 'none',
    borderBottom: '1px solid rgba(255, 255, 255, 0.12)' // Subtle divider
  }}
>
  <Toolbar sx={{ 
    justifyContent: 'space-between', 
    gap: 2,
    minHeight: '64px' // Ensure consistent height
  }}>
    {/* Left section - Title and Calendar */}
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Typography variant="h6" component="h1" sx={{ fontWeight: 'bold' }}>
        Helicopter Passengers
      </Typography>
      
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        '& .MuiButton-root': {
          color: 'white',
          borderColor: 'rgba(255, 255, 255, 0.23)',
          '&:hover': {
            borderColor: 'white'
          }
        },
        '& .MuiIconButton-root': {
          color: 'white'
        }
      }}>
        <IconButton onClick={handlePrevWeek} size="small">
          <ChevronLeft />
        </IconButton>
        
        <Button 
          variant="outlined" 
          size="small" 
          onClick={handleToday}
          sx={{ textTransform: 'none' }}
        >
          Today
        </Button>
        
        <Typography variant="body2" sx={{ 
          minWidth: 150, 
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.7)' // Slightly muted
        }}>
          {getWeekRangeDisplay()}
        </Typography>
        
        <IconButton onClick={handleNextWeek} size="small">
          <ChevronRight />
        </IconButton>
      </Box>
    </Box>

    {/* Middle section - Location dropdown */}
    <Box sx={{ 
      flex: 1, 
      maxWidth: 200,
      '& .MuiInputLabel-root': {
        color: 'rgba(255, 255, 255, 0.7)'
      },
      '& .MuiOutlinedInput-root': {
        color: 'white',
        '& fieldset': {
          borderColor: 'rgba(255, 255, 255, 0.23)'
        },
        '&:hover fieldset': {
          borderColor: 'white'
        }
      },
      '& .MuiSelect-icon': {
        color: 'white'
      }
    }}>
      <LocationDropdown 
        currentLocation={currentLocation} 
        onLocationChange={setCurrentLocation}
        size="small"
      />
    </Box>

    {/* Right section - User controls */}
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 1,
      '& .MuiButton-root': {
        color: 'white'
      }
    }}>
      {isAdmin && (
        <IconButton 
          onClick={() => navigate('/admin')}
          title="Admin Settings"
          sx={{ 
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.08)'
            }
          }}
        >
          <Settings />
        </IconButton>
      )}
      
      <Typography variant="body2" noWrap sx={{ 
        maxWidth: 300,
        color: 'white'
      }}>
        {user?.userEmail}
        {isAdmin && " (admin)"}
      </Typography>
      
      <Button 
        variant="text" 
        onClick={logout}
        size="small"
        sx={{ 
          textTransform: 'none',
          ml: 1,
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.08)'
          }
        }}
      >
        Logout
      </Button>
    </Box>
  </Toolbar>
</AppBar>
      
      <div className="days-header">
        <div className="corner-cell"></div>
        {daysOfWeek.map((day, index) => (
          <div key={index} className="day-cell">
            {day}
          </div>
        ))}
      </div>
      
      <div className="week-container">
        {weeksData.length > 0 ? (
          weeksData.map((week, weekIndex) => {
            const incomingHeight = sectionHeights[weekIndex]?.maxIncoming * 1.5 + 3;
            const outgoingHeight = sectionHeights[weekIndex]?.maxOutgoing * 1.5 + 3;

            return (
              <div key={weekIndex} className="week-row">
                <div className="row-header">
                  <div className="incoming-label" style={{ minHeight: `${incomingHeight}rem` }}>IN</div>
                  <div className="outgoing-label" style={{ minHeight: `${outgoingHeight}rem` }}>OUT</div>
                </div>
                
                {week.map((day, dayIndex) => (
                  <div key={dayIndex} className="day-column" style={{
                    borderRight: dayIndex < 6 ? '1px solid #ddd' : 'none'
                  }}>
                    <div className="date-header" style={{
                      fontWeight: isToday(day.date) ? 'bold' : 'normal',
                      color: isToday(day.date) ? '#1976d2' : 'inherit'
                    }}>
                      {format(day.date, 'MMM d')}
                    </div>
                    
                    <div className="passenger-lists">
                      <div 
                        className="incoming-section"
                        style={{ minHeight: `${incomingHeight}rem` }}
                        onDragOver={(e) => isAdmin && handleDragOver(e, day.date, 'incoming')}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => isAdmin && handleDrop(e, day.date, 'incoming')}
                      >
                        <div className="passenger-cards-container">
                          {day.incoming.map((trip, i) => (
                            <div 
                              key={i}
                              onClick={() => isAdmin && setEditingTrip(trip)}
                              className={`passenger-card-container ${!isAdmin ? 'readonly' : ''}`}
                              draggable={isAdmin}
                              onDragStart={() => isAdmin && handleDragStart(trip, 'incoming')}
                            >
                              <PassengerCard
                                firstName={getPassengerById(trip.passengerId)?.firstName || ''}
                                lastName={getPassengerById(trip.passengerId)?.lastName || ''}
                                jobRole={getPassengerById(trip.passengerId)?.jobRole || ''}
                                fromOrigin={trip.fromOrigin}
                                toDestination={trip.toDestination}
                                type='incoming'
                                confirmed={trip.confirmed}
                              />
                            </div>
                          ))}
                        </div>
                        {isAdmin && (
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
                        )}
                      </div>
                      
                      <div 
                        className="outgoing-section"
                        style={{ minHeight: `${outgoingHeight}rem` }}
                        onDragOver={(e) => isAdmin && handleDragOver(e, day.date, 'outgoing')}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => isAdmin && handleDrop(e, day.date, 'outgoing')}
                      >
                        <div className="passenger-cards-container">
                          {day.outgoing.map((trip, i) => (
                            <div 
                              key={i}
                              onClick={() => isAdmin && setEditingTrip(trip)}
                              className={`passenger-card-container ${!isAdmin ? 'readonly' : ''}`}
                              draggable={isAdmin}
                              onDragStart={() => isAdmin && handleDragStart(trip, 'outgoing')}
                            >
                              <PassengerCard
                                firstName={getPassengerById(trip.passengerId)?.firstName || ''}
                                lastName={getPassengerById(trip.passengerId)?.lastName || ''}
                                jobRole={getPassengerById(trip.passengerId)?.jobRole || ''}
                                fromOrigin={trip.fromOrigin}
                                toDestination={trip.toDestination}
                                type='outgoing'
                                confirmed={trip.confirmed}
                              />
                            </div>
                          ))}
                        </div>
                        {isAdmin && (
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
                        )}
                      </div>
                    </div>
                    
                    <div className="pob-footer">
                      POB: {day.pob}
                    </div>
                  </div>
                ))}
              </div>
            );
          })
        ) : (
          <div className="no-data-message">
            No trip data available for the selected location and date range
          </div>
        )}
      </div>

      {isAdmin && (
        <>
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
        </>
      )}
    </div>
  );
};

export default HeliPage;