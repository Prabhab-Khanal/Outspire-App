import React from 'react';
import { Button, Text } from 'react-native-paper';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const DatePicker = ({ date, onDateChange, showDatePicker, setShowDatePicker }) => {
  return (
    <React.Fragment>
      <Button mode="outlined" onPress={() => setShowDatePicker(true)}>
        Pick Date of Birth
      </Button>
      {showDatePicker && (
        <DateTimePickerModal
          isVisible={showDatePicker}
          mode="date"
          onConfirm={onDateChange}
          onCancel={() => setShowDatePicker(false)}
        />
      )}
      <Text>{date.toLocaleDateString()}</Text>
    </React.Fragment>
  );
};

export default DatePicker;
