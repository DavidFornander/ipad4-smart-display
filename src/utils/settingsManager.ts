import { storeData, removeData } from './storageService';
import { clearAllCache } from './cacheService';

// Clear all cached API data
export const clearCacheData = (): boolean => {
  try {
    clearAllCache();
    return true;
  } catch (error) {
    console.error('Failed to clear cache:', error);
    return false;
  }
};

// Reset all dashboard settings to defaults
export const resetAllSettings = (): boolean => {
  try {
    // List of all setting keys to remove
    const settingsKeys = [
      'dashboard_config',
      'theme_preference',
      'widget_settings_clock',
      'widget_settings_weather',
      'widget_settings_calendar',
      'widget_settings_news',
      'widget_settings_notes',
      // Add other setting keys as needed
    ];
    
    // Remove each setting
    settingsKeys.forEach(key => removeData(key));
    
    // Optionally keep user data like notes, but reset their settings
    
    return true;
  } catch (error) {
    console.error('Failed to reset settings:', error);
    return false;
  }
};

// Get storage usage information
export const getStorageUsage = (): { used: number, total: number } => {
  try {
    // Check if localStorage is available
    if (typeof localStorage === 'undefined') {
      return { used: 0, total: 5 * 1024 * 1024 }; // Default 5MB
    }
    
    // Calculate usage across all localStorage items
    let used = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (value) {
          used += value.length * 2; // Approximate bytes (UTF-16 encoding)
        }
      }
    }
    
    // Convert to KB for display
    used = Math.round(used / 1024);
    
    // Rough approximation - most browsers limit to around 5MB
    const total = 5 * 1024; // KB
    
    return { used, total };
  } catch (error) {
    console.error('Failed to calculate storage usage:', error);
    return { used: 0, total: 5 * 1024 };
  }
};
