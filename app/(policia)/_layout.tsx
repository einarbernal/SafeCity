import { Stack } from "expo-router";
import { Platform } from "react-native";

export default function Layout() {
  return (
    <Stack>
      {/* Pantallas con menús (Tabs de Admin) */}
      <Stack.Screen
        name="(tab)"
        options={{
          headerShown: false, // Oculta el header del Stack
        }}
      />

      {/* Pantallas modales para Admin */}
      <Stack.Screen
        name="(modals)/NoticiaExito"
        options={{
          presentation: "modal",
          headerShown: false,
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="(modals)/DescripcionRAtendidos"
        options={{
          presentation: "modal",
          headerShown: false,
          gestureEnabled: true,
          contentStyle: {
            marginTop: Platform.OS === "android" ? 25 : 0,
          },
        }}
      />
      <Stack.Screen
        name="(modals)/DescripcionReportes"
        options={{
          presentation: "modal",
          headerShown: false,
          gestureEnabled: true,
          contentStyle: {
            marginTop: Platform.OS === "android" ? 25 : 0,
          },
        }}
      />
    </Stack>
  );
}
