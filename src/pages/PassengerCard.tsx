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
      <div className="passenger-info">
        <div className="passenger-name" data-tooltip={tooltipContent.trim()}>
          {firstName} {lastName}
          {numberOfPassengers && numberOfPassengers > 0 && (
            <span className="passenger-count"> ({numberOfPassengers})</span>
          )}
        </div>
        {jobRole && (
          <div className="passenger-job">
            {jobRole}
          </div>
        )}
      </div>
      <div className="passenger-route">
        {type !== 'outgoing' && <span className="route-location">{fromOrigin}</span>}
        <span className={`route-arrow ${type}`}>→</span>
        {type !== 'incoming' && <span className="route-location">{toDestination}</span>}
      </div>
    </div>
  );
}