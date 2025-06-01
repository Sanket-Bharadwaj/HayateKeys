export interface TypingStats {
  totalTests: number;
  totalWords: number;
  totalTime: number;
  bestWpm: number;
  bestAccuracy: number;
  averageWpm: number;
  averageAccuracy: number;
  longestStreak: number;
  totalErrors: number;
  testsToday: number;
  lastTestDate: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface TestResult {
  id: string;
  date: string;
  mode: string;
  wpm: number;
  accuracy: number;
  streak: number;
  errors: number;
  duration: number;
  text: string;
  score: number;
}

export const getStats = (): TypingStats => {
  const stored = localStorage.getItem('hayatekeys-stats');
  if (!stored) {
    const defaultStats: TypingStats = {
      totalTests: 0,
      totalWords: 0,
      totalTime: 0,
      bestWpm: 0,
      bestAccuracy: 0,
      averageWpm: 0,
      averageAccuracy: 0,
      longestStreak: 0,
      totalErrors: 0,
      testsToday: 0,
      lastTestDate: ''
    };
    saveStats(defaultStats);
    return defaultStats;
  }
  return JSON.parse(stored);
};

export const saveStats = (stats: TypingStats) => {
  localStorage.setItem('hayatekeys-stats', JSON.stringify(stats));
};

export const getAchievements = (): Achievement[] => {
  const stored = localStorage.getItem('hayatekeys-achievements');
  if (!stored) {
    const defaultAchievements: Achievement[] = [
      { id: 'first-test', name: 'First Steps', description: 'Complete your first typing test', icon: '🎯', unlocked: false },
      { id: 'speed-demon', name: 'Speed Demon', description: 'Reach 60 WPM', icon: '⚡', unlocked: false },
      { id: 'accuracy-ace', name: 'Accuracy Ace', description: 'Achieve 95% accuracy', icon: '🎯', unlocked: false },
      { id: 'streak-master', name: 'Streak Master', description: 'Get a 50+ character streak', icon: '🔥', unlocked: false },
      { id: 'daily-warrior', name: 'Daily Warrior', description: 'Complete 5 tests in one day', icon: '🏆', unlocked: false },
      { id: 'perfectionist', name: 'Perfectionist', description: 'Complete a test with 100% accuracy', icon: '💎', unlocked: false }
    ];
    saveAchievements(defaultAchievements);
    return defaultAchievements;
  }
  return JSON.parse(stored);
};

export const saveAchievements = (achievements: Achievement[]) => {
  localStorage.setItem('hayatekeys-achievements', JSON.stringify(achievements));
};

export const getTestHistory = (): TestResult[] => {
  const stored = localStorage.getItem('hayatekeys-history');
  return stored ? JSON.parse(stored) : [];
};

export const saveTestResult = (result: TestResult) => {
  const history = getTestHistory();
  history.unshift(result);
  // Keep only last 100 results
  if (history.length > 100) {
    history.splice(100);
  }
  localStorage.setItem('hayatekeys-history', JSON.stringify(history));
};
