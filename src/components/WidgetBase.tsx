import React, { useState } from 'react';
import styles from '../styles/Dashboard.module.css';
import { useTheme } from '../contexts/ThemeContext';

export type WidgetSize = 'small' | 'medium' | 'large';

interface WidgetBaseProps {
  title: string;
  size?: WidgetSize;
  children: React.ReactNode;
  hasSettings?: boolean;
}

const WidgetBase: React.FC<WidgetBaseProps> = ({ 
  title, 
  size = 'medium', 
  children,
  hasSettings = false
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { currentTheme } = useTheme();
  
  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };
  
  return (
    <div 
      className={`${styles.widgetContainer} ${styles[size]}`}
      data-theme={currentTheme}
    >
      <div className={styles.widgetHeader}>
        <h3 className={styles.widgetTitle}>{title}</h3>
        {hasSettings && (
          <button 
            onClick={toggleSettings} 
            className={styles.settingsButton}
            aria-label={showSettings ? "Close settings" : "Open settings"}
            aria-pressed={showSettings}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              width="20" 
              height="20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
            </svg>
          </button>
        )}
      </div>
      
      <div className={`${styles.widgetContent} ${isLoading ? styles.loading : ''}`}>
        {showSettings ? (
          <div className={styles.widgetSettings}>
            <h4>Widget Settings</h4>
            <button 
              onClick={toggleSettings}
              className={styles.button}
            >
              Close
            </button>
          </div>
        ) : (
          <>
            {isLoading ? (
              <div className={styles.loadingIndicator}>
                <div className={styles.spinner}></div>
                <p>Loading...</p>
              </div>
            ) : (
              children
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WidgetBase;
