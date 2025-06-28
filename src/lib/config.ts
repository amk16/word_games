// Configuration for the application
export const config = {
  // Backend API configuration
  backend: {
    url: import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000',
    timeout: 10000, // 10 seconds timeout for API calls
  },
  
  // Victory rewards configuration
  victoryRewards: {
    defaultImageCount: 5,
    imageRotationInterval: 4000, // 4 seconds
    confettiDuration: 5000, // 5 seconds
  },
} as const;

export default config; 