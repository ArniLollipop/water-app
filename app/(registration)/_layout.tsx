import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen
        name="registration"
        options={{
          headerShadowVisible: false,
          headerTransparent: true,
          headerTitle: "",
        }}
      />
      <Stack.Screen
        name="confirmSms"
        options={{
          headerShadowVisible: false,
          headerTransparent: true,
          headerTitle: "",
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          headerShadowVisible: false,
          headerTransparent: true,
          headerTitle: "",
        }}
      />
    </Stack>
  );
}
