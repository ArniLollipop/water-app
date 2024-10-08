import Colors from "@/constants/Colors";
import { Pressable, StyleSheet, Text, View } from "react-native";
import UIIcon from "../UI/Icon";
import { useRouter } from "expo-router";

export default function HomeRecent(props: { lastOrder: IOrder }) {
  const router = useRouter();

  const { lastOrder } = props;

  const isMoreThanFiveMinutes = () => {
    if (!lastOrder.createdAt) return false;

    const date = new Date(lastOrder.createdAt);
    const now = new Date();

    return now.getTime() - date.getTime() > 300000;
  };

  const handleRepeatOrder = () => {
    router.push("(modals)/order?repeat=true");
  };

  return (
    <View style={recentStyles.container}>
      <View style={recentStyles.block}>
        <View style={recentStyles.inner}>
          <View style={recentStyles.innerTop}>
            <Text style={recentStyles.innerTopText}>Недавнее</Text>
            <View style={recentStyles.innerTopRight}>
              <Text style={recentStyles.topRightText}>
                {lastOrder.status == "awaitingOrder" ? "В очереди" : "В пути"}
              </Text>
            </View>
          </View>
          {lastOrder.products.b12 > 0 && (
            <View style={recentStyles.innerBottom}>
              <Text style={recentStyles.innerBottomRight}>12.5 л</Text>
              <Text style={recentStyles.innerBottomRight}>
                {lastOrder.products.b12} шт
              </Text>
            </View>
          )}
          {lastOrder.products.b19 > 0 && (
            <View style={recentStyles.innerBottom}>
              <Text style={recentStyles.innerBottomRight}>18.9 л</Text>
              <Text style={recentStyles.innerBottomRight}>
                {lastOrder.products.b19} шт
              </Text>
            </View>
          )}
        </View>
        <Pressable onPress={handleRepeatOrder} style={recentStyles.bgRight}>
          <UIIcon name="white-chevron" />
        </Pressable>
        <View style={recentStyles.bgIcon}>
          <UIIcon name="express" />
        </View>
        <View style={{}}></View>
      </View>

      <View style={recentStyles.buttons}>
        {!isMoreThanFiveMinutes() && (
          <Pressable style={recentStyles.button}>
            <UIIcon name="trash" />
            <Text style={{ ...recentStyles.buttonText, ...recentStyles.tint }}>
              ОТМЕНИТЬ
            </Text>
          </Pressable>
        )}
        <Pressable style={recentStyles.button}>
          <UIIcon name="recycle" />
          <Text style={recentStyles.buttonText}>ПОВТОРИТЬ</Text>
        </Pressable>
      </View>
    </View>
  );
}

const recentStyles = StyleSheet.create({
  container: {
    width: "100%",
  },
  block: {
    backgroundColor: Colors.darkWhite,
    borderRadius: 18,
    padding: 15,
    width: "100%",
    height: "auto",
    position: "relative",
    overflow: "hidden",
  },
  inner: {
    flexDirection: "column",
    paddingRight: 30,
  },
  innerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  innerTopRight: {
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 5,
  },
  bgIcon: {
    position: "absolute",
    left: "50%",
    top: -10,
    transform: [{ translateX: -70 }],
    padding: 15,
    borderRadius: 18,
  },
  innerBottom: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 10,
  },
  innerBottomRight: {
    paddingHorizontal: 19,
    paddingVertical: 3,
    backgroundColor: Colors.border,
    borderRadius: 11,
    color: Colors.background,
  },
  innerTopText: {
    fontSize: 20,
    fontWeight: "500",
    color: Colors.text,
  },
  topRightText: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.tint,
  },
  bgRight: {
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 5,
    backgroundColor: Colors.tint,
    height: "140%",
    justifyContent: "center",
    alignItems: "center",
    padding: 5,
  },
  buttons: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
    maxWidth: "80%",
    width: "100%",
    margin: "auto",
    gap: 20,
  },
  button: {
    display: "flex",
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
  },
  tint: {
    color: Colors.tint,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.text,
  },
});
