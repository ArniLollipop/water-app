import Colors from "@/constants/Colors";
import { RootState } from "@/store/store";
import sharedStyles from "@/styles/style";
import useHttp from "@/utils/axios";
import { usePathname } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";

export default function Story() {
  const pathname = usePathname();
  const { user } = useSelector((state: RootState) => state.user);

  const [page, setPage] = useState(1);
  const [orders, setOrders] = useState([] as IOrder[]);
  const [haveMore, setHaveMore] = useState(false)
  const [isLoading, setIsLoading] = useState(false); // Флаг для предотвращения дублирования запросов

  const getHistory = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);

    await useHttp
      .post<{ orders: IOrder[] }>("/getClientHistoryMobile", {
        clientId: user?._id,
        page,
      })
      .then((res) => {
        const newOrders = res.data.orders;
        if (newOrders.length === 0) {
          setHaveMore(true)
        }
        setOrders((prevOrders) => [...prevOrders, ...newOrders]);
      })
      .catch((error) => console.error(error))
      .finally(() => setIsLoading(false));
  }, [page, user?._id, isLoading]);

  const handleScroll = useCallback(
    ({ nativeEvent }) => {
      const buffer = 300; // Буфер перед концом списка
      const isNearBottom =
        nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >=
        nativeEvent.contentSize.height - buffer;

      if (isNearBottom && !isLoading && !haveMore) {
        setPage((prevPage) => prevPage + 1);
      }
    },
    [isLoading]
  );

  // Сброс состояния при каждом входе на страницу
  useEffect(() => {
    if (pathname === "/story") {
      setPage(1);
      setOrders([]);
      setHaveMore(false);
    }
  }, [pathname]);


  useEffect(() => {
      getHistory();
  }, [page, haveMore]);

  return (
    <ScrollView
      onScroll={handleScroll}
      scrollEventThrottle={100} // Ограничиваем частоту вызова функции (200 мс)
      contentContainerStyle={{ minHeight: "100%" }}
    >
      <View style={sharedStyles.container}>
        {orders.length > 0 &&
          orders.map((order) => {
            return (
              <View key={order._id} style={storyStyles.item}>
                <View style={storyStyles.itemLeft}>
                  <View style={{ gap: 10, maxWidth: 200 }}>
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
                        fontWeight: "500"
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
                      ? "В очереди"
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
    overflow: "hidden",
  },
  itemRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
});
