import UIIcon from "@/components/UI/Icon";
import UIInput from "@/components/UI/Input";
import Colors from "@/constants/Colors";
import sharedStyles from "@/styles/style";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import useHttp from "@/utils/axios";
import { RootState } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "@/store/slices/userSlice";
import { setError } from "@/store/slices/errorSlice";

export default function Profile() {
  const router = useRouter();

  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.user);

  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState(user?.fullName || "User");
  const [subscription, setSubscription] = useState("");
  const [editable, setEditable] = useState(
    "" as "fullName" | "phone" | "subscription" | ""
  );
  const [firstAddress, setFirstAddress] = useState({} as IAddress);

  const handleLogOut = async () => {
    await SecureStore.setItemAsync("token", "");
    await SecureStore.setItemAsync("refreshToken", "");
    router.push("(registration)/login");
  };

  const getUser = async () => {
    await useHttp
      .post<{ clientData: { _doc: IUser }; success: true }>(
        "/getClientDataMobile",
        {
          mail: user?.mail,
        }
      )
      .then((res) => {
        setPhone(res.data.clientData._doc.phone || "");
        setFullName(res.data.clientData._doc.fullName || "");
        setSubscription(res.data.clientData._doc.subscription || "");
        setFirstAddress(
          res.data.clientData._doc?.addresses
            ? res.data.clientData._doc.addresses[0]
            : ({
                street: "",
                house: "",
              } as IAddress)
        );
      });
  };

  const handleSave = async (data: {
    field: "fullName" | "phone" | "subscription";
    value: string;
  }) => {
    setEditable("");

    await useHttp
      .post("/updateClientDataMobile", {
        mail: user?.mail,
        ...data,
      })
      .then(() => {
        dispatch(
          setUser({
            ...user,
            [data.field as keyof IUser]: data.value || "",
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
  };

  useEffect(() => {
    getUser();
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{
        flex: 1,
        width: "100%",
        height: "100%",
        paddingBottom: 20,
        backgroundColor: Colors.background,
      }}
      enabled>
      <ScrollView
        style={{ flex: 1, width: "100%" }}
        contentContainerStyle={{ flexGrow: 1 }}>
        <View style={sharedStyles.container}>
          <View
            style={{
              alignItems: "center",
              width: "100%",
            }}>
            <View style={profileStyles.avatar}>
              <Text style={profileStyles.avatarText}>
                {fullName
                  ? fullName.split(" ")[0][0] + fullName.split(" ")[0][1]
                  : ""}
              </Text>
            </View>
            <Text style={profileStyles.name}>{fullName}</Text>
            <View style={{ gap: 10, width: "100%", marginVertical: 15 }}>
              <UIInput
                editable={editable == "fullName"}
                value={fullName}
                onChangeText={(text) => setFullName(text)}
                type="filled"
                placeholder="Имя"
                rightElementClick={() =>
                  editable == "fullName"
                    ? handleSave({ field: "fullName", value: fullName })
                    : setEditable("fullName")
                }
                rightElement={
                  editable == "fullName" ? (
                    <UIIcon name="check" />
                  ) : (
                    <UIIcon name="edit" />
                  )
                }
              />
              <UIInput
                editable={editable === "phone"}
                value={phone}
                onChangeText={(text) => setPhone(text)}
                type="filled"
                placeholder="Номер телефона"
                rightElementClick={() =>
                  editable == "phone" ? setEditable("") : setEditable("phone")
                }
                rightElement={
                  editable == "phone" ? (
                    <UIIcon name="check" />
                  ) : (
                    <UIIcon name="edit" />
                  )
                }
              />
              <UIInput
                value={`${firstAddress?.street} ${firstAddress?.house}`}
                type="filled"
                placeholder="Адрес"
                rightElementClick={() => router.push("(modals)/address")}
                rightElement={<UIIcon name="gray-chevron" />}
              />
            </View>
            <View style={{ width: "100%", gap: 10 }}>
              <Text
                style={{ fontWeight: "500", fontSize: 20, color: Colors.text }}>
                Промокод
              </Text>
              <UIInput
                editable={editable === "subscription"}
                value={subscription}
                onChangeText={(text) => setSubscription(text)}
                type="filled"
                placeholder="Промокод"
                rightElementClick={() =>
                  editable == "subscription"
                    ? setEditable("")
                    : setEditable("subscription")
                }
                rightElement={
                  editable == "subscription" ? (
                    <UIIcon name="check" />
                  ) : (
                    <UIIcon name="edit" />
                  )
                }
              />
            </View>
            <TouchableOpacity
              onPress={() => handleLogOut}
              style={{ marginTop: 20, marginLeft: "auto" }}>
              <Text style={{ color: Colors.tint, fontSize: 20 }}>Выйти</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const profileStyles = StyleSheet.create({
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.tint,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 36,
    textAlign: "center",
    color: Colors.background,
    fontWeight: "500",
  },
  name: {
    marginTop: 20,
    fontSize: 24,
    fontWeight: "500",
    color: Colors.text,
    textAlign: "center",
  },
});
