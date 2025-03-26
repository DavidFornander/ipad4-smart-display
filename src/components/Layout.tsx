import React, { useEffect } from 'react';
import Head from 'next/head';
import { useTheme } from '../contexts/ThemeContext';
import styles from '../styles/Layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentTheme } = useTheme();
  
  // Prevent iOS Safari behaviors like rubber-band scrolling
  useEffect(() => {
    document.addEventListener('touchmove', (e) => {
      // Only prevent default for actual page scrolling, not in scrollable elements
      if (!(e.target as any).closest('.scrollable, [style*="overflow"]')) {
        e.preventDefault();
      }
    }, { passive: false });
    
    // Keep screen on by refreshing meta tag
    const keepScreenOn = () => {
      const metaTag = document.querySelector('meta[name="apple-mobile-web-app-capable"]');
      if (metaTag) {
        metaTag.setAttribute('content', 'yes');
      }
    };
    
    const interval = setInterval(keepScreenOn, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className={styles.container} data-theme={currentTheme}>
      <Head>
        <title>iPad Dashboard</title>
        <meta name="description" content="Smart dashboard for iPad 4th generation" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Dashboard" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="apple-touch-startup-image" href="/launch.png" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <main className={styles.main}>
        <div className={styles.content}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;