import React, { useState, useEffect } from 'react';
import styles from '../../styles/WidgetStyles.module.css';
import { retrieveWidgetSettings, storeWidgetSettings } from '../../utils/storageService';

type ClockType = 'digital' | 'analog';

const ClockWidget: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [clockType, setClockType] = useState<ClockType>('digital');
  const [showSettings, setShowSettings] = useState(false);
  
  // Load saved settings
  useEffect(() => {
    const settings = retrieveWidgetSettings<{ clockType: ClockType }>('clock');
    if (settings && settings.clockType) {
      setClockType(settings.clockType);
    }
  }, []);
  
  // Update clock every second
  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => {
      clearInterval(timerId);
    };
  }, []);
  
  const saveClockType = (type: ClockType) => {
    setClockType(type);
    storeWidgetSettings('clock', { clockType: type });
  };
  
  // Format date for display
  const formattedDate = currentTime.toLocaleDateString(undefined, { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  // Compute clock hand rotations for analog clock
  const hours = currentTime.getHours() % 12;
  const minutes = currentTime.getMinutes();
  const seconds = currentTime.getSeconds();
  
  const hourRotation = (hours * 30) + (minutes * 0.5); // 30 degrees per hour + 0.5 degrees per minute
  const minuteRotation = minutes * 6; // 6 degrees per minute
  const secondRotation = seconds * 6; // 6 degrees per second
  
  return (
    <div className={styles.clockWidget}>
      {showSettings ? (
        <div className={styles.clockSettings}>
          <h4>Clock Display</h4>
          <div className={styles.settingOptions}>
            <label>
              <input 
                type="radio" 
                name="clockType" 
                value="digital" 
                checked={clockType === 'digital'} 
                onChange={() => saveClockType('digital')}
              />
              Digital
            </label>
            <label>
              <input 
                type="radio" 
                name="clockType" 
                value="analog" 
                checked={clockType === 'analog'} 
                onChange={() => saveClockType('analog')}
              />
              Analog
            </label>
          </div>
          <button onClick={() => setShowSettings(false)}>Close</button>
        </div>
      ) : (
        <>
          {clockType === 'digital' ? (
            <>
              <div className={styles.digitalClock}>
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className={styles.date}>{formattedDate}</div>
            </>
          ) : (
            <>
              <div className={styles.analogClock}>
                <div 
                  className={`${styles.clockHand} ${styles.hourHand}`} 
                  style={{ transform: `rotate(${hourRotation}deg)` }}
                ></div>
                <div 
                  className={`${styles.clockHand} ${styles.minuteHand}`} 
                  style={{ transform: `rotate(${minuteRotation}deg)` }}
                ></div>
                <div 
                  className={`${styles.clockHand} ${styles.secondHand}`} 
                  style={{ transform: `rotate(${secondRotation}deg)` }}
                ></div>
                <div className={styles.clockCenter}></div>
              </div>
              <div className={styles.date}>{formattedDate}</div>
            </>
          )}
          
          <button 
            onClick={() => setShowSettings(true)}
            className={styles.settingsButton}
          >
            Settings
          </button>
        </>
      )}
    </div>
  );
};

export default ClockWidget;
