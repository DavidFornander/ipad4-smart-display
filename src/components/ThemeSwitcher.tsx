import React from 'react';
import { useTheme, ThemeMode } from '../contexts/ThemeContext';
import styles from '../styles/ThemeSwitcher.module.css';

const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();
  
  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTheme(e.target.value as ThemeMode);
  };
  
  return (
    <div className={styles.themeSwitcher}>
      <label htmlFor="theme-select" className={styles.themeLabel}>
        Theme:
      </label>
      <select 
        id="theme-select" 
        value={theme} 
        onChange={handleThemeChange}
        className={styles.themeSelect}
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="auto">Auto (Time-based)</option>
      </select>
    </div>
  );
};

export default ThemeSwitcher;
