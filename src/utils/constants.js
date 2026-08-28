// API Configuration
export const API_ENDPOINTS = {
  PREMIUM_SITES: "/premium-sites",
  FESTIVALS: "/festivals",
  ARTS: "/arts",
  GLOBAL_GEMS: "/global-gems",
  DESTINATIONS: "/destinations",
  REVIEWS: "/reviews",
  AUTH: "/auth",
  USERS: "/users",
  BOOKMARKS: "/bookmarks",
  QUIZZES: "/quizzes",
  SEARCH: "/search",
};

// Popular Travel Destinations / Countries
export const GLOBAL_DESTINATIONS = [
  "France", "Italy", "Japan", "Thailand", "Spain",
  "United States", "United Kingdom", "Australia",
  "Turkey", "Greece", "Switzerland", "New Zealand",
  "Iceland", "Morocco", "Peru", "South Korea",
  "Brazil", "Egypt", "Portugal", "Norway",
  "India", "Canada", "Mexico", "Indonesia",
  "Vietnam", "Croatia", "South Africa", "Argentina",
  "Czech Republic", "Ireland", "Netherlands", "Austria",
  "Singapore", "Malaysia", "Colombia", "Chile",
];

// Landmark Categories
export const PREMIUM_CATEGORIES = [
  "UNESCO World Heritage Site",
  "Archaeological Site",
  "Ancient Wonder",
  "Historic Landmark",
  "Royal Palace",
  "Cultural Site",
  "Natural Wonder",
  "Cultural Landscape",
  "Monument",
  "National Park",
  "Museum",
  "Gallery",
  "Library",
  "Other",
];

// Festival Categories
export const FESTIVAL_CATEGORIES = [
  "Music Festival",
  "Cultural Celebration",
  "Food & Drink Festival",
  "Religious Festival",
  "Art & Film Festival",
  "Carnival",
  "Harvest Festival",
  "Seasonal Festival",
  "National Holiday",
  "Sports Event",
  "Folk Festival",
  "Light & Lantern Festival",
  "Other",
];

// Art Categories
export const ART_CATEGORIES = [
  "Classical Dance",
  "Folk Dance",
  "Classical Music",
  "Folk Music",
  "Traditional Painting",
  "Folk Art",
  "Sculpture",
  "Traditional Craft",
  "Textile Art",
  "Pottery",
  "Jewelry Making",
  "Wood Carving",
  "Metal Work",
  "Other",
];

// Difficulty Levels
export const DIFFICULTY_LEVELS = {
  EASY: "Easy",
  MODERATE: "Moderate",
  HARD: "Hard",
  EXPERT: "Expert",
};

// Quiz Categories
export const QUIZ_CATEGORIES = [
  "heritage-monuments",
  "festivals",
  "classical-arts",
  "ancient-history",
  "regional-culture",
  "hidden-gems",
];

// User Roles
export const USER_ROLES = {
  VISITOR: "visitor",
  MEMBER: "member",
  CONTRIBUTOR: "contributor",
  MODERATOR: "moderator",
  ADMIN: "admin",
};

// Application Settings
export const APP_CONFIG = {
  NAME: "SafarX",
  VERSION: "1.0.0",
  DESCRIPTION: "Your Global Travel Companion",
  KEYWORDS: ["travel", "explore", "world", "destinations", "adventure", "culture"],
  DEFAULT_LANGUAGE: "en",
  SUPPORTED_LANGUAGES: ["en"],
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_IMAGES_PER_UPLOAD: 8,
  ITEMS_PER_PAGE: 20,
  SEARCH_DEBOUNCE_MS: 300,
  TOAST_DURATION: 5000,
  MAP_CENTER: [20.0, 0.0], // World center
  MAP_ZOOM: 3,
};

// Color Themes
export const COLORS = {
  SKY_BLUE: "#0EA5E9",
  WHITE: "#FFFFFF",
  OCEAN_TEAL: "#0D9488",
  ACCENT_RED: "#DC2626",
  PEACOCK_BLUE: "#0EA5E9",
  GOLD: "#F59E0B",
};

// Social Media Links
export const SOCIAL_LINKS = {
  FACEBOOK: "https://facebook.com/safar360",
  TWITTER: "https://twitter.com/safar360",
  INSTAGRAM: "https://instagram.com/safar360",
  YOUTUBE: "https://youtube.com/@safarx",
  LINKEDIN: "https://linkedin.com/company/safar360",
};

// External API Keys (Use environment variables in production)
export const API_KEYS = {
  GOOGLE_MAPS: import.meta.env.VITE_GOOGLE_MAPS_KEY || "",
  YOUTUBE: import.meta.env.VITE_YOUTUBE_KEY || "",
  WEATHER: import.meta.env.VITE_WEATHER_KEY || "",
};

// Regular Expressions
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  MOBILE: /^\+?[1-9]\d{1,14}$/,
  POSTCODE: /^[a-zA-Z0-9\s-]{3,10}$/,
  COORDINATES: /^-?([1-8]?[0-9](\.[0-9]+)?|90(\.0+)?)$/,
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  FORBIDDEN: "Access denied.",
  NOT_FOUND: "The requested resource was not found.",
  SERVER_ERROR: "Internal server error. Please try again later.",
  VALIDATION_ERROR: "Please check your input and try again.",
  FILE_TOO_LARGE: "File size exceeds the maximum limit.",
  INVALID_FILE_TYPE: "Invalid file type.",
  LOCATION_DENIED: "Location access denied.",
  CAMERA_DENIED: "Camera access denied.",
  MICROPHONE_DENIED: "Microphone access denied.",
};

// Success Messages
export const SUCCESS_MESSAGES = {
  PROFILE_UPDATED: "Profile updated successfully!",
  BOOKMARK_ADDED: "Added to bookmarks!",
  BOOKMARK_REMOVED: "Removed from bookmarks.",
  REVIEW_SUBMITTED: "Review submitted successfully!",
  SUBMISSION_SUCCESS: "Submission sent for review!",
  QUIZ_COMPLETED: "Quiz completed successfully!",
  ACCOUNT_CREATED: "Account created successfully!",
  LOGIN_SUCCESS: "Welcome back!",
  LOGOUT_SUCCESS: "Logged out successfully.",
};
