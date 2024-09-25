import Colors from "@/constants/Colors";
import { StyleSheet } from "react-native";

const sharedStyles = StyleSheet.create({
  container: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingLeft: 15,
    paddingRight: 15,
    paddingBottom: 10,
    backgroundColor: Colors.background,
    width: "100%",
    height: "100%",
  },
});

export default sharedStyles;
