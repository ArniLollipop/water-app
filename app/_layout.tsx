import store from "@/store/store";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack, usePathname, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import "react-native-reanimated";
import { Provider, useDispatch } from "react-redux";
import * as SecureStore from "expo-secure-store";
import useHttp from "@/utils/axios";
import UIError from "@/components/UI/Error";
import { SafeAreaView } from "react-native";
import { StatusBar } from "expo-status-bar";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.

export default function RootLayout() {
  const segments = useSegments();
  const pathname = usePathname();
  const router = useRouter();

  const [loaded, error] = useFonts({
    Roboto: require("../assets/fonts/Roboto-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // useEffect(() => {
  //   if (loaded) {
  //     SplashScreen.hideAsync();
  //   }
  // }, [loaded]);

  useEffect(() => {
    let token = "";

    (async () => {
      token = (await SecureStore.getItemAsync("token")) || "";
      if (token && segments.includes("registration")) {
        router.push("(tabs)/");
      }
    })();
  }, [pathname]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <>
      <StatusBar style="dark" hidden={false} backgroundColor="transparent" />
      <SafeAreaView
        shouldRasterizeIOS
        style={{
          flex: 1,
          backgroundColor: "transparent",
        }}>
        <Provider store={store}>
          <Stack>
            <Stack.Screen
              name="(tabs)"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="(registration)"
              options={{ headerShown: false }}
            />
            <Stack.Screen name="(modals)" options={{ headerShown: false }} />
          </Stack>
          <UIError />
        </Provider>
      </SafeAreaView>
    </>
  );
}
