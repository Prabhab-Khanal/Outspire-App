import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

const THEME_KEY = 'theme_preference';

// Function to get the current system theme (light or dark)
const getCurrentSystemTheme = () => {
  const colorScheme = Appearance.getColorScheme(); // Gets system theme (light or dark)
  console.log(`System Theme Detected: ${colorScheme}`);
  return colorScheme || 'light';  // Default to light if system theme is undefined
};

// Function to get the stored theme preference (if any)
const getStoredTheme = async () => {
  try {
    const storedTheme = await AsyncStorage.getItem(THEME_KEY);  // Get stored theme from AsyncStorage
    console.log(`Stored Theme: ${storedTheme || 'None'}`);
    return storedTheme || getCurrentSystemTheme(); // Fallback to system theme if no stored preference
  } catch (error) {
    console.error('Error fetching stored theme:', error);
    return getCurrentSystemTheme(); // Return system theme in case of error
  }
};

// Function to store the user's theme preference
const setTheme = async (theme) => {
  try {
    await AsyncStorage.setItem(THEME_KEY, theme); // Store the theme preference
    console.log(`Theme Stored: ${theme}`);
  } catch (error) {
    console.error('Error storing theme preference:', error);
  }
};

// Function to toggle between light and dark themes
const toggleTheme = async (currentTheme) => {
  const newTheme = currentTheme === 'light' ? 'dark' : 'light'; // Toggle theme
  await setTheme(newTheme);  // Set the new theme
  console.log(`Theme Toggled: ${newTheme}`);
  return newTheme; // Return the new theme
};

export { getStoredTheme, setTheme, toggleTheme };
