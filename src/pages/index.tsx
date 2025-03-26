import React, { useState } from 'react';
import Dashboard from '../components/Dashboard';
import AlternativeView from '../components/AlternativeView';
import SmartView from '../components/SmartView';
import Layout from '../components/Layout';
import ThemeSwitcher from '../components/ThemeSwitcher';
import SettingsPanel from '../components/SettingsPanel';
import styles from '../styles/Dashboard.module.css';
import navStyles from '../styles/Navigation.module.css';

const Home: React.FC = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'alternative' | 'smart'>('dashboard');
  const [showSettings, setShowSettings] = useState(false);

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  return (
    <Layout>
      <div className={styles.dashboard}>
        <header className={styles.header}>
          <div className={styles.titleNavContainer}>
            <h1 className={styles.title}>Dashboard</h1>
            <nav className={navStyles.viewNav}>
              <button 
                className={`${navStyles.viewTab} ${currentView === 'dashboard' ? navStyles.activeView : ''}`}
                onClick={() => setCurrentView('dashboard')}
              >
                Main View
              </button>
              <button 
                className={`${navStyles.viewTab} ${currentView === 'alternative' ? navStyles.activeView : ''}`}
                onClick={() => setCurrentView('alternative')}
              >
                Alternative View
              </button>
              <button 
                className={`${navStyles.viewTab} ${currentView === 'smart' ? navStyles.activeView : ''}`}
                onClick={() => setCurrentView('smart')}
              >
                Smart View
              </button>
            </nav>
          </div>
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
          <SettingsPanel onClose={toggleSettings} />
        ) : (
          <>
            {currentView === 'dashboard' && <Dashboard />}
            {currentView === 'alternative' && <AlternativeView />}
            {currentView === 'smart' && <SmartView />}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Home;