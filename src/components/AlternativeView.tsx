import React, { useState, useEffect } from 'react';
import styles from '../styles/AlternativeView.module.css';
import WidgetBase from './WidgetBase';
import { availableWidgets } from '../utils/widgetRegistry';
import { retrieveDashboardConfig } from '../utils/storageService';
import { WidgetVisibility } from './Dashboard';

// Define the dashboard configuration interface (matching Dashboard.tsx)
interface DashboardConfig {
  widgetVisibility: WidgetVisibility;
  theme?: string;
}

const AlternativeView: React.FC = () => {
  // Initialize with default empty state that matches the WidgetVisibility type
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

  useEffect(() => {
    const savedConfig = retrieveDashboardConfig<DashboardConfig>();
    
    if (savedConfig && savedConfig.widgetVisibility) {
      setWidgetVisibility(savedConfig.widgetVisibility);
    }
  }, []);

  return (
    <div className={styles.alternativeView}>
      <h1>Alternative View</h1>
      <div className={styles.differentLayout}>
        {availableWidgets.map(widget => (
          widgetVisibility[widget.id as keyof WidgetVisibility] && (
            <WidgetBase 
              key={widget.id}
              title={widget.title} 
              size="medium" 
              hasSettings={widget.hasSettings}
            >
              {React.createElement(widget.component)}
            </WidgetBase>
          )
        ))}
      </div>
    </div>
  );
};

export default AlternativeView;
