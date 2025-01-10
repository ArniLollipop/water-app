import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Animated,
  StyleSheet,
  Text,
  Pressable,
  Image,
} from "react-native";
import UIIcon from "@/components/UI/Icon";
import Colors from "@/constants/Colors";
import sharedStyles from "@/styles/style";
import { RootState } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import { setError } from "@/store/slices/errorSlice";
import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from "expo-background-fetch";
import useHttp from "@/utils/axios";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, // Показывать уведомление в foreground
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Константы
const ML_PER_PRESS = 250; // Объем за одно нажатие
const NOTIFICATION_INTERVAL_MS = 3600000; // 1 час
const NOTIFICATION_START_HOUR = 9; // 9:00
const NOTIFICATION_END_HOUR = 22; // 22:00
const START_TIME_KEY = "start_time_key";

// Ключи для SecureStore
const BACKGROUND_TASK_NAME = "BACKGROUND_TASK";
const EXPO_PUSH_TOKEN_KEY = "expoPushToken";

// Определяем фоновую задачу
TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
  console.log("Фоновая задача выполнена");
  const startTime = await SecureStore.getItemAsync(START_TIME_KEY);

  if (startTime) {
    const currentTime = Date.now();
    const elapsed = currentTime - parseInt(startTime, 10);

    if (elapsed >= NOTIFICATION_INTERVAL_MS) {
      const now = new Date();
      const currentHour = now.getHours();
      if (
        currentHour >= NOTIFICATION_START_HOUR &&
        currentHour < NOTIFICATION_END_HOUR
      ) {
        // Очистим таймер после отправки уведомления
        await SecureStore.deleteItemAsync(START_TIME_KEY);
      }

      return "new_data";
    }
  }

  return "no_data";
});

// Регистрация фоновой задачи
BackgroundFetch.registerTaskAsync(BACKGROUND_TASK_NAME, {
  minimumInterval: 3600, // Интервал 1 час
  stopOnTerminate: false, // Приложение будет работать после закрытия
  startOnBoot: true, // Приложение будет работать после перезагрузки устройства
});

const Bonus = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.user);
  const userDailyWaterInMl =
    (user?.dailyWater && user.dailyWater * 1000) || 2000;
  const totalPresses = Math.floor(userDailyWaterInMl / ML_PER_PRESS);
  if (!user?.mail) {
    console.error("User mail is not defined.");
    return null; // или показать ошибку, если почта пользователя не определена
  }

  const bonusKey = `${user.mail.replace(/[^a-zA-Z0-9_.-]/g, "")}Bonus`;

  const resetData = () => {
    setPressCount(0);
    setCurrentAmount(0);
    setTimer(null);
    setIsTimerRunning(false);
  };

  const waterLevels = Array.from(
    { length: totalPresses },
    () => useRef(new Animated.Value(0)).current
  );

  const [pressCount, setPressCount] = useState(0);
  const [currentAmount, setCurrentAmount] = useState(0);
  const [timer, setTimer] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false); // добавлено состояние загрузки данных

  // Запрос разрешений на уведомления
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission for notifications not granted.");
        return;
      }
      const { data: devicePushToken } = await Notifications.getDevicePushTokenAsync();
      console.log("Expo Push Token:", devicePushToken);
      await SecureStore.setItemAsync(EXPO_PUSH_TOKEN_KEY, devicePushToken); // сохраняем токен в состоянии
    })();
  }, []);

  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const storedData = await SecureStore.getItemAsync(bonusKey);

        // Проверка на начало нового дня
        const today = new Date().toISOString().split("T")[0];

        if (storedData) {
          const data = JSON.parse(storedData);

          if (data.lastAccessed !== today) {
            resetData(); // Обнуляем данные, если день новый
            await SecureStore.setItemAsync(
              bonusKey,
              JSON.stringify({ lastAccessed: today, pressCount: 0, currentAmount: 0, startTime: null })
            );
          } else {
            // Устанавливаем данные из SecureStore
            setPressCount(data.pressCount || 0);
            setCurrentAmount(data.currentAmount || 0);

            if (data.startTime) {
              const currentTime = Date.now();
              const elapsed = currentTime - parseInt(data.startTime, 10);

              if (elapsed < NOTIFICATION_INTERVAL_MS) {
                setTimer(NOTIFICATION_INTERVAL_MS - elapsed);
                setIsTimerRunning(true);
              }
            }
            for (let i = 0; i < data.pressCount; i++) {
              Animated.timing(waterLevels[i], {
                toValue: 100,
                duration: 500,
                useNativeDriver: false,
              }).start();
            }
          }
        } else {
          // Если данных нет, создаем новую запись с сегодняшним днем
          await SecureStore.setItemAsync(
            bonusKey,
            JSON.stringify({ lastAccessed: today, pressCount: 0, currentAmount: 0, startTime: null })
          );
        }

        setIsDataLoaded(true); // Данные загружены
      } catch (error) {
        console.error("Ошибка при загрузке данных из SecureStore:", error);
      }
    };
    loadStoredData();
  }, []);

  // Таймер обратного отсчета
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (isTimerRunning && timer && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (!prevTimer) return null;
          const newTimer = prevTimer - 1000;
          if (newTimer <= 0) {
            clearInterval(interval);
            handleTimerEnd();
          }
          return newTimer;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timer]);

  // Сохранение данных в SecureStore
  const saveData = async (updatedData: any) => {
    const today = new Date().toISOString().split("T")[0];
    const data = {
      lastAccessed: today,
      pressCount,
      currentAmount,
      startTime: timer ? Date.now().toString() : null,
      ...updatedData
    };
    await SecureStore.setItemAsync(bonusKey, JSON.stringify(data));
  };

  // Обработка завершения таймера
  const handleTimerEnd = async () => {
    setTimer(null);
    setIsTimerRunning(false);

    await saveData({ startTime: null });
  };

  const handleAddBonus = async (count: number): Promise<boolean> => {
    let res = false;
    let expoPushToken = await SecureStore.getItemAsync(EXPO_PUSH_TOKEN_KEY);

    if (!expoPushToken) {
      const { data: devicePushToken } = await Notifications.getDevicePushTokenAsync();
      expoPushToken = devicePushToken;

      // Сохраните токен в SecureStore, если он новый
      await SecureStore.setItemAsync(EXPO_PUSH_TOKEN_KEY, devicePushToken);
    }
    await useHttp
      .post("/addBonus", { mail: user?.mail, count: count, expoPushToken })
      .then(() => {
        dispatch(
          setError({
            error: true,
            errorMessage: "Бонусы успешно начислены.",
          })
        );
        res = true;
      })
      .catch(() => {
        dispatch(
          setError({
            error: true,
            errorMessage: "Ошибка начисления бонусов.",
          })
        );
        res = false;
      });

    return res;
  };

  const handlePress = async () => {
    if (isTimerRunning) {
      dispatch(
        setError({
          error: true,
          errorMessage: "Вы можете пить воду только раз в час.",
        })
      );
      return;
    } else if (currentAmount >= userDailyWaterInMl) {
      dispatch(
        setError({
          error: true,
          errorMessage: "Вы уже выпили достаточно воды на сегодня.",
        })
      );
      return;
    }

    if (pressCount < totalPresses && currentAmount < userDailyWaterInMl) {
      const res = await handleAddBonus(5);
      if (!res) return;
    }

    const newPressCount = pressCount + 1;
    const newAmount = Math.min(currentAmount + ML_PER_PRESS, userDailyWaterInMl || 2000);

    setPressCount(newPressCount);
    setCurrentAmount(newAmount);
    setTimer(NOTIFICATION_INTERVAL_MS);
    await saveData({ pressCount: newPressCount, currentAmount: newAmount, startTime: Date.now().toString() });
    const levelIndex = newPressCount - 1;

    Animated.timing(waterLevels[levelIndex], {
      toValue: 100,
      duration: 500,
      useNativeDriver: false,
    }).start();

    if (newPressCount === totalPresses) {
      await handleAddBonus(20);
    }

    setIsTimerRunning(true);
  };

  const formatTime = (timer: number) => {
    const hours = Math.floor(timer / 3600000);
    const minutes = Math.floor((timer % 3600000) / 60000);
    const seconds = Math.floor((timer % 60000) / 1000);

    return `${hours}:${minutes}:${seconds}`;
  };

  return !isDataLoaded ? (
    <View style={styles.container}>
      <UIIcon name="loading" />
    </View>
  ) : (
    <View style={sharedStyles.container}>
      {/* Display water levels */}
      <View style={styles.waterContainer}>
        <View style={styles.leftItems}>
          {waterLevels.map((waterLevel, index) => (
            <View
              key={index}
              style={[
                styles.leftItem,
                index === 0 && styles.firstItem,
                index === waterLevels.length - 1 && styles.lastItem,
                { height: 220 / totalPresses },
              ]}>
              <Animated.View
                style={[
                  styles.waterFill,
                  {
                    height: waterLevel.interpolate({
                      inputRange: [0, 100],
                      outputRange: ["0%", "100%"],
                    }),
                  },
                ]}
              />
            </View>
          ))}
        </View>
        <Pressable onPress={handlePress} style={styles.imageContainer}>
          <Image
            source={require("../../assets/images/bonusImg.png")}
            style={{
              height: 200,
              width: 200,
              objectFit: "contain",
            }}
          />
        </Pressable>
      </View>

      <View style={styles.infoBlocksContainer}>
        <View style={styles.infoBlock}>
          <UIIcon name="waterButton" />
          <Text style={styles.infoBlockText}>{pressCount * 5}</Text>
        </View>
        <View style={styles.infoBlock}>
          <UIIcon name="alarmClock" />
          <Text style={styles.infoBlockText}>
            {isTimerRunning ? formatTime(timer!) : "1:00:00"}
          </Text>
        </View>
        <View style={styles.infoBlock}>
          <UIIcon name="water" />
          <Text style={styles.infoBlockText}>{currentAmount / 1000} л</Text>
        </View>
      </View>

      <View style={styles.rules}>
        <View>
          <Text style={styles.rulesText}>
            1. За каждый выпитый стакан воды — 5 бонусов.
          </Text>
          <Text style={styles.rulesText}>
            2. За выполнение ежедневной цели — +20 бонусов.
          </Text>
          <Text style={styles.rulesText}>
            3. За каждые 500 бонусов — скидка 10% на аксессуары (до 50%).
          </Text>
          <Text style={styles.rulesText}>
            4. За каждый заказ воды — +50 бонусов.
          </Text>
        </View>
      </View>
    </View>
  );
};

export default Bonus;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  waterContainer: {
    height: "50%",
    width: "100%",
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    position: "relative",
  },
  imageContainer: {
    width: 200,
    height: 200,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
    zIndex: 1000,
    overflow: "hidden",
  },
  infoBlocksContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  infoBlock: {
    backgroundColor: Colors.darkWhite,
    padding: 10,
    borderRadius: 16,
    overflow: "hidden",
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  infoBlockText: {
    color: Colors.text,
    fontSize: 20,
  },
  rules: {
    backgroundColor: Colors.darkWhite,
    padding: 10,
    borderRadius: 16,
    width: "100%",
    marginVertical: 20,
  },
  rulesHead: {
    color: Colors.disabled,
    fontSize: 20,
  },
  rulesText: {
    marginVertical: 5,
    color: Colors.text,
    fontSize: 16,
  },
  leftItems: {
    flexDirection: "column-reverse",
    justifyContent: "space-between",
    padding: 10,
    position: "absolute",
    left: 0,
    top: "50%",
    gap: 2,
    transform: [{ translateY: -120 }],
  },
  leftItem: {
    width: 15,
    borderWidth: 1,
    borderColor: Colors.tint,
    borderStyle: "solid",
    position: "relative",
    overflow: "hidden",
  },
  lastItem: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  firstItem: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  waterFill: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 123, 255, 0.3)",
  },
});
