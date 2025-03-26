// IFTTT integration for IoT and other integrations

import { IFTTTService, IFTTTTrigger, IFTTTApplet } from './serviceInterfaces';
import { isAuthenticated, clearAuthentication } from '../utils/authService';

export class IFTTTIntegration implements IFTTTService {
  name = 'IFTTT';
  webhookKey: string = '';
  
  constructor(webhookKey: string = '') {
    this.webhookKey = webhookKey;
  }
  
  get isConnected(): boolean {
    return !!this.webhookKey;
  }
  
  connect(): Promise<boolean> {
    // For IFTTT Webhooks, we just need a webhook key
    // In a real app, you'd prompt the user to enter this
    return Promise.resolve(this.isConnected);
  }
  
  disconnect(): Promise<boolean> {
    this.webhookKey = '';
    return Promise.resolve(true);
  }
  
  getTriggers(): Promise<IFTTTTrigger[]> {
    if (!this.isConnected) {
      return Promise.reject(new Error('Not connected to IFTTT'));
    }
    
    // Mock triggers
    const triggers: IFTTTTrigger[] = [
      {
        id: 'lights_on',
        name: 'Turn Lights On',
        description: 'Turn on smart lights'
      },
      {
        id: 'lights_off',
        name: 'Turn Lights Off',
        description: 'Turn off smart lights'
      },
      {
        id: 'thermostat_up',
        name: 'Increase Temperature',
        description: 'Raise thermostat by 1 degree'
      },
      {
        id: 'thermostat_down',
        name: 'Decrease Temperature',
        description: 'Lower thermostat by 1 degree'
      }
    ];
    
    return Promise.resolve(triggers);
  }
  
  getApplets(): Promise<IFTTTApplet[]> {
    if (!this.isConnected) {
      return Promise.reject(new Error('Not connected to IFTTT'));
    }
    
    // Mock applets
    const applets: IFTTTApplet[] = [
      {
        id: 'morning_routine',
        name: 'Morning Routine',
        isEnabled: true,
        lastTriggered: new Date(new Date().setHours(7, 30, 0, 0)).toISOString()
      },
      {
        id: 'evening_routine',
        name: 'Evening Routine',
        isEnabled: true,
        lastTriggered: new Date(new Date().setHours(22, 0, 0, 0)).toISOString()
      },
      {
        id: 'weather_alert',
        name: 'Weather Alert',
        isEnabled: false
      }
    ];
    
    return Promise.resolve(applets);
  }
  
  triggerWebhook(key: string, event: string, value1?: string, value2?: string, value3?: string): Promise<boolean> {
    if (!this.isConnected) {
      return Promise.reject(new Error('Not connected to IFTTT'));
    }
    
    // In a real app, this would make a request to the IFTTT Webhooks API
    // https://maker.ifttt.com/trigger/{event}/with/key/{key}
    console.log(`Triggered IFTTT webhook: ${event}`, { value1, value2, value3 });
    
    // Mock successful trigger
    return Promise.resolve(true);
  }
}
