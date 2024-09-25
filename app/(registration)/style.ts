import Colors from "@/constants/Colors";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 15,
    paddingRight: 15,
    paddingBottom: 10,
    backgroundColor: Colors.background,
  },
  loginTop: {
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 15,
    width: "100%",
  },
  logo: {
    objectFit: "cover",
  },
  loginText: {
    fontFamily: "Roboto",
    color: Colors.text,
    fontSize: 12,
    fontWeight: "400",
    textAlign: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
  },
  buttonText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default styles;
