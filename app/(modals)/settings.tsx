import React, { useEffect, useState } from "react";
import { Switch, Text, View, Alert, ScrollView, Pressable } from "react-native";
import UIIcon from "@/components/UI/Icon";
import UIInput from "@/components/UI/Input";
import MaskedUIInput from "@/components/UI/MaskedInput";
import Colors from "@/constants/Colors";
import { setError } from "@/store/slices/errorSlice";
import { setUser } from "@/store/slices/userSlice";
import { RootState } from "@/store/store";
import sharedStyles from "@/styles/style";
import useHttp from "@/utils/axios";
import { useDispatch, useSelector } from "react-redux";
import * as Notifications from "expo-notifications";
import { usePathname, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";

const PRESS_COUNT_KEY = "press_count";
const CURRENT_AMOUNT_KEY = "current_amount";
const TIMER_KEY = "timer_key";
const BACKGROUND_TASK_NAME = "BACKGROUND_TASK";
const EXPO_PUSH_TOKEN_KEY = "expoPushToken";

const Settings = () => {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.user);

  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);
  const [standardWaterCount, setStandardWaterCount] = useState("2");
  const [editable, setEditable] = useState("");

  const getUser = async () => {
    await useHttp
      .post<{ clientData: { _doc: IUser }; success: true }>(
        "/getClientDataMobile",
        {
          mail: user?.mail,
        }
      )
      .then((res) => {
        if (res.data.clientData._doc.dailyWater)
          setStandardWaterCount(res.data.clientData._doc.dailyWater.toString());
      });
  };

  // Проверка наличия разрешения на отправку уведомлений при загрузке компонента
  useEffect(() => {
    const checkNotificationPermission = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status === "granted") {
        setIsNotificationsEnabled(true);
      }
    };

    checkNotificationPermission();
    console.log(pathname);
    if (pathname == "/settings") getUser();
  }, [pathname]);

  // Функция запроса разрешения на отправку уведомлений
  const askNotificationPermission = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      const { status: newStatus } =
        await Notifications.requestPermissionsAsync();
      if (newStatus !== "granted") {
        Alert.alert(
          "Разрешение отклонено",
          "Пожалуйста, разрешите отправку уведомлений в настройках."
        );
        return false;
      }
    }
    return true;
  };

  // Обработчик переключения состояния
  const handleNotificationToggle = async () => {
    if (!isNotificationsEnabled) {
      // Запрашиваем разрешение на уведомления
      const permissionGranted = await askNotificationPermission();
      if (!permissionGranted) {
        setIsNotificationsEnabled(false); // Если разрешение не получено, возвращаем переключатель в исходное состояние
        return;
      }
    } else {
      // Если уведомления отключаются
      Alert.alert(
        "Отключение уведомлений",
        "Вы можете полностью отключить уведомления в настройках устройства."
      );
    }
  
    // Изменяем внутреннее состояние
    setIsNotificationsEnabled(!isNotificationsEnabled);
  };

  const handleSaveSetting = async () => {
    const numberOfWater = parseFloat(standardWaterCount);
    console.log(numberOfWater);
    

    if (numberOfWater < 1 || numberOfWater > 4) {
      dispatch(
        setError({
          error: true,
          errorMessage: "Норма воды должна быть в пределах от 1 до 4 литров",
        })
      );
      return;
    } else if (user) {
      await useHttp
        .post("/updateClientDataMobile", {
          mail: user.mail,
          field: "dailyWater",
          value: numberOfWater,
        })
        .then(() => {
          setEditable("");
          dispatch(
            setUser({
              ...user,
              dailyWater: numberOfWater,
            })
          );
        })
        .catch((err) => {
          dispatch(
            setError({
              error: true,
              errorMessage: err?.response?.data?.message,
            })
          );
        });
    }
  };

  const handleDeleteAccount = async () => {
    if (user) {
      await useHttp
        .post("/deleteClient", {
          id: user._id,
        })
        .then(async () => {
          dispatch(
            setUser(null)
          );
          await SecureStore.setItemAsync("token", "");
          await SecureStore.setItemAsync("refreshToken", "");
          await SecureStore.deleteItemAsync(PRESS_COUNT_KEY);
          await SecureStore.deleteItemAsync(CURRENT_AMOUNT_KEY);
          await SecureStore.deleteItemAsync(TIMER_KEY);
          await SecureStore.deleteItemAsync(BACKGROUND_TASK_NAME);
          await SecureStore.deleteItemAsync(EXPO_PUSH_TOKEN_KEY);
          router.push("/(registration)/login");
        })
        .catch((err) => {
          dispatch(
            setError({
              error: true,
              errorMessage: err?.response?.data?.message,
            })
          );
        });
    }
    console.log("Аккаунт удалён");
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      "Удаление аккаунта",
      "Вы уверены, что хотите удалить ваш аккаунт? Это действие необратимо.",
      [
        {
          text: "Отмена",
          style: "cancel", // Закрывает окно
        },
        {
          text: "Удалить",
          style: "destructive", // Красный цвет текста на iOS
          onPress: () => handleDeleteAccount(),
        },
      ]
    );
  };

  return (
    <View style={sharedStyles.container}>
      <ScrollView
        bounces={false}
        keyboardShouldPersistTaps="never"
        style={{
          gap: 15,
          width: "100%",
        }}>
        <UIInput
          editable={false}
          value="Уведомления"
          type="filled"
          placeholder="Уведомления"
          rightElement={
            <Switch
              trackColor={{ false: "#767577", true: Colors.green }}
              thumbColor={isNotificationsEnabled ? "#fff" : "#f4f3f4"}
              style={{
                height: 30,
                backgroundColor: "transparent",
                paddingVertical: 0,
                paddingHorizontal: 0,
                maxWidth: 50,
                width: 50,
                marginTop: -6,
              }}
              ios_backgroundColor="#767577"
              value={isNotificationsEnabled}
              onValueChange={handleNotificationToggle}
            />
          }
        />
        <View style={{height: 30}}></View>
        <MaskedUIInput
          mask="9.99"
          editable={editable == "waterCount"}
          value={standardWaterCount}
          onChangeText={(count) => {
            setStandardWaterCount(count); 
          }}
          type="filled"
          textContentType="telephoneNumber"
          keyboardType="numeric"
          label="Дневная норма воды: от 1л. - до 4л."
          placeholder="2"
          rightElementClick={() =>
            editable == "waterCount"
              ? handleSaveSetting()
              : setEditable("waterCount")
          }
          rightElement={
            editable == "waterCount" ? (
              <UIIcon name="check" />
            ) : (
              <UIIcon name="edit" />
            )
          }
        />

        <View style={{height: 20}}></View>

        <Pressable
          disabled={false}
          onPress={confirmDeleteAccount}
          style={{
            padding: 10,
            marginLeft: "auto",
            alignSelf: 'center',
            borderRadius: 8,
            shadowColor: "#4C4E64",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.42,
            shadowRadius: 4,
            elevation: 4,
            alignItems: "center",
            justifyContent: "center",
            opacity: false ? 0.5 : 1,
            backgroundColor: Colors.tint
          }}>
            <Text
              style={{
                fontSize: 15,
                fontWeight: "500",
                fontFamily: "Roboto",
                textAlign: "center",
                color: Colors.textSecondary,
              }}>
              Удалить аккаунт
            </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
};

export default Settings;
