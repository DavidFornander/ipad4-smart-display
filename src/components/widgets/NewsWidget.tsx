import React, { useState, useEffect } from 'react';

interface NewsItem {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
}

const NewsWidget: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchNews();
    
    // Refresh news every hour
    const intervalId = setInterval(fetchNews, 60 * 60 * 1000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);
  
  const fetchNews = () => {
    setLoading(true);
    
    // Mock API call (replace with actual API in production)
    // Using Promise instead of async/await for iOS 10 compatibility
    new Promise<NewsItem[]>((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: '1',
            title: 'Scientists discover new renewable energy source',
            source: 'Science Daily',
            url: 'https://example.com/news/1',
            publishedAt: '2023-03-15T14:30:00Z'
          },
          {
            id: '2',
            title: 'Tech company reveals latest smartphone innovations',
            source: 'Tech Review',
            url: 'https://example.com/news/2',
            publishedAt: '2023-03-15T12:15:00Z'
          },
          {
            id: '3',
            title: 'Global economic forum discusses sustainable growth',
            source: 'Financial Times',
            url: 'https://example.com/news/3',
            publishedAt: '2023-03-15T10:45:00Z'
          },
          {
            id: '4',
            title: 'New health study reveals benefits of Mediterranean diet',
            source: 'Health Today',
            url: 'https://example.com/news/4',
            publishedAt: '2023-03-15T09:20:00Z'
          }
        ]);
      }, 500);
    })
    .then(data => {
      setNews(data);
      setLoading(false);
      setError(null);
    })
    .catch(err => {
      setError('Failed to load news');
      setLoading(false);
    });
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  if (loading && news.length === 0) {
    return <div className="widget news-widget">Loading news...</div>;
  }
  
  if (error && news.length === 0) {
    return <div className="widget news-widget">Error: {error}</div>;
  }
  
  return (
    <div className="widget news-widget">
      <div className="widget-inner">
        <h3 className="widget-title">Latest News</h3>
        <ul className="news-list">
          {news.map(item => (
            <li key={item.id} className="news-item">
              <h4 className="news-title">{item.title}</h4>
              <div className="news-meta">
                <span className="news-source">{item.source}</span>
                <span className="news-time">{formatDate(item.publishedAt)}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default NewsWidget;
