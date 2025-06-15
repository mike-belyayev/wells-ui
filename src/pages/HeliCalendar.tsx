import { useState, useEffect } from 'react';
import { format, addWeeks, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

interface DayData {
  date: Date;
  incoming: string[];
  outgoing: string[];
  pob: number;
}

export default function HeliDashboard() {
  const [currentDate] = useState(new Date());
  
  // Generate 3 weeks of data
  const generateWeeks = (): DayData[][] => {
    return Array.from({ length: 3 }, (_, weekIndex) => {
      const weekStart = startOfWeek(addWeeks(currentDate, weekIndex));
      const weekEnd = endOfWeek(weekStart);
      const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
      
      return days.map(date => ({
        date,
        incoming: ['John D.', 'Jane S.', 'Alex M.', 'Taylor K.'], // Sample data
        outgoing: ['Mike J.', 'Sarah W.', 'Chris P.', 'Pat L.'],
        pob: Math.floor(Math.random() * 50) + 100 // Random POB between 100-150
      }));
    });
  };

  const [weeksData, setWeeksData] = useState<DayData[][]>([]);

  useEffect(() => {
    setWeeksData(generateWeeks());
  }, []);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      margin: 0,
      padding: '10px',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      backgroundColor: '#f5f5f5',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h2 style={{ 
        margin: '0 0 10px 0', 
        textAlign: 'center',
        fontSize: '1.5rem'
      }}>
        Helicopter Passenger Dashboard
      </h2>
      
      {/* Column Headers - Days of Week */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '80px repeat(7, 1fr)',
        height: '40px',
        backgroundColor: '#2c3e50',
        color: 'white',
        fontWeight: 'bold'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRight: '1px solid #3d5166'
        }}>
          {/* Empty corner cell */}
        </div>
        {daysOfWeek.map((day, index) => (
          <div key={index} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRight: index < 6 ? '1px solid #3d5166' : 'none',
            fontSize: '0.9rem'
          }}>
            {day}
          </div>
        ))}
      </div>
      
      {/* Week Rows */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        border: '1px solid #ddd'
      }}>
        {weeksData.map((week, weekIndex) => (
          <div key={weekIndex} style={{
            display: 'grid',
            gridTemplateColumns: '80px repeat(7, 1fr)',
            height: '33.33%',
            minHeight: '200px',
            borderBottom: weekIndex < 2 ? '1px solid #ddd' : 'none'
          }}>
            {/* Row Header - Incoming/Outgoing Labels */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#ecf0f1',
              borderRight: '1px solid #ddd'
            }}>
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#e6f7e6', // Light green
                borderBottom: '1px solid #ddd',
                fontWeight: 'bold',
                color: '#2e7d32',
                fontSize: '0.85rem',
                writingMode: 'vertical-rl',
                transform: 'rotate(180deg)'
              }}>
                Incoming
              </div>
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#e6f3f7', // Light blue
                fontWeight: 'bold',
                color: '#1565c0',
                fontSize: '0.85rem',
                writingMode: 'vertical-rl',
                transform: 'rotate(180deg)'
              }}>
                Outgoing
              </div>
            </div>
            
            {/* Day Cells */}
            {week.map((day, dayIndex) => (
              <div key={dayIndex} style={{
                display: 'flex',
                flexDirection: 'column',
                borderRight: dayIndex < 6 ? '1px solid #ddd' : 'none',
                backgroundColor: 'white'
              }}>
                {/* Date Header */}
                <div style={{
                  padding: '5px',
                  textAlign: 'center',
                  borderBottom: '1px solid #eee',
                  fontWeight: 'bold',
                  fontSize: '0.8rem',
                  backgroundColor: '#f8f9fa'
                }}>
                  {format(day.date, 'MMM d')}
                </div>
                
                {/* Passenger Lists - Stacked Vertically */}
                <div style={{ flex: 1 }}>
                  {/* Incoming Section */}
                  <div style={{
                    height: '50%',
                    padding: '5px',
                    borderBottom: '1px solid #eee',
                    backgroundColor: 'rgba(230, 247, 230, 0.3)' // Very light green
                  }}>
                    {day.incoming.map((passenger, i) => (
                      <div key={i} style={{
                        marginBottom: '3px',
                        fontSize: '0.75rem',
                        color: '#2e7d32'
                      }}>
                        {passenger}
                      </div>
                    ))}
                  </div>
                  
                  {/* Outgoing Section */}
                  <div style={{
                    height: '50%',
                    padding: '5px',
                    backgroundColor: 'rgba(230, 243, 247, 0.3)' // Very light blue
                  }}>
                    {day.outgoing.map((passenger, i) => (
                      <div key={i} style={{
                        marginBottom: '3px',
                        fontSize: '0.75rem',
                        color: '#1565c0'
                      }}>
                        {passenger}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* POB Footer */}
                <div style={{
                  padding: '3px',
                  textAlign: 'center',
                  borderTop: '1px solid #eee',
                  fontSize: '0.75rem',
                  backgroundColor: '#f8f9fa',
                  fontWeight: '500'
                }}>
                  POB: {day.pob}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}