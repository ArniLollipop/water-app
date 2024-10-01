import UIButton from "@/components/UI/Button";
import UIIcon from "@/components/UI/Icon";
import UIInput from "@/components/UI/Input";
import Colors from "@/constants/Colors";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";
import styles from "./style";
import useHttp from "@/utils/axios";
import { useDispatch } from "react-redux";
import { setError } from "@/store/slices/errorSlice";

export default function Login() {
  const dispatch = useDispatch();
  const { mail, isRecovery } = useLocalSearchParams<{
    mail: string;
    isRecovery: string;
  }>();
  const router = useRouter();

  const [isLoading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    mail: mail,
    code: "",
  });

  const handleConfirmSms = async () => {
    setLoading(true);
    await useHttp
      .post("/codeConfirm", formData)
      .then((res) => {
        if (isRecovery) {
          router.push({
            pathname: "(registration)/create?isRecovery=true",
            params: { mail: formData.mail },
          });
        } else {
          router.push({
            pathname: "(registration)/create",
            params: { mail: formData.mail },
          });
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
            value={formData.code}
            onChangeText={(text) =>
              setFormData({
                ...formData,
                code: text,
              })
            }
            placeholder="Код из смс"
            textContentType="oneTimeCode"
          />

          {/* <UIInput placeholder="Логин" textContentType="username" />
          <UIInput
            placeholder="Пароль"
            textContentType="password"
            secureTextEntry
          />
          <UIInput
            placeholder="Повторите пароль"
            textContentType="password"
            secureTextEntry
          /> */}
        </View>
      </View>
      <View style={{ gap: 15, width: "100%" }}>
        <UIButton
          isLoading={isLoading}
          type="default"
          text="Подтвердить"
          onPress={handleConfirmSms}
        />
      </View>
    </View>
  );
}
