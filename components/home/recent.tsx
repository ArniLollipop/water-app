import Colors from "@/constants/Colors";
import { Pressable, StyleSheet, Text, View } from "react-native";
import UIIcon from "../UI/Icon";

export default function HomeRecent() {
  return (
    <View style={recentStyles.container}>
      <View style={recentStyles.block}>
        <View style={recentStyles.inner}>
          <View style={recentStyles.innerTop}>
            <Text style={recentStyles.innerTopText}>Недавнее</Text>
            <View style={recentStyles.innerTopRight}>
              <Text style={recentStyles.topRightText}>В ПУТИ</Text>
              <Text
                style={{ ...recentStyles.topRightText, color: Colors.text }}>
                00:30
              </Text>
            </View>
          </View>
          <View style={recentStyles.innerBottom}>
            <Text style={recentStyles.innerBottomRight}>12,9 л.</Text>
            <Text style={recentStyles.innerBottomRight}>4 шт</Text>
          </View>
        </View>
        <View style={recentStyles.bgRight}>
          <UIIcon name="white-chevron" />
        </View>
        <View style={recentStyles.bgIcon}>
          <UIIcon name="express" />
        </View>
        <View style={{}}></View>
      </View>

      <View style={recentStyles.buttons}>
        <Pressable style={recentStyles.button}>
          <UIIcon name="trash" />
          <Text style={{ ...recentStyles.buttonText, ...recentStyles.tint }}>
            ОТМЕНИТЬ
          </Text>
        </Pressable>
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
    justifyContent: "space-between",
    marginTop: 10,
    maxWidth: "80%",
    width: "100%",
    margin: "auto",
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
