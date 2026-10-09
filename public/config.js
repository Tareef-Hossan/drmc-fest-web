// Configuration for DRMC Tech Carnival 2026
// Update these values for your deployment

const CONFIG = {
  // API Base URL - update to your Firebase Functions URL
  // For local development: 'http://localhost:5001/your-project/us-central1/api'
  // For production: 'https://your-project.firebaseapp.com/api'
  API_BASE: 'https://your-project.firebaseapp.com/api',

  // Enable/disable API integration
  // Set to false to use hardcoded data (for testing without backend)
  USE_API: false,

  // Event details
  EVENT: {
    name: '9th DRMC International Tech Carnival 2026',
    startDate: '2026-10-08',
    endDate: '2026-10-10',
    venue: 'Dhaka Residential Model College',
    bKashNumber: '01814333287'
  }
};

// Export for use in HTML
if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
}
