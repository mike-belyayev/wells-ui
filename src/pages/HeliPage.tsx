// src/pages/HeliPage.tsx
import { useState, useEffect, useCallback } from 'react';
import { format, addWeeks, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { AppBar, Toolbar, IconButton, Typography, Box, Button } from '@mui/material';
import { Settings, ChevronLeft, ChevronRight } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../auth/AuthContext';
import LocationDropdown from '../components/HeliPage/LocationDropdown';
import AddTripModal from '../components/HeliPage/AddTripModal';
import EditTripModal from '../components/HeliPage/EditTripModal';
import WeekView from '../components/HeliPage/WeekView';
import { API_ENDPOINTS } from '../config/api';
import type { Trip, TripType } from '../types';
import { calculatePOB } from '../utils/pobCalculations';
import { sortTrips } from '../utils/sortUtils';
import { useTripData } from '../hooks/useTripData';
import { useDragAndDrop } from '../hooks/useDragAndDrop';

import './HeliPage.css';

const HeliPage = () => {
  const { logout, user } = useAuth();
  const isAdmin = user?.isAdmin || false;
  const VISIBLE_WEEKS = 10;
  
  // State
  const [currentLocation, setCurrentLocation] = useState(user?.homeLocation || 'NSC');
  const [weeksData, setWeeksData] = useState<any[][]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCellDate, setSelectedCellDate] = useState<Date>(new Date());
  const [tripType, setTripType] = useState<TripType>('outgoing');
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  
  // Custom hooks
  const { 
    passengers, 
    trips, 
    sites, 
    loading, 
    error, 
    fetchData, 
    setTrips, 
    setPassengers 
  } = useTripData(user?.token);
  
  const {
    draggedTrip,
    dragOverIndex,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDropReorder,
    handleDropMoveDate
  } = useDragAndDrop(isAdmin, user?.token, currentLocation, trips, setTrips, fetchData);
  
  const navigate = useNavigate();
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Update location when user changes
  useEffect(() => {
    if (user?.homeLocation) {
      setCurrentLocation(user.homeLocation);
    }
  }, [user?.homeLocation]);
  
  // Generate weeks data
  const generateWeeks = useCallback(() => {
    return Array.from({ length: VISIBLE_WEEKS }, (_, relativeOffset) => {
      const weekStart = startOfWeek(addWeeks(new Date(), weekOffset + relativeOffset));
      const weekEnd = endOfWeek(weekStart);
      const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
      
      return days.map(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const relevantTrips = trips.filter(trip => trip.tripDate === dateStr);
        const pobResult = calculatePOB(date, currentLocation, trips, sites);
        
        return {
          date,
          incoming: sortTrips(
            relevantTrips.filter(trip => trip.toDestination === currentLocation),
            currentLocation,
            'incoming',
            getPassengerById
          ),
          outgoing: sortTrips(
            relevantTrips.filter(trip => trip.fromOrigin === currentLocation),
            currentLocation,
            'outgoing',
            getPassengerById
          ),
          pob: pobResult.pob,
          updateInfo: pobResult.updateInfo
        };
      });
    });
  }, [trips, currentLocation, weekOffset, sites, passengers]);
  
  useEffect(() => {
    const generatedWeeks = generateWeeks();
    setWeeksData(generatedWeeks);
  }, [generateWeeks]);
  
  // Helper functions
  const getPassengerById = useCallback((passengerId: string) => {
    return passengers.find(p => p._id === passengerId);
  }, [passengers]);
  
  const handleAddPassenger = async (passengerData: { firstName: string; lastName: string; jobRole: string }) => {
    try {
      const response = await fetch(API_ENDPOINTS.PASSENGERS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify(passengerData),
      });
      
      if (!response.ok) throw new Error('Failed to add passenger');
      
      const newPassenger = await response.json();
      const passengersResponse = await fetch(API_ENDPOINTS.PASSENGERS, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (passengersResponse.ok) {
        const allPassengers = await passengersResponse.json();
        setPassengers(allPassengers);
      } else {
        setPassengers(prev => [...prev, newPassenger]);
      }
      
      return newPassenger;
    } catch (error) {
      console.error('Error adding passenger:', error);
      throw error;
    }
  };
  
  const handleAddTrip = async (tripData: {
    passengerId: string;
    fromOrigin: string;
    toDestination: string;
    tripDate: string;
    confirmed: boolean;
    numberOfPassengers?: number;
  }) => {
    if (!isAdmin) return;
    
    try {
      const response = await fetch(API_ENDPOINTS.TRIPS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify(tripData),
      });
      
      if (!response.ok) throw new Error('Failed to add trip');
      
      const newTrip = await response.json();
      setTrips(prev => [...prev, newTrip]);
    } catch (error) {
      console.error('Error adding trip:', error);
    }
  };
  
  const handleUpdateTrip = async (updatedTrip: Trip) => {
    if (!isAdmin) return;
    
    try {
      const response = await fetch(API_ENDPOINTS.TRIP_BY_ID(updatedTrip._id), {
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
      
      const response = await fetch(API_ENDPOINTS.TRIP_BY_ID(tripId), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      
      if (!response.ok && response.status !== 404) {
        const tripsRes = await fetch(API_ENDPOINTS.TRIPS);
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
  
  // Navigation
  const handlePrevWeek = () => setWeekOffset(prev => prev - VISIBLE_WEEKS);
  const handleNextWeek = () => setWeekOffset(prev => prev + VISIBLE_WEEKS);
  const handleToday = () => setWeekOffset(0);
  
  const getWeekRangeDisplay = () => {
    if (weeksData.length === 0) return '';
    const firstWeek = weeksData[0][0].date;
    const lastWeek = weeksData[VISIBLE_WEEKS - 1][6].date;
    return `${format(firstWeek, 'MMM d')} - ${format(lastWeek, 'MMM d, yyyy')}`;
  };
  
  // Loading/error states
  if (loading) return <div className="loading-container">Loading dashboard data...</div>;
  if (error) return <div className="error-container">Error: {error}</div>;
  
  return (
    <div className="dashboard-container">
      {/* Complete Header with Navigation Controls */}
      <AppBar 
        position="static" 
        sx={{ 
          backgroundColor: '#121212',
          color: 'white',
          backgroundImage: 'none',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)'
        }}
      >
        <Toolbar sx={{ 
          justifyContent: 'space-between', 
          gap: 2,
          minHeight: '64px'
        }}>
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
                color: 'rgba(255, 255, 255, 0.7)'
              }}>
                {getWeekRangeDisplay()}
              </Typography>
              
              <IconButton onClick={handleNextWeek} size="small">
                <ChevronRight />
              </IconButton>
            </Box>
          </Box>

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
{/* Developer Credit Section */}
<Box sx={{ 
  display: 'flex', 
  flexDirection: 'column',
  gap: 0.5,
}}>
  <Typography 
    variant="caption" 
    sx={{ 
      color: '#32cd32',
      fontSize: '0.65rem',
      lineHeight: 1.2,
      fontWeight: 500,
      letterSpacing: 0.3
    }}
  >
    App developed for Wells Team by:
  </Typography>
  <Typography 
    variant="caption" 
    sx={{ 
      color: '#32cd32',
      fontSize: '0.65rem',
      lineHeight: 1.2,
      fontWeight: 500,
      letterSpacing: 0.3
    }}
  >
    Mike.Belyayev@exxonmobil.com
  </Typography>
</Box>
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
              {user?.userName}
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
        {daysOfWeek.map((day, index) => (
          <div key={index} className="day-cell">{day}</div>
        ))}
      </div>
      
      <div className="weeks-scroll-container">
        {weeksData.length > 0 ? (
          weeksData.map((week, weekIndex) => (
            <WeekView
              key={weekIndex}
              week={week}
              currentLocation={currentLocation}
              sites={sites}
              isAdmin={isAdmin}
              getPassengerById={getPassengerById}
              onAddTrip={(date, type) => {
                setSelectedCellDate(date);
                setModalOpen(true);
                setTripType(type);
              }}
              onEditTrip={setEditingTrip}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDropReorder={handleDropReorder}
              onDropMoveDate={handleDropMoveDate}
              dragOverIndex={dragOverIndex}
              draggedTripId={draggedTrip?.trip._id}
            />
          ))
        ) : (
          <div className="no-data-message">
            No trip data available for the selected location and date range
          </div>
        )}
      </div>
      
      {/* Modals */}
      {isAdmin && (
        <>
          <AddTripModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            passengers={passengers}
            selectedDate={selectedCellDate}
            tripType={tripType}
            currentLocation={currentLocation}
            userHomeBase={user?.homeLocation || 'NSC'}
            onSubmit={handleAddTrip}
            onAddPassenger={handleAddPassenger}
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