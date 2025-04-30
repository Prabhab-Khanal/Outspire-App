import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { ThemeContext } from '../contexts/ThemeContext'; // Import ThemeContext
import DateTimePicker from '@react-native-community/datetimepicker'; // Import DateTimePicker from the library

const DatePicker = ({ onDateChange }) => {
  const { theme } = useContext(ThemeContext);

  // Define theme-based styles
  const themeColors = {
    light: {
      background: '#fff',
      textColor: '#000',
      buttonColor: '#4CAF50',  // Green button for light theme
    },
    dark: {
      background: '#333',
      textColor: '#fff',
      buttonColor: '#FF7043',  // Orange button for dark theme
    },
  };

  const currentColors = themeColors[theme]; // Apply the current theme's colors

  const [date, setDate] = useState(new Date()); // Default date is today
  const [show, setShow] = useState(false); // State to control visibility of the date picker

  // Function to handle date change
  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(false); // Close the date picker after selection
    setDate(currentDate);
    onDateChange(currentDate); // Send the selected date to the parent component
  };

  // Show the date picker when button is clicked
  const showDatepicker = () => {
    setShow(true); // Display the calendar or dialog
  };

  return (
    <View style={[styles.container, { backgroundColor: currentColors.background }]}>
      <Text style={[styles.label, { color: currentColors.textColor }]}>Select Date of Birth</Text>

      <TouchableOpacity onPress={showDatepicker} style={[styles.dateButton, { backgroundColor: currentColors.buttonColor }]}>
        <Text style={{ color: currentColors.textColor }}>
          {date ? date.toLocaleDateString() : 'MM/DD/YYYY'}
        </Text>
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode="date"
          display="default"  // Use 'default' for both iOS and Android
          onChange={onChange}
        />
      )}

      {/* Optional: You can handle errors based on your form's validation */}
      {/* {errors.date_of_birth && <Text style={styles.error}>{errors.date_of_birth?.message}</Text>} */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  dateButton: {
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    alignItems: 'center',
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
});

export default DatePicker;
