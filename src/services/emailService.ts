// Email service implementation (Gmail + others)

import { EmailService, EmailMessage, EmailAddress } from './serviceInterfaces';
import { isAuthenticated, clearAuthentication } from '../utils/authService';
import { cacheApiResponse, getCachedApiResponse } from '../utils/cacheService';

export class GmailService implements EmailService {
  name = 'Gmail';
  credentials: any = {};
  
  constructor(clientId: string, clientSecret: string) {
    this.credentials = { clientId, clientSecret };
  }
  
  get isConnected(): boolean {
    return isAuthenticated('google');
  }
  
  connect(): Promise<boolean> {
    // Mock successful authentication
    return Promise.resolve(true);
  }
  
  disconnect(): Promise<boolean> {
    return Promise.resolve(clearAuthentication('google'));
  }
  
  getInbox(limit: number = 10): Promise<EmailMessage[]> {
    if (!this.isConnected) {
      return Promise.reject(new Error('Not connected to Gmail'));
    }
    
    // Check cache first
    const cacheKey = `gmail_inbox_${limit}`;
    const cachedData = getCachedApiResponse<EmailMessage[]>(cacheKey);
    
    if (cachedData.data && !cachedData.isStale) {
      return Promise.resolve(cachedData.data);
    }
    
    // Generate mock emails
    const mockEmails: EmailMessage[] = [
      {
        id: '1',
        subject: 'Meeting Tomorrow',
        from: { name: 'John Doe', address: 'john.doe@example.com' },
        to: [{ address: 'user@example.com' }],
        body: 'Hi there, just a reminder about our meeting tomorrow at 10 AM.',
        isRead: false,
        receivedAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: '2',
        subject: 'Project Update',
        from: { name: 'Jane Smith', address: 'jane.smith@example.com' },
        to: [{ address: 'user@example.com' }],
        cc: [{ name: 'Team', address: 'team@example.com' }],
        body: 'Here\'s the latest update on our project. We\'re making good progress!',
        isRead: true,
        receivedAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: '3',
        subject: 'Invitation: Company Picnic',
        from: { name: 'HR Department', address: 'hr@example.com' },
        to: [{ address: 'all-staff@example.com' }],
        body: 'You\'re invited to our annual company picnic next Saturday!',
        isRead: false,
        receivedAt: new Date(Date.now() - 172800000).toISOString()
      }
    ];
    
    // Cache the data
    cacheApiResponse(cacheKey, mockEmails, 5); // Cache for 5 minutes
    
    return Promise.resolve(mockEmails);
  }
  
  getUnreadCount(): Promise<number> {
    if (!this.isConnected) {
      return Promise.reject(new Error('Not connected to Gmail'));
    }
    
    // Mock unread count
    return Promise.resolve(2);
  }
  
  markAsRead(messageId: string): Promise<boolean> {
    if (!this.isConnected) {
      return Promise.reject(new Error('Not connected to Gmail'));
    }
    
    console.log('Marked email as read:', messageId);
    return Promise.resolve(true);
  }
  
  sendEmail(message: EmailMessage): Promise<boolean> {
    if (!this.isConnected) {
      return Promise.reject(new Error('Not connected to Gmail'));
    }
    
    console.log('Sent email:', message);
    return Promise.resolve(true);
  }
}
