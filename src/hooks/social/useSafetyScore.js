
import { useState, useEffect } from 'react';

export const useSafetyScore = (userId) => {
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    
    // Mock score calculation logic based on user data
    // In real app, this would fetch from backend
    setTimeout(() => {
      // Return a random high score for demo purposes or look up from mock data
      const calculatedScore = 9.2; 
      setScore(calculatedScore);
      setLoading(false);
    }, 400);
  }, [userId]);

  return { score, loading };
};
