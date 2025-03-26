// Local storage utilities with fallbacks for compatibility

const PREFIX = 'ipad_dashboard_';

// Check if localStorage is available
const isStorageAvailable = (type: string): boolean => {
  try {
    const storage = window[type as keyof typeof window];
    const x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return false;
  }
};

// Store data with expiry option
export const storeData = <T>(key: string, data: T, expiryMinutes?: number): boolean => {
  if (!isStorageAvailable('localStorage')) {
    console.warn('localStorage is not available');
    return false;
  }

  const item = {
    data,
    expires: expiryMinutes ? new Date().getTime() + expiryMinutes * 60000 : null
  };

  try {
    localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(item));
    return true;
  } catch (error) {
    console.error('Error storing data:', error);
    return false;
  }
};

// Retrieve data and check expiry
export const retrieveData = <T>(key: string): { data: T | null; isStale: boolean } => {
  if (!isStorageAvailable('localStorage')) {
    console.warn('localStorage is not available');
    return { data: null, isStale: false };
  }

  try {
    const item = localStorage.getItem(`${PREFIX}${key}`);
    if (!item) return { data: null, isStale: false };

    const parsedItem = JSON.parse(item);
    
    // Check if data is expired
    if (parsedItem.expires && new Date().getTime() > parsedItem.expires) {
      return { data: parsedItem.data, isStale: true };
    }

    return { data: parsedItem.data, isStale: false };
  } catch (error) {
    console.error('Error retrieving data:', error);
    return { data: null, isStale: false };
  }
};

// Remove specific data
export const removeData = (key: string): boolean => {
  if (!isStorageAvailable('localStorage')) {
    return false;
  }

  try {
    localStorage.removeItem(`${PREFIX}${key}`);
    return true;
  } catch (error) {
    console.error('Error removing data:', error);
    return false;
  }
};

// Store widget settings
export const storeWidgetSettings = (widgetId: string, settings: any): boolean => {
  return storeData(`widget_settings_${widgetId}`, settings);
};

// Retrieve widget settings
export const retrieveWidgetSettings = <T>(widgetId: string): T | null => {
  const result = retrieveData<T>(`widget_settings_${widgetId}`);
  return result.data;
};

// Store dashboard configuration
export const storeDashboardConfig = (config: any): boolean => {
  return storeData('dashboard_config', config);
};

// Retrieve dashboard configuration
export const retrieveDashboardConfig = <T>(): T | null => {
  const result = retrieveData<T>('dashboard_config');
  return result.data;
};

// Store user notes
export const storeUserNotes = (notes: any[]): boolean => {
  return storeData('notes', notes);
};

// Retrieve user notes
export const retrieveUserNotes = (): any[] => {
  const result = retrieveData<any[]>('notes');
  return result.data || [];
};
