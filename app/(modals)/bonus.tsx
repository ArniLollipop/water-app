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
const START_TIME_KEY = "start_time_key";

// Ключи для SecureStore
const PRESS_COUNT_KEY = "press_count";
const CURRENT_AMOUNT_KEY = "current_amount";
const TIMER_KEY = "timer_key";
const BACKGROUND_TASK_NAME = "BACKGROUND_TASK";

// Определяем фоновую задачу
TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
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
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Время пить воду!",
            body: "Не забудьте выпить свой стакан воды.",
          },
          trigger: { seconds: 1 },
        });

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
  minimumInterval: 60 * 60, // Интервал 1 час
  stopOnTerminate: false, // Приложение будет работать после закрытия
  startOnBoot: true, // Приложение будет работать после перезагрузки устройства
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

  const [pressCount, setPressCount] = useState(0);
  const [currentAmount, setCurrentAmount] = useState(0);
  const [timer, setTimer] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false); // добавлено состояние загрузки данных

  // Запрос разрешений на уведомления
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

  // Загрузка данных из SecureStore при монтировании компонента
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const storedPressCount = await SecureStore.getItemAsync(
          PRESS_COUNT_KEY
        );
        const storedCurrentAmount = await SecureStore.getItemAsync(
          CURRENT_AMOUNT_KEY
        );
        const storedStartTime = await SecureStore.getItemAsync(START_TIME_KEY);

        const pressCountValue = storedPressCount
          ? parseInt(storedPressCount, 10)
          : 0;
        const currentAmountValue = storedCurrentAmount
          ? parseInt(storedCurrentAmount, 10)
          : 0;

        setPressCount(pressCountValue);
        setCurrentAmount(currentAmountValue);

        if (storedStartTime) {
          const currentTime = Date.now();
          const elapsed = currentTime - parseInt(storedStartTime, 10);

          if (elapsed < NOTIFICATION_INTERVAL_MS) {
            setTimer(NOTIFICATION_INTERVAL_MS - elapsed);
            setIsTimerRunning(true);
          } else {
            setTimer(null);
            setIsTimerRunning(false);
          }
        }

        // Анимация уже заполненных уровней воды
        for (let i = 0; i < pressCountValue; i++) {
          Animated.timing(waterLevels[i], {
            toValue: 100,
            duration: 500,
            useNativeDriver: false,
          }).start();
        }

        setIsDataLoaded(true); // помечаем данные как загруженные
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

  // Обработка завершения таймера
  const handleTimerEnd = async () => {
    setTimer(null);
    setIsTimerRunning(false);

    // Отправляем уведомление
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

    await SecureStore.deleteItemAsync(START_TIME_KEY);
  };

  // Функция для сохранения данных о начале таймера
  const saveTimerStart = async () => {
    const startTime = Date.now().toString();
    await SecureStore.setItemAsync(START_TIME_KEY, startTime);
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
      const newPressCount = pressCount + 1;
      const newAmount = Math.min(
        currentAmount + ML_PER_PRESS,
        userDailyWaterInMl || 2000
      );

      await SecureStore.setItemAsync(PRESS_COUNT_KEY, newPressCount.toString());
      await SecureStore.setItemAsync(CURRENT_AMOUNT_KEY, newAmount.toString());

      setPressCount(newPressCount);
      setCurrentAmount(newAmount);
      setTimer(NOTIFICATION_INTERVAL_MS);
      await saveTimerStart();

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
