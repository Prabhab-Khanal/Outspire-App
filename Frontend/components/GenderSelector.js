import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';
import { ThemeContext } from '../contexts/ThemeContext';  // Import ThemeContext to access the theme

const GenderSelector = ({ selectedGender, onSelectGender }) => {
  // Get the current theme from ThemeContext
  const { theme } = useContext(ThemeContext);

  // Define the colors based on the theme
  const themeColors = {
    light: {
      background: '#f0f0f0',  // Light background for unselected cards
      selectedBackground: '#4CAF50',  // Green for selected in light mode
      unselectedTextColor: '#4A90E2',  // Blue color for unselected text
      selectedTextColor: '#fff',  // White text for selected card
    },
    dark: {
      background: '#333',  // Dark background for unselected cards
      selectedBackground: '#FF7043',  // Dark orange for selected in dark mode
      unselectedTextColor: '#FF8A65',  // Light orange color for unselected text
      selectedTextColor: '#fff',  // White text for selected card
    },
  };

  const currentColors = themeColors[theme];  // Get the current colors based on the theme

  return (
    <View style={styles.container}>
      {['Male', 'Female', 'Other'].map((gender) => (
        <Card
          key={gender}
          style={[
            styles.card,
            {
              backgroundColor: selectedGender === gender ? currentColors.selectedBackground : currentColors.background,
              borderColor: selectedGender === gender ? currentColors.selectedTextColor : currentColors.background, // Change border color when selected
            },
          ]}
          onPress={() => onSelectGender(gender)}
        >
          <Text style={{ color: selectedGender === gender ? currentColors.selectedTextColor : currentColors.unselectedTextColor }}>
            {gender}
          </Text>
        </Card>
      ))}
    </View>
  );
};

// Styling for the GenderSelector component
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  card: {
    padding: 10,
    borderRadius: 5,
    width: '30%',
    alignItems: 'center',
    borderWidth: 1,  // Add border to the card for better definition
  },
});

export default GenderSelector;
