import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Trophy, Target, Timer, Zap, Volume2, VolumeX, BarChart3, Award, Palette, Share2, Monitor, Moon, Sun, Zap as ZapIcon } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { getStats, saveStats, getAchievements, saveAchievements, saveTestResult, TestResult } from '@/utils/storage';
import { calculateScore, getComboMultiplier, checkAchievements } from '@/utils/scoring';
import { soundManager } from '@/utils/sounds';
import { textModes, getDailyChallenge } from '@/data/textModes';
import { shareScore, getSharedChallenge, ShareData } from '@/utils/share';
import { useTheme, ThemeProvider, themes } from '@/contexts/ThemeContext';
import Keyboard3D from '@/components/Keyboard3D';

const IndexContent = () => {
  const [currentText, setCurrentText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [isCompleted, setIsCompleted] = useState(false);
  const [errors, setErrors] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [mode, setMode] = useState('quotes');
  const [subMode, setSubMode] = useState('');
  const [timeLimit, setTimeLimit] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [stats, setStats] = useState(getStats());
  const [achievements, setAchievements] = useState(getAchievements());
  const [showStats, setShowStats] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [recentUnlocks, setRecentUnlocks] = useState<string[]>([]);
  const [combo, setCombo] = useState(1);
  const [showDailyChallenge, setShowDailyChallenge] = useState(false);
  const [dailyChallenge, setDailyChallenge] = useState(getDailyChallenge());
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [pressedKey, setPressedKey] = useState<string>('');
  const [sharedChallenge, setSharedChallenge] = useState<ShareData | null>(null);

  const { theme, setTheme, themes: themeOptions } = useTheme();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -25]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check for shared challenge on mount
  useEffect(() => {
    const challenge = getSharedChallenge();
    if (challenge) {
      setSharedChallenge(challenge);
    }
  }, []);

  // Handle keypress for 3D keyboard
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      setPressedKey(event.key);
      setTimeout(() => setPressedKey(''), 150);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Get theme-specific classes
  const getThemeClasses = () => {
    const currentTheme = themeOptions.find(t => t.value === theme);
    const bgGradient = currentTheme?.colors || 'from-slate-900 via-purple-900 to-slate-900';
    
    const cardClasses = theme === 'light' 
      ? 'bg-white/80 backdrop-blur-lg border-gray-200 text-gray-900'
      : 'bg-white/10 backdrop-blur-lg border-white/20 text-white';
      
    const textClasses = theme === 'light' ? 'text-gray-900' : 'text-white';
    const mutedTextClasses = theme === 'light' ? 'text-gray-600' : 'text-gray-400';
    
    return { bgGradient, cardClasses, textClasses, mutedTextClasses };
  };

  const { bgGradient, cardClasses, textClasses, mutedTextClasses } = getThemeClasses();

  // Initialize sound manager
  useEffect(() => {
    soundManager.initialize();
  }, []);

  // Timer logic
  useEffect(() => {
    if (timeLimit > 0 && startTime && !isCompleted) {
      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const remaining = Math.max(0, timeLimit - elapsed);
        setTimeRemaining(remaining);
        
        if (remaining === 0) {
          setIsCompleted(true);
          if (timerRef.current) clearInterval(timerRef.current);
        }
      }, 100);
      
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [timeLimit, startTime, isCompleted]);

  // Typing logic
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (userInput.length > 0 && !startTime) {
      setStartTime(Date.now());
      if (timeLimit > 0) {
        setTimeRemaining(timeLimit);
      }
    }

    if (userInput.length > 0) {
      const timeElapsed = (Date.now() - (startTime || Date.now())) / 1000 / 60;
      const wordsTyped = userInput.trim().split(' ').length;
      const currentWpm = Math.round(wordsTyped / timeElapsed) || 0;
      setWpm(currentWpm);

      let correctChars = 0;
      let totalErrors = 0;
      for (let i = 0; i < userInput.length; i++) {
        if (userInput[i] === currentText[i]) {
          correctChars++;
        } else {
          totalErrors++;
        }
      }
      
      setErrors(totalErrors);
      const currentAccuracy = userInput.length > 0 ? Math.round((correctChars / userInput.length) * 100) : 100;
      setAccuracy(currentAccuracy);

      // Handle typing feedback
      const lastChar = userInput[userInput.length - 1];
      const expectedChar = currentText[userInput.length - 1];
      
      if (lastChar === expectedChar) {
        setStreak(prev => {
          const newStreak = prev + 1;
          setMaxStreak(current => Math.max(current, newStreak));
          setCombo(getComboMultiplier(newStreak));
          
          if (newStreak % 10 === 0 && soundEnabled) {
            soundManager.play('combo');
          } else if (soundEnabled) {
            soundManager.play('correct');
          }
          
          return newStreak;
        });
      } else {
        setStreak(0);
        setCombo(1);
        if (soundEnabled) {
          soundManager.play('error');
        }
      }
    }

    if (userInput === currentText || (timeLimit > 0 && timeRemaining === 0)) {
      setIsCompleted(true);
      if (soundEnabled) {
        soundManager.play('complete');
      }
    }
  }, [userInput, currentText, startTime, timeLimit, timeRemaining, soundEnabled]);

  // Handle completion
  useEffect(() => {
    if (isCompleted) {
      const duration = startTime ? (Date.now() - startTime) / 1000 : 0;
      const score = calculateScore(wpm, accuracy, maxStreak, errors, duration);
      
      // Update stats
      const newStats = {
        ...stats,
        totalTests: stats.totalTests + 1,
        totalWords: stats.totalWords + userInput.trim().split(' ').length,
        totalTime: stats.totalTime + duration,
        bestWpm: Math.max(stats.bestWpm, wpm),
        bestAccuracy: Math.max(stats.bestAccuracy, accuracy),
        averageWpm: Math.round((stats.averageWpm * stats.totalTests + wpm) / (stats.totalTests + 1)),
        averageAccuracy: Math.round((stats.averageAccuracy * stats.totalTests + accuracy) / (stats.totalTests + 1)),
        longestStreak: Math.max(stats.longestStreak, maxStreak),
        totalErrors: stats.totalErrors + errors,
        testsToday: new Date().toDateString() === stats.lastTestDate ? stats.testsToday + 1 : 1,
        lastTestDate: new Date().toDateString()
      };
      
      setStats(newStats);
      saveStats(newStats);
      
      // Save test result
      const result: TestResult = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        mode: mode + (subMode ? `-${subMode}` : ''),
        wpm,
        accuracy,
        streak: maxStreak,
        errors,
        duration,
        text: currentText.substring(0, 50) + '...',
        score
      };
      
      saveTestResult(result);
      
      // Check achievements
      const unlocks = checkAchievements(newStats, achievements, result);
      if (unlocks.length > 0) {
        setRecentUnlocks(unlocks);
        saveAchievements(achievements);
      }
      
      // Check daily challenge
      if (showDailyChallenge && !dailyChallenge.completed) {
        if (wpm >= dailyChallenge.target.wpm && accuracy >= dailyChallenge.target.accuracy) {
          const updatedChallenge = { ...dailyChallenge, completed: true };
          setDailyChallenge(updatedChallenge);
          localStorage.setItem('hayatekeys-daily-challenge', JSON.stringify(updatedChallenge));
        }
      }
    }
  }, [isCompleted]);

  const resetGame = useCallback(() => {
    setUserInput('');
    setCurrentIndex(0);
    setStartTime(null);
    setWpm(0);
    setAccuracy(100);
    setIsCompleted(false);
    setErrors(0);
    setStreak(0);
    setMaxStreak(0);
    setCombo(1);
    setTimeRemaining(timeLimit);
    setRecentUnlocks([]);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Select new text based on mode
    let newText = '';
    if (showDailyChallenge) {
      newText = dailyChallenge.text;
    } else if (mode === 'quotes') {
      const quotesArray = textModes.quotes;
      newText = quotesArray[Math.floor(Math.random() * quotesArray.length)];
    } else if (mode === 'code') {
      const lang = subMode as keyof typeof textModes.code;
      if (lang && textModes.code[lang]) {
        const codeArray = textModes.code[lang];
        newText = codeArray[Math.floor(Math.random() * codeArray.length)];
      }
    } else if (mode === 'numbers') {
      const numbersArray = textModes.numbers;
      newText = numbersArray[Math.floor(Math.random() * numbersArray.length)];
    } else if (mode === 'words') {
      const wordsArray = textModes.words;
      newText = wordsArray[Math.floor(Math.random() * wordsArray.length)];
    }
    
    setCurrentText(newText);
    
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [mode, subMode, timeLimit, showDailyChallenge, dailyChallenge]);

  // Initialize text on component mount
  useEffect(() => {
    resetGame();
  }, [mode, subMode, showDailyChallenge]);

  const getCharacterClass = (index: number) => {
    const baseClasses = theme === 'light' ? 'text-gray-900' : 'text-gray-400';
    
    if (index < userInput.length) {
      return userInput[index] === currentText[index] 
        ? 'text-green-400 bg-green-400/20' 
        : 'text-red-400 bg-red-400/20';
    }
    if (index === userInput.length) {
      return 'bg-blue-400/30 animate-pulse';
    }
    return baseClasses;
  };

  const handleShare = () => {
    const shareData: ShareData = {
      wpm,
      accuracy,
      streak: maxStreak,
      score: calculateScore(wpm, accuracy, maxStreak, errors, startTime ? (Date.now() - startTime) / 1000 : 0)
    };
    shareScore(shareData);
  };

  const progress = (userInput.length / currentText.length) * 100;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgGradient} p-2 sm:p-4 relative overflow-hidden`}>
      {/* Animated background elements */}
      <motion.div 
        style={{ y: y1 }}
        className="absolute inset-0 opacity-10"
      >
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-10 w-40 h-40 bg-purple-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-1/3 w-36 h-36 bg-pink-500 rounded-full blur-3xl"></div>
      </motion.div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Compact Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4 sm:mb-6"
        >
          <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-1`}>
            HayateKeys
          </h1>
          <p className={`${mutedTextClasses} text-sm sm:text-base`}>Master your typing speed</p>
        </motion.div>

        {/* Shared Challenge Banner */}
        {sharedChallenge && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <Card className={`${cardClasses} p-3 border-yellow-500/30 bg-yellow-500/10`}>
              <div className="text-center">
                <Trophy className="h-5 w-5 text-yellow-400 mx-auto mb-1" />
                <p className="text-yellow-400 font-bold text-sm">Challenge Received!</p>
                <p className={`${mutedTextClasses} text-xs`}>
                  Beat {sharedChallenge.wpm} WPM with {sharedChallenge.accuracy}% accuracy
                </p>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Compact Controls */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-wrap justify-center gap-2 mb-4"
        >
          <Select value={mode} onValueChange={setMode}>
            <SelectTrigger className={`w-28 ${cardClasses} border-white/20`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-white/20">
              <SelectItem value="quotes">Quotes</SelectItem>
              <SelectItem value="code">Code</SelectItem>
              <SelectItem value="numbers">Numbers</SelectItem>
              <SelectItem value="words">Words</SelectItem>
            </SelectContent>
          </Select>

          {mode === 'code' && (
            <Select value={subMode} onValueChange={setSubMode}>
              <SelectTrigger className={`w-28 ${cardClasses} border-white/20`}>
                <SelectValue placeholder="Lang" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/20">
                <SelectItem value="javascript">JS</SelectItem>
                <SelectItem value="python">Python</SelectItem>
              </SelectContent>
            </Select>
          )}

          <Select value={timeLimit.toString()} onValueChange={(value) => setTimeLimit(parseInt(value))}>
            <SelectTrigger className={`w-24 ${cardClasses} border-white/20`}>
              <SelectValue placeholder="Time" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-white/20">
              <SelectItem value="0">∞</SelectItem>
              <SelectItem value="15">15s</SelectItem>
              <SelectItem value="30">30s</SelectItem>
              <SelectItem value="60">1m</SelectItem>
              <SelectItem value="120">2m</SelectItem>
            </SelectContent>
          </Select>

          {/* Theme Selector */}
          <div className="relative">
            <Button
              onClick={() => setShowThemeSelector(!showThemeSelector)}
              variant="outline"
              size="icon"
              className={`${cardClasses} border-white/20 hover:bg-white/20`}
            >
              <Palette className="h-4 w-4" />
            </Button>
            
            {showThemeSelector && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`absolute top-12 right-0 ${cardClasses} rounded-lg p-2 shadow-lg z-50`}
              >
                <div className="grid grid-cols-2 gap-2 w-32">
                  {themeOptions.map((t) => (
                    <Button
                      key={t.value}
                      onClick={() => {
                        setTheme(t.value);
                        setShowThemeSelector(false);
                      }}
                      variant={theme === t.value ? "default" : "outline"}
                      size="sm"
                      className="text-xs"
                    >
                      {t.name}
                    </Button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          <Button
            onClick={() => setShowDailyChallenge(!showDailyChallenge)}
            variant={showDailyChallenge ? "default" : "outline"}
            size="icon"
            className={`${cardClasses} border-white/20 hover:bg-white/20`}
          >
            <Target className="h-4 w-4" />
          </Button>

          <Button
            onClick={() => setSoundEnabled(!soundEnabled)}
            variant="outline"
            size="icon"
            className={`${cardClasses} border-white/20 hover:bg-white/20`}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
        </motion.div>

        {/* Compact Stats */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 mb-4"
        >
          <Card className={`${cardClasses} p-3 text-center`}>
            <div className="flex items-center justify-center mb-1">
              <Timer className="h-4 w-4 text-blue-400 mr-1" />
              <span className={`${mutedTextClasses} text-xs`}>WPM</span>
            </div>
            <div className={`text-lg font-bold ${textClasses}`}>{wpm}</div>
          </Card>
          
          <Card className={`${cardClasses} p-3 text-center`}>
            <div className="flex items-center justify-center mb-1">
              <Target className="h-4 w-4 text-green-400 mr-1" />
              <span className={`${mutedTextClasses} text-xs`}>Accuracy</span>
            </div>
            <div className={`text-lg font-bold ${textClasses}`}>{accuracy}%</div>
          </Card>

          <Card className={`${cardClasses} p-3 text-center`}>
            <div className="flex items-center justify-center mb-1">
              <Trophy className="h-4 w-4 text-yellow-400 mr-1" />
              <span className={`${mutedTextClasses} text-xs`}>Streak</span>
            </div>
            <div className={`text-lg font-bold ${textClasses}`}>{streak}</div>
            {combo > 1 && (
              <Badge className="mt-1 bg-yellow-500/20 text-yellow-300 text-xs">
                {combo.toFixed(1)}x
              </Badge>
            )}
          </Card>

          <Card className={`${cardClasses} p-3 text-center`}>
            <div className="flex items-center justify-center mb-1">
              <Zap className="h-4 w-4 text-red-400 mr-1" />
              <span className={`${mutedTextClasses} text-xs`}>Errors</span>
            </div>
            <div className="text-lg font-bold text-red-400">{errors}</div>
          </Card>

          {timeLimit > 0 && (
            <Card className={`${cardClasses} p-3 text-center`}>
              <div className="flex items-center justify-center mb-1">
                <Timer className="h-4 w-4 text-purple-400 mr-1" />
                <span className={`${mutedTextClasses} text-xs`}>Time</span>
              </div>
              <div className={`text-lg font-bold ${textClasses}`}>
                {Math.ceil(timeRemaining)}s
              </div>
            </Card>
          )}
        </motion.div>

        {/* Progress Bar */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4"
        >
          <Progress value={progress} className="h-2 bg-white/20" />
        </motion.div>

        {/* 3D Keyboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <Card className={`${cardClasses} p-2`}>
            <Keyboard3D pressedKey={pressedKey} className="rounded-lg overflow-hidden" />
          </Card>
        </motion.div>

        {/* Typing Area */}
        <motion.div
          style={{ y: y2 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className={`${cardClasses} p-4 sm:p-6 mb-4`}>
            {showDailyChallenge && (
              <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <h3 className="text-yellow-400 font-bold mb-1 text-sm">🏆 Daily Challenge</h3>
                <p className={`${mutedTextClasses} text-xs`}>
                  Target: {dailyChallenge.target.wpm} WPM, {dailyChallenge.target.accuracy}% accuracy
                  {dailyChallenge.completed && <span className="text-green-400 ml-2">✓ Completed!</span>}
                </p>
              </div>
            )}
            
            <div className="text-base sm:text-lg leading-relaxed font-mono mb-4 min-h-[80px] sm:min-h-[120px]">
              {currentText.split('').map((char, index) => (
                <span
                  key={index}
                  className={`${getCharacterClass(index)} transition-all duration-150 rounded px-0.5`}
                >
                  {char}
                </span>
              ))}
            </div>
            
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className={`w-full p-3 sm:p-4 bg-white/5 border border-white/20 rounded-lg ${textClasses} placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 font-mono text-sm sm:text-lg`}
              placeholder="Start typing..."
              disabled={isCompleted}
            />
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-2">
          <Button
            onClick={resetGame}
            variant="outline"
            className={`${cardClasses} border-white/20 hover:bg-white/20`}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            New Text
          </Button>
          
          {isCompleted && (
            <Button
              onClick={handleShare}
              variant="outline"
              className={`${cardClasses} border-white/20 hover:bg-white/20`}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          )}
        </div>

        {/* Achievement Notifications */}
        <AnimatePresence>
          {recentUnlocks.map((achievement, index) => (
            <motion.div
              key={achievement}
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="fixed top-4 right-4 bg-yellow-500/90 text-black p-4 rounded-lg shadow-lg z-50"
              style={{ top: `${4 + index * 80}px` }}
            >
              <div className="flex items-center">
                <Trophy className="h-6 w-6 mr-2" />
                <div>
                  <div className="font-bold">Achievement Unlocked!</div>
                  <div className="text-sm">{achievement}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Completion Modal */}
        <AnimatePresence>
          {isCompleted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className={`${cardClasses} rounded-xl p-6 text-center max-w-md w-full`}
              >
                <Trophy className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
                <h2 className={`text-2xl font-bold ${textClasses} mb-4`}>Test Complete!</h2>
                <div className={`space-y-2 ${mutedTextClasses} mb-6`}>
                  <p>Speed: <span className="text-blue-400 font-bold">{wpm} WPM</span></p>
                  <p>Accuracy: <span className="text-green-400 font-bold">{accuracy}%</span></p>
                  <p>Max Streak: <span className="text-yellow-400 font-bold">{maxStreak}</span></p>
                  <p>Score: <span className="text-purple-400 font-bold">{calculateScore(wpm, accuracy, maxStreak, errors, startTime ? (Date.now() - startTime) / 1000 : 0)}</span></p>
                </div>
                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={resetGame}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                  <Button
                    onClick={handleShare}
                    variant="outline"
                    className={`${cardClasses} border-white/20 hover:bg-white/20`}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <ThemeProvider>
      <IndexContent />
    </ThemeProvider>
  );
};

export default Index;
