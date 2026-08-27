import { supabase } from "../lib/supabaseClient";

// Clerk user functions (for AccountPage, Profile, etc.)
export const createOrUpdateUser = async (clerkUser) => {
  if (!clerkUser) return null;
  console.log("👤 Clerk user sync");
  return null;
};

export const getUserData = async (clerkId) => {
  if (!clerkId) return null;
  console.log("👤 Clerk user data");
  return null;
};

export const updateUserProfile = async (userId, updates) => {
  console.log("👤 Clerk profile update");
  return null;
};

// ✅ THIS WAS MISSING - NOW FIXED
export const getUserStats = async (userId) => {
  if (!userId) return null;
  console.log("👤 Clerk user stats");
  return { total_points: 0 }; // Dummy data
};

// Anonymous helpers (UploadForm.jsx)
export const getAnonymousSubmitter = () => ({
  type: "anonymous",
  submitted_at: new Date().toISOString(),
});

export const isAnonymousSubmission = () => true;
