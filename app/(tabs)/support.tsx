import HomeRecent from "@/components/home/recent";
import Colors from "@/constants/Colors";
import { RootState } from "@/store/store";
import sharedStyles from "@/styles/style";
import useHttp from "@/utils/axios";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";

export default function Support() {
  const { user } = useSelector((state: RootState) => state.user);

  const [lastOrder, setLastOrder] = useState<IOrder | null>(null);

  async function getLastOrder() {
    await useHttp
      .post<{ order: IOrder }>("/getLastOrderMobile", { clientId: user?._id })
      .then((res) => {
        setLastOrder(res.data.order);
      });
  }

  useEffect(() => {
    if (user?._id) getLastOrder();
  }, [user?.mail]);

  return (
    <View style={sharedStyles.container}>
      {lastOrder && <HomeRecent lastOrder={lastOrder} />}
      <View style={supportStyles.list}>
        <Text style={supportStyles.listHead}>Поддержка клиентов:</Text>
        <View style={supportStyles.listContent}>
          <Link href="tel:+7 707 707 77 77">
            <Text style={supportStyles.phone}>+7 707 707 77 77</Text>
          </Link>
          <Link href="tel:+7 707 707 77 77">
            <Text style={supportStyles.phone}>+7 707 707 77 77</Text>
          </Link>
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
