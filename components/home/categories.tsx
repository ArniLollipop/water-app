import Colors from "@/constants/Colors";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function HomeCategories() {
  const router = useRouter();

  return (
    <View style={{ flexBasis: 0 }}>
      <ScrollView
        horizontal
        contentContainerStyle={{ gap: 20 }}
        style={categoryStyles.container}>
        <Pressable
          style={categoryStyles.block}
          onPress={() => router.push("(modals)/bonus")}>
          <View style={categoryStyles.innerBlock}>
            <Text
              style={{
                fontSize: 32,
                fontWeight: "500",
                color: Colors.textSecondary,
              }}>
              Скидка
            </Text>
            <Text
              style={{
                fontSize: 15,
                fontWeight: "500",
                color: Colors.textSecondary,
                textAlign: "center",
              }}>
              20%
            </Text>
          </View>
        </Pressable>
        <View style={categoryStyles.block}>
          <View style={categoryStyles.innerBlock}>
            <Text
              style={{
                fontSize: 32,
                fontWeight: "500",
                color: Colors.textSecondary,
              }}>
              Здоровье
            </Text>
            <Text
              style={{
                fontSize: 15,
                fontWeight: "500",
                color: Colors.textSecondary,
                textAlign: "center",
              }}>
              2567
            </Text>
          </View>
        </View>
        <Pressable
          onPress={() => router.push("(registration)/login")}
          style={categoryStyles.block}>
          <View style={categoryStyles.innerBlock}>
            <Text
              style={{
                fontSize: 32,
                fontWeight: "500",
                color: Colors.textSecondary,
              }}>
              Скидка
            </Text>
            <Text
              style={{
                fontSize: 15,
                fontWeight: "500",
                color: Colors.textSecondary,
                textAlign: "center",
              }}>
              20%
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
    backgroundColor: Colors.tint,
    borderRadius: 18,
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
