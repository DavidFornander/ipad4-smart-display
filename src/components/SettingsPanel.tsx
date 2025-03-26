import React, { useState, useEffect } from 'react';
import styles from '../styles/SettingsPanel.module.css';
import ThemeSwitcher from './ThemeSwitcher';
import { clearCacheData, resetAllSettings, getStorageUsage } from '../utils/settingsManager';
import { retrieveDashboardConfig, storeDashboardConfig } from '../utils/storageService';
import { WidgetVisibility } from './Dashboard';

interface SettingsPanelProps {
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'widgets' | 'appearance' | 'system'>('widgets');
  const [storageUsage, setStorageUsage] = useState({ used: 0, total: 0 });
  const [clearingCache, setClearingCache] = useState(false);
  const [resettingSettings, setResettingSettings] = useState(false);
  const [widgetVisibility, setWidgetVisibility] = useState<WidgetVisibility>({
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
  });

  // Load widget visibility on mount
  useEffect(() => {
    const savedConfig = retrieveDashboardConfig<{widgetVisibility: WidgetVisibility}>();
    if (savedConfig && savedConfig.widgetVisibility) {
      setWidgetVisibility(savedConfig.widgetVisibility);
    }
  }, []);

  // Toggle widget visibility and save to localStorage
  const toggleWidgetVisibility = (widget: keyof WidgetVisibility) => {
    setWidgetVisibility(prev => {
      const newVisibility = {
        ...prev,
        [widget]: !prev[widget]
      };
      
      // Save updated configuration to localStorage
      const currentConfig = retrieveDashboardConfig<{widgetVisibility: WidgetVisibility}>() || {};
      storeDashboardConfig({
        ...currentConfig,
        widgetVisibility: newVisibility
      });
      
      return newVisibility;
    });
  };

  // Get storage info on mount
  useEffect(() => {
    setStorageUsage(getStorageUsage());
  }, []);

  const handleClearCache = () => {
    setClearingCache(true);
    const success = clearCacheData();
    
    if (success) {
      // Update storage usage
      setTimeout(() => {
        setStorageUsage(getStorageUsage());
        setClearingCache(false);
      }, 500);
    } else {
      setClearingCache(false);
    }
  };
  
  const handleResetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings? This cannot be undone.')) {
      setResettingSettings(true);
      const success = resetAllSettings();
      
      if (success) {
        // Navigate user back to main view after brief delay
        setTimeout(() => {
          onClose();
        }, 500);
      } else {
        setResettingSettings(false);
      }
    }
  };

  // Group widgets by category for better organization
  const standardWidgets: Array<{id: keyof WidgetVisibility, label: string}> = [
    { id: 'clock', label: 'Clock' },
    { id: 'weather', label: 'Weather' },
    { id: 'system', label: 'System Status' },
    { id: 'calendar', label: 'Calendar' },
    { id: 'notes', label: 'Notes' },
    { id: 'news', label: 'News' }
  ];
  
  const externalServiceWidgets: Array<{id: keyof WidgetVisibility, label: string}> = [
    { id: 'googleCalendar', label: 'Google Calendar' },
    { id: 'email', label: 'Email' },
    { id: 'health', label: 'Health' },
    { id: 'ifttt', label: 'IFTTT' },
    { id: 'todo', label: 'Todo List' }
  ];

  return (
    <div className={styles.settingsPanel}>
      <header className={styles.settingsHeader}>
        <h2>Dashboard Settings</h2>
        <button 
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close settings"
        >
          ×
        </button>
      </header>

      <nav className={styles.tabNav}>
        <button 
          className={`${styles.tabButton} ${activeTab === 'widgets' ? styles.active : ''}`}
          onClick={() => setActiveTab('widgets')}
        >
          Widgets
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'appearance' ? styles.active : ''}`}
          onClick={() => setActiveTab('appearance')}
        >
          Appearance
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'system' ? styles.active : ''}`}
          onClick={() => setActiveTab('system')}
        >
          System
        </button>
      </nav>

      <div className={styles.tabContent}>
        {activeTab === 'widgets' && (
          <div className={styles.widgetsTab}>
            <section className={styles.widgetSection}>
              <h3>Standard Widgets</h3>
              <div className={styles.widgetToggles}>
                {standardWidgets.map(widget => (
                  <div key={widget.id} className={styles.widgetToggleItem}>
                    <label className={styles.toggleLabel}>
                      <input 
                        type="checkbox" 
                        checked={widgetVisibility[widget.id]}
                        onChange={() => toggleWidgetVisibility(widget.id)}
                        className={styles.toggleCheckbox}
                      />
                      <span className={styles.toggleTrack}>
                        <span className={styles.toggleIndicator}></span>
                      </span>
                      <span className={styles.toggleText}>{widget.label}</span>
                    </label>
                  </div>
                ))}
              </div>
            </section>

            <section className={styles.widgetSection}>
              <h3>External Services</h3>
              <div className={styles.widgetToggles}>
                {externalServiceWidgets.map(widget => (
                  <div key={widget.id} className={styles.widgetToggleItem}>
                    <label className={styles.toggleLabel}>
                      <input 
                        type="checkbox" 
                        checked={widgetVisibility[widget.id]}
                        onChange={() => toggleWidgetVisibility(widget.id)}
                        className={styles.toggleCheckbox}
                      />
                      <span className={styles.toggleTrack}>
                        <span className={styles.toggleIndicator}></span>
                      </span>
                      <span className={styles.toggleText}>{widget.label}</span>
                    </label>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className={styles.appearanceTab}>
            <section className={styles.themeSection}>
              <h3>Theme</h3>
              <div className={styles.themeControl}>
                <ThemeSwitcher />
              </div>
            </section>
            
            <section className={styles.layoutSection}>
              <h3>Layout</h3>
              <p className={styles.sectionDescription}>
                Layout preferences will be saved automatically.
              </p>
              {/* Layout options could include column count, spacing preferences */}
            </section>
          </div>
        )}

        {activeTab === 'system' && (
          <div className={styles.systemTab}>
            <section className={styles.systemSection}>
              <h3>About</h3>
              <div className={styles.aboutInfo}>
                <p>Dashboard for iPad v1.0.0</p>
                <p>Optimized for iPad 4th generation and Safari 10</p>
              </div>
            </section>
            
            <section className={styles.systemSection}>
              <h3>Storage</h3>
              <div className={styles.storageInfo}>
                <div className={styles.storageBar}>
                  <div 
                    className={styles.storageUsed} 
                    style={{ width: `${Math.min(100, (storageUsage.used / storageUsage.total) * 100)}%` }}
                  ></div>
                </div>
                <div className={styles.storageText}>
                  {storageUsage.used} KB used of {storageUsage.total} KB
                </div>
                
                <div className={styles.storageControls}>
                  <button 
                    className={styles.dangerButton}
                    onClick={handleClearCache}
                    disabled={clearingCache}
                  >
                    {clearingCache ? 'Clearing...' : 'Clear Cache Data'}
                  </button>
                  <button 
                    className={styles.dangerButton}
                    onClick={handleResetSettings}
                    disabled={resettingSettings}
                  >
                    {resettingSettings ? 'Resetting...' : 'Reset All Settings'}
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
      
      <footer className={styles.settingsFooter}>
        <button 
          className={styles.primaryButton}
          onClick={onClose}
        >
          Save & Close
        </button>
      </footer>
    </div>
  );
};

export default SettingsPanel;
