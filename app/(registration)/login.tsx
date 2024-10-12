import UIButton from "@/components/UI/Button";
import UIIcon from "@/components/UI/Icon";
import UIInput from "@/components/UI/Input";
import Colors from "@/constants/Colors";
import Checkbox from "expo-checkbox";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import styles from "./style";
import useHttp from "@/utils/axios";
import * as SecureStore from "expo-secure-store";
import { useDispatch, useSelector } from "react-redux";
import parseJwt from "@/utils/parseJwt";
import { setError } from "@/store/slices/errorSlice";
import { setUser } from "@/store/slices/userSlice";

export default function Login() {
  const router = useRouter();

  const dispatch = useDispatch();

  const [isChecked, setChecked] = useState(true);
  const [formData, setFormData] = useState({
    mail: "",
    password: "",
  });

  const handleLogin = async () => {
    console.log("login");
    await useHttp
      .post<{ accessToken: string; refreshToken: string }>(
        "/clientLogin",
        formData
      )
      .then(async (res) => {
        await SecureStore.setItemAsync("token", res.data.accessToken);
        if (isChecked)
          await SecureStore.setItemAsync("refreshToken", res.data.refreshToken);
        useHttp.defaults.headers.authorization =
          "Bearer " + res.data.accessToken;
        const user = parseJwt(res.data.accessToken);
        dispatch(setUser(user));
        router.push("/");
      })
      .catch((err) => {
        dispatch(
          setError({
            error: true,
            errorMessage: err?.response?.data?.message,
          })
        );
      });
  };

  return (
    <View style={styles.container}>
      <View style={styles.loginTop}>
        <UIIcon name="logo" />
        <Text style={styles.loginText}>
          Пожалуйста, войдите в свой аккаунт и начните работу
        </Text>
        <View style={{ width: "100%", gap: 15 }}>
          <UIInput
            value={formData.mail}
            placeholder="Почта"
            textContentType="emailAddress"
            onChangeText={(text) => setFormData({ ...formData, mail: text })}
          />
          <UIInput
            value={formData.password}
            placeholder="Пароль"
            textContentType="password"
            secureTextEntry
            onChangeText={(text) =>
              setFormData({ ...formData, password: text })
            }
          />
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
              <Text style={styles.buttonText}>Запомнить меня</Text>
            </Pressable>
            <Pressable
              onPress={() =>
                router.push("/(registration)/registration?isRecovery=true")
              }>
              <Text
                style={{
                  ...styles.buttonText,
                  color: Colors.blue,
                  textDecorationColor: Colors.blue,
                  textDecorationLine: "underline",
                }}>
                Забыли пароль?
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
      <View style={{ gap: 15, width: "100%" }}>
        <UIButton onPress={handleLogin} type="default" text="Войти" />
        <UIButton
          type="outlined"
          text="СОздать аккаунт"
          onPress={() => router.push("/(registration)/registration")}
        />
      </View>
    </View>
  );
}
