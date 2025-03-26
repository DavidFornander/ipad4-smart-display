// Define interfaces for external service integrations

// Common interface for all service integrations
export interface ServiceIntegration {
  name: string;
  isConnected: boolean;
  connect(): Promise<boolean>;
  disconnect(): Promise<boolean>;
}

// Google Calendar integration
export interface CalendarService extends ServiceIntegration {
  getEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]>;
  addEvent(event: CalendarEvent): Promise<boolean>;
  updateEvent(event: CalendarEvent): Promise<boolean>;
  deleteEvent(eventId: string): Promise<boolean>;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  location?: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  allDay?: boolean;
  recurringEventId?: string;
}

// Email integration (Gmail + others)
export interface EmailService extends ServiceIntegration {
  getInbox(limit?: number): Promise<EmailMessage[]>;
  getUnreadCount(): Promise<number>;
  markAsRead(messageId: string): Promise<boolean>;
  sendEmail(message: EmailMessage): Promise<boolean>;
}

export interface EmailMessage {
  id: string;
  subject: string;
  from: EmailAddress;
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  body: string;
  isRead: boolean;
  receivedAt: string; // ISO string
  attachments?: EmailAttachment[];
}

export interface EmailAddress {
  name?: string;
  address: string;
}

export interface EmailAttachment {
  id: string;
  filename: string;
  contentType: string;
  size: number;
}

// Apple Health integration
export interface HealthService extends ServiceIntegration {
  getSleepData(startDate: Date, endDate: Date): Promise<SleepData[]>;
  getWaterIntake(startDate: Date, endDate: Date): Promise<WaterIntakeData[]>;
  logWaterIntake(amount: number, unit: 'ml' | 'oz', date?: Date): Promise<boolean>;
}

export interface SleepData {
  id: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  quality?: 'poor' | 'fair' | 'good' | 'excellent';
  deepSleepMinutes?: number;
  remSleepMinutes?: number;
  lightSleepMinutes?: number;
}

export interface WaterIntakeData {
  id: string;
  amount: number;
  unit: 'ml' | 'oz';
  timestamp: string; // ISO string
}

// IFTTT integration
export interface IFTTTService extends ServiceIntegration {
  getTriggers(): Promise<IFTTTTrigger[]>;
  getApplets(): Promise<IFTTTApplet[]>;
  triggerWebhook(key: string, event: string, value1?: string, value2?: string, value3?: string): Promise<boolean>;
}

export interface IFTTTTrigger {
  id: string;
  name: string;
  description: string;
}

export interface IFTTTApplet {
  id: string;
  name: string;
  isEnabled: boolean;
  lastTriggered?: string; // ISO string
}

// Todo list
export interface TodoService extends ServiceIntegration {
  getTasks(): Promise<TodoTask[]>;
  addTask(task: TodoTask): Promise<TodoTask>;
  updateTask(task: TodoTask): Promise<TodoTask>;
  deleteTask(taskId: string): Promise<boolean>;
  completeTask(taskId: string): Promise<boolean>;
}

export interface TodoTask {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  dueDate?: string; // ISO string
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
}
