import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TrailsStack from './stacks/TrailsStack';
import CommunityStack from './stacks/CommunityStack';
import ChatStack from './stacks/ChatStack';
import PremiumStack from './stacks/PremiumStack';
import SosStack from './stacks/SosStack';
import SettingsStack from './stacks/SettingsStack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Tab = createBottomTabNavigator();

export default function DashboardNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="Trails"
        component={TrailsStack}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="map-marker-path" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Community"
        component={CommunityStack}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="account-group" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatStack}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="chat" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Premium"
        component={PremiumStack}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="crown" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="SOS"
        component={SosStack}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="alert" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStack}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="cog-outline" color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}
