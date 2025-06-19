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
  return (
    <div className={`passenger-card ${type} ${confirmed ? 'confirmed' : 'unconfirmed'}`}>
      <div>
        <div className="passenger-name">
          {firstName} {lastName}
        </div>
        <div className="passenger-job">
          {jobRole}
        </div>
      </div>
      <div className="passenger-route">
        <span>{fromOrigin}</span>
        <span className={`route-arrow ${type}`}>→</span>
        <span>{toDestination}</span>
      </div>
    </div>
  );
}