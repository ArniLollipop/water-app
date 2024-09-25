import UIButton from "@/components/UI/Button";
import UIIcon from "@/components/UI/Icon";
import UIInput from "@/components/UI/Input";
import Colors from "@/constants/Colors";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import styles from "./style";
import useHttp from "@/utils/axios";
import * as SecureStore from "expo-secure-store";
import parseJwt from "@/utils/parseJwt";
import { setUser } from "@/store/slices/userSlice";
import { useDispatch } from "react-redux";
import { setError } from "@/store/slices/errorSlice";

export default function Login() {
  const { mail } = useLocalSearchParams<{ mail: string }>();
  const dispatch = useDispatch();
  const router = useRouter();

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
    await useHttp
      .post<{ accessToken: string; refreshToken: string }>(
        "/clientRegister",
        formData
      )
      .then(async (res) => {
        if (res.status == 200) {
          await SecureStore.setItemAsync("token", res.data.accessToken);
          await SecureStore.setItemAsync("refreshToken", res.data.refreshToken);
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
            errorMessage: err.response.data.message,
          })
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <View style={styles.container}>
      <View style={styles.loginTop}>
        <UIIcon name="logo" />
        <Text style={styles.loginText}>
          Пожалуйста, введите код из смс для подтверждения
        </Text>
        <View style={{ width: "100%", gap: 15 }}>
          <UIInput
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
      </View>
      <View style={{ gap: 15, width: "100%" }}>
        <UIButton
          isLoading={isLoading}
          type="default"
          text="Создать аккаунт"
          onPress={handleRegister}
        />
      </View>
    </View>
  );
}
