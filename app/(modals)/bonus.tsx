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

// Константы
const ML_PER_PRESS = 250; // Объем за одно нажатие
const NOTIFICATION_INTERVAL_MS = 3600000; // 1 час
const NOTIFICATION_START_HOUR = 9; // 9:00
const NOTIFICATION_END_HOUR = 22; // 22:00

// Ключи для SecureStore
const PRESS_COUNT_KEY = "press_count";
const CURRENT_AMOUNT_KEY = "current_amount";
const TIMER_KEY = "timer_key";
const BACKGROUND_TASK_NAME = "BACKGROUND_TASK";

// Регистрация задачи для работы в фоне
TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
  const storedPressCount = await SecureStore.getItemAsync(PRESS_COUNT_KEY);
  const storedCurrentAmount = await SecureStore.getItemAsync(
    CURRENT_AMOUNT_KEY
  );
  const storedTimer = await SecureStore.getItemAsync(TIMER_KEY);

  const pressCountValue = storedPressCount ? parseInt(storedPressCount, 10) : 0;
  const currentAmountValue = storedCurrentAmount
    ? parseInt(storedCurrentAmount, 10)
    : 0;
  const timerValue = storedTimer ? parseInt(storedTimer, 10) : null;

  if (timerValue !== null && timerValue <= 0) {
    const now = new Date();
    const currentHour = now.getHours();
    if (
      currentHour >= NOTIFICATION_START_HOUR &&
      currentHour < NOTIFICATION_END_HOUR
    ) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Время пить воду!",
          body: "Не забудьте выпить свой стакан воды.",
        },
        trigger: { seconds: 1 },
      });
      return BackgroundFetch.Result.NewData;
    }
  }
  return BackgroundFetch.Result.NoData;
});

BackgroundFetch.registerTaskAsync(BACKGROUND_TASK_NAME, {
  minimumInterval: NOTIFICATION_INTERVAL_MS, // 1 час
  stopOnTerminate: false, // Приложение будет работать после закрытия
  startOnBoot: true, // Приложение будет работать после перезапуска устройства
});

const Bonus = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.user);
  const userDailyWaterInMl =
    (user?.dailyWater && user.dailyWater * 1000) || 2000;
  const totalPresses = Math.floor(userDailyWaterInMl / ML_PER_PRESS);

  const waterLevels = Array.from(
    { length: totalPresses },
    () => useRef(new Animated.Value(0)).current
  );

  const rotationX = useRef(new Animated.Value(0)).current;
  const rotationY = useRef(new Animated.Value(0)).current;

  const [pressCount, setPressCount] = useState(0);
  const [currentAmount, setCurrentAmount] = useState(0);
  const [timer, setTimer] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Request permissions on component mount
  useEffect(() => {
    const requestPermissions = async () => {
      try {
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== "granted") {
          const { granted } = await Notifications.requestPermissionsAsync();
          if (!granted) return;
        }
      } catch (error) {
        console.error("Error requesting notification permissions:", error);
      }
    };
    requestPermissions();
  }, []);

  // Load data from SecureStore on component mount
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const storedPressCount = await SecureStore.getItemAsync(
          PRESS_COUNT_KEY
        );
        const storedCurrentAmount = await SecureStore.getItemAsync(
          CURRENT_AMOUNT_KEY
        );
        const storedTimer = await SecureStore.getItemAsync(TIMER_KEY);

        const pressCountValue = storedPressCount
          ? parseInt(storedPressCount, 10)
          : 0;
        const currentAmountValue = storedCurrentAmount
          ? parseInt(storedCurrentAmount, 10)
          : 0;
        const timerValue = storedTimer ? parseInt(storedTimer, 10) : null;

        setPressCount(pressCountValue);
        setCurrentAmount(currentAmountValue);
        setTimer(timerValue ?? NOTIFICATION_INTERVAL_MS);
        setIsTimerRunning(!!timerValue);

        // Анимация уже заполненных уровней воды
        for (let i = 0; i < pressCountValue; i++) {
          Animated.timing(waterLevels[i], {
            toValue: 100,
            duration: 500,
            useNativeDriver: false,
          }).start();
        }
      } catch (error) {
        console.error("Ошибка при загрузке данных из SecureStore:", error);
      }
    };
    loadStoredData();
  }, []);

  // Timer countdown
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

  // Function to handle end of timer
  const handleTimerEnd = async () => {
    const now = new Date();
    const currentHour = now.getHours();

    // Notification restrictions between 22:00 and 9:00
    if (
      currentHour >= NOTIFICATION_END_HOUR ||
      currentHour < NOTIFICATION_START_HOUR
    ) {
      return;
    }

    const newAmount = Math.max(currentAmount - ML_PER_PRESS, 0);
    setCurrentAmount(newAmount);
    setTimer(NOTIFICATION_INTERVAL_MS);
    setIsTimerRunning(false);
    await saveDataToStore(pressCount, newAmount, NOTIFICATION_INTERVAL_MS);

    // Send notification
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Время пить воду!",
          body: "Не забудьте выпить свой стакан воды.",
        },
        trigger: { seconds: 1 },
      });
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  // Function to save data to SecureStore
  const saveDataToStore = async (
    pressCount: number,
    amount: number,
    timerValue: number
  ) => {
    try {
      await SecureStore.setItemAsync(PRESS_COUNT_KEY, pressCount.toString());
      await SecureStore.setItemAsync(CURRENT_AMOUNT_KEY, amount.toString());
      await SecureStore.setItemAsync(TIMER_KEY, timerValue.toString());
    } catch (error) {
      console.error("Error saving data to SecureStore:", error);
    }
  };

  const handlePress = async () => {
    if (timer !== null && timer > 0 && timer !== NOTIFICATION_INTERVAL_MS) {
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
      const newPressCount = pressCount + 1;
      const newAmount = Math.min(
        currentAmount + ML_PER_PRESS,
        userDailyWaterInMl || 2000
      );

      setPressCount(newPressCount);
      setCurrentAmount(newAmount);
      setTimer(NOTIFICATION_INTERVAL_MS);
      await saveDataToStore(newPressCount, newAmount, NOTIFICATION_INTERVAL_MS);

      const levelIndex = newPressCount - 1;

      Animated.timing(waterLevels[levelIndex], {
        toValue: 100,
        duration: 500,
        useNativeDriver: false,
      }).start();

      setIsTimerRunning(true);
    }
  };

  const formatTime = (timer: number) => {
    const hours = Math.floor(timer / 3600000);
    const minutes = Math.floor((timer % 3600000) / 60000);
    const seconds = Math.floor((timer % 60000) / 1000);

    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <View style={sharedStyles.container}>
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
            <Text style={styles.infoBlockText}>{pressCount}</Text>
          </View>
          <View style={styles.infoBlock}>
            <UIIcon name="alarmClock" />
            <Text style={styles.infoBlockText}>
              {isTimerRunning ? formatTime(timer!) : "1:00:00"}
            </Text>
          </View>
          <View style={styles.infoBlock}>
            <UIIcon name="water" />
            <Text style={styles.infoBlockText}>
              {(currentAmount + 250) / 1000} л
            </Text>
          </View>
        </View>

        <View style={styles.rules}>
          <View>
            <Text style={styles.rulesHead}>Правила начисления</Text>
            <Text style={styles.rulesText}>
              1. За каждый 1 выпитый стакан начисляется 2 бонуса
            </Text>
            <Text style={styles.rulesText}>
              2. За 1000 бонусов можно купить 1 л воды
            </Text>
            <Text style={styles.rulesText}>
              3. Каждые 40 минут можно выпить 1 стакан
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

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
    fontSize: 20,
  },
  leftItems: {
    flexDirection: "column",
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
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  firstItem: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  waterFill: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 123, 255, 0.3)",
  },
});

export default Bonus;
