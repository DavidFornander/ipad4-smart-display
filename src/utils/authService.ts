// Authentication utilities for external services

import { storeData, retrieveData, removeData } from './storageService';

// Supported service types
export type ServiceType = 'google' | 'apple_health' | 'ifttt' | 'email' | 'todo';

// Auth tokens interface
export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number; // Unix timestamp in milliseconds
  tokenType?: string;
}

// Service credentials
export interface ServiceCredentials {
  clientId?: string;
  clientSecret?: string;
  apiKey?: string;
  username?: string;
  password?: string; // Note: Should be used carefully, prefer OAuth where possible
}

// Initialize OAuth flow - returns URL to redirect to
export const initializeOAuth = (
  serviceType: ServiceType,
  credentials: ServiceCredentials,
  redirectUri: string,
  scope: string[]
): string => {
  switch (serviceType) {
    case 'google':
      return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${credentials.clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope.join(' '))}&access_type=offline&prompt=consent`;
    case 'ifttt':
      return `https://ifttt.com/api/v2/oauth2/authorize?client_id=${credentials.clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope.join(' '))}`;
    // Add other OAuth providers as needed
    default:
      throw new Error(`OAuth not supported for service type: ${serviceType}`);
  }
};

// Handle OAuth callback and exchange code for tokens
export const handleOAuthCallback = (
  serviceType: ServiceType,
  code: string,
  credentials: ServiceCredentials,
  redirectUri: string
): Promise<AuthTokens> => {
  let tokenUrl: string;
  let body: Record<string, string>;
  
  switch (serviceType) {
    case 'google':
      tokenUrl = 'https://oauth2.googleapis.com/token';
      body = {
        code,
        client_id: credentials.clientId || '',
        client_secret: credentials.clientSecret || '',
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      };
      break;
    case 'ifttt':
      tokenUrl = 'https://ifttt.com/api/v2/oauth2/token';
      body = {
        code,
        client_id: credentials.clientId || '',
        client_secret: credentials.clientSecret || '',
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      };
      break;
    default:
      return Promise.reject(new Error(`OAuth not supported for service type: ${serviceType}`));
  }

  return fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: Object.entries(body)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&')
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      const tokens: AuthTokens = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        tokenType: data.token_type,
        expiresAt: data.expires_in ? (new Date().getTime() + (data.expires_in * 1000)) : undefined
      };
      
      // Store tokens
      storeAuthTokens(serviceType, tokens);
      
      return tokens;
    });
};

// Refresh OAuth tokens when they expire
export const refreshTokens = (
  serviceType: ServiceType,
  credentials: ServiceCredentials
): Promise<AuthTokens> => {
  const currentTokens = getAuthTokens(serviceType);
  
  if (!currentTokens || !currentTokens.refreshToken) {
    return Promise.reject(new Error('No refresh token available'));
  }
  
  let tokenUrl: string;
  let body: Record<string, string>;
  
  switch (serviceType) {
    case 'google':
      tokenUrl = 'https://oauth2.googleapis.com/token';
      body = {
        refresh_token: currentTokens.refreshToken,
        client_id: credentials.clientId || '',
        client_secret: credentials.clientSecret || '',
        grant_type: 'refresh_token'
      };
      break;
    case 'ifttt':
      tokenUrl = 'https://ifttt.com/api/v2/oauth2/token';
      body = {
        refresh_token: currentTokens.refreshToken,
        client_id: credentials.clientId || '',
        client_secret: credentials.clientSecret || '',
        grant_type: 'refresh_token'
      };
      break;
    default:
      return Promise.reject(new Error(`Token refresh not supported for service type: ${serviceType}`));
  }

  return fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: Object.entries(body)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&')
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      const tokens: AuthTokens = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || currentTokens.refreshToken,
        tokenType: data.token_type,
        expiresAt: data.expires_in ? (new Date().getTime() + (data.expires_in * 1000)) : undefined
      };
      
      // Store updated tokens
      storeAuthTokens(serviceType, tokens);
      
      return tokens;
    });
};

// Store authentication tokens
export const storeAuthTokens = (serviceType: ServiceType, tokens: AuthTokens): boolean => {
  return storeData(`auth_${serviceType}`, tokens);
};

// Get stored authentication tokens
export const getAuthTokens = (serviceType: ServiceType): AuthTokens | null => {
  const result = retrieveData<AuthTokens>(`auth_${serviceType}`);
  return result.data;
};

// Check if service is authenticated
export const isAuthenticated = (serviceType: ServiceType): boolean => {
  const tokens = getAuthTokens(serviceType);
  
  if (!tokens) {
    return false;
  }
  
  // Check if token is expired
  if (tokens.expiresAt && new Date().getTime() > tokens.expiresAt) {
    return false;
  }
  
  return true;
};

// Clear authentication data
export const clearAuthentication = (serviceType: ServiceType): boolean => {
  return removeData(`auth_${serviceType}`);
};
