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
  // jobRole, 
  fromOrigin, 
  toDestination,
  type,
  confirmed
}: PassengerCardProps) {
  return (
    <div className={`passenger-card ${type} ${confirmed ? 'confirmed' : 'unconfirmed'}`}>
      <div className="passenger-info">
        <div className="passenger-name" title={`${firstName} ${lastName}`}>
          {firstName} {lastName}
        </div>
        {/* {jobRole && (
          <div className="passenger-job" title={jobRole}>
            {jobRole}
          </div>
        )} */}
      </div>
      <div className="passenger-route">
        {type !== 'outgoing' && <span className="route-location">{fromOrigin}</span>}
        <span className={`route-arrow ${type}`}>→</span>
        {type !== 'incoming' && <span className="route-location">{toDestination}</span>}
      </div>
    </div>
  );
}