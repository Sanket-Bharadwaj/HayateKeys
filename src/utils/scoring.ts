
export const calculateScore = (wpm: number, accuracy: number, streak: number, errors: number, duration: number) => {
  const baseScore = wpm * 10;
  const accuracyBonus = accuracy * 5;
  const streakBonus = Math.min(streak * 2, 200);
  const errorPenalty = errors * 10;
  const consistencyBonus = duration > 60 ? 50 : 0;
  
  return Math.max(0, baseScore + accuracyBonus + streakBonus - errorPenalty + consistencyBonus);
};

export const getComboMultiplier = (streak: number): number => {
  if (streak >= 50) return 2.0;
  if (streak >= 25) return 1.5;
  if (streak >= 10) return 1.2;
  return 1.0;
};

export const checkAchievements = (stats: any, achievements: any[], result: any) => {
  const newUnlocks: string[] = [];
  
  achievements.forEach(achievement => {
    if (!achievement.unlocked) {
      let shouldUnlock = false;
      
      switch (achievement.id) {
        case 'first-test':
          shouldUnlock = stats.totalTests >= 1;
          break;
        case 'speed-demon':
          shouldUnlock = result.wpm >= 60;
          break;
        case 'accuracy-ace':
          shouldUnlock = result.accuracy >= 95;
          break;
        case 'streak-master':
          shouldUnlock = result.streak >= 50;
          break;
        case 'daily-warrior':
          shouldUnlock = stats.testsToday >= 5;
          break;
        case 'perfectionist':
          shouldUnlock = result.accuracy === 100;
          break;
      }
      
      if (shouldUnlock) {
        achievement.unlocked = true;
        achievement.unlockedAt = new Date().toISOString();
        newUnlocks.push(achievement.name);
      }
    }
  });
  
  return newUnlocks;
};
