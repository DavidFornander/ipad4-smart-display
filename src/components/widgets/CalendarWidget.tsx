import React, { useState, useEffect } from 'react';

interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  location?: string;
}

const CalendarWidget: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate] = useState<Date>(new Date());
  
  useEffect(() => {
    fetchEvents();
    
    // Refresh events every hour
    const intervalId = setInterval(fetchEvents, 60 * 60 * 1000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);
  
  const fetchEvents = () => {
    setLoading(true);
    
    // Mock API call (replace with actual API in production)
    // Using Promise instead of async/await for iOS 10 compatibility
    new Promise<CalendarEvent[]>((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: '1',
            title: 'Team Meeting',
            startTime: '2023-03-15T10:00:00',
            endTime: '2023-03-15T11:00:00',
            location: 'Conference Room A'
          },
          {
            id: '2',
            title: 'Lunch with Client',
            startTime: '2023-03-15T12:30:00',
            endTime: '2023-03-15T13:30:00',
            location: 'Downtown Café'
          },
          {
            id: '3',
            title: 'Project Deadline',
            startTime: '2023-03-15T17:00:00',
            endTime: '2023-03-15T17:00:00'
          },
          {
            id: '4',
            title: 'Gym Class',
            startTime: '2023-03-15T18:30:00',
            endTime: '2023-03-15T19:30:00',
            location: 'Fitness Center'
          }
        ]);
      }, 500);
    })
    .then(data => {
      setEvents(data);
      setLoading(false);
      setError(null);
    })
    .catch(err => {
      setError('Failed to load events');
      setLoading(false);
    });
  };
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formattedDate = currentDate.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });
  
  if (loading && events.length === 0) {
    return <div className="widget calendar-widget">Loading events...</div>;
  }
  
  if (error && events.length === 0) {
    return <div className="widget calendar-widget">Error: {error}</div>;
  }
  
  return (
    <div className="widget calendar-widget">
      <div className="widget-inner">
        <h3 className="widget-title">Calendar</h3>
        <div className="calendar-date">{formattedDate}</div>
        
        {events.length === 0 ? (
          <p className="no-events">No events scheduled for today.</p>
        ) : (
          <ul className="event-list">
            {events.map(event => (
              <li key={event.id} className="event-item">
                <div className="event-time">
                  {formatTime(event.startTime)} - {formatTime(event.endTime)}
                </div>
                <div className="event-details">
                  <div className="event-title">{event.title}</div>
                  {event.location && <div className="event-location">{event.location}</div>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CalendarWidget;
