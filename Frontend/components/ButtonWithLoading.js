import React from 'react';
import { Button, ActivityIndicator } from 'react-native-paper';

const ButtonWithLoading = ({ loading, onPress, title }) => {
  return (
    <Button mode="contained" onPress={onPress} disabled={loading} loading={loading}>
      {loading ? <ActivityIndicator size="small" color="#fff" /> : title}
    </Button>
  );
};

export default ButtonWithLoading;
