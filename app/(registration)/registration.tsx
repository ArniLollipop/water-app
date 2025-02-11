import UIButton from "@/components/UI/Button";
import UIIcon from "@/components/UI/Icon";
import UIInput from "@/components/UI/Input";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Linking, ScrollView, Text, View } from "react-native";
import styles from "./style";
import useHttp from "@/utils/axios";
import { useDispatch } from "react-redux";
import { setError } from "@/store/slices/errorSlice";
import Colors from "@/constants/Colors";

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
      console.log("sendMailRecovery");
      
      await useHttp
        .post("/sendMailRecovery", { mail: formData.mail })
        .then((res) => {
          router.push({
            pathname: "/(registration)/confirmSms",
            params: { mail: formData.mail, isRecovery: "true" },
          });
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
      console.log("sendMail");
      await useHttp
        .post("/sendMail", { mail: formData.mail })
        .then((res) => {
          console.log(res);
          router.push({
            pathname: "/(registration)/confirmSms",
            params: { mail: formData.mail },
          });
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

  const routeByLinkToAgreement = () => {
    Linking.openURL("https://tibetskaya.kz/agreement");
  };
  const routeByLinkToPolicy = () => {
    Linking.openURL("https://tibetskaya.kz/privacyPolicy");
  };
  const routeByLinkToPublicOffer = () => {
    Linking.openURL("https://tibetskaya.kz/publicOffer");
  };
  const routeByLinkToPaymentTerms = () => {
    Linking.openURL("https://tibetskaya.kz/paymentTerms");
  };

  return (
    <ScrollView
      bounces={false}
      keyboardShouldPersistTaps="never"
      contentContainerStyle={styles.container}>
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
          <Text
            style={{
              color: Colors.text,
              fontSize: 12,
              fontWeight: "500",
              textAlign: "center",
            }}>
            Нажимая кнопку "Отправить Код", вы подтверждаете, что ознакомились и принимаете условия{" "}
            <Text
              style={{ color: Colors.blue, textDecorationLine: "underline" }}
              onPress={routeByLinkToAgreement}>
              Пользовательского соглашения
            </Text>{" "}
            ,{" "}
            <Text
              style={{ color: Colors.blue, textDecorationLine: "underline" }}
              onPress={routeByLinkToPublicOffer}>
              Публичной оферты
            </Text>
            ,{" "}
            <Text
              style={{ color: Colors.blue, textDecorationLine: "underline" }}
              onPress={routeByLinkToPaymentTerms}>
              Условий оплаты
            </Text>
            и{" "}
            <Text
              style={{ color: Colors.blue, textDecorationLine: "underline" }}
              onPress={routeByLinkToPolicy}>
              Политики конфиденциальности
            </Text>
          </Text>
        </View>
      </View>
      <View style={{ gap: 15, width: "100%" }}>
        <UIButton
          isLoading={isLoading}
          type="default"
          text="Отправить Код"
          onPress={handleSendMail}
        />
      </View>
    </ScrollView>
  );
}
