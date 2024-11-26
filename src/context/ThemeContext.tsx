'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface ThemeContextType {
  theme: 'light' | 'dark';
  textSize: 'small' | 'medium' | 'large';
  setTheme: (theme: 'light' | 'dark') => void;
  setTextSize: (size: 'small' | 'medium' | 'large') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');
  const [textSize, setTextSize] = useLocalStorage<'small' | 'medium' | 'large'>('textSize', 'medium');

  useEffect(() => {
    // Apply theme to document
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);

    // Apply text size
    document.documentElement.classList.remove('text-small', 'text-medium', 'text-large');
    document.documentElement.classList.add(`text-${textSize}`);
  }, [theme, textSize]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, textSize, setTextSize }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
