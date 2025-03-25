import React, { useState, useEffect } from 'react';

interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
  location: string;
  forecast: Array<{
    day: string;
    high: number;
    low: number;
    condition: string;
  }>;
}

const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchWeather();
    
    // Refresh weather data every 30 minutes
    const intervalId = setInterval(fetchWeather, 30 * 60 * 1000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);
  
  const fetchWeather = () => {
    setLoading(true);
    
    // Mock API call (replace with actual API in production)
    // Using Promise instead of async/await for iOS 10 compatibility
    new Promise<WeatherData>((resolve) => {
      setTimeout(() => {
        resolve({
          temperature: 72,
          condition: 'Sunny',
          icon: '☀️',
          location: 'San Francisco, CA',
          forecast: [
            { day: 'Mon', high: 74, low: 63, condition: 'Sunny' },
            { day: 'Tue', high: 70, low: 58, condition: 'Partly Cloudy' },
            { day: 'Wed', high: 68, low: 60, condition: 'Cloudy' },
            { day: 'Thu', high: 72, low: 61, condition: 'Sunny' },
            { day: 'Fri', high: 73, low: 62, condition: 'Sunny' }
          ]
        });
      }, 500);
    })
    .then(data => {
      setWeather(data);
      setLoading(false);
      setError(null);
    })
    .catch(err => {
      setError('Failed to load weather data');
      setLoading(false);
    });
  };
  
  if (loading) {
    return <div className="widget weather-widget">Loading weather...</div>;
  }
  
  if (error) {
    return <div className="widget weather-widget">Error: {error}</div>;
  }
  
  return (
    <div className="widget weather-widget">
      <div className="widget-inner">
        {weather && (
          <>
            <div className="weather-current">
              <div className="weather-icon">{weather.icon}</div>
              <div className="weather-temp">{weather.temperature}°</div>
              <div className="weather-condition">{weather.condition}</div>
              <div className="weather-location">{weather.location}</div>
            </div>
            <div className="weather-forecast">
              {weather.forecast.map((day, index) => (
                <div key={index} className="forecast-day">
                  <div className="day-name">{day.day}</div>
                  <div className="day-temp">H: {day.high}° L: {day.low}°</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WeatherWidget;
