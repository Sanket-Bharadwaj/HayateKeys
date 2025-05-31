
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TypingInterface } from "@/components/TypingInterface";
import { HighScores } from "@/components/HighScores";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Keyboard, Github, Heart, Volume2, VolumeX } from "lucide-react";

type TypingMode = 'words' | 'sentences' | 'code';
type AppView = 'home' | 'typing' | 'scores';

interface TypingResult {
  wpm: number;
  accuracy: number;
  time: number;
  errors: number;
  mode: string;
}

const Index = () => {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [selectedMode, setSelectedMode] = useState<TypingMode>('words');
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create a more pleasant ambient typing sound
    const backgroundMusic = new Audio();
    // Using a simple sine wave for ambient typing sounds
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    
    // Create a simple ambient sound URL (placeholder for now)
    backgroundMusic.src = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+D0wWIcCEe06t2lVhAKTaHh9sJiHAhOp+PwtmMcBjmQ2PHLeSsFJXfH8N2QQAoUXrTp66hVFApGnt/0wWIfCEu26+OoVhAKTaLh9sNiHQhOp+PwtmMcBjmQ2PHLeSsFJXfH8N2QQAoUXrTp66hVFApGnt/0wWIfCEu26+OoVhAKTaLh9sNiHQhOp+PwtmMcBjmQ2PHLeSsFJXfH8N2QQAoUXrTp66hVFApGnt/0wWIfCEu26+OoVhAKTaLh9sNiHQhOp+PwtmMcBjmQ2PHLeSsFJXfH8N2QQAoUXrTp66hVFApGnt/0wWIfCEu26+OoVhAKTaLh9sNiHQhOp+PwtmMcBjmQ2PHLeSsFJXfH8N2QQAoUXrTp66hVFApGnt/0wWIfCEu26+OoVhAKTaLh9sNiHQhOp+PwtmMcBjmQ2PHLeSsFJXfH8N2QQAoUXrTp66hVFApGnt/0wWIfCEu26+OoVhAK";
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.1; // Much quieter
    setAudio(backgroundMusic);

    return () => {
      if (backgroundMusic) {
        backgroundMusic.pause();
        backgroundMusic.src = "";
      }
    };
  }, []);

  const toggleMusic = () => {
    if (audio) {
      if (isMusicPlaying) {
        audio.pause();
      } else {
        audio.play().catch(console.error);
      }
      setIsMusicPlaying(!isMusicPlaying);
    }
  };

  const handleModeSelect = (mode: TypingMode) => {
    setSelectedMode(mode);
    setCurrentView('typing');
  };

  const handleTestComplete = (result: TypingResult) => {
    const existingScores = localStorage.getItem('hayatekeys-high-scores');
    const scores = existingScores ? JSON.parse(existingScores) : [];
    scores.push({
      ...result,
      date: new Date().toISOString()
    });
    localStorage.setItem('hayatekeys-high-scores', JSON.stringify(scores));
  };

  const renderHome = () => (
    <div className="min-h-screen relative overflow-hidden">
      <div className="container mx-auto px-4 py-4 sm:py-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 sm:mb-12 gap-4">
          <div className="flex items-center gap-3 hover:animate-rubber-band transition-all duration-300">
            <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-xl backdrop-blur-lg border border-white/20 shadow-2xl hover:animate-jiggle">
              <Keyboard className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent hover:animate-glow">
                HayateKeys
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">Master your typing with 3D visualization</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Button 
              onClick={toggleMusic}
              variant="outline"
              size="icon"
              className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30 backdrop-blur-lg hover:animate-jiggle hover:scale-105 transition-all duration-300"
            >
              {isMusicPlaying ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            <Button 
              onClick={() => setCurrentView('scores')} 
              variant="outline"
              className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30 backdrop-blur-lg hover:animate-jiggle hover:scale-105 transition-all duration-300"
            >
              High Scores
            </Button>
            <ThemeToggle />
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-glow hover:animate-rubber-band transition-all duration-300">
            Experience Typing in 3D
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Improve your typing speed and accuracy with our interactive 3D keyboard visualization. 
            Watch as your performance comes to life in real-time.
          </p>
          <div className="flex justify-center">
            <Badge variant="outline" className="text-base sm:text-lg px-4 sm:px-6 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30 backdrop-blur-sm">
              🚀 Next-Gen Typing Experience
            </Badge>
          </div>
        </div>

        {/* Mode Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto mb-12 sm:mb-20">
          <Card 
            className="cursor-pointer transition-all duration-500 hover:animate-jiggle hover:-rotate-1 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30 hover:border-blue-400/50 backdrop-blur-lg shadow-2xl hover:shadow-blue-500/25"
            onClick={() => handleModeSelect('words')}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-xl sm:text-2xl text-center flex items-center justify-center gap-2">
                📝 Words
              </CardTitle>
              <CardDescription className="text-center text-sm sm:text-base">
                Practice with common English words
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-2">
                <p className="text-xs sm:text-sm text-muted-foreground">Perfect for beginners</p>
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                  Easy
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer transition-all duration-500 hover:animate-jiggle hover:rotate-1 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 hover:border-purple-400/50 backdrop-blur-lg shadow-2xl hover:shadow-purple-500/25"
            onClick={() => handleModeSelect('sentences')}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-xl sm:text-2xl text-center flex items-center justify-center gap-2">
                📚 Sentences
              </CardTitle>
              <CardDescription className="text-center text-sm sm:text-base">
                Type complete sentences and paragraphs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-2">
                <p className="text-xs sm:text-sm text-muted-foreground">Build fluency and rhythm</p>
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                  Medium
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer transition-all duration-500 hover:animate-jiggle hover:-rotate-1 bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30 hover:border-orange-400/50 backdrop-blur-lg shadow-2xl hover:shadow-orange-500/25"
            onClick={() => handleModeSelect('code')}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-xl sm:text-2xl text-center flex items-center justify-center gap-2">
                💻 Code
              </CardTitle>
              <CardDescription className="text-center text-sm sm:text-base">
                Practice with programming syntax
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-2">
                <p className="text-xs sm:text-sm text-muted-foreground">Special characters and symbols</p>
                <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                  Hard
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
          {[
            { icon: "🎯", title: "Real-time Stats", desc: "Track WPM, accuracy, and errors as you type" },
            { icon: "🎨", title: "3D Visualization", desc: "Interactive keyboard that responds to your typing" },
            { icon: "🏆", title: "High Scores", desc: "Save and track your best performances" },
            { icon: "🌙", title: "Dark/Light Mode", desc: "Comfortable viewing in any lighting" }
          ].map((feature, index) => (
            <div 
              key={index}
              className="text-center p-4 sm:p-6 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-xl border border-white/20 shadow-xl hover:animate-jiggle hover:scale-105 transition-all duration-300"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
                <span className="text-lg sm:text-2xl">{feature.icon}</span>
              </div>
              <h3 className="font-semibold mb-2 text-sm sm:text-base">{feature.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Credits */}
        <div className="text-center mt-16 sm:mt-20">
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-2xl border border-purple-500/30 p-4 sm:p-6 max-w-md mx-auto shadow-2xl hover:animate-rubber-band transition-all duration-300">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-pink-400 animate-pulse" />
              <span className="text-sm sm:text-base font-semibold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                Made with love by
              </span>
            </div>
            <div className="text-lg sm:text-xl font-bold text-white mb-2">Sanket Bharadwaj</div>
            <a 
              href="https://github.com/Sanket-Bharadwaj" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors hover:scale-105 transform duration-200"
            >
              <Github className="h-4 w-4" />
              github.com/Sanket-Bharadwaj
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTyping = () => (
    <div className="min-h-screen relative overflow-hidden">
      <div className="container mx-auto px-4 py-4 sm:py-8 relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 gap-4">
          <Button 
            onClick={() => setCurrentView('home')} 
            variant="outline"
            className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30 backdrop-blur-lg hover:animate-jiggle hover:scale-105 transition-all duration-300"
          >
            ← Back to Home
          </Button>
          <div className="flex items-center gap-2 sm:gap-4">
            <Button 
              onClick={toggleMusic}
              variant="outline"
              size="icon"
              className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30 backdrop-blur-lg hover:animate-jiggle hover:scale-105 transition-all duration-300"
            >
              {isMusicPlaying ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            <Button 
              onClick={() => setCurrentView('scores')} 
              variant="outline"
              className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30 backdrop-blur-lg hover:animate-jiggle hover:scale-105 transition-all duration-300"
            >
              High Scores
            </Button>
            <ThemeToggle />
          </div>
        </div>
        
        <TypingInterface 
          mode={selectedMode} 
          onComplete={handleTestComplete}
        />
      </div>
    </div>
  );

  const renderScores = () => (
    <div className="min-h-screen relative overflow-hidden">
      <div className="container mx-auto px-4 py-4 sm:py-8 relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 gap-4">
          <Button 
            onClick={() => setCurrentView('home')} 
            variant="outline"
            className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30 backdrop-blur-lg hover:animate-jiggle hover:scale-105 transition-all duration-300"
          >
            ← Back to Home
          </Button>
          <div className="flex items-center gap-2 sm:gap-4">
            <Button 
              onClick={toggleMusic}
              variant="outline"
              size="icon"
              className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30 backdrop-blur-lg hover:animate-jiggle hover:scale-105 transition-all duration-300"
            >
              {isMusicPlaying ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            <ThemeToggle />
          </div>
        </div>
        
        <HighScores />
      </div>
    </div>
  );

  return (
    <ThemeProvider defaultTheme="dark">
      {currentView === 'home' && renderHome()}
      {currentView === 'typing' && renderTyping()}
      {currentView === 'scores' && renderScores()}
    </ThemeProvider>
  );
};

export default Index;
