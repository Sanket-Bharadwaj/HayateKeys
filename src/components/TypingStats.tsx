
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TypingStatsProps {
  wpm: number;
  accuracy: number;
  time: number;
  errors: number;
  charactersTyped: number;
}

export const TypingStats = ({ 
  wpm, 
  accuracy, 
  time, 
  errors, 
  charactersTyped 
}: TypingStatsProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getWpmColor = (wpm: number) => {
    if (wpm >= 60) return "text-neon-green";
    if (wpm >= 40) return "text-neon-blue";
    return "text-orange-400";
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 95) return "text-neon-green";
    if (accuracy >= 85) return "text-neon-blue";
    return "text-orange-400";
  };

  const stats = [
    {
      title: "WPM",
      value: wpm,
      color: getWpmColor(wpm),
      gradient: "from-blue-500/20 to-purple-500/20",
      border: "border-blue-500/30"
    },
    {
      title: "Accuracy",
      value: `${accuracy}%`,
      color: getAccuracyColor(accuracy),
      gradient: "from-green-500/20 to-emerald-500/20",
      border: "border-green-500/30"
    },
    {
      title: "Time",
      value: formatTime(time),
      color: "text-neon-purple",
      gradient: "from-purple-500/20 to-pink-500/20",
      border: "border-purple-500/30"
    },
    {
      title: "Errors",
      value: errors,
      color: "text-red-400",
      gradient: "from-red-500/20 to-orange-500/20",
      border: "border-red-500/30"
    },
    {
      title: "Characters",
      value: charactersTyped,
      color: "text-cyan-400",
      gradient: "from-cyan-500/20 to-blue-500/20",
      border: "border-cyan-500/30"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 mb-6">
      {stats.map((stat, index) => (
        <Card 
          key={stat.title}
          className={`p-4 bg-gradient-to-br ${stat.gradient} ${stat.border} backdrop-blur-lg shadow-xl hover:animate-jiggle hover:shadow-2xl transition-all duration-300 cursor-pointer group`}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <CardHeader className="pb-1">
            <CardTitle className="text-xs sm:text-sm text-muted-foreground text-center group-hover:animate-rubber-band">
              {stat.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 flex items-center justify-center h-full">
            <div className={`text-lg sm:text-xl lg:text-2xl font-bold ${stat.color} animate-glow text-center group-hover:scale-110 transition-transform duration-300`}>
              {stat.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
