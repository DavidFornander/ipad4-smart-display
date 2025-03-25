import React, { useState, useEffect } from 'react';

const ClockWidget: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => {
      clearInterval(timerId);
    };
  }, []);
  
  const formatDate = (date: Date) => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    } as Intl.DateTimeFormatOptions;
    
    return date.toLocaleDateString(undefined, options);
  };
  
  return (
    <div className="widget clock-widget">
      <div className="widget-inner">
        <div className="time">
          {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className="date">
          {formatDate(currentTime)}
        </div>
      </div>
    </div>
  );
};

export default ClockWidget;
