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
  tripDate?: string; // Trip date to determine if it's past
}

export default function PassengerCard({ 
  firstName, 
  lastName, 
  jobRole, 
  fromOrigin, 
  toDestination,
  type,
  confirmed,
  numberOfPassengers,
  tripDate
}: PassengerCardProps) {
  const fullName = `${firstName} ${lastName}`;
  
  // Get the relevant location for display
  const displayLocation = type === 'incoming' ? fromOrigin : toDestination;
  
  // Helper function to create a local date from a date string or Date object
  const getLocalDate = (dateInput: string | Date): Date => {
    let date: Date;
    if (typeof dateInput === 'string') {
      // Parse the date string in local timezone
      const [year, month, day] = dateInput.split('T')[0].split('-').map(Number);
      date = new Date(year, month - 1, day);
    } else {
      date = new Date(dateInput);
    }
    // Return date at midnight in local timezone
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };
  
  // Determine if this trip is in the past (yesterday or earlier)
  // Today's trips should NOT be greyed out
  const isPastTrip = (() => {
    if (!tripDate) return false;
    
    const tripLocalDate = getLocalDate(tripDate);
    const today = new Date();
    const todayLocalDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    // Trip is past if it's before today (yesterday or earlier)
    return tripLocalDate < todayLocalDate;
  })();
  
  // Get site abbreviation
  const getSiteAbbreviation = (site: string): string => {
    const siteUpper = site.toUpperCase();
    switch (siteUpper) {
      case 'STC': return 'STC';
      case 'NTM': return 'NTM';
      case 'NBD': return 'NBD';
      case 'NSC': return 'NSC';
      case 'OGLE': return '';
      case 'NDT': return 'NDT';
      default: return site.length > 3 ? site.substring(0, 3).toUpperCase() : site.toUpperCase();
    }
  };

  const siteAbbreviation = getSiteAbbreviation(displayLocation);
  const shouldShowSiteText = siteAbbreviation !== ''; // Only show if not empty (not Ogle)
  
  // Determine if this is a group trip
  const isGroupTrip = numberOfPassengers && numberOfPassengers > 1;
  
  // Base classes
  const baseClasses = `passenger-card ${type} ${confirmed ? 'confirmed' : 'unconfirmed'}`;
  
  // Add past trip class only for trips from yesterday or earlier
  const pastClass = isPastTrip ? 'past-trip' : '';
  
  // Add group trip class
  const groupClass = isGroupTrip ? 'group-trip' : '';

  return (
    <div 
      className={`${baseClasses} ${pastClass} ${groupClass}`}
    >
      <div className="passenger-content">
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
      </div>
      
      {/* Site text on right edge - only show if not Ogle */}
      {shouldShowSiteText && (
        <div className="site-text" title={displayLocation}>
          {siteAbbreviation}
        </div>
      )}
    </div>
  );
}