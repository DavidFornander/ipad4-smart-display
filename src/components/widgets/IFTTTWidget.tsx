import React, { useState, useEffect } from 'react';
import styles from '../../styles/WidgetStyles.module.css';
import { IFTTTTrigger } from '../../services/serviceInterfaces';
import { IFTTTIntegration } from '../../services/iftttService';
import { Loading, Error } from '../shared/LoadingError';

interface IFTTTWidgetProps {
  webhookKey?: string;
}

const IFTTTWidget: React.FC<IFTTTWidgetProps> = ({ webhookKey = '' }) => {
  const [triggers, setTriggers] = useState<IFTTTTrigger[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [iftttService] = useState(new IFTTTIntegration(webhookKey));
  const [customKey, setCustomKey] = useState<string>(webhookKey);
  const [showKeyInput, setShowKeyInput] = useState<boolean>(false);
  const [activeTriggerId, setActiveTriggerId] = useState<string | null>(null);
  
  useEffect(() => {
    if (iftttService.isConnected) {
      fetchTriggers();
    } else {
      setLoading(false);
    }
  }, [iftttService.isConnected]);
  
  const fetchTriggers = () => {
    setLoading(true);
    iftttService.getTriggers()
      .then(fetchedTriggers => {
        setTriggers(fetchedTriggers);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch IFTTT triggers');
        setLoading(false);
        console.error('IFTTT error:', err);
      });
  };
  
  const handleConnect = () => {
    if (!customKey.trim()) {
      setError('Please enter a webhook key');
      return;
    }
    
    setLoading(true);
    
    // Create new service with the custom key
    const service = new IFTTTIntegration(customKey);
    
    // Try to get triggers to verify the connection
    service.getTriggers()
      .then(fetchedTriggers => {
        setTriggers(fetchedTriggers);
        setLoading(false);
        setShowKeyInput(false);
        // Update the main service instance
        iftttService.webhookKey = customKey;
      })
      .catch(err => {
        setError('Failed to connect to IFTTT with the provided key');
        setLoading(false);
        console.error('IFTTT connection error:', err);
      });
  };
  
  const triggerAction = (triggerId: string) => {
    setActiveTriggerId(triggerId);
    iftttService.triggerWebhook(iftttService.webhookKey, triggerId)
      .then(() => {
        // Show success feedback
        setTimeout(() => {
          setActiveTriggerId(null);
        }, 1000);
      })
      .catch(err => {
        setError(`Failed to trigger action: ${triggerId}`);
        setActiveTriggerId(null);
        console.error('IFTTT trigger error:', err);
      });
  };
  
  if (loading) {
    return <Loading message="Loading IFTTT integration..." />;
  }
  
  if (!iftttService.isConnected) {
    return (
      <div className={styles.iftttWidget}>
        {showKeyInput ? (
          <div className={styles.keyInput}>
            <h3>Connect to IFTTT</h3>
            <p className={styles.helpText}>Enter your IFTTT Webhooks key to control your connected devices</p>
            <input
              type="text"
              value={customKey}
              onChange={e => setCustomKey(e.target.value)}
              placeholder="Enter IFTTT Webhook Key"
              className={styles.keyInputField}
            />
            <div className={styles.keyInputButtons}>
              <button 
                onClick={() => setShowKeyInput(false)}
                className={styles.smallButton}
              >
                Cancel
              </button>
              <button 
                onClick={handleConnect}
                className={styles.actionButton}
              >
                Connect
              </button>
            </div>
            {error && <div className={styles.errorMessage}>{error}</div>}
          </div>
        ) : (
          <div className={styles.connectPrompt}>
            <p>Connect your IFTTT account to control your smart home devices.</p>
            <button 
              onClick={() => setShowKeyInput(true)} 
              className={styles.connectButton}
            >
              Connect to IFTTT
            </button>
          </div>
        )}
      </div>
    );
  }
  
  if (error) {
    return <Error message={error} onRetry={fetchTriggers} />;
  }
  
  return (
    <div className={styles.iftttWidget}>
      <div className={styles.serviceHeader}>
        <span className={styles.serviceTitle}>IFTTT Controls</span>
        <button 
          onClick={() => iftttService.disconnect()} 
          className={styles.smallButton}
          title="Disconnect from IFTTT"
        >
          Disconnect
        </button>
      </div>
      
      <div className={styles.triggersList}>
        {triggers.length === 0 ? (
          <p className={styles.noTriggersMessage}>No triggers available</p>
        ) : (
          <div className={styles.triggerGrid}>
            {triggers.map(trigger => (
              <button
                key={trigger.id}
                onClick={() => triggerAction(trigger.id)}
                className={`${styles.triggerButton} ${activeTriggerId === trigger.id ? styles.activeTrigger : ''}`}
                title={trigger.description}
                disabled={activeTriggerId !== null}
              >
                {trigger.name}
                {activeTriggerId === trigger.id && (
                  <span className={styles.triggerIndicator}>✓</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      
      <div className={styles.refreshRow}>
        <p className={styles.smallText}>
          {triggers.length} available triggers
        </p>
        <button 
          onClick={fetchTriggers}
          className={styles.smallButton}
          title="Refresh triggers"
        >
          Refresh
        </button>
      </div>
    </div>
  );
};

export default IFTTTWidget;
