import React from 'react';
import { Text } from 'react-native';

const ErrorMessage = ({ message }) => {
  return <Text style={{ color: 'red', marginBottom: 10 }}>{message}</Text>;
};

export default ErrorMessage;
