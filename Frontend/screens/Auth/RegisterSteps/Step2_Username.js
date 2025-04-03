import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

export default function Step2_Username({ navigation, route }) {
  const [username, setUsername] = useState('');

  const handleNext = () => {
    navigation.navigate('Step3_Email', {
      ...route.params,
      username,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Step 2: Choose a Username</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <Button title="Next" onPress={handleNext} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 10, marginBottom: 16 },
});
