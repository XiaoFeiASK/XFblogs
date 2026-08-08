"use client";
import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({ isDark: false, toggleTheme: () => {} });

const getInitialIsDark = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.localStorage.getItem('blog-theme') === 'dark';
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(getInitialIsDark);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    localStorage.setItem('blog-theme', newDark ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
