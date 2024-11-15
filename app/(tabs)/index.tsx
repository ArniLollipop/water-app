import HomeCategories from "@/components/home/categories";
import Products from "@/components/home/products";
import HomeRecent from "@/components/home/recent";
import UIButton from "@/components/UI/Button";
import Colors from "@/constants/Colors";
import { setError } from "@/store/slices/errorSlice";
import { setCart } from "@/store/slices/userSlice";
import { RootState } from "@/store/store";
import sharedStyles from "@/styles/style";
import useHttp from "@/utils/axios";
import { usePathname, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import io from "socket.io-client";
import * as Notifications from "expo-notifications";

const socket = io(process.env.EXPO_PUBLIC_BASE_URL);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, // Показывать уведомление в foreground
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function Home() {
  const router = useRouter();
  const pathname = usePathname();

  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.user);

  const [lastOrder, setLastOrder] = useState<IOrder | null>(null);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null)
  const [bonus, setBonus] = useState(0);
  const [haveCompletedOrder, setHaveCompletedOrder] = useState(false)
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);

  async function getCart() {
    await useHttp
      .post<ICart>("/getCart", { mail: user?.mail })
      .then((res) => {
        dispatch(setCart(res.data));
      })
      .catch((err) => {
        dispatch(
          setError({
            error: true,
            errorMessage: err.response.data,
          })
        );
      });
  }

  async function getBonuses() {
    await useHttp
      .post<IUser>("/getClientDataForId", { id: user?._id })
      .then((res) => {
        setBonus(res.data.bonus || 0);
        setHaveCompletedOrder(res.data.haveCompletedOrder || false)
      })
      .catch((err) => {
        dispatch(
          setError({
            error: true,
            errorMessage: err.response.data,
          })
        );
      });
  }

  async function getLastOrder() {
    await useHttp
      .post<{ order: IOrder }>("/getLastOrderMobile", { clientId: user?._id })
      .then((res) => {
        setLastOrder(res.data.order);
        setLastOrderId(res.data.order._id)
      })
      .catch(() => {
        console.log("no last order");
      });
  }

  useEffect(() => {
    if (pathname == "/") {
      if (user?.mail) {
        getCart();
      }
      if (user?._id) {
        getLastOrder();
        getBonuses();
      }
    }
  }, [user?.mail, pathname]);

  async function sendPushNotification(status: string) {
    let sendStatus = ""
    if (status === "delivered") {
      sendStatus = "Доставлено"
    } else {
      sendStatus = "В пути"
    }
    await useHttp
      .post<any>("/pushNotification", { expoToken: expoPushToken, status: sendStatus })
      .then((res) => {
        console.log(res.data);
        
      })
      .catch(() => {
        console.log("hz che sluchilos");
      });
  }

  useEffect(() => {
    if (lastOrderId && lastOrder?._id) {
      console.log("useefect lastOrder");
      
      socket.on("message", (data) => {
          console.log(data);
      });
      socket.emit("join", user?._id, user?.mail);

      const handleOrderStatusChanged = (data: { orderId: string; status: "awaitingOrder" | "onTheWay" | "delivered" | "cancelled"; }) => {
        console.log("Order status changed:", data);
        if (lastOrder?.status !== data.status) {
          setLastOrder({ ...lastOrder, status: data.status });
          sendPushNotification(data.status)
        }
      };

      socket.on("orderStatusChanged", handleOrderStatusChanged);

      // Возвращаем функцию очистки, которая отключает слушатель
      return () => {
          socket.off("orderStatusChanged", handleOrderStatusChanged);
      };
  }
}, [lastOrderId]);

  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission for notifications not granted.");
        return;
      }
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log("Expo Push Token:", token);
      setExpoPushToken(token); // сохраняем токен в состоянии
    })();
  }, []);

  const isButtonVisible = () => {
    return user?.cart && (user.cart.b12 > 0 || user.cart.b19 > 0);
  };

  // useEffect(() => {
  //   console.log("USEEFFECT 1");
  
  //   const subscription = Notifications.addNotificationReceivedListener(async (notification) => {
  //     console.log("Notification received in foreground:");
  
  //     // Проверяем, если уведомление имеет специфические данные, которые мы сами добавили, и не создаем его снова
  //     if (notification.request.content.data?.triggeredByForegroundHandler) {
  //       console.log("Notification skipped to prevent loop", notification.request.content.data);
  //       return;
  //     }
  
  //     // Ручное отображение уведомления через scheduleNotificationAsync
  //     await Notifications.scheduleNotificationAsync({
  //       content: {
  //         title: notification.request.content.title || "Новое уведомление",
  //         body: notification.request.content.body,
  //         data: { ...notification.request.content.data, triggeredByForegroundHandler: true },
  //       },
  //       trigger: null, // Немедленное отображение
  //     });
  //   });

  //   console.log("USEEFFECT 2");
  
  //   return () => subscription.remove();
  // }, []);

  // const sendPushNotification = async (token: string | null, status: string) => {
  //   if (!token) return;
  //   const message = {
  //     to: token,
  //     sound: "default",
  //     title: "Обновление статуса заказа",
  //     body: `Статус вашего заказа: ${status}`,
  //     data: { status },
  //   };

  //   await fetch("https://api.expo.dev/v2/push/send", {
  //     method: "POST",
  //     headers: {
  //       Accept: "application/json",
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify(message),
  //   })
  //     .then((response) => response.json())
  //     .then((data) => console.log("Expo push response:", data))
  //     .catch((error) => console.error("Push notification error:", error));
  // };

  return (
    <View style={sharedStyles.container}>
      <ScrollView
        bounces={false}
        contentContainerStyle={{
          backgroundColor: Colors.background,
          paddingBottom: 15,
        }}>
        {lastOrder && <HomeRecent lastOrder={lastOrder} />}
        <HomeCategories
          bonus={bonus}
          hasLastOrder={haveCompletedOrder}
        />
        <Products />
      </ScrollView>
      {isButtonVisible() && (
        <UIButton
          onPress={() => router.push("/(modals)/order")}
          type="default"
          text="Заказать"
          styles={{
            position: "fixed",
            bottom: 0,
            zIndex: 10,
          }}
        />
      )}
    </View>
  );
}
