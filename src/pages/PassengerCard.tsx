import './PassengerCard.css';

interface PassengerCardProps {
  firstName: string;
  lastName: string;
  jobRole: string;
  fromOrigin: string;
  toDestination: string;
  type: 'incoming' | 'outgoing';
  confirmed: boolean;
}

export default function PassengerCard({ 
  firstName, 
  lastName, 
  jobRole, 
  fromOrigin, 
  toDestination,
  type,
  confirmed
}: PassengerCardProps) {
  const fullName = `${firstName} ${lastName}`;
  const tooltipContent = `
    Name: ${fullName}
    Role: ${jobRole || 'N/A'}
    Route: ${fromOrigin} → ${toDestination}
    Type: ${type}
    Status: ${confirmed ? 'Confirmed' : 'Pending'}
  `;

  return (
    <div className={`passenger-card ${type} ${confirmed ? 'confirmed' : 'unconfirmed'}`}>
      <div className="passenger-info">
        <div className="passenger-name" data-tooltip={tooltipContent.trim()}>
          {firstName} {lastName}
        </div>
      </div>
      <div className="passenger-route">
        {type !== 'outgoing' && <span className="route-location">{fromOrigin}</span>}
        <span className={`route-arrow ${type}`}>→</span>
        {type !== 'incoming' && <span className="route-location">{toDestination}</span>}
      </div>
    </div>
  );
}