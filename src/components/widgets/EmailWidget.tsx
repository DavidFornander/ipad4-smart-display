import React, { useState, useEffect } from 'react';
import styles from '../../styles/WidgetStyles.module.css';
import { EmailMessage } from '../../services/serviceInterfaces';
import { GmailService } from '../../services/emailService';
import { Loading, Error } from '../shared/LoadingError';

interface EmailWidgetProps {
  clientId?: string;
  clientSecret?: string;
  limit?: number;
}

const EmailWidget: React.FC<EmailWidgetProps> = ({ clientId = '', clientSecret = '', limit = 5 }) => {
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [emailService] = useState(new GmailService(clientId, clientSecret));
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  
  useEffect(() => {
    if (emailService.isConnected) {
      loadEmailData();
    } else {
      setLoading(false);
    }
  }, [emailService, limit]);
  
  const loadEmailData = () => {
    setRefreshing(true);
    
    Promise.all([
      emailService.getInbox(limit),
      emailService.getUnreadCount()
    ])
      .then(([inboxEmails, count]) => {
        setEmails(inboxEmails);
        setUnreadCount(count);
        setRefreshing(false);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch emails');
        setRefreshing(false);
        setLoading(false);
        console.error('Email error:', err);
      });
  };
  
  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };
  
  const handleConnect = () => {
    setLoading(true);
    emailService.connect()
      .then(success => {
        if (success) {
          loadEmailData();
        } else {
          setError('Failed to connect to email service');
          setLoading(false);
        }
      })
      .catch(err => {
        setError('Failed to connect to email service');
        setLoading(false);
        console.error('Email connection error:', err);
      });
  };
  
  const markAsRead = (messageId: string) => {
    emailService.markAsRead(messageId)
      .then(() => {
        // Update UI
        setEmails(prevEmails => 
          prevEmails.map(email => 
            email.id === messageId ? { ...email, isRead: true } : email
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      })
      .catch(err => {
        console.error('Error marking email as read:', err);
      });
  };

  const handleBackToList = () => {
    setSelectedEmail(null);
  };
  
  if (loading && !refreshing) {
    return <Loading message="Loading emails..." />;
  }
  
  if (!emailService.isConnected) {
    return (
      <div className={styles.emailConnectionPrompt}>
        <div className={styles.emailServiceIcon}>
          <span role="img" aria-hidden="true">📧</span>
        </div>
        <h3>Connect to Your Email</h3>
        <p>View your inbox and stay updated with new messages</p>
        <button 
          onClick={handleConnect}
          className={styles.connectButton}
        >
          Connect to Email
        </button>
      </div>
    );
  }
  
  if (error && !refreshing) {
    return <Error message={error} onRetry={loadEmailData} />;
  }

  return (
    <div className={styles.emailWidget}>
      {selectedEmail ? (
        // Email detail view
        <div className={styles.emailDetail}>
          <div className={styles.emailDetailHeader}>
            <button 
              className={styles.backButton}
              onClick={handleBackToList}
            >
              ← Back
            </button>
          </div>
          
          <div className={styles.emailDetailContent}>
            <h3 className={styles.emailDetailSubject}>{selectedEmail.subject}</h3>
            
            <div className={styles.emailDetailMeta}>
              <div className={styles.emailDetailFrom}>
                <strong>From:</strong> {selectedEmail.from.name || selectedEmail.from.address}
              </div>
              <div className={styles.emailDetailDate}>
                {formatDate(selectedEmail.receivedAt)}
              </div>
            </div>
            
            <div className={styles.emailDetailBody}>
              {selectedEmail.body}
            </div>
          </div>
        </div>
      ) : (
        // Email list view
        <>
          <div className={styles.emailHeader}>
            <div className={styles.emailServiceInfo}>
              <span className={styles.serviceName}>{emailService.name}</span>
              {unreadCount > 0 && (
                <span className={styles.unreadBadge} title={`${unreadCount} unread emails`}>
                  {unreadCount}
                </span>
              )}
            </div>
            <button 
              onClick={loadEmailData}
              className={`${styles.refreshButton} ${refreshing ? styles.refreshing : ''}`}
              disabled={refreshing}
              title="Refresh emails"
            >
              ↻
            </button>
          </div>
          
          <div className={styles.emailList}>
            {refreshing && (
              <div className={styles.overlayLoading}>
                <div className={styles.miniSpinner}></div>
              </div>
            )}
            
            {emails.length === 0 ? (
              <div className={styles.emptyState}>
                <p>Your inbox is empty</p>
              </div>
            ) : (
              <ul className={styles.emailItems}>
                {emails.map(email => (
                  <li 
                    key={email.id} 
                    className={`${styles.emailItem} ${!email.isRead ? styles.unreadEmail : ''}`}
                    onClick={() => {
                      setSelectedEmail(email);
                      if (!email.isRead) {
                        markAsRead(email.id);
                      }
                    }}
                  >
                    <div className={styles.emailSender}>
                      {!email.isRead && <span className={styles.unreadDot} title="Unread"></span>}
                      {email.from.name || email.from.address}
                    </div>
                    <div className={styles.emailSubject}>{email.subject}</div>
                    <div className={styles.emailPreview}>
                      {email.body.substring(0, 60)}...
                    </div>
                    <div className={styles.emailTime}>{formatDate(email.receivedAt)}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default EmailWidget;
