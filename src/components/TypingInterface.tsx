
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TypingStats } from "./TypingStats";
import { Keyboard3D } from "./Keyboard3D";
import { useToast } from "@/hooks/use-toast";

interface TypingInterfaceProps {
  mode: 'words' | 'sentences' | 'code';
  onComplete: (stats: TypingResult) => void;
}

interface TypingResult {
  wpm: number;
  accuracy: number;
  time: number;
  errors: number;
  mode: string;
}

const sampleTexts = {
  words: [
    "the quick brown fox jumps over the lazy dog",
    "pack my box with five dozen liquor jugs",
    "how vexingly quick daft zebras jump",
    "bright vixens jump dozy fowl quack",
    "sphinx of black quartz judge my vow"
  ],
  sentences: [
    "The art of programming is the art of organizing complexity, of mastering multitude and avoiding its bastard chaos as effectively as possible.",
    "In software development, it is often the small details that make the difference between a good product and a great one.",
    "Code is like humor. When you have to explain it, it's bad. Clean code always looks like it was written by someone who cares.",
    "The best programs are written so that computing machines can perform them quickly and so that human beings can understand them clearly.",
    "Programming isn't about what you know; it's about what you can figure out when you don't know."
  ],
  code: [
    "function calculateSum(arr) { return arr.reduce((a, b) => a + b, 0); }",
    "const fibonacci = n => n <= 1 ? n : fibonacci(n - 1) + fibonacci(n - 2);",
    "class Rectangle { constructor(width, height) { this.width = width; this.height = height; } }",
    "const fetchData = async (url) => { const response = await fetch(url); return response.json(); }",
    "const debounce = (func, delay) => { let timeoutId; return (...args) => { clearTimeout(timeoutId); timeoutId = setTimeout(() => func.apply(null, args), delay); }; };"
  ]
};

export const TypingInterface = ({ mode, onComplete }: TypingInterfaceProps) => {
  const [text, setText] = useState("");
  const [input, setInput] = useState("");
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errors, setErrors] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [currentKey, setCurrentKey] = useState<string>("");
  const { toast } = useToast();

  // Real-time stats
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [time, setTime] = useState(0);

  const getRandomText = useCallback(() => {
    const texts = sampleTexts[mode];
    return texts[Math.floor(Math.random() * texts.length)];
  }, [mode]);

  const resetTest = useCallback(() => {
    setText(getRandomText());
    setInput("");
    setCurrentIndex(0);
    setErrors(0);
    setStartTime(null);
    setEndTime(null);
    setIsActive(false);
    setWpm(0);
    setAccuracy(100);
    setTime(0);
    setCurrentKey("");
  }, [getRandomText]);

  useEffect(() => {
    resetTest();
  }, [mode, resetTest]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && !endTime) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, endTime]);

  // Calculate real-time stats
  useEffect(() => {
    if (startTime && input.length > 0) {
      const timeElapsed = (Date.now() - startTime.getTime()) / 1000 / 60; // minutes
      const wordsTyped = input.length / 5; // Standard: 5 characters = 1 word
      const currentWpm = Math.round(wordsTyped / timeElapsed) || 0;
      setWpm(currentWpm);

      const correctChars = input.split('').filter((char, i) => char === text[i]).length;
      const currentAccuracy = input.length > 0 ? Math.round((correctChars / input.length) * 100) : 100;
      setAccuracy(currentAccuracy);
    }
  }, [input, startTime, text]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    
    if (!startTime && value.length > 0) {
      setStartTime(new Date());
      setIsActive(true);
    }

    // Prevent typing beyond text length
    if (value.length > text.length) return;

    setInput(value);
    setCurrentIndex(value.length);

    // Set current key for 3D visualization
    if (value.length < text.length) {
      setCurrentKey(text[value.length]);
    }

    // Count errors
    let errorCount = 0;
    for (let i = 0; i < value.length; i++) {
      if (value[i] !== text[i]) {
        errorCount++;
      }
    }
    setErrors(errorCount);

    // Check if test is complete
    if (value === text) {
      const endTime = new Date();
      setEndTime(endTime);
      setIsActive(false);
      
      const timeElapsed = (endTime.getTime() - (startTime?.getTime() || 0)) / 1000 / 60;
      const finalWpm = Math.round((text.length / 5) / timeElapsed);
      const finalAccuracy = Math.round(((text.length - errorCount) / text.length) * 100);
      
      const result: TypingResult = {
        wpm: finalWpm,
        accuracy: finalAccuracy,
        time: Math.round((endTime.getTime() - (startTime?.getTime() || 0)) / 1000),
        errors: errorCount,
        mode
      };

      onComplete(result);
      
      toast({
        title: "Test Complete!",
        description: `WPM: ${finalWpm}, Accuracy: ${finalAccuracy}%`,
      });
    }
  };

  const renderText = () => {
    return text.split('').map((char, index) => {
      let className = "text-lg font-mono ";
      
      if (index < input.length) {
        // Typed characters
        if (input[index] === char) {
          className += "text-typing-correct bg-green-500/20";
        } else {
          className += "text-typing-incorrect bg-red-500/20";
        }
      } else if (index === currentIndex) {
        // Current character
        className += "text-typing-current bg-blue-500/30 animate-pulse";
      } else {
        // Untyped characters
        className += "text-muted-foreground";
      }

      return (
        <span key={index} className={className}>
          {char}
        </span>
      );
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-lg px-4 py-2">
          {mode.charAt(0).toUpperCase() + mode.slice(1)} Mode
        </Badge>
        <Button onClick={resetTest} variant="outline">
          New Text
        </Button>
      </div>

      <TypingStats
        wpm={wpm}
        accuracy={accuracy}
        time={time}
        errors={errors}
        charactersTyped={input.length}
      />

      <Keyboard3D
        currentKey={currentKey}
        accuracy={accuracy}
        wpm={wpm}
        isTyping={isActive}
      />

      <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700">
        <CardContent className="p-6">
          <div className="mb-4 p-4 bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-600 min-h-[120px] flex items-center">
            <div className="leading-relaxed">
              {renderText()}
            </div>
          </div>
          
          <textarea
            value={input}
            onChange={handleInputChange}
            placeholder="Start typing here..."
            className="w-full h-32 p-4 bg-gray-800/50 border border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-mono"
            disabled={!!endTime}
          />
        </CardContent>
      </Card>
    </div>
  );
};
