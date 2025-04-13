import React from 'react';
import { TextInput, Text } from 'react-native-paper';
import { Controller } from 'react-hook-form';

const FormInput = ({ control, name, label, rules, error, secureTextEntry = false, keyboardType = 'default' }) => {
  return (
    <React.Fragment>
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field: { onChange, value } }) => (
          <TextInput
            label={label}
            style={{ marginBottom: 10 }}
            onChangeText={onChange}
            value={value}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            error={!!error}
          />
        )}
      />
      {error && <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text>}
    </React.Fragment>
  );
};

export default FormInput;
