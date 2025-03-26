import React, { useState, useEffect } from 'react';
import styles from '../styles/SmartView.module.css';
import WidgetBase from './WidgetBase';
import { availableWidgets } from '../utils/widgetRegistry';
import { retrieveDashboardConfig, storeWidgetSettings, retrieveWidgetSettings } from '../utils/storageService';
import { WidgetVisibility } from './Dashboard';

interface DashboardConfig {
  widgetVisibility: WidgetVisibility;
  theme?: string;
}

// Settings interface for SmartView
interface SmartViewSettings {
  cycleTime: number; // in seconds
}

const SmartView: React.FC = () => {
  // Default settings
  const defaultSettings: SmartViewSettings = {
    cycleTime: 10 // 10 seconds default
  };

  // State for widget visibility and current widget
  const [widgetVisibility, setWidgetVisibility] = useState<WidgetVisibility>({
    clock: false,
    weather: false,
    system: false,
    calendar: false,
    notes: false,
    news: false,
    googleCalendar: false,
    email: false,
    health: false,
    ifttt: false,
    todo: false,
  });
  
  const [currentWidgetIndex, setCurrentWidgetIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [enabledWidgets, setEnabledWidgets] = useState<string[]>([]);
  const [settings, setSettings] = useState<SmartViewSettings>(defaultSettings);
  const [countdown, setCountdown] = useState<number>(settings.cycleTime);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  
  // Load saved settings
  useEffect(() => {
    const savedSettings = retrieveWidgetSettings<SmartViewSettings>('smart_view');
    if (savedSettings) {
      setSettings(savedSettings);
      setCountdown(savedSettings.cycleTime);
    }
  }, []);
  
  // Load config and determine enabled widgets
  useEffect(() => {
    const savedConfig = retrieveDashboardConfig<DashboardConfig>();
    
    if (savedConfig && savedConfig.widgetVisibility) {
      setWidgetVisibility(savedConfig.widgetVisibility);
      
      // Create array of enabled widget IDs
      const enabledWidgetIds = Object.entries(savedConfig.widgetVisibility)
        .filter(([_, isEnabled]) => isEnabled)
        .map(([id]) => id);
      
      setEnabledWidgets(enabledWidgetIds);
    }
  }, []);
  
  // Set up the cycling functionality and countdown
  useEffect(() => {
    if (enabledWidgets.length === 0) return;
    
    let cycleInterval: NodeJS.Timeout;
    let countdownInterval: NodeJS.Timeout;
    
    if (!isPaused) {
      // Main cycle interval
      cycleInterval = setInterval(() => {
        setCurrentWidgetIndex(prevIndex => 
          (prevIndex + 1) % enabledWidgets.length
        );
        setCountdown(settings.cycleTime); // Reset countdown when widget changes
      }, settings.cycleTime * 1000);
      
      // Countdown interval (updates every second)
      countdownInterval = setInterval(() => {
        setCountdown(prevCount => {
          if (prevCount <= 1) return settings.cycleTime;
          return prevCount - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (cycleInterval) clearInterval(cycleInterval);
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [enabledWidgets, isPaused, settings.cycleTime]);
  
  const handlePrevWidget = () => {
    setCurrentWidgetIndex(prevIndex => 
      (prevIndex - 1 + enabledWidgets.length) % enabledWidgets.length
    );
    setCountdown(settings.cycleTime); // Reset countdown when manually changing widget
  };
  
  const handleNextWidget = () => {
    setCurrentWidgetIndex(prevIndex => 
      (prevIndex + 1) % enabledWidgets.length
    );
    setCountdown(settings.cycleTime); // Reset countdown when manually changing widget
  };
  
  const togglePause = () => {
    setIsPaused(prev => !prev);
  };
  
  const updateCycleTime = (newTime: number) => {
    // Update settings
    const updatedSettings = { ...settings, cycleTime: newTime };
    setSettings(updatedSettings);
    setCountdown(newTime); // Reset countdown with new time
    
    // Save to localStorage
    storeWidgetSettings('smart_view', updatedSettings);
  };
  
  if (enabledWidgets.length === 0) {
    return (
      <div className={styles.smartView}>
        <div className={styles.noWidgets}>
          <h2>No Widgets Enabled</h2>
          <p>Enable widgets in Settings to use Smart View</p>
        </div>
      </div>
    );
  }
  
  // Get the current widget to display
  const currentWidgetId = enabledWidgets[currentWidgetIndex];
  const currentWidget = availableWidgets.find(widget => widget.id === currentWidgetId);
  
  if (!currentWidget) {
    return (
      <div className={styles.smartView}>
        <div className={styles.errorState}>
          <h2>Widget Not Found</h2>
        </div>
      </div>
    );
  }
  
  return (
    <div className={styles.smartView}>
      <div className={styles.controls}>
        <div className={styles.navigation}>
          <button onClick={handlePrevWidget} className={styles.navButton}>Previous</button>
          <span className={styles.widgetCounter}>
            {currentWidgetIndex + 1} / {enabledWidgets.length}
          </span>
          <button onClick={handleNextWidget} className={styles.navButton}>Next</button>
        </div>
        
        <div className={styles.timerControls}>
          <div className={styles.countdown}>
            <div className={styles.countdownBar} style={{ 
              width: `${(countdown / settings.cycleTime) * 100}%` 
            }}></div>
            <span className={styles.countdownText}>
              Next: {countdown}s
            </span>
          </div>
          
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={styles.settingsButton}
            title="Cycle time settings"
          >
            ⚙️
          </button>
          
          <button 
            onClick={togglePause}
            className={styles.pauseButton}
            aria-label={isPaused ? "Resume cycling" : "Pause cycling"}
          >
            {isPaused ? "▶️ Resume" : "⏸️ Pause"}
          </button>
        </div>
      </div>
      
      {showSettings && (
        <div className={styles.cycleSettings}>
          <div className={styles.settingHeader}>
            <h3>Widget Cycle Time</h3>
            <button className={styles.closeButton} onClick={() => setShowSettings(false)}>×</button>
          </div>
          <div className={styles.cycleTimeOptions}>
            {[5, 10, 15, 30, 60].map(seconds => (
              <button 
                key={seconds}
                onClick={() => updateCycleTime(seconds)}
                className={`${styles.cycleTimeButton} ${settings.cycleTime === seconds ? styles.active : ''}`}
              >
                {seconds} {seconds === 1 ? 'second' : 'seconds'}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div className={styles.widgetContainer}>
        <WidgetBase 
          key={currentWidget.id}
          title={currentWidget.title} 
          size="large" 
          hasSettings={currentWidget.hasSettings}
        >
          {React.createElement(currentWidget.component)}
        </WidgetBase>
      </div>
    </div>
  );
};

export default SmartView;
