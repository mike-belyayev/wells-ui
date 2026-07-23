// src/hooks/useDragAndDrop.ts
import { useState, useCallback } from 'react';
import type { Trip, TripType } from '../types';
import { API_ENDPOINTS } from '../config/api';
import { format } from 'date-fns';
import { getSortKey } from '../utils/sortUtils';

export const useDragAndDrop = (
  isAdmin: boolean,
  userToken: string | undefined,
  currentLocation: string,
  trips: Trip[],
  setTrips: React.Dispatch<React.SetStateAction<Trip[]>>,
  fetchData: () => Promise<void>
) => {
  const [draggedTrip, setDraggedTrip] = useState<{
    trip: Trip;
    type: TripType;
    sourceDate: string;
  } | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = useCallback((trip: Trip, type: TripType) => {
    if (!isAdmin) return;
    setDraggedTrip({ trip, type, sourceDate: trip.tripDate });
    setIsDragging(true);
  }, [isAdmin]);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    if (!isAdmin || !draggedTrip) return;
    e.preventDefault();
    setDragOverIndex(index);
  }, [isAdmin, draggedTrip]);

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedTrip(null);
    setDragOverIndex(null);
    setIsDragging(false);
  }, []);

  const handleDropReorder = useCallback(async (
    targetTrip: Trip, 
    type: TripType,
    targetIndex: number
  ) => {
    if (!isAdmin || !draggedTrip || draggedTrip.trip._id === targetTrip._id || !userToken) return;
    
    try {
      const dateStr = targetTrip.tripDate;
      
      const sameDateTrips = trips.filter(t => 
        t.tripDate === dateStr &&
        ((type === 'incoming' && t.toDestination === currentLocation) ||
         (type === 'outgoing' && t.fromOrigin === currentLocation))
      );
      
      const draggedIndex = sameDateTrips.findIndex(t => t._id === draggedTrip.trip._id);
      if (draggedIndex === -1) return;
      
      const reorderedTrips = [...sameDateTrips];
      const [movedTrip] = reorderedTrips.splice(draggedIndex, 1);
      
      const adjustedTargetIndex = draggedIndex < targetIndex ? targetIndex - 1 : targetIndex;
      reorderedTrips.splice(adjustedTargetIndex, 0, movedTrip);
      
      const updatePromises = reorderedTrips.map((trip, index) => {
        const sortKey = getSortKey(currentLocation, type);
        const newSortIndices = { ...trip.sortIndices, [sortKey]: index };
        
        return fetch(API_ENDPOINTS.TRIP_SORT(trip._id), {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`
          },
          body: JSON.stringify({ sortIndices: newSortIndices })
        });
      });
      
      await Promise.all(updatePromises);
      
      setTrips(prevTrips => 
        prevTrips.map(trip => {
          const updatedTrip = reorderedTrips.find(rt => rt._id === trip._id);
          if (updatedTrip) {
            const newIndex = reorderedTrips.findIndex(rt => rt._id === trip._id);
            const sortKey = getSortKey(currentLocation, type);
            return {
              ...trip,
              sortIndices: {
                ...trip.sortIndices,
                [sortKey]: newIndex
              }
            };
          }
          return trip;
        })
      );
      
      setDraggedTrip(null);
      setDragOverIndex(null);
      setIsDragging(false);
      
    } catch (error) {
      console.error('Error reordering trips:', error);
      fetchData();
    }
  }, [isAdmin, userToken, currentLocation, trips, setTrips, draggedTrip, fetchData]);

  const handleDropMoveDate = useCallback(async (date: Date, type: TripType) => {
    if (!isAdmin || !draggedTrip || draggedTrip.type !== type || !userToken) return;
    
    try {
      const newDateStr = format(date, 'yyyy-MM-dd');
      
      const updatedTrip = {
        ...draggedTrip.trip,
        tripDate: newDateStr,
        sortIndices: {
          ...draggedTrip.trip.sortIndices,
          [getSortKey(currentLocation, type)]: 0
        }
      };
      
      const response = await fetch(API_ENDPOINTS.TRIP_BY_ID(draggedTrip.trip._id), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify(updatedTrip)
      });
      
      if (!response.ok) throw new Error('Failed to move trip');
      
      setTrips(prevTrips => 
        prevTrips.map(t => t._id === draggedTrip.trip._id ? updatedTrip : t)
      );
      
      setDraggedTrip(null);
      setIsDragging(false);
      
    } catch (error) {
      console.error('Error moving trip:', error);
    }
  }, [isAdmin, userToken, currentLocation, draggedTrip, setTrips]);

  // NEW: Arrow sorting functions
  const handleMoveUp = useCallback(async (
    tripId: string,
    date: string,
    type: TripType
  ) => {
    if (!isAdmin || !userToken) return;
    
    try {
      const sortKey = getSortKey(currentLocation, type);
      
      // Get all trips for this date and type
      const dateTrips = trips.filter(t => 
        t.tripDate === date &&
        ((type === 'incoming' && t.toDestination === currentLocation) ||
         (type === 'outgoing' && t.fromOrigin === currentLocation))
      );
      
      // Sort by sortIndices
      const sortedTrips = [...dateTrips].sort((a, b) => {
        const aIndex = a.sortIndices?.[sortKey] ?? 0;
        const bIndex = b.sortIndices?.[sortKey] ?? 0;
        return aIndex - bIndex;
      });
      
      const currentIndex = sortedTrips.findIndex(t => t._id === tripId);
      
      if (currentIndex <= 0) return; // Already at top
      
      // Swap sort indices
      const tripToMove = sortedTrips[currentIndex];
      const tripAbove = sortedTrips[currentIndex - 1];
      
      const tripToMoveIndex = tripToMove.sortIndices?.[sortKey] ?? 0;
      const tripAboveIndex = tripAbove.sortIndices?.[sortKey] ?? 0;
      
      // Update both trips
      const updatedTripToMove = {
        ...tripToMove,
        sortIndices: {
          ...tripToMove.sortIndices,
          [sortKey]: tripAboveIndex
        }
      };
      
      const updatedTripAbove = {
        ...tripAbove,
        sortIndices: {
          ...tripAbove.sortIndices,
          [sortKey]: tripToMoveIndex
        }
      };
      
      // Save to API
      await fetch(API_ENDPOINTS.TRIP_SORT(tripToMove._id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({ sortIndices: updatedTripToMove.sortIndices }),
      });
      
      await fetch(API_ENDPOINTS.TRIP_SORT(tripAbove._id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({ sortIndices: updatedTripAbove.sortIndices }),
      });
      
      // Update local state
      setTrips(prevTrips => {
        return prevTrips.map(t => {
          if (t._id === tripToMove._id) return updatedTripToMove;
          if (t._id === tripAbove._id) return updatedTripAbove;
          return t;
        });
      });
      
    } catch (error) {
      console.error('Error moving trip up:', error);
      await fetchData();
    }
  }, [isAdmin, userToken, currentLocation, trips, setTrips, fetchData]);

  const handleMoveDown = useCallback(async (
    tripId: string,
    date: string,
    type: TripType
  ) => {
    if (!isAdmin || !userToken) return;
    
    try {
      const sortKey = getSortKey(currentLocation, type);
      
      // Get all trips for this date and type
      const dateTrips = trips.filter(t => 
        t.tripDate === date &&
        ((type === 'incoming' && t.toDestination === currentLocation) ||
         (type === 'outgoing' && t.fromOrigin === currentLocation))
      );
      
      // Sort by sortIndices
      const sortedTrips = [...dateTrips].sort((a, b) => {
        const aIndex = a.sortIndices?.[sortKey] ?? 0;
        const bIndex = b.sortIndices?.[sortKey] ?? 0;
        return aIndex - bIndex;
      });
      
      const currentIndex = sortedTrips.findIndex(t => t._id === tripId);
      
      if (currentIndex >= sortedTrips.length - 1) return; // Already at bottom
      
      // Swap sort indices
      const tripToMove = sortedTrips[currentIndex];
      const tripBelow = sortedTrips[currentIndex + 1];
      
      const tripToMoveIndex = tripToMove.sortIndices?.[sortKey] ?? 0;
      const tripBelowIndex = tripBelow.sortIndices?.[sortKey] ?? 0;
      
      // Update both trips
      const updatedTripToMove = {
        ...tripToMove,
        sortIndices: {
          ...tripToMove.sortIndices,
          [sortKey]: tripBelowIndex
        }
      };
      
      const updatedTripBelow = {
        ...tripBelow,
        sortIndices: {
          ...tripBelow.sortIndices,
          [sortKey]: tripToMoveIndex
        }
      };
      
      // Save to API
      await fetch(API_ENDPOINTS.TRIP_SORT(tripToMove._id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({ sortIndices: updatedTripToMove.sortIndices }),
      });
      
      await fetch(API_ENDPOINTS.TRIP_SORT(tripBelow._id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({ sortIndices: updatedTripBelow.sortIndices }),
      });
      
      // Update local state
      setTrips(prevTrips => {
        return prevTrips.map(t => {
          if (t._id === tripToMove._id) return updatedTripToMove;
          if (t._id === tripBelow._id) return updatedTripBelow;
          return t;
        });
      });
      
    } catch (error) {
      console.error('Error moving trip down:', error);
      await fetchData();
    }
  }, [isAdmin, userToken, currentLocation, trips, setTrips, fetchData]);

  return {
    draggedTrip,
    dragOverIndex,
    isDragging,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDragEnd,
    handleDropReorder,
    handleDropMoveDate,
    handleMoveUp,    // NEW
    handleMoveDown   // NEW
  };
};