import store, { RootState } from "@/store/store";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import {
  SplashScreen,
  Stack,
  usePathname,
  useRouter,
  useSegments,
} from "expo-router";
import { useEffect, useRef } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import * as SecureStore from "expo-secure-store";
import UIError from "@/components/UI/Error";
import { SafeAreaView, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import socket from "@/utils/socket";
import * as Notifications from "expo-notifications";
import parseJwt from "@/utils/parseJwt";
import { setUser } from "@/store/slices/userSlice";
import { updateOrderStatus } from "@/store/slices/lastOrderStatusSlice";
import { subscribeToSocketEvents } from "@/utils/socketEvents";
import useHttp from "@/utils/axios";

const EXPO_PUSH_TOKEN_KEY = "expoPushToken";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, // Показывать уведомление в foreground
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

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
  const pathname = usePathname();
  const router = useRouter();

  const [loaded, error] = useFonts({
    Roboto: require("../assets/fonts/Roboto-Regular.ttf"),
    ...FontAwesome.font,
  });

  // subscribeToSocketEvents();

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    let token = "";

    (async () => {
      token = (await SecureStore.getItemAsync("token")) || "";
      if (token && pathname.includes("/login")) {
        router.push("/(tabs)");
      }
    })();
  }, [pathname]);

  useEffect(() => {
    console.log("useEffect");
  }, []);

  if (!loaded) {
    return null;
  }

  return <Provider store={store}>
    <RootLayoutNav />
    </Provider>

}

function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.user);
  const hasJoinedRef = useRef(false);

  const getMe = async () => {
    const token = await SecureStore.getItemAsync("token");
    if (token) {
      const user = parseJwt(token);
      dispatch(setUser(user));
    } else if (!segments.some((segment) => segment == "(registration)")) {
      dispatch(setUser(null));
      router.push("/(registration)/login");
    }
  };

  useEffect(() => {
    if (!user) getMe();
  }, [segments]);

  useEffect(() => {
    if (user?._id && !hasJoinedRef.current) {
      console.log("Socket join");
      socket.emit("join", user._id, user.mail);
      hasJoinedRef.current = true;
    }
  }, [user]);

  async function sendPushNotification(status: string) {
    await useHttp
      .post<any>("/expoTokenCheck", { where: "sendPushNotification"})
      .then((res) => {
        console.log("expoToken check");
      })
      .catch(() => {
        console.log("hz che sluchilos");
      });
    const expoPushToken = await SecureStore.getItemAsync(EXPO_PUSH_TOKEN_KEY);
    let sendStatus = ""
    if (status === "delivered") {
      sendStatus = "Доставлено"
    } else {
      sendStatus = "В пути"
    }

    if (!expoPushToken) {
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      await SecureStore.setItemAsync(EXPO_PUSH_TOKEN_KEY, token)
      await useHttp
        .post<any>("/pushNotification", { expoToken: token, status: sendStatus })
        .then((res) => {
          console.log(res.data);
          dispatch(updateOrderStatus(status))
          console.log("sendPushNotification after dipatch");
        })
        .catch(() => {
          console.log("hz che sluchilos");
        });
    } else {
      await useHttp
        .post<any>("/pushNotification", { expoToken: expoPushToken, status: sendStatus })
        .then((res) => {
          console.log(res.data);
          dispatch(updateOrderStatus(status))
          console.log("sendPushNotification after dipatch");
        })
        .catch(() => {
          console.log("hz che sluchilos");
        });
    }
  }

  useEffect(() => {
    const handleOrderStatusChanged = async (data: { orderId: string; status: "awaitingOrder" | "onTheWay" | "delivered" | "cancelled" }) => {
      console.log("Order status changed:", data.status);
      sendPushNotification(data.status)
      console.log("After dipatch updateOrderStataus");
      await useHttp
        .post<any>("/expoTokenCheck", { where: "handleOrderStatusChanged"})
        .then((res) => {
          console.log("expoToken check");
        })
        .catch(() => {
          console.log("hz che sluchilos");
        });
    };

    console.log("Subscribing to socket events in RootLayoutNav...");
    socket.on("orderStatusChanged", handleOrderStatusChanged);

    return () => {
      console.log("Unsubscribing from socket events in RootLayoutNav...");
      socket.off("orderStatusChanged", handleOrderStatusChanged);
    };
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission for notifications not granted.");
        return;
      }
      const expoPushToken = await SecureStore.getItemAsync(EXPO_PUSH_TOKEN_KEY)
      await useHttp
        .post<any>("/expoTokenCheck", { expoToken: expoPushToken, where: "expoPushToken"})
        .then((res) => {
          console.log("expoToken check");
        })
        .catch(() => {
          console.log("hz che sluchilos");
        });
      if (!expoPushToken) {
        const token = (await Notifications.getExpoPushTokenAsync()).data;
        await useHttp
        .post<any>("/expoTokenCheck", { expoToken: token, where: "token"})
        .then((res) => {
          console.log("expoToken check");
        })
        .catch(() => {
          console.log("hz che sluchilos");
        });
        await SecureStore.setItemAsync(EXPO_PUSH_TOKEN_KEY, token);
      }
    })();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "transparent",
      }}>
      <StatusBar style="dark" hidden={false} backgroundColor="transparent" />
      <SafeAreaView
        style={{
          flex: 1,
        }}>
          <Stack>
            <Stack.Screen
              name="(tabs)"
              options={{
                headerShown: false,
                headerStyle: {
                  backgroundColor: "blue",
                },
              }}
            />
            <Stack.Screen
              name="(registration)"
              options={{ headerShown: false }}
            />
            <Stack.Screen name="(modals)" options={{ headerShown: false }} />
          </Stack>
          <UIError />
      </SafeAreaView>
    </View>
  );
}
