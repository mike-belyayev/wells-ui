interface PassengerCardProps {
  firstName: string;
  lastName: string;
  jobRole: string;
  fromOrigin: string;
  toDestination: string;
}

export default function PassengerCard({ firstName, lastName, jobRole, fromOrigin, toDestination }: PassengerCardProps) {
  return (
    <div style={{
      marginBottom: '3px',
      fontSize: '0.75rem',
      padding: '4px',
      borderRadius: '4px',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
    }}>
      <div style={{ fontWeight: 'bold' }}>{firstName} {lastName}</div>
      <div style={{ fontSize: '0.7rem' }}>{jobRole}</div>
      <div style={{ fontSize: '0.65rem', fontStyle: 'italic' }}>
        {fromOrigin} → {toDestination}
      </div>
    </div>
  );
}