import './PassengerCard.css';

interface PassengerCardProps {
  firstName: string;
  lastName: string;
  jobRole: string;
  fromOrigin: string;
  toDestination: string;
  type: 'incoming' | 'outgoing';
  confirmed: boolean;
  numberOfPassengers?: number;
}

export default function PassengerCard({ 
  firstName, 
  lastName, 
  jobRole, 
  fromOrigin, 
  toDestination,
  type,
  confirmed,
  numberOfPassengers
}: PassengerCardProps) {
  const fullName = `${firstName} ${lastName}`;
  const location = type === 'incoming' ? fromOrigin : toDestination;
  
  // Build tooltip content including number of passengers if defined
  const tooltipContent = `
    Name: ${fullName}
    Role: ${jobRole || 'N/A'}
    Route: ${fromOrigin} → ${toDestination}
    Type: ${type}
    Status: ${confirmed ? 'Confirmed' : 'Pending'}
    ${numberOfPassengers ? `Passengers: ${numberOfPassengers}` : ''}
  `;

  return (
    <div className={`passenger-card ${type} ${confirmed ? 'confirmed' : 'unconfirmed'}`}>
      <div className="passenger-content" data-tooltip={tooltipContent.trim()}>
        <div className="passenger-main-info">
          {numberOfPassengers && numberOfPassengers > 0 && (
            <span className="passenger-count">[{numberOfPassengers}]</span>
          )}
          <div className="passenger-text">
            <div className="passenger-name">
              {fullName}
            </div>
            {jobRole && (
              <div className="passenger-job">
                {jobRole}
              </div>
            )}
          </div>
        </div>
        <div className="passenger-direction">
          <span className="direction-location">{location}</span>
          <span className="direction-arrow">{type === 'incoming' ? '←' : '→'}</span>
        </div>
      </div>
    </div>
  );
}