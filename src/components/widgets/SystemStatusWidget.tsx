import React, { useState, useEffect } from 'react';
import styles from '../../styles/WidgetStyles.module.css';
import { getSystemStatus } from '../../utils/dataService';
import { Loading, Error } from '../shared/LoadingError';

const SystemStatusWidget: React.FC = () => {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    fetchSystemStatus();
    // Update every minute
    const interval = setInterval(fetchSystemStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchSystemStatus = () => {
    getSystemStatus()
      .then(data => {
        setStatus(data);
        setLoading(false);
        setLastUpdated(new Date());
      })
      .catch(err => {
        setError('Unable to fetch system status');
        setLoading(false);
        console.error('System status error:', err);
      });
  };

  if (loading) {
    return <Loading message="Loading system status..." />;
  }

  if (error) {
    return <Error message={error} onRetry={fetchSystemStatus} />;
  }

  return (
    <div className={styles.systemWidget}>
      <div className={styles.statusSection}>
        <h3>Network</h3>
        <div className={styles.statusItem}>
          <span className={styles.statusIcon}>
            {status.network.online ? '🔌' : '⚠️'}
          </span>
          <span className={styles.statusLabel}>Connection:</span>
          <span className={`${styles.statusValue} ${!status.network.online ? styles.textError : ''}`}>
            {status.network.online ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      <div className={styles.statusSection}>
        <h3>Battery</h3>
        {status.battery.level !== 'Unknown' ? (
          <>
            <div className={styles.statusItem}>
              <span className={styles.statusIcon}>🔋</span>
              <span className={styles.statusLabel}>Level:</span>
              <span className={styles.statusValue}>
                {typeof status.battery.level === 'number' 
                  ? `${Math.round(status.battery.level)}%` 
                  : 'Unknown'}
              </span>
            </div>
            <div className={styles.batteryLevel}>
              <div 
                className={`${styles.batteryFill} ${status.battery.level < 20 ? styles.batteryLow : ''}`}
                style={{ width: `${status.battery.level}%` }}
              ></div>
            </div>
            {status.battery.charging !== 'Unknown' && (
              <div className={styles.statusItem}>
                <span className={styles.statusIcon}>⚡</span>
                <span className={styles.statusLabel}>Status:</span>
                <span className={styles.statusValue}>
                  {status.battery.charging ? 'Charging' : 'Not charging'}
                </span>
              </div>
            )}
          </>
        ) : (
          <div className={styles.statusItem}>
            <span className={styles.statusIcon}>🔋</span>
            <span className={styles.statusLabel}>Status:</span>
            <span className={styles.statusValue}>Not available on this device</span>
          </div>
        )}
      </div>

      <div className={styles.statusItem}>
        <span className={styles.statusIcon}>🕒</span>
        <span className={styles.statusLabel}>Updated:</span>
        <span className={styles.statusValue}>
          {lastUpdated.toLocaleTimeString()}
        </span>
      </div>
      
      <div className={styles.refreshButton}>
        <button onClick={fetchSystemStatus} className={styles.smallButton}>
          Refresh
        </button>
      </div>
    </div>
  );
};

export default SystemStatusWidget;
