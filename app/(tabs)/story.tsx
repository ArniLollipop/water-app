import UIAccordion from "@/components/UI/Accordion";
import Colors from "@/constants/Colors";
import { RootState } from "@/store/store";
import sharedStyles from "@/styles/style";
import useHttp from "@/utils/axios";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";

export default function Story() {
  const { user } = useSelector((state: RootState) => state.user);

  const [page, setPage] = useState(1);
  const [orders, setOrders] = useState([] as IOrder[]);

  async function getHistory() {
    await useHttp
      .post<{ orders: IOrder[] }>("/getClientHistoryMobile", {
        clientId: user?._id,
        page: page,
      })
      .then((res) => {
        setOrders(res.data.orders);
      });
  }

  useEffect(() => {
    getHistory();
  }, [user?.mail]);

  return (
    <ScrollView
      onScroll={({ nativeEvent }) => {
        if (
          nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >=
          nativeEvent.contentSize.height
        ) {
          setPage(page + 1);
          getHistory();
        }
      }}
      contentContainerStyle={{ minHeight: "100%" }}>
      <View style={sharedStyles.container}>
        {orders.length > 0 &&
          orders.map((order) => {
            return (
              <View key={order._id} style={storyStyles.item}>
                <View style={storyStyles.itemLeft}>
                  <View style={{ gap: 10 }}>
                    <Text
                      style={{
                        color: Colors.text,
                        fontSize: 16,
                        fontWeight: "400",
                      }}>
                      {order.createdAt
                        .split("T")[0]
                        .split("-")
                        .reverse()
                        .join("/")}
                    </Text>
                    <Text
                      style={{
                        color: Colors.text,
                        fontSize: 16,
                        fontWeight: "500",
                      }}>
                      {order?.address?.actual}
                    </Text>
                  </View>
                  <Text
                    style={{
                      color: Colors.text,
                      fontSize: 16,
                      fontWeight: "500",
                    }}>
                    {/* Адрес */}
                    {order.sum} ₸
                  </Text>
                </View>
                <View style={storyStyles.itemRight}>
                  <View style={storyStyles.innerBottom}>
                    <Text style={storyStyles.innerBottomRight}>
                      12.5 л - {order.products.b12} шт
                    </Text>
                    <Text style={storyStyles.innerBottomRight}>
                      18.9 л - {order.products.b19} шт
                    </Text>
                  </View>

                  <Text>
                    {order?.status == "awaitingOrder"
                      ? "Ожидает заказ"
                      : order?.status == "onTheWay"
                      ? "В пути"
                      : order?.status == "delivered"
                      ? "Доставлен"
                      : "Отменен"}
                  </Text>
                </View>
              </View>
            );
          })}
      </View>
    </ScrollView>
  );
}

const storyStyles = StyleSheet.create({
  item: {
    borderRadius: 15,
    backgroundColor: Colors.darkWhite,
    padding: 15,
    width: "100%",
    display: "flex",
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  itemLeft: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    justifyContent: "space-between",
    height: 120,
  },
  innerBottom: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 5,
  },
  innerBottomRight: {
    paddingHorizontal: 19,
    paddingVertical: 3,
    backgroundColor: Colors.border,
    borderRadius: 11,
    color: Colors.background,
  },
  itemRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
});
