import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ChatScreen from '../../screens/Chat/ChatScreen';
import CreateGroupScreen from '../../screens/Chat/CreateGroupScreen';
import GroupChatRoomScreen from '../../screens/Chat/GroupChatScreen';
import ChatRoomScreen from '../../screens/Chat/ChatRoomScreen';
import GroupSettingsScreen from '../../screens/Chat/GroupSettingsScreen';
import AddMembersScreen from '../../screens/Chat/AddMembersScreen';
import RenameGroupScreen from '../../screens/Chat/RenameGroupScreen';

const Stack = createNativeStackNavigator();

export default function ChatStack() {
  return (
    <Stack.Navigator>
      
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="ChatRoom" component={ChatRoomScreen} options={{ headerShown: false}}/>
      <Stack.Screen name="GroupChatRoom" component={GroupChatRoomScreen} options={{ headerShown: false}} />
      <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
      <Stack.Screen name="GroupSettings" component={GroupSettingsScreen} />
      <Stack.Screen name="AddMembers" component={AddMembersScreen} />
      <Stack.Screen name="RenameGroup" component={RenameGroupScreen} />



    </Stack.Navigator>
  );
}
