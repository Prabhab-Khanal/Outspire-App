import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

export default function Step3_Email({ navigation, route }) {
  const [email, setEmail] = useState('');

  const handleNext = () => {
    navigation.navigate('Step4_ProfilePicture', {
      ...route.params,
      email,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Step 3: Enter Your Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Email Address"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
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
