import React, { useState, useEffect } from 'react';
import { CalendarEvent } from '../../services/serviceInterfaces';
import { GoogleCalendarService } from '../../services/googleCalendarService';

interface CalendarWidgetProps {
  clientId?: string;
  clientSecret?: string;
}

const CalendarIntegrationWidget: React.FC<CalendarWidgetProps> = ({ clientId = '', clientSecret = '' }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [calendarService] = useState(new GoogleCalendarService(clientId, clientSecret));
  
  useEffect(() => {
    // Fetch calendar events for today and upcoming days
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    calendarService.getEvents(today, nextWeek)
      .then(fetchedEvents => {
        setEvents(fetchedEvents);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch calendar events');
        setLoading(false);
        console.error('Calendar error:', err);
      });
  }, [calendarService]);
  
  // Format date/time for display
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };
  
  if (loading) {
    return <div>Loading calendar events...</div>;
  }
  
  if (error) {
    return <div>{error}</div>;
  }
  
  // Group events by day
  const eventsByDay: { [date: string]: CalendarEvent[] } = {};
  events.forEach(event => {
    const eventDate = formatDate(event.startTime);
    if (!eventsByDay[eventDate]) {
      eventsByDay[eventDate] = [];
    }
    eventsByDay[eventDate].push(event);
  });
  
  return (
    <div className="calendar-widget">
      <div className="service-info">
        <div className="service-connection">
          {calendarService.isConnected ? (
            <span className="connected">Connected to {calendarService.name}</span>
          ) : (
            <button 
              onClick={() => calendarService.connect()}
              className="connect-button"
            >
              Connect to Google Calendar
            </button>
          )}
        </div>
      </div>
      
      <div className="events-container">
        {Object.keys(eventsByDay).length === 0 ? (
          <p>No upcoming events</p>
        ) : (
          Object.entries(eventsByDay).map(([date, dayEvents]) => (
            <div key={date} className="event-day">
              <h4 className="day-heading">{date}</h4>
              <ul className="event-list">
                {dayEvents.map(event => (
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
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CalendarIntegrationWidget;
