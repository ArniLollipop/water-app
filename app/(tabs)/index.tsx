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
import * as SecureStore from "expo-secure-store";

const EXPO_PUSH_TOKEN_KEY = "expoPushToken";

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
  const [status2, setStatus2] = useState<"awaitingOrder" | "onTheWay" | "delivered" | "cancelled">("awaitingOrder")

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
        })
        .catch(() => {
          console.log("hz che sluchilos");
        });
    } else {
      await useHttp
        .post<any>("/pushNotification", { expoToken: expoPushToken, status: sendStatus })
        .then((res) => {
          console.log(res.data);
        })
        .catch(() => {
          console.log("hz che sluchilos");
        });
    }
  }

  useEffect(() => {
    console.log("Subscribing to socket events...");
  
    const handleOrderStatusChanged = (data: { orderId: string; status: "awaitingOrder" | "onTheWay" | "delivered" | "cancelled" }) => {
      console.log("Order status changed:");
      console.log("data.status: ", data.status);
      console.log("status: ", status2);
      if (data.status !== status2) {
        setStatus2(data.status);
      }
    };
  
    socket.on("orderStatusChanged", handleOrderStatusChanged);
  
    return () => {
      console.log("Unsubscribing from socket events");
      socket.off("orderStatusChanged");
    };
  }, []);

  useEffect(() => {
    if (status2 !== "awaitingOrder" && status2 !== lastOrder?.status) {
      sendPushNotification(status2);
      if (lastOrder && lastOrder._id) {
        setLastOrder({
          ...lastOrder,
          status: status2,
        });
      } else {
        console.error("lastOrder или _id отсутствует, не могу обновить статус");
      }
    }
  }, [status2])

  useEffect(() => {
    if (user?._id) {
      socket.emit("join", user?._id, user?.mail);
  }
  }, [user]);

  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission for notifications not granted.");
        return;
      }
      const expoPushToken = await SecureStore.getItemAsync(EXPO_PUSH_TOKEN_KEY)
      if (!expoPushToken) {
        const token = (await Notifications.getExpoPushTokenAsync()).data;
        await SecureStore.setItemAsync(EXPO_PUSH_TOKEN_KEY, token);
      }
    })();
  }, []);

  const isButtonVisible = () => {
    return user?.cart && (user.cart.b12 > 0 || user.cart.b19 > 0);
  };

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
