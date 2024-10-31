import Colors from "@/constants/Colors";
import { useRouter } from "expo-router";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function HomeCategories() {
  const router = useRouter();

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
              style={{ fontSize: 18, fontWeight: "500", color: Colors.text }}>
              Новости
            </Text>
          </View>
        </Pressable>
        <Pressable
          style={categoryStyles.block}
          onPress={() => router.push("/(modals)/bonus")}>
          <Image
            source={require("../../assets/images/mainBonus.png")}
            style={{
              height: 173,
              width: 165,
              objectFit: "cover",
            }}
          />
          <View style={{ position: "absolute", left: 10, bottom: 10 }}>
            <Text
              style={{ fontSize: 18, fontWeight: "500", color: Colors.text }}>
              Бонусы
            </Text>
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
