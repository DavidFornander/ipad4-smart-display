// API and data handling utilities for the dashboard

// Generic fetch utility that uses Promises (compatible with Safari 10)
export const fetchData = <T>(url: string, options?: RequestInit): Promise<T> => {
  return fetch(url, options)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => data as T)
    .catch(error => {
      console.error('Error fetching data:', error);
      throw error;
    });
};

// Weather API integration
export const getWeatherData = (location: string = 'default'): Promise<any> => {
  // Replace with actual API endpoint when ready
  const mockData = {
    location: 'New York',
    temperature: 72,
    condition: 'Sunny',
    humidity: 45,
    wind: 8,
    forecast: [
      { day: 'Mon', temp: 72, condition: 'Sunny' },
      { day: 'Tue', temp: 68, condition: 'Partly Cloudy' },
      { day: 'Wed', temp: 65, condition: 'Cloudy' },
      { day: 'Thu', temp: 70, condition: 'Sunny' },
      { day: 'Fri', temp: 73, condition: 'Sunny' },
    ]
  };
  
  // Simulate API call with delay
  return new Promise(resolve => {
    setTimeout(() => resolve(mockData), 800);
  });
};

// News API integration
export const getNewsData = (category: string = 'general'): Promise<any> => {
  // Replace with actual API endpoint when ready
  const mockData = [
    {
      id: '1',
      title: 'Scientists make breakthrough in renewable energy research',
      source: 'Science Daily',
      url: 'https://example.com/news/1',
      publishedAt: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Tech company reveals latest smartphone innovations',
      source: 'Tech Review',
      url: 'https://example.com/news/2',
      publishedAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: '3',
      title: 'Global economic forum discusses sustainable growth',
      source: 'Financial Times',
      url: 'https://example.com/news/3',
      publishedAt: new Date(Date.now() - 7200000).toISOString()
    }
  ];
  
  // Simulate API call with delay
  return new Promise(resolve => {
    setTimeout(() => resolve(mockData), 700);
  });
};

// Calendar events API integration
export const getCalendarEvents = (): Promise<any> => {
  // Replace with actual API endpoint or calendar integration when ready
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const mockData = [
    {
      id: '1',
      title: 'Team Meeting',
      startTime: new Date(today.setHours(10, 0, 0, 0)).toISOString(),
      endTime: new Date(today.setHours(11, 0, 0, 0)).toISOString(),
      location: 'Conference Room'
    },
    {
      id: '2',
      title: 'Lunch with Client',
      startTime: new Date(today.setHours(13, 0, 0, 0)).toISOString(),
      endTime: new Date(today.setHours(14, 30, 0, 0)).toISOString(),
      location: 'Downtown Cafe'
    },
    {
      id: '3',
      title: 'Project Deadline',
      startTime: new Date(tomorrow.setHours(15, 0, 0, 0)).toISOString(),
      endTime: new Date(tomorrow.setHours(16, 0, 0, 0)).toISOString(),
      location: null
    }
  ];
  
  // Simulate API call with delay
  return new Promise(resolve => {
    setTimeout(() => resolve(mockData), 600);
  });
};

// System status data
export const getSystemStatus = (): Promise<any> => {
  // Note: These are limited to what's available in browser APIs
  const getNetworkInfo = () => {
    return {
      online: navigator.onLine,
      // Safari 10 doesn't support navigator.connection, so we use a simple check
      connectionType: navigator.onLine ? 'online' : 'offline',
    };
  };
  
  // Get battery information if available (not fully supported in Safari 10)
  const getBatteryInfo = () => {
    // Check if getBattery method exists before trying to call it
    if (navigator && 'getBattery' in navigator && typeof navigator.getBattery === 'function') {
      // Cast to any as the BatteryManager interface may not be recognized in TypeScript
      return (navigator as any).getBattery()
        .then((battery: any) => ({
          level: battery.level * 100,
          charging: battery.charging
        }))
        .catch(() => ({ level: 'Unknown', charging: 'Unknown' }));
    }
    
    // Return default data if the Battery API is not supported
    return Promise.resolve({ level: 'Unknown', charging: 'Unknown' });
  };
  
  // Combine all system information
  return getBatteryInfo()
    .then(batteryInfo => ({
      battery: batteryInfo,
      network: getNetworkInfo(),
      timestamp: new Date().toISOString()
    }));
};
