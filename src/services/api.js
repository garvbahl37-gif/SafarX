import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : "http://localhost:1337/api";

const AI_API_URL = import.meta.env.VITE_AI_API_URL || "http://localhost:8000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const aiClient = axios.create({
  baseURL: AI_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

class ApiService {
  constructor() {
    this.apiClient = apiClient;
    this.aiClient = aiClient;
    this.token = null;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      this.apiClient.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${token}`;
    } else {
      delete this.apiClient.defaults.headers.common["Authorization"];
    }
  }

  async get(url, params = {}) {
    try {
      const response = await this.apiClient.get(url, { params });
      return response.data;
    } catch (error) {
      console.error(`Error GET ${url}:`, error);
      throw error;
    }
  }

  async post(url, data, headers = {}) {
    try {
      const response = await this.apiClient.post(url, data, { headers });
      return response.data;
    } catch (error) {
      console.error(`Error POST ${url}:`, error);
      throw error;
    }
  }

  async put(url, data) {
    try {
      const response = await this.apiClient.put(url, data);
      return response.data;
    } catch (error) {
      console.error(`Error PUT ${url}:`, error);
      throw error;
    }
  }

  async delete(url) {
    try {
      const response = await this.apiClient.delete(url);
      return response.data;
    } catch (error) {
      console.error(`Error DELETE ${url}:`, error);
      throw error;
    }
  }

  // ============================
  // Heritage Sites
  // ============================
  async getHeritageSites(params = {}) {
    return this.get("/hers", { populate: "*", ...params });
  }

  async getHeritageSite(id) {
    return this.get(`/hers/${id}`, { populate: "*" });
  }

  async searchHeritageSites(query) {
    return this.get("/hers/search", { q: query });
  }

  // ============================
  // Festivals
  // ============================
  async getFestivals(params = {}) {
    return this.get("/festivals", { populate: "*", ...params });
  }

  async getFestival(id) {
    return this.get(`/festivals/${id}`, { populate: "*" });
  }

  // ============================
  // Arts
  // ============================
  async getArts(params = {}) {
    return this.get("/art-forms", { populate: "*", ...params });
  }

  async getArt(id) {
    return this.get(`/art-forms/${id}`, { populate: "*" });
  }

  // ============================
  // Hidden Gems
  // ============================
  async getHiddenGems(params = {}) {
    return this.get("/hidden-gems", { populate: "*", ...params });
  }

  async submitHiddenGem(formData) {
    // For FormData, don't set Content-Type explicitly; let axios handle it
    return this.post("/hidden-gems", formData, {
      "Content-Type": "multipart/form-data",
    });
  }

  // ============================
  // States
  // ============================
  async getStates(params = {}) {
    return this.get("/states", { populate: "*", ...params });
  }

  async getStateById(id) {
    return this.get(`/states/${id}`, { populate: "*" });
  }

  // ============================
  // Reviews
  // ============================
  async getReviews(itemType, itemId) {
    return this.get("/reviews", { itemType, itemId, populate: "*" });
  }

  async submitReview(reviewData) {
    return this.post("/reviews", reviewData);
  }

  // ============================
  // User Management
  // ============================
  async login(credentials) {
    return this.post("/auth/local", credentials);
  }

  async register(userData) {
    return this.post("/auth/local/register", userData);
  }

  async getProfile() {
    return this.get("/users/me");
  }

  async updateProfile(profileData) {
    return this.put("/users/me", profileData);
  }

  // ============================
  // Bookmarks
  // ============================
  async getBookmarks(params = {}) {
    return this.get("/bookmarks", { populate: "*", ...params });
  }

  async addBookmark(bookmarkData) {
    return this.post("/bookmarks", bookmarkData);
  }

  async removeBookmark(id) {
    return this.delete(`/bookmarks/${id}`);
  }

  // ============================
  // Quiz
  // ============================
  async getQuizzes(params = {}) {
    return this.get("/quizzes", { populate: "*", ...params });
  }

  async getQuiz(id) {
    return this.get(`/quizzes/${id}`, { populate: "*" });
  }

  async submitQuizResult(resultData) {
    return this.post("/quiz-results", resultData);
  }

  // ============================
  // AI Chat
  // ============================
  async chatWithAI(message, context = {}) {
    try {
      const response = await this.aiClient.post("/chat", { message, context });
      return response.data;
    } catch (error) {
      console.error("AI chat failed:", error);
      throw error;
    }
  }

  // ============================
  // Search
  // ============================
  async globalSearch(query) {
    return this.get("/search", { q: query });
  }

  async getSearchSuggestions(query) {
    return this.get("/search/suggestions", { q: query });
  }
}

export default new ApiService();
