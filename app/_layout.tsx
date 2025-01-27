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
import { SetStateAction, useEffect, useState } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import * as SecureStore from "expo-secure-store";
import UIError from "@/components/UI/Error";
import { Button, FlatList, Modal, Platform, SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as Notifications from "expo-notifications";
import parseJwt from "@/utils/parseJwt";
import { setUser } from "@/store/slices/userSlice";
import { updateOrderStatus } from "@/store/slices/lastOrderStatusSlice";
import useHttp from "@/utils/axios";
import { setError } from "@/store/slices/errorSlice";
import { Rating } from "react-native-ratings";
import UIButton from "@/components/UI/Button";

const EXPO_PUSH_TOKEN_KEY = "expoPushToken";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, // Показывать уведомление в foreground
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export {
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

const reviewComment = [
  {
    rating: 1,
    comments: ["Поздняя доставка", "Без звонка", "Без формы", "Грубое общение", "Повреждена упаковка"]
  },
  {
    rating: 2,
    comments: ["Курьер не помог установить", "Проблемы с оплатой", "Без формы", "Повреждена упаковка", "Грубое общение"]
  },
  {
    rating: 3,
    comments: ["Поздняя доставка", "Чистая упаковка", "Без звонка", "Курьер не помог установить", "Ошибка оплаты"]
  },
  {
    rating: 4,
    comments: ["Быстрая доставка", "Чистая упаковка", "Дружелюбный курьер", "Фирменная форма", "Удобное время"]
  },
  {
    rating: 5,
    comments: ["Быстрая доставка", "Чистая упаковка", "Дружелюбный курьер", "Фирменная форма", "Пунктуальная доставка"]
  },
]


export default function RootLayout() {
  const pathname = usePathname();
  const router = useRouter();
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
  const segments = useSegments();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.user);
  const [order, setOrder] = useState<IOrder | null>()
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewStep, setReviewStep] = useState(1)
  const [selectedComments, setSelectedComments] = useState<string[]>([]);

  const getMe = async () => {
    const token = await SecureStore.getItemAsync("token");
    if (token) {
      const user = parseJwt(token);
      dispatch(setUser(user));
    } else if (!segments.some((segment: string) => segment == "(registration)")) {
      dispatch(setUser(null));
    }
  };

  useEffect(() => {
    if (!user) getMe();
  }, [segments]);

  async function getLastOrder() {
    await useHttp
      .post<{ order: IOrder }>("/getLastOrderMobile", { clientId: user?._id })
      .then((res) => {
        dispatch(updateOrderStatus(res.data.order.status))
      })
      .catch(() => {
        console.log("no last order");
      });
  }

  useEffect(() => {
    // Добавляем слушателя
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      if (notification.request.content.data.newStatus !== "bonus") {
        if (notification.request.content.data.newStatus === "delivered") {
          getUnreviewedOrder()
        }
        getLastOrder()
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
      }

      const expoPushToken = await SecureStore.getItemAsync(EXPO_PUSH_TOKEN_KEY);
      if (!expoPushToken) {
        try {
          let token = null;
          // Получение токена в зависимости от платформы
          if (Platform.OS === "ios") {
            const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync();
            token = expoPushToken;
          } else if (Platform.OS === "android") {
            const { data: devicePushToken } = await Notifications.getDevicePushTokenAsync();
            token = devicePushToken;
          }
          await SecureStore.setItemAsync(EXPO_PUSH_TOKEN_KEY, token);
        } catch (error) {
          await useHttp.post<any>("/expoTokenCheck", { where: "getExpoPushTokenAsync in useEffect error", error })
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
          let token = null;
          // Получение токена в зависимости от платформы
          if (Platform.OS === "ios") {
            const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync();
            token = expoPushToken;
            console.log("expoPushToken: ", expoPushToken);
            
          } else if (Platform.OS === "android") {
            const { data: devicePushToken } = await Notifications.getDevicePushTokenAsync();
            token = devicePushToken;
          }
          await useHttp
            .post("/updateClientDataMobile", {
              mail: user.mail,
              field: "expoPushToken",
              value: token,
            })
            .then(() => {
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
            .post<any>("/expoTokenCheck", { where: "getExpoPushTokenAsync error in sendExpoPushToken", error })
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

  const getUnreviewedOrder = async () => {
    if (user?.mail !== "" && user?.mail !== null) {
      await useHttp
        .post("/getUnreviewedOrder", {
          mail: user?.mail,
        })
        .then(({data}) => {
          if (data.success) {
            setOrder(data.order)
          } else {
            setOrder(null)
          }
        })
        .catch((err: { response: { data: { message: any; }; }; }) => {
        });
    }
  }

  useEffect(() => {      
      sendExpoPushToken()
      getUnreviewedOrder()
  }, [user?.mail])

  useEffect(() => {
    if (order) {
      setShowRatingModal(true);
    }
  }, [order]);

  const currentComments =
    reviewComment.find((item) => item.rating === rating)?.comments || [];

  const toggleCommentSelection = (comment: string) => {
    if (selectedComments.includes(comment)) {
      setSelectedComments((prev) =>
        prev.filter((selected) => selected !== comment)
      );
    } else {
      setSelectedComments((prev) => [...prev, comment]);
    }
  };

  const handleSubmit = async () => {
    await useHttp
        .post("/addReview", {
          orderId: order?._id,
          rating,
          notes: selectedComments
        })
        .then(({data}) => {
          if (data.success) {
            setOrder(null)
            setShowRatingModal(false); // Закрыть модальное окно
            setReviewStep(1); // Сбросить шаги
            setRating(0); // Сбросить рейтинг
            setSelectedComments([]); // Сбросить комментарии
            getUnreviewedOrder()
          }
        }).catch((err: { response: { data: { message: any; }; }; }) => {
          console.log("Error in addReview");
        });
  };

  return (
    <>
    {order && <Modal
        visible={showRatingModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {}} // Блокируем возможность закрыть модальное окно
      >
          <View
            style={{
              flex: 1,
              justifyContent: "flex-end",
              alignItems: "center",
              backgroundColor: "rgba(0, 0, 0, 0.5)", // Полупрозрачный фон
            }}
          >
            <View
              style={{
                width: "100%",
                padding: 16,
                backgroundColor: "white",
                borderTopEndRadius: 10,
                borderTopLeftRadius: 10,
                alignItems: "center",
              }}
            >
              {reviewStep === 1 && order?.address?.name &&
                <Text style={{ fontSize: 20, marginBottom: 16, textAlign: "center" }}>
                  {order?.address?.name && <Text>Пожалуйста, оцените доставку ({order?.address?.name})</Text>}
                </Text>
              }
              {reviewStep === 2 && 
                <Text style={{ fontSize: 25, fontWeight: "medium", marginBottom: 16, textAlign: "center" }}>
                  {rating < 4 ? "Что случилось ?" : "Оцените нашу работу"}
                </Text>
              }
              
              <Rating
                type="star" // Используем звёзды
                ratingCount={5} // Количество звёзд
                imageSize={50} // Размер звёзд
                startingValue={0}
                onFinishRating={(value: SetStateAction<number>) => {setRating(value); setSelectedComments([])}} // Устанавливаем рейтинг
                style={{ marginBottom: 46 }}
              />
              {/* Добавьте компонент для оценки */}
              {reviewStep === 1 &&
                <>
                  <UIButton
                    onPress={() => {
                      if (rating > 0) {
                        setReviewStep(2)
                      }
                    }}
                    isLoading={rating <= 0}
                    type="default"
                    text="Оценить"
                  />
                  <View style={{ height: 20 }} />
                </>
              }

              {reviewStep === 2 && 
                <>
                  <View style={{ height: 1, backgroundColor: "#f7f7f7", width: "100%" }} />
                  <FlatList
                    data={currentComments}
                    keyExtractor={(item) => item}
                    style={{ marginBottom: 26 }}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        onPress={() => toggleCommentSelection(item)}
                        style={{
                          padding: 10,
                          marginVertical: 5,
                          backgroundColor: selectedComments.includes(item)
                            ? "#d1e7dd"
                            : "#f8f9fa",
                          borderRadius: 5,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 16,
                            color: selectedComments.includes(item)
                              ? "#0f5132"
                              : "#212529",
                          }}
                        >
                          {item}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />

                  <UIButton
                    onPress={handleSubmit}
                    type="default"
                    text="Оценить"
                  />
                  <View style={{ height: 20 }} />
                </>
              }
            </View>
          </View>
      </Modal>
    }
    
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
    </>
  );
}
