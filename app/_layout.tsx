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
import { useEffect, useRef, useState } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import * as SecureStore from "expo-secure-store";
import UIError from "@/components/UI/Error";
import { Alert, SafeAreaView, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import socket from "@/utils/socket";
import * as Notifications from "expo-notifications";
import parseJwt from "@/utils/parseJwt";
import { setUser } from "@/store/slices/userSlice";
import { updateOrderStatus } from "@/store/slices/lastOrderStatusSlice";
import useHttp from "@/utils/axios";
import { setError } from "@/store/slices/errorSlice";
import { Platform } from 'react-native';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import checkAndRequestTrackingPermission from "@/components/home/checkAndRequestTrackingPermission";

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
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [permissionChecked, setPermissionChecked] = useState(false);
  const [loaded, error] = useFonts({
    Roboto: require("../assets/fonts/Roboto-Regular.ttf"),
    ...FontAwesome.font,
  });

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
    } else if (!segments.some((segment: string) => segment == "(registration)")) {
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

  useEffect(() => {
    // Добавляем слушателя
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      if (notification.request.content.data.newStatus === "bonus") {
        console.log("Сообщение:", notification.request.content.body);
        console.log("Данные:", notification.request.content.data);
      } else {
        console.log("Сообщение:", notification.request.content.body);
        console.log("Данные:", notification.request.content.data);
        dispatch(updateOrderStatus(notification.request.content.data.newStatus === "В пути" ? "onTheWay" : "delivered"))
      }
    });
  
    // Возвращаем функцию очистки для отписки
    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    (async () => {
      const { status: pushStatus } = await Notifications.requestPermissionsAsync();
      if (pushStatus !== "granted") {
        console.log("Permission for notifications not granted.");
        return;
      } else {
        setTimeout(async () => {
          const { status: attStatus } = await requestTrackingPermissionsAsync();
          if (attStatus === "granted") {
            console.log("App Tracking Transparency permission granted.");
          } else {
            checkAndRequestTrackingPermission
            console.log("App Tracking Transparency permission denied.");
          }
        }, 1000);
      }
      const expoPushToken = await SecureStore.getItemAsync(EXPO_PUSH_TOKEN_KEY)
      if (!expoPushToken) {
        try {
          const tokenData = await Notifications.getExpoPushTokenAsync({projectId: "44ab56bf-15dd-4f12-9c01-c29f592dc6c9"});
          const token = tokenData.data;
          await SecureStore.setItemAsync(EXPO_PUSH_TOKEN_KEY, token);
        } catch (error) {
          await useHttp
            .post<any>("/expoTokenCheck", { where: "getExpoPushTokenAsync error", error })
            .then((res: any) => {
              console.log("expoToken check");
            })
            .catch((err: any) => {
              console.log("Ошибка при отправке expoToken:", err);
            });
        }
      }
    })();
  }, []);

  const sendExpoPushToken = async () => {
    if (user?.mail) {
      const expoPushToken = await SecureStore.getItemAsync(EXPO_PUSH_TOKEN_KEY)
      if (!expoPushToken) {
        try {
          const tokenData = await Notifications.getExpoPushTokenAsync({projectId: "44ab56bf-15dd-4f12-9c01-c29f592dc6c9"});
          const token = tokenData.data;
          await useHttp
          .post("/updateClientDataMobile", {
            mail: user.mail,
            field: "expoPushToken",
            value: expoPushToken,
          })
          .then(() => {
            console.log("updateClientDataMobile in !expoPushToken");
            
            dispatch(
              setUser({
                ...user,
                expoPushToken: token,
              })
            );
          })
          .catch((err: { response: { data: { message: any; }; }; }) => {
            dispatch(
              setError({
                error: true,
                errorMessage: err?.response?.data?.message,
              })
            );
          });
          await SecureStore.setItemAsync(EXPO_PUSH_TOKEN_KEY, token);
        } catch (error) {
          await useHttp
            .post<any>("/expoTokenCheck", { where: "getExpoPushTokenAsync error", error })
            .then((res: any) => {
              console.log("expoToken check");
            })
            .catch((err: any) => {
              console.log("Ошибка при отправке expoToken:", err);
            });
        }
      } else {
        await useHttp
          .post("/updateClientDataMobile", {
            mail: user.mail,
            field: "expoPushToken",
            value: expoPushToken,
          })
          .then(() => {
            console.log("updateClientDataMobile in expoPushToken");
            dispatch(
              setUser({
                ...user,
                expoPushToken: expoPushToken,
              })
            );
          })
          .catch((err: { response: { data: { message: any; }; }; }) => {
            dispatch(
              setError({
                error: true,
                errorMessage: err?.response?.data?.message,
              })
            );
          });
      }
    }
  }

  useEffect(() => {      
      sendExpoPushToken()
  }, [user?.mail])

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
