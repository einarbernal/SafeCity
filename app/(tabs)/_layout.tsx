import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Entypo, FontAwesome, MaterialIcons } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "black",
        tabBarInactiveTintColor: 'white',
        headerShown: true,
        tabBarButton: HapticTab,
        //tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {
            backgroundColor: '#2e5929',
          },
        }),
        
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="Localizar"
        options={{
          title: 'Localizar',
          tabBarIcon: ({ color }) => <Entypo size={28} name="location" color={color} />,
        }}
      />

    <Tabs.Screen
        name="Reportar"
        options={{
          title: 'Reportar',
          tabBarIcon: ({ color }) => <MaterialIcons size={28} name="add-box" color={color} />,
        }}
      />

    <Tabs.Screen
        name="Historial"
        options={{
          title: 'Historial',
          tabBarIcon: ({ color }) => <Entypo size={28} name="text-document-inverted" color={color} />,
        }}
      />
       <Tabs.Screen name="DescripcionReportes" options={{ title: 'Descripción' }} />
    </Tabs>
  );
}
