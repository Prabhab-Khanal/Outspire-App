import React, { useContext } from 'react';
import { TextInput, Text, View, StyleSheet } from 'react-native';
import { ThemeContext } from '../contexts/ThemeContext';

const FormInput = ({
  label,
  value,
  onChangeText,
  onBlur,               // ← accept onBlur
  onFocus,              // ← optionally accept onFocus
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  placeholder,
  placeholderTextColor,
  ...restProps          // ← collect any other props (e.g. maxLength, autoCapitalize, etc.)
}) => {
  const { theme } = useContext(ThemeContext);

  const themeColors = {
    light: {
      textColor: '#000',
      borderColor: '#000',
      placeholderTextColor: '#000',
      errorTextColor: 'red',
      labelColor: '#3E7D41',
    },
    dark: {
      textColor: '#fff',
      borderColor: '#fff',
      placeholderTextColor: '#fff',
      errorTextColor: 'red',
      labelColor: '#5B9A5E',
    }
  };
  const currentColors = themeColors[theme];

  return (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: currentColors.labelColor }]}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}                                // ← forward onBlur
        onFocus={onFocus}                              // ← forward onFocus
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor || currentColors.placeholderTextColor}
        style={[
          styles.input,
          {
            borderColor: error
              ? currentColors.errorTextColor
              : currentColors.borderColor,
            color: currentColors.textColor
          }
        ]}
        {...restProps}                                 // ← forward all other props
      />
      {error ? (
        <Text style={[styles.errorText, { color: currentColors.errorTextColor }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    height: 56,
    borderBottomWidth: 2,
    paddingLeft: 16,
    paddingRight: 16,
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    marginTop: 5,
  },
});

export default FormInput;
