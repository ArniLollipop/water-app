import Colors from "@/constants/Colors";
import { setError } from "@/store/slices/errorSlice";
import { useRouter } from "expo-router";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useDispatch } from "react-redux";
import UIIcon from "../UI/Icon";

export default function HomeCategories(props: {
  hasLastOrder: boolean;
  bonus: number;
}) {
  const dispatch = useDispatch();
  const router = useRouter();

  const handlePushToBonus = () => {
    if (props.hasLastOrder) {
      router.push("/bonus");
    } else {
      dispatch(
        setError({
          error: true,
          errorMessage: "В бонусы можно перейти после первого заказа",
        })
      );
    }
  };

  return (
    <View style={{ flexBasis: 0 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: 20 }}
        style={categoryStyles.container}>
        <Pressable
          style={categoryStyles.block}
          onPress={() => router.push("/news")}>
          <Image
            source={require("../../assets/images/mainNews.png")}
            style={{
              height: 173,
              width: 165,
              objectFit: "cover",
            }}
          />
          <View style={{ position: "absolute", left: 10, bottom: 10 }}>
            <Text
              style={{ fontSize: 16, fontWeight: "500", color: Colors.text }}>
              Новости
            </Text>
          </View>
        </Pressable>
        <Pressable style={categoryStyles.block} onPress={handlePushToBonus}>
          <Image
            source={require("../../assets/images/mainBonus.png")}
            style={{
              height: 173,
              width: 165,
              objectFit: "cover",
            }}
          />
          <View
            style={{
              position: "absolute",
              left: 10,
              bottom: 10,
              flexDirection: "row",
              gap: 5,
              alignItems: "flex-end",
            }}>
            <Text
              style={{ fontSize: 16, fontWeight: "500", color: Colors.text }}>
              Бонусы-{props.bonus}
            </Text>
            <UIIcon name="waterButton" />
          </View>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const categoryStyles = StyleSheet.create({
  container: {
    marginVertical: 40,
  },
  block: {
    position: "relative",
    borderRadius: 18,
    overflow: "hidden",
    height: 173,
    width: 165,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  innerBlock: {
    height: "70%",
    flexDirection: "column",
    gap: 15,
  },
});
