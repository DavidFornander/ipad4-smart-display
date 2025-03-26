import React, { useState, useEffect } from 'react';
import styles from '../styles/Dashboard.module.css';
import WidgetBase from './WidgetBase';
import ThemeSwitcher from './ThemeSwitcher';
import SettingsPanel from './SettingsPanel';

// Import the widget components
import ClockWidget from './widgets/ClockWidget';
import WeatherWidget from './widgets/WeatherWidget';
import SystemStatusWidget from './widgets/SystemStatusWidget';
import CalendarWidget from './widgets/CalendarWidget';
import NotesWidget from './widgets/NotesWidget';
import NewsWidget from './widgets/NewsWidget';
// Import new integration widgets
import CalendarIntegrationWidget from './widgets/CalendarIntegrationWidget';
import EmailWidget from './widgets/EmailWidget';
import HealthWidget from './widgets/HealthWidget';
import IFTTTWidget from './widgets/IFTTTWidget';
import TodoWidget from './widgets/TodoWidget';

// Import storage utilities
import { retrieveDashboardConfig, storeDashboardConfig } from '../utils/storageService';

// Define widget visibility state interface and export it for SettingsPanel
export interface WidgetVisibility {
  clock: boolean;
  weather: boolean;
  system: boolean;
  calendar: boolean;
  notes: boolean;
  news: boolean;
  // New integration widgets
  googleCalendar: boolean;
  email: boolean;
  health: boolean;
  ifttt: boolean;
  todo: boolean;
}

// Define dashboard configuration interface
interface DashboardConfig {
  widgetVisibility: WidgetVisibility;
  theme?: string;
  // Add more configuration options as needed
}

const Dashboard: React.FC = () => {
  // Default widget visibility state
  const defaultVisibility: WidgetVisibility = {
    clock: true,
    weather: true,
    system: true,
    calendar: true,
    notes: true,
    news: true,
    // New integration widgets default to hidden
    googleCalendar: false,
    email: false,
    health: false,
    ifttt: false,
    todo: false,
  };
  
  // State for widget visibility
  const [widgetVisibility, setWidgetVisibility] = useState<WidgetVisibility>(defaultVisibility);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved configuration on mount
  useEffect(() => {
    const savedConfig = retrieveDashboardConfig<DashboardConfig>();
    
    if (savedConfig && savedConfig.widgetVisibility) {
      // Merge saved visibility with default to handle new widgets
      setWidgetVisibility({
        ...defaultVisibility,
        ...savedConfig.widgetVisibility
      });
    }
    
    setIsLoading(false);
  }, []);

  // Toggle widget visibility and save to localStorage
  const toggleWidgetVisibility = (widget: keyof WidgetVisibility) => {
    setWidgetVisibility(prev => {
      const newVisibility = {
        ...prev,
        [widget]: !prev[widget]
      };
      
      // Save updated configuration to localStorage
      const currentConfig = retrieveDashboardConfig<DashboardConfig>() || {};
      storeDashboardConfig({
        ...currentConfig,
        widgetVisibility: newVisibility
      });
      
      return newVisibility;
    });
  };
  
  // Handle settings panel
  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };
  
  if (isLoading) {
    return <div className={styles.loading}>Loading dashboard configuration...</div>;
  }
  
  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <div className={styles.headerControls}>
          <ThemeSwitcher />
          <button 
            className={styles.button}
            onClick={toggleSettings}
          >
            Settings
          </button>
        </div>
      </header>
      
      {showSettings ? (
        <SettingsPanel 
          widgetVisibility={widgetVisibility}
          toggleWidgetVisibility={toggleWidgetVisibility}
          onClose={toggleSettings}
        />
      ) : (
        <div className={styles.widgetGrid}>
          {/* Priority widgets (larger, top row) */}
          {widgetVisibility.clock && (
            <WidgetBase title="Clock" size="medium" hasSettings={true}>
              <ClockWidget />
            </WidgetBase>
          )}
          
          {widgetVisibility.weather && (
            <WidgetBase title="Weather" size="medium" hasSettings={true}>
              <WeatherWidget />
            </WidgetBase>
          )}

          {/* Calendar and notes get more space */}
          {widgetVisibility.calendar && (
            <WidgetBase title="Calendar" size="medium" hasSettings={true}>
              <CalendarWidget />
            </WidgetBase>
          )}
          
          {widgetVisibility.notes && (
            <WidgetBase title="Notes" size="medium" hasSettings={true}>
              <NotesWidget />
            </WidgetBase>
          )}
          
          {/* Secondary widgets */}
          {widgetVisibility.system && (
            <WidgetBase title="System Status" size="medium" hasSettings={false}>
              <SystemStatusWidget />
            </WidgetBase>
          )}
          
          {widgetVisibility.news && (
            <WidgetBase title="News" size="medium" hasSettings={true}>
              <NewsWidget />
            </WidgetBase>
          )}
          
          {/* Integration widgets */}
          {widgetVisibility.googleCalendar && (
            <WidgetBase title="Google Calendar" size="medium" hasSettings={true}>
              <CalendarIntegrationWidget />
            </WidgetBase>
          )}
          
          {widgetVisibility.email && (
            <WidgetBase title="Email" size="medium" hasSettings={true}>
              <EmailWidget />
            </WidgetBase>
          )}
          
          {widgetVisibility.health && (
            <WidgetBase title="Health" size="medium" hasSettings={true}>
              <HealthWidget />
            </WidgetBase>
          )}
          
          {widgetVisibility.ifttt && (
            <WidgetBase title="IFTTT" size="medium" hasSettings={true}>
              <IFTTTWidget />
            </WidgetBase>
          )}
          
          {widgetVisibility.todo && (
            <WidgetBase title="Todo" size="medium" hasSettings={true}>
              <TodoWidget />
            </WidgetBase>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;