import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ChatScreen from '../../screens/Chat/ChatScreen';
import GroupScreen from '../../screens/Chat/GroupScreen';
import MessageScreen from '../../screens/Chat/MessageScreen';

const Stack = createNativeStackNavigator();

export default function ChatStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Chats" component={ChatScreen} />
      <Stack.Screen name="Groups" component={GroupScreen} />
      <Stack.Screen name="Message" component={MessageScreen} />
    </Stack.Navigator>
  );
}
