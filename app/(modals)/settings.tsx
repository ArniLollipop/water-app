import React, { useEffect, useState } from "react";
import { Switch, Text, View, Alert, ScrollView } from "react-native";
import UIIcon from "@/components/UI/Icon";
import UIInput from "@/components/UI/Input";
import MaskedUIInput from "@/components/UI/MaskedInput";
import UIRadio from "@/components/UI/Radio";
import Colors from "@/constants/Colors";
import { setError } from "@/store/slices/errorSlice";
import { setUser } from "@/store/slices/userSlice";
import { RootState } from "@/store/store";
import sharedStyles from "@/styles/style";
import useHttp from "@/utils/axios";
import { useDispatch, useSelector } from "react-redux";
import * as Notifications from "expo-notifications";
import { usePathname } from "expo-router";

const Settings = () => {
  const pathname = usePathname();
  const dispatch = useDispatch();
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
    // Если включаем уведомления, запросить разрешение
    if (!isNotificationsEnabled) {
      const permissionGranted = await askNotificationPermission();
      if (!permissionGranted) {
        // Если разрешение не дано, вернуть переключатель в исходное положение
        setIsNotificationsEnabled(false);
        return;
      }
    }

    // Меняем состояние уведомлений
    setIsNotificationsEnabled(!isNotificationsEnabled);
  };

  const handleSaveSetting = async () => {
    const numberOfWater = parseFloat(standardWaterCount);

    if (numberOfWater < 1 || numberOfWater > 3) {
      dispatch(
        setError({
          error: true,
          errorMessage: "Норма воды должна быть в пределах от 1 до 3 литров",
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
                width: 30,
              }}
              ios_backgroundColor="#767577"
              value={isNotificationsEnabled}
              onValueChange={handleNotificationToggle}
            />
          }
        />
        <MaskedUIInput
          mask="9.99"
          editable={editable == "waterCount"}
          value={standardWaterCount}
          onChangeText={(count) => setStandardWaterCount(count)}
          type="filled"
          textContentType="telephoneNumber"
          keyboardType="numeric"
          label="Дневная норма воды"
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

        <UIRadio
          title="Способ оплаты"
          items={[
            {
              id: "1",
              text: "Картой",
            },
            {
              id: "2",
              text: "Наличными",
            },
          ]}
          addText="Привязать карту"
        />
      </ScrollView>
    </View>
  );
};

export default Settings;
