import React, { useState, useEffect } from 'react';
import styles from '../styles/SmartView.module.css';
import WidgetBase from './WidgetBase';
import { availableWidgets } from '../utils/widgetRegistry';
import { retrieveDashboardConfig } from '../utils/storageService';
import { WidgetVisibility } from './Dashboard';

interface DashboardConfig {
  widgetVisibility: WidgetVisibility;
  theme?: string;
}

const SmartView: React.FC = () => {
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
  
  // Set up the cycling functionality
  useEffect(() => {
    if (enabledWidgets.length === 0) return;
    
    let interval: NodeJS.Timeout;
    
    if (!isPaused) {
      interval = setInterval(() => {
        setCurrentWidgetIndex(prevIndex => 
          (prevIndex + 1) % enabledWidgets.length
        );
      }, 10000); // Cycle every 10 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [enabledWidgets, isPaused]);
  
  const handlePrevWidget = () => {
    setCurrentWidgetIndex(prevIndex => 
      (prevIndex - 1 + enabledWidgets.length) % enabledWidgets.length
    );
  };
  
  const handleNextWidget = () => {
    setCurrentWidgetIndex(prevIndex => 
      (prevIndex + 1) % enabledWidgets.length
    );
  };
  
  const togglePause = () => {
    setIsPaused(prev => !prev);
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
        
        <button 
          onClick={togglePause}
          className={styles.pauseButton}
          aria-label={isPaused ? "Resume cycling" : "Pause cycling"}
        >
          {isPaused ? "▶️ Resume" : "⏸️ Pause"}
        </button>
      </div>
      
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
