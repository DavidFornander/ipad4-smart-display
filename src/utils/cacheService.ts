// Data caching utilities for offline support

import { storeData, retrieveData } from './storageService';

// Cache constants
const CACHE_PREFIX = 'api_cache_';
const DEFAULT_CACHE_TIME = 30; // Default cache time in minutes

// Cache API response
export const cacheApiResponse = <T>(endpoint: string, data: T, expiryMinutes: number = DEFAULT_CACHE_TIME): boolean => {
  const cacheKey = `${CACHE_PREFIX}${endpoint}`;
  return storeData(cacheKey, data, expiryMinutes);
};

// Get cached API response
export const getCachedApiResponse = <T>(endpoint: string): { data: T | null; isStale: boolean } => {
  const cacheKey = `${CACHE_PREFIX}${endpoint}`;
  return retrieveData<T>(cacheKey);
};

// Fetch data with cache support
export const fetchWithCache = <T>(
  url: string, 
  options?: RequestInit, 
  cacheTime: number = DEFAULT_CACHE_TIME
): Promise<{ data: T; fromCache: boolean; isStale: boolean }> => {
  // Check cache first
  const cachedResponse = getCachedApiResponse<T>(url);
  
  if (cachedResponse.data) {
    // Return cached data, but refresh in background if stale
    if (cachedResponse.isStale) {
      // Silent refresh in background
      fetch(url, options)
        .then(response => {
          if (response.ok) return response.json();
          throw new Error(`HTTP error! Status: ${response.status}`);
        })
        .then(freshData => {
          cacheApiResponse(url, freshData as T, cacheTime);
        })
        .catch(error => {
          console.error('Error refreshing stale data:', error);
        });
    }
    
    return Promise.resolve({
      data: cachedResponse.data,
      fromCache: true,
      isStale: cachedResponse.isStale
    });
  }
  
  // No cache or expired cache, fetch fresh data
  return fetch(url, options)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      // Cache the new data
      cacheApiResponse(url, data as T, cacheTime);
      
      return {
        data: data as T,
        fromCache: false,
        isStale: false
      };
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      throw error;
    });
};

// Clear specific cache entry
export const clearCache = (endpoint: string): boolean => {
  const cacheKey = `${CACHE_PREFIX}${endpoint}`;
  try {
    localStorage.removeItem(cacheKey);
    return true;
  } catch (error) {
    console.error('Error clearing cache:', error);
    return false;
  }
};

// Clear all cached API responses
export const clearAllCache = (): boolean => {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    }
    return true;
  } catch (error) {
    console.error('Error clearing all cache:', error);
    return false;
  }
};
