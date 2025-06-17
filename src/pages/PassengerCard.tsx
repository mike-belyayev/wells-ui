interface PassengerCardProps {
  firstName: string;
  lastName: string;
  jobRole: string;
  fromOrigin: string;
  toDestination: string;
  type: 'incoming' | 'outgoing';
}

export default function PassengerCard({ 
  firstName, 
  lastName, 
  jobRole, 
  fromOrigin, 
  toDestination,
  type 
}: PassengerCardProps) {
  // Define colors based on trip type
  const backgroundColor = type === 'incoming' ? '#2e7d32' : '#1565c0'; // Dark green for incoming, dark blue for outgoing
  const arrowColor = type === 'incoming' ? '#a5d6a7' : '#90caf9'; // Light green/blue for arrow

  return (
    <div style={{
      marginBottom: '3px',
      fontSize: '0.75rem',
      padding: '8px',
      borderRadius: '4px',
      backgroundColor: backgroundColor,
      color: 'white',
      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div>
        <div style={{ 
          fontWeight: 'bold',
          fontSize: '0.8rem'
        }}>
          {firstName} {lastName}
        </div>
        <div style={{ 
          fontSize: '0.7rem',
          opacity: 0.9
        }}>
          {jobRole}
        </div>
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '0.7rem'
      }}>
        <span>{fromOrigin}</span>
        <span style={{ color: arrowColor }}>→</span>
        <span>{toDestination}</span>
      </div>
    </div>
  );
}