
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  storageKey = "hayatekeys-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
      
      // Apply background styles based on system theme
      if (systemTheme === "dark") {
        root.style.background = "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)";
      } else {
        root.style.background = "linear-gradient(135deg, #fef7ff 0%, #f0f9ff 50%, #e0f2fe 100%)";
      }
      return;
    }

    root.classList.add(theme);
    
    // Apply complete background theme changes
    if (theme === "dark") {
      root.style.background = "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)";
    } else {
      root.style.background = "linear-gradient(135deg, #fef7ff 0%, #f0f9ff 50%, #e0f2fe 100%)";
    }
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
