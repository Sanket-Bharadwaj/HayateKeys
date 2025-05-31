
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface HighScore {
  wpm: number;
  accuracy: number;
  time: number;
  mode: string;
  date: string;
}

export const HighScores = () => {
  const [scores, setScores] = useState<HighScore[]>([]);

  useEffect(() => {
    const savedScores = localStorage.getItem('hayatekeys-high-scores');
    if (savedScores) {
      setScores(JSON.parse(savedScores));
    }
  }, []);

  const clearScores = () => {
    localStorage.removeItem('hayatekeys-high-scores');
    setScores([]);
  };

  const getBestScore = (mode: string) => {
    return scores
      .filter(score => score.mode === mode)
      .sort((a, b) => b.wpm - a.wpm)[0];
  };

  const modes = ['words', 'sentences', 'code'];

  if (scores.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700 backdrop-blur-lg shadow-2xl animate-float">
        <CardHeader>
          <CardTitle className="text-center text-gray-400">No High Scores Yet</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            Complete a typing test to see your scores here!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          High Scores
        </h2>
        <Button 
          onClick={clearScores} 
          variant="outline" 
          size="sm"
          className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-500/30 backdrop-blur-sm hover:scale-105 transition-all duration-300"
        >
          Clear All
        </Button>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3">
        {modes.map((mode, index) => {
          const bestScore = getBestScore(mode);
          
          return (
            <Card 
              key={mode} 
              className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-blue-500/30 backdrop-blur-lg shadow-2xl hover:scale-105 transition-all duration-300 animate-float"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <CardHeader>
                <CardTitle className="text-base sm:text-lg capitalize flex items-center gap-2 justify-center">
                  {mode}
                  {bestScore && (
                    <Badge variant="secondary" className="text-xs bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                      Best
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {bestScore ? (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">WPM:</span>
                      <span className="font-bold text-neon-blue text-lg">{bestScore.wpm}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Accuracy:</span>
                      <span className="font-bold text-neon-green text-lg">{bestScore.accuracy}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Time:</span>
                      <span className="font-bold text-neon-purple text-lg">
                        {Math.floor(bestScore.time / 60)}:{(bestScore.time % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground text-center mt-3 pt-2 border-t border-white/10">
                      {new Date(bestScore.date).toLocaleDateString()}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm text-center py-4">No scores yet</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700 backdrop-blur-lg shadow-2xl">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Recent Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {scores
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 10)
              .map((score, index) => (
                <div 
                  key={index} 
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-gray-800/30 backdrop-blur-sm rounded-lg border border-white/10 hover:scale-[1.02] transition-all duration-300 gap-2 sm:gap-4 animate-float"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant="outline" className="capitalize text-xs">
                      {score.mode}
                    </Badge>
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      {new Date(score.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4 text-sm flex-wrap">
                    <span className="text-neon-blue font-bold">{score.wpm} WPM</span>
                    <span className="text-neon-green font-bold">{score.accuracy}%</span>
                    <span className="text-muted-foreground">
                      {Math.floor(score.time / 60)}:{(score.time % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
