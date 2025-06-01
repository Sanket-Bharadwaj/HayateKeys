
import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'dark' | 'light' | 'neon' | 'forest' | 'ocean';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  themes: { name: string; value: Theme; colors: string }[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const themes = [
  { name: 'Dark', value: 'dark' as Theme, colors: 'from-slate-900 via-purple-900 to-slate-900' },
  { name: 'Light', value: 'light' as Theme, colors: 'from-blue-50 via-white to-purple-50' },
  { name: 'Neon', value: 'neon' as Theme, colors: 'from-purple-900 via-pink-900 to-indigo-900' },
  { name: 'Forest', value: 'forest' as Theme, colors: 'from-green-900 via-emerald-800 to-teal-900' },
  { name: 'Ocean', value: 'ocean' as Theme, colors: 'from-blue-900 via-cyan-800 to-teal-900' }
];

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('hayatekeys-theme');
    return (saved as Theme) || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('hayatekeys-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
