// src/components/HeliPage/WeekView.tsx
import React from 'react';
import { format, isPast, isToday } from 'date-fns';
import PassengerCard from './PassengerCard';
import type { DayData, Trip, Site, TripType, Passenger } from '../../types';

interface WeekViewProps {
  week: DayData[];
  currentLocation: string;
  sites: Site[];
  isAdmin: boolean;
  getPassengerById: (id: string) => Passenger | undefined;
  onAddTrip: (date: Date, type: TripType) => void;
  onEditTrip: (trip: Trip) => void;
  onDragStart: (trip: Trip, type: TripType) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragLeave: () => void;
  onDropReorder: (trip: Trip, type: TripType, index: number) => void;
  onDropMoveDate: (date: Date, type: TripType) => void;
  dragOverIndex: number | null;
  draggedTripId?: string;
}

const WeekView: React.FC<WeekViewProps> = ({
  week,
  currentLocation,
  sites,
  isAdmin,
  getPassengerById,
  onAddTrip,
  onEditTrip,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDropReorder,
  onDropMoveDate,
  dragOverIndex,
  draggedTripId
}) => {
  const getPOBStatus = (currentPOB: number, maximumPOB: number): 'normal' | 'warning' | 'critical' => {
    if (currentPOB === 0) return 'normal';
    const percentage = (currentPOB / maximumPOB) * 100;
    if (currentPOB > maximumPOB) return 'critical';
    if (percentage >= 95) return 'warning';
    return 'normal';
  };

  const site = sites.find(s => s.siteName === currentLocation);
  const maximumPOB = site?.maximumPOB || 200;

  // Use the original isToday from date-fns to keep today detection correct
  const isTodayDate = (date: Date): boolean => {
    return isToday(date);
  };

  // For past detection, subtract 1 day so that today is not considered past
  const isPastDate = (date: Date): boolean => {
    const adjustedDate = new Date(date);
    adjustedDate.setDate(adjustedDate.getDate() + 1);
    return isPast(adjustedDate);
  };

  return (
    <div className="week-row">
      {week.map((day, dayIndex) => {
        const isToday = isTodayDate(day.date);
        const isPast = isPastDate(day.date);
        
        // Admin can edit any date, non-admin can only edit future dates (not past and not today)
        const isEditable = isAdmin || (!isPast && !isToday);

        const pobStatus = getPOBStatus(day.pob, maximumPOB);

        return (
          <div key={dayIndex} className={`day-column ${isPast ? 'past-day' : ''}`}>
            <div className={`date-header ${isToday ? 'today' : ''}`}>
              {format(day.date, 'MMM d')}
            </div>
            
            <div className="passenger-lists">
              <div className="sections-container">
                {/* Incoming Section */}
                <div 
                  className="incoming-section"
                  onDragOver={(e) => isEditable && e.preventDefault()}
                  onDrop={(e) => {
                    if (!isEditable) return;
                    e.preventDefault();
                    onDropMoveDate(day.date, 'incoming');
                  }}
                >
                  <div className="passenger-cards-container">
                    {day.incoming.map((trip, index) => (
                      <div
                        key={`${trip._id}-${index}`}
                        className={`passenger-card-container ${
                          !isEditable ? 'readonly' : ''
                        } ${dragOverIndex === index ? 'drag-over' : ''} ${
                          draggedTripId === trip._id ? 'dragging' : ''
                        }`}
                        draggable={isEditable}
                        onDragStart={() => isEditable && onDragStart(trip, 'incoming')}
                        onDragOver={(e) => isEditable && onDragOver(e, index)}
                        onDragLeave={onDragLeave}
                        onDrop={(e) => {
                          if (!isEditable) return;
                          e.preventDefault();
                          onDropReorder(trip, 'incoming', index);
                        }}
                        onClick={() => isEditable && onEditTrip(trip)}
                      >
                        <PassengerCard
                          firstName={getPassengerById(trip.passengerId)?.firstName || ''}
                          lastName={getPassengerById(trip.passengerId)?.lastName || ''}
                          jobRole={getPassengerById(trip.passengerId)?.jobRole || ''}
                          fromOrigin={trip.fromOrigin}
                          toDestination={trip.toDestination}
                          type="incoming"
                          confirmed={trip.confirmed}
                          numberOfPassengers={trip.numberOfPassengers}
                          tripDate={trip.tripDate}
                        />
                      </div>
                    ))}
                  </div>
                  {isEditable && (
                    <button
                      onClick={() => onAddTrip(day.date, 'incoming')}
                      className="add-button"
                      title="Add incoming passenger"
                    >
                      +
                    </button>
                  )}
                </div>
                
                {/* Outgoing Section */}
                <div 
                  className="outgoing-section"
                  onDragOver={(e) => isEditable && e.preventDefault()}
                  onDrop={(e) => {
                    if (!isEditable) return;
                    e.preventDefault();
                    onDropMoveDate(day.date, 'outgoing');
                  }}
                >
                  <div className="passenger-cards-container">
                    {day.outgoing.map((trip, index) => (
                      <div
                        key={`${trip._id}-${index}`}
                        className={`passenger-card-container ${
                          !isEditable ? 'readonly' : ''
                        } ${dragOverIndex === index ? 'drag-over' : ''} ${
                          draggedTripId === trip._id ? 'dragging' : ''
                        }`}
                        draggable={isEditable}
                        onDragStart={() => isEditable && onDragStart(trip, 'outgoing')}
                        onDragOver={(e) => isEditable && onDragOver(e, index)}
                        onDragLeave={onDragLeave}
                        onDrop={(e) => {
                          if (!isEditable) return;
                          e.preventDefault();
                          onDropReorder(trip, 'outgoing', index);
                        }}
                        onClick={() => isEditable && onEditTrip(trip)}
                      >
                        <PassengerCard
                          firstName={getPassengerById(trip.passengerId)?.firstName || ''}
                          lastName={getPassengerById(trip.passengerId)?.lastName || ''}
                          jobRole={getPassengerById(trip.passengerId)?.jobRole || ''}
                          fromOrigin={trip.fromOrigin}
                          toDestination={trip.toDestination}
                          type="outgoing"
                          confirmed={trip.confirmed}
                          numberOfPassengers={trip.numberOfPassengers}
                          tripDate={trip.tripDate}
                        />
                      </div>
                    ))}
                  </div>
                  {isEditable && (
                    <button
                      onClick={() => onAddTrip(day.date, 'outgoing')}
                      className="add-button"
                      title="Add outgoing passenger"
                    >
                      +
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <div className={`pob-footer ${pobStatus} ${isPast ? 'past' : ''}`}>
              POB: {day.pob}
              {day.updateInfo && (
                <span className="pob-update-info">
                  ({day.updateInfo})
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WeekView;