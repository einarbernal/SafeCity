import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#2e5929' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        headerBackTitle: "Atrás",
      }}
    >
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen 
        name="PerfilCiudadano" 
        options={{ 
          title: 'Perfil',
          headerLeft: () => null // Oculta el botón de retroceso si es necesario
        }} 
      />
    </Stack>
  );
}