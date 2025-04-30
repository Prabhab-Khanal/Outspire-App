import React, { useContext } from 'react';
import { Button, ActivityIndicator } from 'react-native-paper';
import { StyleSheet } from 'react-native'; // Import StyleSheet for styling
import { ThemeContext } from '../contexts/ThemeContext'; // Import ThemeContext

const ButtonWithLoading = ({ loading, onPress, title }) => {
  const { theme } = useContext(ThemeContext); // Get the current theme from the context

  // Define theme-based button colors
  const themeColors = {
    light: {
      buttonColor: '#388E3C', // Green for light mode
      textColor: '#fff', // White text for light mode
    },
    dark: {
      buttonColor: '#4CAF50', // Dark green for dark mode
      textColor: '#fff', // White text for dark mode
    },
  };

  const currentColors = themeColors[theme]; // Get the button color based on the current theme

  return (
    <Button 
      mode="contained" 
      onPress={onPress} 
      disabled={loading} 
      loading={loading} 
      style={[styles.button, { backgroundColor: currentColors.buttonColor }]} // Apply button color based on the theme
    >
      {loading ? <ActivityIndicator size="small" color={currentColors.textColor} /> : title}
    </Button>
  );
};

const styles = StyleSheet.create({
  button: {
    marginTop: 20, // Adds some space at the top of the button
    paddingVertical: 10, // Adds vertical padding for a more spacious button
    paddingHorizontal: 20, // Adds horizontal padding
    borderRadius: 5, // Optional: Makes the button rounded
  },
});

export default ButtonWithLoading;
