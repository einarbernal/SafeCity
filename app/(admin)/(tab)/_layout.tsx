import { Tabs } from "expo-router";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useColorScheme } from "react-native";

const Colors = {
  light: {
    tint: "#2e5929",
    headerBg: "#1a3b1a",
    headerTint: "white",
  },
  dark: {
    tint: "black",
    headerBg: "#0f260f",
    headerTint: "white",
  },
};

export default function AdminLayout() {
  const colorScheme = useColorScheme();
  const currentColors = Colors[colorScheme ?? "light"];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: currentColors.tint,
        tabBarInactiveTintColor: "white",
        tabBarStyle: {
          backgroundColor: "#2E4A28",
          height: 98,
          paddingBottom: 10,
        },
        tabBarLabelStyle: {
          fontSize: 14,
          marginBottom: 5,
        },

        headerStyle: {
          backgroundColor: "#2E4A28",
          height: 100, 
        },
        headerTitleStyle: {
          color: currentColors.headerTint,
          fontSize: 22,
          fontWeight: "bold",
        },
        headerTintColor: currentColors.headerTint,
      }}
    >
      <Tabs.Screen
        name="inicio"
        options={{
          title: "Lista de Policías",
          tabBarLabel: "Inicio",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="home" size={30} color={color} />
          ),
          headerTitle: "Lista de Policías",
        }}
      />
      <Tabs.Screen
        name="CrearPolicia"
        options={{
          title: "Crear Policía",
          tabBarLabel: "Crear Policía",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="person-add-alt-1" size={30} color={color} />
          ),
          headerTitle: "Crear Policía",
        }}
      />
      <Tabs.Screen
        name="PerfilAdmin"
        options={{
          title: "Perfil Admin",
          tabBarLabel: "Perfil",
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="user-shield" size={28} color={color} />
          ),
          headerTitle: "Perfil Admin",
        }}
      />
    </Tabs>
  );
}
