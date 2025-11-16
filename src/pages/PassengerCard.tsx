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
      <div className="passenger-content" data-tooltip={tooltipContent.trim()}>
        {numberOfPassengers && numberOfPassengers > 0 && (
          <span className="passenger-count">[{numberOfPassengers}] </span>
        )}
        <span className="passenger-name">{firstName} {lastName}</span>
        {jobRole && (
          <span className="passenger-job">
            {jobRole.length > 20 ? `${jobRole.substring(0, 20)}...` : jobRole}
          </span>
        )}
        <span className="passenger-route">
          {type !== 'outgoing' && <span className="route-location">{fromOrigin}</span>}
          <span className={`route-arrow ${type}`}>→</span>
          {type !== 'incoming' && <span className="route-location">{toDestination}</span>}
        </span>
      </div>
    </div>
  );
}