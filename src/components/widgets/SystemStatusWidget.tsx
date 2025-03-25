import React, { useState, useEffect } from 'react';

// Note: These system APIs aren't fully available in browsers, 
// especially in iOS Safari, so we use what's available
const SystemStatusWidget: React.FC = () => {
  const [online, setOnline] = useState<boolean>(navigator.onLine);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  
  useEffect(() => {
    // Handle online/offline events
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Update time
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(timerId);
    };
  }, []);
  
  // Format time into hours:minutes
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className="widget system-widget">
      <div className="widget-inner">
        <h3 className="widget-title">System Status</h3>
        
        <div className="status-item">
          <span className="status-label">Network:</span>
          <span className={`status-value ${online ? 'online' : 'offline'}`}>
            {online ? 'Online' : 'Offline'}
          </span>
        </div>
        
        <div className="status-item">
          <span className="status-label">Time:</span>
          <span className="status-value">{formatTime(currentTime)}</span>
        </div>
        
        {/* Note: Battery API is not available in iOS Safari 10 */}
        <div className="status-note">
          <p>Battery information is not available in Safari on iOS.</p>
        </div>
      </div>
    </div>
  );
};

export default SystemStatusWidget;
