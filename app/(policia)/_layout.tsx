import { Tabs } from 'expo-router';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';

const Colors = {
  light: {
    tint: '#2e5929',
    headerBg: '#1a3b1a', // Color más oscuro para el header
    headerTint: 'white',
  },
  dark: {
    tint: 'white',
    headerBg: '#0f260f', // Versión oscura para el header
    headerTint: 'white',
  },
};

export default function PoliciaLayout() {
  const colorScheme = useColorScheme();
  const currentColors = Colors[colorScheme ?? 'light'];

  return (
    <Tabs
      screenOptions={{
        // Configuración del Tab Bar Inferior
        tabBarActiveTintColor: currentColors.tint,
        tabBarInactiveTintColor: '#aaa',
        tabBarStyle: {
          backgroundColor: '#2E4A28',
          height: 98,
          paddingBottom: 10,
        },
        tabBarLabelStyle: {
          fontSize: 14,
          marginBottom: 5,
        },
        
        // Configuración del Header Superior
        headerStyle: {
          backgroundColor: "#2E4A28",
          height: 100, // Altura personalizada
        },
        headerTitleStyle: {
          color: currentColors.headerTint,
          fontSize: 22,
          fontWeight: 'bold',
        },
        headerTintColor: currentColors.headerTint,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Reportes', // Título en el header
          tabBarLabel: 'Inicio',    // Etiqueta en el tab bar
          tabBarIcon: ({ color }) => (
            <FontAwesome name="home" size={30} color={color} />
          ),
          headerTitle: 'Reportes' // Título diferente para el header
        }}
      />
      
      <Tabs.Screen
        name="RegistroNoticia"
        options={{
          title: 'Registrar Noticia', // Título en el header
          tabBarLabel: 'Subir', // Etiqueta en el tab bar
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="add-box" size={30} color={color} />
          ),
          headerTitle: 'Registrar Noticia' // Título diferente para el header
        }}
      />
    </Tabs>
  );
}