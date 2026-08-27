import { useState } from "react";
import { useLocalStorage } from "./useLocalStorage";

export function useProgress() {
  const [progress, setProgress] = useLocalStorage("safar360_progress", {
    sitesVisited: [],
    quizzesTaken: [],
    averageScore: 0,
    bestScore: 0,
    totalPoints: 0,
    badgesEarned: [],
    level: 1,
    joinDate: new Date().toISOString(),
  });

  const updateProgress = (key, value) => {
    setProgress((prev) => {
      const updated = { ...prev };

      if (key === "sitesVisited" && !prev.sitesVisited.includes(value)) {
        updated.sitesVisited = [...prev.sitesVisited, value];
      } else if (key === "quizzesTaken") {
        updated.quizzesTaken = [...prev.quizzesTaken, value];

        // Recalculate average and best score
        const scores = updated.quizzesTaken.map(
          (quiz) => (quiz.score / quiz.total) * 100
        );
        updated.averageScore = Math.round(
          scores.reduce((a, b) => a + b, 0) / scores.length
        );
        updated.bestScore = Math.max(...scores);
      } else if (key === "totalPoints") {
        updated.totalPoints = prev.totalPoints + value;
        updated.level = Math.floor(updated.totalPoints / 1000) + 1;
      } else if (key === "badgesEarned" && !prev.badgesEarned.includes(value)) {
        updated.badgesEarned = [...prev.badgesEarned, value];
      } else {
        updated[key] = value;
      }

      return updated;
    });
  };

  const resetProgress = () => {
    setProgress({
      sitesVisited: [],
      quizzesTaken: [],
      averageScore: 0,
      bestScore: 0,
      totalPoints: 0,
      badgesEarned: [],
      level: 1,
      joinDate: new Date().toISOString(),
    });
  };

  return {
    progress,
    updateProgress,
    resetProgress,
  };
}
