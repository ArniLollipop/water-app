import HomeRecent from "@/components/home/recent";
import Colors from "@/constants/Colors";
import { RootState } from "@/store/store";
import sharedStyles from "@/styles/style";
import useHttp from "@/utils/axios";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import { Linking, Platform } from "react-native";

export default function Support() {
  const { user } = useSelector((state: RootState) => state.user);

  const [lastOrder, setLastOrder] = useState<IOrder | null>(null);

  async function getLastOrder() {
    await useHttp
      .post<{ order: IOrder }>("/getLastOrderMobile", { clientId: user?._id })
      .then((res) => {
        setLastOrder(res.data.order);
      })
      .catch(() => {
        console.log("error");
      });
  }

  useEffect(() => {
    if (user?._id) getLastOrder();
  }, [user?.mail]);

  const onCallMobilePhone = async (phoneNumber: string) => {
    if (Platform.OS === "android") {
      Linking.openURL(`tel:${phoneNumber}`);
      return;
    }

    if (Platform.OS === "ios") {
      Linking.openURL(`telprompt:${phoneNumber}`);
      return;
    }
  };

  const onMailOpen = async (mail: string) => {
    Linking.openURL(`mailto:${mail}`);
  };

  return (
    <View style={sharedStyles.container}>
      {lastOrder && <HomeRecent lastOrder={lastOrder} />}
      <View style={supportStyles.list}>
        <Text style={supportStyles.listHead}>Поддержка клиентов:</Text>
        <View style={supportStyles.listContent}>
          <TouchableOpacity onPress={() => onCallMobilePhone("+77272378047")}>
            <Text style={supportStyles.phone}>+7 727 237 80 47</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onCallMobilePhone("+77475315558")}>
            <Text style={supportStyles.phone}>+7 747 531 55 58</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onMailOpen("info@tibetskaya.kz")}>
            <Text style={supportStyles.phone}>info@tibetskaya.kz</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const supportStyles = StyleSheet.create({
  list: {
    width: "100%",
    height: "auto",
    marginTop: 20,
  },
  listHead: {
    fontSize: 20,
    fontWeight: "400",
    color: Colors.disabled,
  },
  listContent: {
    marginTop: 10,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  phone: {
    fontSize: 20,
    fontWeight: "400",
    color: Colors.blue,
    textDecorationLine: "underline",
  },
});
