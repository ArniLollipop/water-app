import UIButton from "@/components/UI/Button";
import UIIcon from "@/components/UI/Icon";
import UIInput from "@/components/UI/Input";
import Colors from "@/constants/Colors";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import styles from "./style";
import useHttp from "@/utils/axios";
import * as SecureStore from "expo-secure-store";
import parseJwt from "@/utils/parseJwt";
import { setUser } from "@/store/slices/userSlice";
import { useDispatch } from "react-redux";
import { setError } from "@/store/slices/errorSlice";
import MaskedUIInput from "@/components/UI/MaskedInput";
import Checkbox from "expo-checkbox";

export default function Login() {
  const { mail, isRecovery } = useLocalSearchParams<{
    mail: string;
    isRecovery: string;
  }>();
  const dispatch = useDispatch();
  const router = useRouter();

  const [isChecked, setChecked] = useState(true);
  const [isLoading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    mail: mail,
    phone: "",
    password: "",
    repeatPassword: "",
    token: "",
  });

  const handleRegister = async () => {
    if (formData.password !== formData.repeatPassword) {
      dispatch(
        setError({
          error: true,
          errorMessage: "Пароли не совпадают",
        })
      );
      return;
    }

    setLoading(true);

    if (isRecovery) {
      await useHttp
        .post<{ accessToken: string; refreshToken: string }>(
          "/updateForgottenPassword",
          {
            ...formData,
            type: isChecked,
          }
        )
        .then(async (res) => {
          await SecureStore.setItemAsync("token", res.data.accessToken);
          await SecureStore.setItemAsync("refreshToken", res.data.refreshToken);
          useHttp.defaults.headers.authorization =
            "Bearer " + res.data.accessToken;
          dispatch(setUser(parseJwt(res.data.accessToken)));
          router.push("/(tabs)");
        })
        .catch((err) => {
          dispatch(
            setError({
              error: true,
              errorMessage: err.response.data,
            })
          );
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      await useHttp
        .post<{ accessToken: string; refreshToken: string }>(
          "/clientRegister",
          {
            ...formData,
            type: isChecked,
          }
        )
        .then(async (res) => {
          if (res.status == 200) {
            await SecureStore.setItemAsync("token", res.data.accessToken);
            await SecureStore.setItemAsync(
              "refreshToken",
              res.data.refreshToken
            );
            useHttp.defaults.headers.authorization =
              "Bearer " + res.data.accessToken;
            dispatch(setUser(parseJwt(res.data.accessToken)));
            router.push("/(tabs)");
          }
        })
        .catch((err) => {
          dispatch(
            setError({
              error: true,
              errorMessage: err.response.data,
            })
          );
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  return (
    <ScrollView
      bounces={false}
      keyboardShouldPersistTaps="never"
      contentContainerStyle={styles.container}>
      <View style={styles.loginTop}>
        <UIIcon name="logo" />
        <Text style={styles.loginText}>
          {isRecovery
            ? "Пожалуйста, введите данные для восстановления"
            : "Пожалуйста, введите данные для регистрации"}
        </Text>
        <View style={{ width: "100%", gap: 15 }}>
          {!isRecovery && (
            <MaskedUIInput
              mask="+7 (999) 999-99-99"
              placeholder="Номер телефона"
              textContentType="telephoneNumber"
              value={formData.phone}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  phone: text,
                })
              }
            />
          )}
          <UIInput
            placeholder="Пароль"
            textContentType="password"
            secureTextEntry
            value={formData.password}
            onChangeText={(text) =>
              setFormData({
                ...formData,
                password: text,
              })
            }
          />
          <UIInput
            placeholder="Повторите пароль"
            textContentType="password"
            secureTextEntry
            value={formData.repeatPassword}
            onChangeText={(text) =>
              setFormData({
                ...formData,
                repeatPassword: text,
              })
            }
          />
        </View>
        {!isRecovery && (
          <View
            style={{
              width: "100%",
              flexDirection: "row",
              justifyContent: "space-between",
            }}>
            <Pressable
              onPress={() => setChecked(!isChecked)}
              style={{ flexDirection: "row", gap: 5, alignItems: "center" }}>
              <Checkbox
                style={styles.checkbox}
                value={isChecked}
                onValueChange={setChecked}
                color={isChecked ? Colors.tint : Colors.border}
              />
              <Text style={styles.buttonText}>Физ Лицо</Text>
            </Pressable>
          </View>
        )}
      </View>
      <View style={{ gap: 15, width: "100%" }}>
        <UIButton
          isLoading={isLoading}
          type="default"
          text={isRecovery ? "Восстановить пароль" : "Создать аккаунт"}
          onPress={handleRegister}
        />
      </View>
    </ScrollView>
  );
}
