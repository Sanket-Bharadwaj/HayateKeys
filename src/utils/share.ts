
export interface ShareData {
  wpm: number;
  accuracy: number;
  streak: number;
  score: number;
}

export const generateShareText = (data: ShareData): string => {
  const messages = [
    `🚀 Just crushed it with ${data.wpm} WPM and ${data.accuracy}% accuracy on HayateKeys! Think you can beat my score of ${data.score}? 💪`,
    `⚡ Lightning fingers! ${data.wpm} WPM, ${data.accuracy}% accuracy, ${data.streak} max streak! Your turn to try HayateKeys! 🔥`,
    `🎯 Nailed it! ${data.wpm} WPM with ${data.accuracy}% accuracy on HayateKeys. Can you type faster? Challenge accepted! 🏆`,
    `💯 ${data.accuracy}% accuracy at ${data.wpm} WPM! My typing game is strong 💪 Try HayateKeys and let's see what you got!`
  ];
  
  return messages[Math.floor(Math.random() * messages.length)];
};

export const shareScore = async (data: ShareData) => {
  const text = generateShareText(data);
  const url = `${window.location.origin}?challenge=${btoa(JSON.stringify(data))}`;
  const shareText = `${text}\n\n${url}`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: 'HayateKeys Score',
        text: shareText,
        url: url
      });
    } catch (error) {
      fallbackShare(shareText);
    }
  } else {
    fallbackShare(shareText);
  }
};

const fallbackShare = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    // Could show a toast here
  });
};

export const getSharedChallenge = (): ShareData | null => {
  const params = new URLSearchParams(window.location.search);
  const challenge = params.get('challenge');
  
  if (challenge) {
    try {
      return JSON.parse(atob(challenge));
    } catch {
      return null;
    }
  }
  
  return null;
};
