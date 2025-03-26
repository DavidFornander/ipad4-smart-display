import React, { useState, useEffect } from 'react';
import styles from '../styles/Dashboard.module.css';
import WidgetBase from './WidgetBase';
import { availableWidgets } from '../utils/widgetRegistry';

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
}

const Dashboard: React.FC = () => {
  const defaultVisibility: WidgetVisibility = {
    clock: true,
    weather: true,
    system: true,
    calendar: true,
    notes: true,
    news: true,
    googleCalendar: false,
    email: false,
    health: false,
    ifttt: false,
    todo: false,
  };
  
  const [widgetVisibility, setWidgetVisibility] = useState<WidgetVisibility>(defaultVisibility);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedConfig = retrieveDashboardConfig<DashboardConfig>();
    
    if (savedConfig && savedConfig.widgetVisibility) {
      setWidgetVisibility({
        ...defaultVisibility,
        ...savedConfig.widgetVisibility
      });
    }
    
    setIsLoading(false);
  }, []);

  const toggleWidgetVisibility = (widget: keyof WidgetVisibility) => {
    setWidgetVisibility(prev => {
      const newVisibility = {
        ...prev,
        [widget]: !prev[widget]
      };
      
      const currentConfig = retrieveDashboardConfig<DashboardConfig>() || {};
      storeDashboardConfig({
        ...currentConfig,
        widgetVisibility: newVisibility
      });
      
      return newVisibility;
    });
  };
  
  if (isLoading) {
    return <div className={styles.loading}>Loading dashboard configuration...</div>;
  }
  
  return (
    <div className={styles.widgetGrid}>
      {availableWidgets.map(widget => (
        widgetVisibility[widget.id] && (
          <WidgetBase 
            key={widget.id}
            title={widget.title} 
            size={widget.defaultSize} 
            hasSettings={widget.hasSettings}
          >
            {React.createElement(widget.component)}
          </WidgetBase>
        )
      ))}
    </div>
  );
};

export default Dashboard;