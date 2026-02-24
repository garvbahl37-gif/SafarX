import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Chat with AI agent
export const sendMessage = async (message, sessionId = 'default') => {
    try {
        const response = await api.post('/agent', {
            message,
            session_id: sessionId,
        });
        return response.data;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};

// Web search via Tavily
export const searchWeb = async (query, maxResults = 5) => {
    try {
        const response = await api.post('/search', {
            query,
            max_results: maxResults,
        });
        return response.data;
    } catch (error) {
        console.error('Error searching web:', error);
        throw error;
    }
};



// Generate itinerary
export const generateItinerary = async (destination, days, preferences = null) => {
    try {
        const response = await api.post('/itinerary', {
            destination,
            days,
            preferences,
        });
        return response.data;
    } catch (error) {
        console.error('Error generating itinerary:', error);
        throw error;
    }
};

// Get recommendations
export const getRecommendations = async (preferences) => {
    try {
        const response = await api.post('/recommend', preferences);
        return response.data;
    } catch (error) {
        console.error('Error getting recommendations:', error);
        throw error;
    }
};



// Clear chat session
export const clearSession = async (sessionId = 'default') => {
    try {
        const response = await api.delete(`/session/${sessionId}`);
        return response.data;
    } catch (error) {
        console.error('Error clearing session:', error);
        throw error;
    }
};

export default api;
