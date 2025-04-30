// contexts/ThemeContext.js
import React, { createContext, useState, useEffect } from 'react';
import { getStoredTheme, setTheme, toggleTheme } from '../services/themeService';  // Import themeService

const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [theme, setCurrentTheme] = useState('light');  // Default theme is light

  useEffect(() => {
    // Fetch the stored theme or default to system theme
    const fetchTheme = async () => {
      const storedTheme = await getStoredTheme();
      setCurrentTheme(storedTheme);
      console.log(`App loaded with theme: ${storedTheme}`);
    };
    fetchTheme();
  }, []);

  // Function to toggle theme between light and dark
  const toggleThemeMode = async () => {
    const newTheme = await toggleTheme(theme); // Toggle theme
    setCurrentTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeContext, ThemeProvider };
