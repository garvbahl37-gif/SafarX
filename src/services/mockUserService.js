const generateMockUserId = () => {
  return `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};

const generateMockSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};

// ✅ Mock user that persists for current session
const getMockUser = () => {
  let mockUser = null;

  // Check if mock user already exists in session storage
  if (typeof window !== "undefined") {
    const stored = sessionStorage.getItem("safar360_mock_user");
    if (stored) {
      try {
        mockUser = JSON.parse(stored);
      } catch (e) {
        console.log("Creating new mock user");
      }
    }
  }

  // Create new mock user if doesn't exist
  if (!mockUser) {
    mockUser = {
      id: generateMockUserId(),
      sessionId: generateMockSessionId(),
      type: "anonymous_mock",
      createdAt: new Date().toISOString(),
      userAgent:
        typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
      ipAddress: null,
    };

    // Store in session storage
    if (typeof window !== "undefined") {
      sessionStorage.setItem("safar360_mock_user", JSON.stringify(mockUser));
    }
  }

  return mockUser;
};

// ✅ Get submitter info for database insert
export const getSubmitterInfo = () => {
  const mockUser = getMockUser();

  return {
    type: "anonymous",
    mock_user_id: mockUser.id,
    session_id: mockUser.sessionId,
    submitted_at: new Date().toISOString(),
    submission_method: "web_form",
    user_agent: mockUser.userAgent,
  };
};

// ✅ Get current mock user
export const getCurrentMockUser = () => {
  return getMockUser();
};

// ✅ Clear mock user (optional - for testing)
export const clearMockUser = () => {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("safar360_mock_user");
    console.log("✅ Mock user cleared from session");
  }
};

export default {
  getSubmitterInfo,
  getCurrentMockUser,
  clearMockUser,
};
