// API configuration - uses environment variable or falls back to localhost for development
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

