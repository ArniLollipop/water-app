import Colors from "@/constants/Colors";
import { RootState } from "@/store/store";
import sharedStyles from "@/styles/style";
import useHttp from "@/utils/axios";
import { usePathname } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";

export default function Story() {
  const pathname = usePathname();
  const { user } = useSelector((state: RootState) => state.user);

  const [page, setPage] = useState(1);
  const [orders, setOrders] = useState([] as IOrder[]);
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false); // Флаг для предотвращения дублирования запросов

  const getHistory = useCallback(async (page: number) => {
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
          setHasMore(false)
        } else {
          if (page === 1) {
              setOrders([...newOrders])
          } else {
            setOrders((prevOrders) => [...prevOrders, ...newOrders]);
          }
        }
      })
      .catch((error) => console.error(error))
      .finally(() => setIsLoading(false));
  }, [page, user?._id, isLoading, hasMore])

  useEffect(() => {
    if (pathname.includes("story")) {
      setPage(1); // Обнуляем page перед очисткой orders
      setOrders([]);
      setHasMore(true);
      setIsLoading(false);
      getHistory(1)
    }
  }, [pathname]);

  const renderItem = ({ item }: { item: IOrder }) => (
    <View style={storyStyles.item}>
      <View style={storyStyles.itemLeft}>
        <View style={{ gap: 10, maxWidth: 200 }}>
          <Text
            style={{
              color: Colors.text,
              fontSize: 16,
              fontWeight: "400",
            }}
          >
            {item.createdAt.split("T")[0].split("-").reverse().join("/")}
          </Text>
          <Text
            style={{
              color: Colors.text,
              fontSize: 16,
              fontWeight: "500",
            }}
          >
            {item?.address?.actual}
          </Text>
        </View>
        <Text
          style={{
            color: Colors.text,
            fontSize: 16,
            fontWeight: "500",
          }}
        >
          {item.sum} ₸
        </Text>
      </View>
      <View style={storyStyles.itemRight}>
        <View style={storyStyles.innerBottom}>
          <Text style={storyStyles.innerBottomRight}>
            12.5 л - {item.products.b12} шт
          </Text>
          <Text style={storyStyles.innerBottomRight}>
            18.9 л - {item.products.b19} шт
          </Text>
        </View>
        <Text>
          {item?.status === "awaitingOrder"
            ? "В очереди"
            : item?.status === "onTheWay"
            ? "В пути"
            : item?.status === "delivered"
            ? "Доставлен"
            : "Отменен"}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={sharedStyles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        onEndReached={() => {
          if (!isLoading && hasMore) {
            getHistory(page + 1)
            setPage((prevPage) => prevPage + 1);
          }
        }}
        onEndReachedThreshold={0.1}
        ListFooterComponent={
          isLoading ? (
            <Text style={{ textAlign: "center", padding: 10 }}>Загрузка...</Text>
          ) : null
        }
        ListEmptyComponent={
          !isLoading && orders.length === 0 ? (
            <Text style={{ textAlign: "center", padding: 10 }}>Нет данных</Text>
          ) : null
        }
      />
    </View>
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
