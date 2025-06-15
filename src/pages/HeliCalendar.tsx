import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useState } from 'react';

const locales = {
  'en-US': enUS
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function HeliCalendar() {
  const [date] = useState(new Date());
  
  // Generate 3 weeks of dates (current week + 2 more)
  const events = [
    {
      title: 'Heli Maintenance',
      start: new Date(2023, 10, 15),
      end: new Date(2023, 10, 16),
    },
    // Add more events as needed
  ];

  return (
    <div style={{ height: '100vh', padding: '20px' }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView="week"
        views={['week', 'day']}
        date={date}
        onNavigate={(newDate: Date) => console.log('Navigate to:', newDate)}
      />
    </div>
  );
}