import UIButton from "@/components/UI/Button";
import UIIcon from "@/components/UI/Icon";
import UIInput from "@/components/UI/Input";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";
import styles from "./style";
import useHttp from "@/utils/axios";
import { useDispatch } from "react-redux";
import { setError } from "@/store/slices/errorSlice";

export default function Login() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { isRecovery } = useLocalSearchParams<{ isRecovery: string }>();

  const [isLoading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    mail: "",
  });

  const handleSendMail = async () => {
    setLoading(true);
    console.log(formData.mail, "mail");
    if (isRecovery) {
      await useHttp
        .post("/sendMailRecovery", { mail: formData.mail })
        .then((res) => {
          router.push({
            pathname: "/(registration)/confirmSms",
            params: { mail: formData.mail, isRecovery: "true" },
          });
        })
        .catch((err) => {
          console.log(err);
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
    } else {
      await useHttp
        .post("/sendMail", { mail: formData.mail })
        .then((res) => {
          router.push({
            pathname: "/(registration)/confirmSms",
            params: { mail: formData.mail },
          });
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
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.loginTop}>
        <UIIcon name="logo" />
        <Text style={styles.loginText}>
          Пожалуйста, введите вашу почту и мы отправим вам код подтверждения
        </Text>
        <View style={{ width: "100%", gap: 15 }}>
          <UIInput
            value={formData.mail}
            onChangeText={(text) =>
              setFormData({
                ...formData,
                mail: text,
              })
            }
            placeholder="Почта"
            textContentType="emailAddress"
          />
        </View>
      </View>
      <View style={{ gap: 15, width: "100%" }}>
        <UIButton
          isLoading={isLoading}
          type="default"
          text="Отправить Смс"
          onPress={handleSendMail}
        />
      </View>
    </View>
  );
}
