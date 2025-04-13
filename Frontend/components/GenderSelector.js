import React from 'react';
import { View, Text } from 'react-native';
import { Card } from 'react-native-paper';

const GenderSelector = ({ selectedGender, onSelectGender }) => {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 }}>
      {['Male', 'Female', 'Other'].map((gender) => (
        <Card
          key={gender}
          style={{
            padding: 10,
            backgroundColor: selectedGender === gender ? '#cfe2f3' : '#f0f0f0',
            borderRadius: 5,
            width: '30%',
            alignItems: 'center',
          }}
          onPress={() => onSelectGender(gender)}
        >
          <Text>{gender}</Text>
        </Card>
      ))}
    </View>
  );
};

export default GenderSelector;
