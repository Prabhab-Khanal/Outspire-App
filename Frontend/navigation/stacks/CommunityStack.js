import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CommunityScreen from '../../screens/Community/CommunityScreen';
import PostDetailsScreen from '../../screens/Community/PostDetailsScreen';
import UserProfileScreen from '../../screens/Profile/UserProfileScreen';
import CommunityAddPostScreen from '../../screens/Community/AddPostScreen';
const Stack = createNativeStackNavigator();

export default function CommunityStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Community" component={CommunityScreen} />
      <Stack.Screen name="PostDetails" component={PostDetailsScreen} options={{ headerShown: false}}/>
      <Stack.Screen name="UserProfile" component={UserProfileScreen} />
      <Stack.Screen name="AddPost" component={CommunityAddPostScreen} />
    </Stack.Navigator>
  );
}
