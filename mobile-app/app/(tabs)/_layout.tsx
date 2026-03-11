import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#10b981',
        tabBarInactiveTintColor: '#64748b',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
            position: 'absolute',
            bottom: Platform.OS === 'ios' ? 32 : 16,
            left: 20,
            right: 20,
            height: 64,
            borderRadius: 32,
            borderTopWidth: 0,
            backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'rgba(255, 255, 255, 0.95)',
            elevation: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.1,
            shadowRadius: 20,
        },
        tabBarBackground: () => 
            Platform.OS === 'ios' ? (
                <BlurView 
                    intensity={80} 
                    tint="light" 
                    style={{ ...StyleSheet.absoluteFillObject, borderRadius: 32, overflow: 'hidden' }} 
                />
            ) : null,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="clock.arrow.circlepath" color={color} />,
        }}
      />
    </Tabs>
  );
}
