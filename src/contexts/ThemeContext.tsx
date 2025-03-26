import React, { createContext, useContext, useState, useEffect } from 'react';
import { retrieveData, storeData } from '../utils/storageService';

// Define theme types
export type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: ThemeMode;
  currentTheme: 'light' | 'dark'; // The actual theme currently applied
  setTheme: (theme: ThemeMode) => void;
}

// Create the context with default values
const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  currentTheme: 'light',
  setTheme: () => {},
});

// Theme provider component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get stored theme or default to auto
  const [theme, setThemeState] = useState<ThemeMode>('light');
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');

  // Effect to load saved theme preference
  useEffect(() => {
    const savedTheme = retrieveData<{ theme: ThemeMode }>('theme_preference');
    if (savedTheme.data) {
      setThemeState(savedTheme.data.theme);
    }
  }, []);

  // Effect to apply theme changes
  useEffect(() => {
    // Save theme preference
    storeData('theme_preference', { theme });
    
    if (theme === 'auto') {
      // Auto theme based on time of day
      const hours = new Date().getHours();
      const isDarkMode = hours < 6 || hours >= 19; // Dark mode from 7pm to 6am
      setCurrentTheme(isDarkMode ? 'dark' : 'light');
      
      // Set up interval to check time for auto switching
      const interval = setInterval(() => {
        const currentHour = new Date().getHours();
        const shouldBeDark = currentHour < 6 || currentHour >= 19;
        if ((shouldBeDark && currentTheme === 'light') || 
            (!shouldBeDark && currentTheme === 'dark')) {
          setCurrentTheme(shouldBeDark ? 'dark' : 'light');
        }
      }, 60000); // Check every minute
      
      return () => clearInterval(interval);
    } else {
      // Manual theme setting
      setCurrentTheme(theme);
    }
  }, [theme]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, currentTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);
