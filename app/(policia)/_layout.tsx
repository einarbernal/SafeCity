import { Stack } from 'expo-router';
import { Platform } from 'react-native';

export default function Layout() {
  return (
    <Stack>
      {/* Pantallas con menús */}
      <Stack.Screen 
        name="(tab)" 
        options={{ 
          headerShown: false // Oculta el header del Stack
        }} 
      />
      
      {/* Pantallas modales */}
      <Stack.Screen 
        name="(modals)/NoticiaExito" 
        options={{ 
          presentation: 'modal', // Efecto modal
          headerShown: false,   // Sin header
          gestureEnabled: true  // Permite cerrar con gesto (opcional)
        }} 
      />
        <Stack.Screen 
        name="(modals)/DescripcionRAtendidos" 
        options={{ 
          presentation: 'modal',
          headerShown: false,   // Oculta el header
          gestureEnabled: true, // Permite cerrar con gesto
          contentStyle:{
            marginTop:Platform.OS === 'android'? 25 : 0
          }
        }} 
      />

<       Stack.Screen 
        name="(modals)/DescripcionReportes" 
        options={{ 
          presentation: 'modal',
          headerShown: false,   // Oculta el header
          gestureEnabled: true, // Permite cerrar con gesto
          contentStyle:{
            marginTop:Platform.OS === 'android'? 25 : 0
          }
        }} 
      />
    </Stack>
  );
}