import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="order"
        options={{
          headerBackVisible: true,
          headerBackButtonMenuEnabled: true,
          headerShown: true,
          headerShadowVisible: false,
          headerTitle: "Оформление заказа",
          headerTitleAlign: "center",
        }}
      />
      <Stack.Screen
        name="news"
        options={{
          headerBackVisible: true,
          headerBackButtonMenuEnabled: true,
          headerShown: true,
          headerShadowVisible: false,
          headerTitle: "Новости",
          headerTitleAlign: "center",
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          headerBackButtonMenuEnabled: true,
          headerShown: true,
          headerShadowVisible: false,
          headerTitle: "Настройки",
          headerTitleAlign: "center",
        }}
      />
      <Stack.Screen
        name="bonus"
        options={{
          headerBackButtonMenuEnabled: true,
          headerShown: true,
          headerShadowVisible: false,
          headerTitle: "Бонусы",
          headerTitleAlign: "center",
        }}
      />
      <Stack.Screen
        name="address"
        options={{
          headerBackButtonMenuEnabled: true,
          headerShown: true,
          headerShadowVisible: false,
          headerTitle: "Адреса",
          headerTitleAlign: "center",
        }}
      />
    </Stack>
  );
}
