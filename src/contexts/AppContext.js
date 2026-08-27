import React, { createContext, useContext, useReducer } from "react";

// Initial state
const initialState = {
  user: null,
  bookmarks: [],
  progress: {
    sitesVisited: [],
    quizzesTaken: [],
    averageScore: 0,
    bestScore: 0,
    totalPoints: 0,
    badgesEarned: [],
    level: 1,
  },
  preferences: {
    theme: "light",
    language: "en",
    notifications: true,
  },
  ui: {
    sidebarOpen: false,
    loading: false,
    currentPage: "home",
  },
};

// Action types
export const actionTypes = {
  SET_USER: "SET_USER",
  LOGOUT: "LOGOUT",
  ADD_BOOKMARK: "ADD_BOOKMARK",
  REMOVE_BOOKMARK: "REMOVE_BOOKMARK",
  UPDATE_PROGRESS: "UPDATE_PROGRESS",
  SET_PREFERENCES: "SET_PREFERENCES",
  SET_LOADING: "SET_LOADING",
  SET_CURRENT_PAGE: "SET_CURRENT_PAGE",
  TOGGLE_SIDEBAR: "TOGGLE_SIDEBAR",
};

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case actionTypes.SET_USER:
      return {
        ...state,
        user: action.payload,
      };

    case actionTypes.LOGOUT:
      return {
        ...state,
        user: null,
        bookmarks: [],
        progress: initialState.progress,
      };

    case actionTypes.ADD_BOOKMARK:
      return {
        ...state,
        bookmarks: [...state.bookmarks, action.payload],
      };

    case actionTypes.REMOVE_BOOKMARK:
      return {
        ...state,
        bookmarks: state.bookmarks.filter(
          (b) => !(b.id === action.payload.id && b.type === action.payload.type)
        ),
      };

    case actionTypes.UPDATE_PROGRESS:
      return {
        ...state,
        progress: {
          ...state.progress,
          ...action.payload,
        },
      };

    case actionTypes.SET_PREFERENCES:
      return {
        ...state,
        preferences: {
          ...state.preferences,
          ...action.payload,
        },
      };

    case actionTypes.SET_LOADING:
      return {
        ...state,
        ui: {
          ...state.ui,
          loading: action.payload,
        },
      };

    case actionTypes.SET_CURRENT_PAGE:
      return {
        ...state,
        ui: {
          ...state.ui,
          currentPage: action.payload,
        },
      };

    case actionTypes.TOGGLE_SIDEBAR:
      return {
        ...state,
        ui: {
          ...state.ui,
          sidebarOpen: !state.ui.sidebarOpen,
        },
      };

    default:
      return state;
  }
}

// Create context
const AppContext = createContext();

// Provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const value = {
    state,
    dispatch,
    // Helper functions
    setUser: (user) => dispatch({ type: actionTypes.SET_USER, payload: user }),
    logout: () => dispatch({ type: actionTypes.LOGOUT }),
    addBookmark: (bookmark) =>
      dispatch({ type: actionTypes.ADD_BOOKMARK, payload: bookmark }),
    removeBookmark: (id, type) =>
      dispatch({ type: actionTypes.REMOVE_BOOKMARK, payload: { id, type } }),
    updateProgress: (progress) =>
      dispatch({ type: actionTypes.UPDATE_PROGRESS, payload: progress }),
    setPreferences: (preferences) =>
      dispatch({ type: actionTypes.SET_PREFERENCES, payload: preferences }),
    setLoading: (loading) =>
      dispatch({ type: actionTypes.SET_LOADING, payload: loading }),
    setCurrentPage: (page) =>
      dispatch({ type: actionTypes.SET_CURRENT_PAGE, payload: page }),
    toggleSidebar: () => dispatch({ type: actionTypes.TOGGLE_SIDEBAR }),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Custom hook to use context
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
