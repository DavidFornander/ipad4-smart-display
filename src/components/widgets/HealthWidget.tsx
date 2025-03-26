import React, { useState, useEffect } from 'react';
import styles from '../../styles/WidgetStyles.module.css';
import { SleepData, WaterIntakeData } from '../../services/serviceInterfaces';
import { AppleHealthService } from '../../services/healthService';
import { Loading, Error } from '../shared/LoadingError';

const HealthWidget: React.FC = () => {
  const [sleepData, setSleepData] = useState<SleepData[]>([]);
  const [waterData, setWaterData] = useState<WaterIntakeData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'sleep' | 'water'>('sleep');
  const [waterAmount, setWaterAmount] = useState<number>(250); // Default to 250ml
  const [healthService] = useState(new AppleHealthService());
  const [waterTarget] = useState<number>(2000); // 2000ml daily target
  const [addingWater, setAddingWater] = useState<boolean>(false);
  
  useEffect(() => {
    if (healthService.isConnected) {
      loadHealthData();
    } else {
      setLoading(false);
    }
  }, [healthService.isConnected]);
  
  const loadHealthData = () => {
    setLoading(true);
    
    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 7);
    
    Promise.all([
      healthService.getSleepData(lastWeek, today),
      healthService.getWaterIntake(lastWeek, today)
    ])
      .then(([sleep, water]) => {
        setSleepData(sleep);
        setWaterData(water);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load health data');
        setLoading(false);
        console.error('Health data error:', err);
      });
  };
  
  const handleConnect = () => {
    healthService.connect()
      .then(success => {
        if (success) {
          loadHealthData();
        }
      })
      .catch(err => {
        setError('Failed to connect to health services');
        console.error('Health connection error:', err);
      });
  };
  
  const addWaterIntake = () => {
    setAddingWater(true);
    
    healthService.logWaterIntake(waterAmount, 'ml')
      .then(() => {
        // Refresh water data
        const today = new Date();
        const lastWeek = new Date();
        lastWeek.setDate(today.getDate() - 7);
        
        return healthService.getWaterIntake(lastWeek, today);
      })
      .then(water => {
        setWaterData(water);
        setAddingWater(false);
      })
      .catch(err => {
        setError('Failed to log water intake');
        setAddingWater(false);
        console.error('Water intake error:', err);
      });
  };
  
  // Calculate total water intake for today
  const getTodayWaterIntake = (): number => {
    const today = new Date().toDateString();
    return waterData
      .filter(entry => new Date(entry.timestamp).toDateString() === today)
      .reduce((total, entry) => {
        // Convert oz to ml if needed
        if (entry.unit === 'oz') {
          return total + (entry.amount * 29.5735); // 1 oz ≈ 29.5735 ml
        }
        return total + entry.amount;
      }, 0);
  };

  // Get sleep data over last week for visualization
  const getWeeklySleepData = () => {
    const result: { date: string; duration: number }[] = [];
    const today = new Date();
    
    // Create entries for last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateStr = date.toLocaleDateString(undefined, { weekday: 'short' });
      
      // Find sleep entry for this day
      const sleepEntry = sleepData.find(entry => {
        const sleepEndDate = new Date(entry.endTime);
        return sleepEndDate.toDateString() === date.toDateString();
      });
      
      let duration = 0;
      if (sleepEntry) {
        const start = new Date(sleepEntry.startTime);
        const end = new Date(sleepEntry.endTime);
        duration = (end.getTime() - start.getTime()) / (60 * 60 * 1000); // hours
      }
      
      result.push({ date: dateStr, duration });
    }
    
    return result;
  };
  
  // Format time for display
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Format duration (in minutes) to hours and minutes
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  // Format hours (floating point) to hours and minutes
  const formatHours = (hours: number): string => {
    const wholeHours = Math.floor(hours);
    const mins = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${mins}m`;
  };
  
  // Get latest sleep entry
  const getLatestSleep = (): SleepData | null => {
    if (sleepData.length === 0) return null;
    
    return sleepData.reduce((latest, current) => {
      const latestDate = new Date(latest.endTime);
      const currentDate = new Date(current.endTime);
      return currentDate > latestDate ? current : latest;
    }, sleepData[0]);
  };

  // Generate a color based on sleep quality
  const getSleepQualityColor = (quality?: 'poor' | 'fair' | 'good' | 'excellent'): string => {
    switch (quality) {
      case 'excellent': return '#4CAF50'; // green
      case 'good': return '#8BC34A'; // light green
      case 'fair': return '#FFC107'; // amber
      case 'poor': return '#FF5722'; // deep orange
      default: return '#9E9E9E'; // grey
    }
  };

  if (loading) {
    return <Loading message="Loading health data..." />;
  }
  
  if (!healthService.isConnected) {
    return (
      <div className={styles.healthConnectionPrompt}>
        <div className={styles.healthServiceIcon}>
          <span role="img" aria-hidden="true">❤️</span>
        </div>
        <h3>Connect to Health Services</h3>
        <p>Track your sleep patterns and water intake</p>
        <button 
          onClick={handleConnect}
          className={styles.connectButton}
        >
          Connect to Health
        </button>
      </div>
    );
  }
  
  if (error) {
    return <Error message={error} onRetry={loadHealthData} />;
  }
  
  const latestSleep = getLatestSleep();
  const todayWaterIntake = getTodayWaterIntake();
  const weeklySleepData = getWeeklySleepData();
  const waterProgress = Math.min(100, Math.round((todayWaterIntake / waterTarget) * 100));
  
  return (
    <div className={styles.healthWidget}>
      <div className={styles.healthTabs}>
        <button 
          className={`${styles.healthTab} ${activeTab === 'sleep' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('sleep')}
        >
          <span className={styles.tabIcon}>💤</span> Sleep
        </button>
        <button 
          className={`${styles.healthTab} ${activeTab === 'water' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('water')}
        >
          <span className={styles.tabIcon}>💧</span> Water
        </button>
      </div>
      
      <div className={styles.healthContent}>
        {activeTab === 'sleep' ? (
          <div className={styles.sleepTab}>
            {latestSleep ? (
              <>
                <div className={styles.sleepSummary}>
                  <div className={styles.sleepDuration}>
                    <span className={styles.sleepDurationValue}>
                      {latestSleep.deepSleepMinutes && latestSleep.lightSleepMinutes && latestSleep.remSleepMinutes ? (
                        formatDuration(latestSleep.deepSleepMinutes + latestSleep.lightSleepMinutes + latestSleep.remSleepMinutes)
                      ) : (
                        // Calculate from start and end times
                        formatDuration(
                          Math.round(
                            (new Date(latestSleep.endTime).getTime() - new Date(latestSleep.startTime).getTime()) / 60000
                          )
                        )
                      )}
                    </span>
                    <span className={styles.sleepLabel}>Last night's sleep</span>
                  </div>
                  
                  <div 
                    className={styles.sleepQuality} 
                    style={{ backgroundColor: getSleepQualityColor(latestSleep.quality) }}
                  >
                    {latestSleep.quality || 'Unknown'}
                  </div>
                </div>
                
                <div className={styles.sleepTimings}>
                  <div className={styles.sleepTimeBlock}>
                    <span className={styles.sleepTimeLabel}>Bedtime</span>
                    <span className={styles.sleepTimeValue}>{formatTime(latestSleep.startTime)}</span>
                  </div>
                  <div className={styles.sleepTimeDivider}></div>
                  <div className={styles.sleepTimeBlock}>
                    <span className={styles.sleepTimeLabel}>Wake up</span>
                    <span className={styles.sleepTimeValue}>{formatTime(latestSleep.endTime)}</span>
                  </div>
                </div>
                
                {latestSleep.deepSleepMinutes && (
                  <div className={styles.sleepBreakdown}>
                    <h4 className={styles.sleepBreakdownTitle}>Sleep Stages</h4>
                    <div className={styles.sleepStages}>
                      <div className={styles.sleepStage}>
                        <div className={styles.sleepStageBar} style={{ backgroundColor: '#0047AB', height: `${Math.min(100, latestSleep.deepSleepMinutes / 4)}px` }}></div>
                        <div className={styles.sleepStageLabel}>Deep</div>
                        <div className={styles.sleepStageDuration}>{formatDuration(latestSleep.deepSleepMinutes)}</div>
                      </div>
                      <div className={styles.sleepStage}>
                        <div className={styles.sleepStageBar} style={{ backgroundColor: '#4169E1', height: `${Math.min(100, (latestSleep.remSleepMinutes || 0) / 4)}px` }}></div>
                        <div className={styles.sleepStageLabel}>REM</div>
                        <div className={styles.sleepStageDuration}>{formatDuration(latestSleep.remSleepMinutes || 0)}</div>
                      </div>
                      <div className={styles.sleepStage}>
                        <div className={styles.sleepStageBar} style={{ backgroundColor: '#87CEEB', height: `${Math.min(100, (latestSleep.lightSleepMinutes || 0) / 4)}px` }}></div>
                        <div className={styles.sleepStageLabel}>Light</div>
                        <div className={styles.sleepStageDuration}>{formatDuration(latestSleep.lightSleepMinutes || 0)}</div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className={styles.sleepTrend}>
                  <h4 className={styles.sleepTrendTitle}>7-Day Sleep History</h4>
                  <div className={styles.sleepTrendChart}>
                    {weeklySleepData.map((day, index) => (
                      <div key={index} className={styles.sleepTrendBar}>
                        <div 
                          className={styles.sleepTrendBarFill} 
                          style={{ 
                            height: `${day.duration * 12}px`,
                            backgroundColor: day.duration > 0 ? (day.duration >= 7 ? '#4CAF50' : (day.duration >= 6 ? '#8BC34A' : '#FF9800')) : '#e0e0e0'
                          }}
                        ></div>
                        <div className={styles.sleepTrendDay}>{day.date}</div>
                        <div className={styles.sleepTrendHours}>
                          {day.duration > 0 ? formatHours(day.duration) : '-'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className={styles.noSleepData}>
                <p>No sleep data available yet</p>
              </div>
            )}
          </div>
        ) : (
          <div className={styles.waterTab}>
            <div className={styles.waterTracking}>
              <div className={styles.waterProgress}>
                <div className={styles.waterProgressCircle}>
                  <svg viewBox="0 0 36 36" className={styles.waterProgressSvg}>
                    <path
                      className={styles.waterProgressBg}
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={styles.waterProgressFill}
                      strokeDasharray={`${waterProgress}, 100`}
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <text x="18" y="20.35" className={styles.waterProgressText}>
                      {waterProgress}%
                    </text>
                  </svg>
                </div>
                <div className={styles.waterStatus}>
                  <div className={styles.waterStatusValue}>
                    {Math.round(todayWaterIntake)} <span className={styles.waterStatusUnit}>ml</span>
                  </div>
                  <div className={styles.waterStatusLabel}>
                    of {waterTarget}ml daily goal
                  </div>
                </div>
              </div>
              
              <div className={styles.waterAddControls}>
                <div className={styles.waterAmountControls}>
                  <button 
                    className={styles.waterAmountButton}
                    onClick={() => setWaterAmount(Math.max(50, waterAmount - 50))}
                    disabled={addingWater}
                  >
                    −
                  </button>
                  <div className={styles.waterAmountDisplay}>
                    <input
                      type="number"
                      className={styles.waterAmountInput}
                      value={waterAmount}
                      onChange={e => setWaterAmount(parseInt(e.target.value, 10) || 0)}
                      min="50"
                      step="50"
                      disabled={addingWater}
                    />
                    <span className={styles.waterAmountUnit}>ml</span>
                  </div>
                  <button 
                    className={styles.waterAmountButton}
                    onClick={() => setWaterAmount(waterAmount + 50)}
                    disabled={addingWater}
                  >
                    +
                  </button>
                </div>
                <button 
                  className={`${styles.waterAddButton} ${addingWater ? styles.loading : ''}`}
                  onClick={addWaterIntake}
                  disabled={addingWater}
                >
                  {addingWater ? 'Adding...' : 'Add Water'}
                </button>
              </div>
              
              <div className={styles.waterHistory}>
                <h4 className={styles.waterHistoryTitle}>Recent Intake</h4>
                <ul className={styles.waterHistoryList}>
                  {waterData.slice(0, 5).map(entry => (
                    <li key={entry.id} className={styles.waterHistoryItem}>
                      <span className={styles.waterHistoryAmount}>
                        {entry.amount} {entry.unit}
                      </span>
                      <span className={styles.waterHistoryTime}>
                        {formatTime(entry.timestamp)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthWidget;
