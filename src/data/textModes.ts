
export const textModes = {
  quotes: [
    "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet and is perfect for typing practice.",
    "In a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole filled with the ends of worms and an oozy smell.",
    "Programming is the art of telling another human being what one wants the computer to do. It requires precision, logic, and creativity.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts. Winston Churchill knew the power of persistence.",
    "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle.",
    "Innovation distinguishes between a leader and a follower. Think different and challenge the status quo."
  ],
  code: {
    javascript: [
      `function calculateSum(numbers) {
  return numbers.reduce((acc, num) => acc + num, 0);
}

const result = calculateSum([1, 2, 3, 4, 5]);
console.log(result);`,
      `const fetchUserData = async (userId) => {
  try {
    const response = await fetch(\`/api/users/\${userId}\`);
    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};`,
      `class Calculator {
  constructor() {
    this.result = 0;
  }
  
  add(value) {
    this.result += value;
    return this;
  }
  
  multiply(value) {
    this.result *= value;
    return this;
  }
  
  getResult() {
    return this.result;
  }
}`
    ],
    python: [
      `def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Generate first 10 fibonacci numbers
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")`,
      `import json
import requests

def get_weather_data(city):
    api_key = "your_api_key"
    url = f"http://api.openweathermap.org/data/2.5/weather"
    params = {"q": city, "appid": api_key, "units": "metric"}
    
    response = requests.get(url, params=params)
    return response.json()`,
      `class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance
    
    def deposit(self, amount):
        self.balance += amount
        return self.balance
    
    def withdraw(self, amount):
        if amount <= self.balance:
            self.balance -= amount
            return self.balance
        return "Insufficient funds"`
    ]
  },
  numbers: [
    "1234567890 9876543210 1357924680 2468013579 1111111111 9999999999",
    "123.456.789 987-654-321 (555) 123-4567 +1-800-555-0199 192.168.1.1",
    "2024-01-15 14:30:45 UTC 99.99% 3.14159 1,000,000.00 $299.99"
  ],
  words: [
    "apple banana cherry date elderberry fig grape honeydew kiwi lemon mango",
    "computer keyboard monitor screen display graphics processor memory storage",
    "beautiful wonderful amazing spectacular incredible fantastic marvelous extraordinary",
    "quickly slowly carefully precisely accurately efficiently effectively smoothly"
  ]
};

export const getDailyChallenge = () => {
  const today = new Date().toDateString();
  const stored = localStorage.getItem('hayatekeys-daily-challenge');
  
  if (stored) {
    const challenge = JSON.parse(stored);
    if (challenge.date === today) {
      return challenge;
    }
  }
  
  // Generate new daily challenge
  const modes = Object.keys(textModes);
  const randomMode = modes[Math.floor(Math.random() * modes.length)];
  let text = '';
  
  if (randomMode === 'quotes') {
    text = textModes.quotes[Math.floor(Math.random() * textModes.quotes.length)];
  } else if (randomMode === 'code') {
    const languages = Object.keys(textModes.code);
    const randomLang = languages[Math.floor(Math.random() * languages.length)];
    text = textModes.code[randomLang as keyof typeof textModes.code][0];
  } else {
    text = textModes[randomMode as keyof typeof textModes][0];
  }
  
  const challenge = {
    date: today,
    mode: randomMode,
    text,
    target: { wpm: 40, accuracy: 90 },
    completed: false
  };
  
  localStorage.setItem('hayatekeys-daily-challenge', JSON.stringify(challenge));
  return challenge;
};
