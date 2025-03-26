import React from 'react';
import styles from '../../styles/WidgetStyles.module.css';

interface LoadingProps {
  message?: string;
}

interface ErrorProps {
  message: string;
  onRetry?: () => void;
}

export const Loading: React.FC<LoadingProps> = ({ message = 'Loading...' }) => (
  <div className={styles.loading}>
    <div className={styles.loadingSpinner}></div>
    <div className={styles.loadingText}>{message}</div>
  </div>
);

export const Error: React.FC<ErrorProps> = ({ message, onRetry }) => (
  <div className={styles.error}>
    <div className={styles.errorIcon}>⚠️</div>
    <div className={styles.errorText}>{message}</div>
    {onRetry && (
      <button 
        onClick={onRetry} 
        className={styles.retryButton}
        aria-label="Retry"
      >
        Try Again
      </button>
    )}
  </div>
);
