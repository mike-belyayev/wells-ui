import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
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

interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
}

export default function HeliCalendar() {
  const [date] = useState(new Date());
  
  const events: CalendarEvent[] = [
    {
      title: 'Heli Maintenance',
      start: new Date(2023, 10, 15),
      end: new Date(2023, 10, 16),
    },
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