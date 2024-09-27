import HomeRecent from "@/components/home/recent";
import Colors from "@/constants/Colors";
import sharedStyles from "@/styles/style";
import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function Support() {
  return (
    <View style={sharedStyles.container}>
      <HomeRecent />
      <View style={supportStyles.list}>
        <Text style={supportStyles.listHead}>Поддержка клиентов:</Text>
        <View style={supportStyles.listContent}>
          <Link href="tel:+7 707 707 77 77">
            <Text style={supportStyles.phone}>+7 707 707 77 77</Text>
          </Link>
          <Link href="tel:+7 707 707 77 77">
            <Text style={supportStyles.phone}>+7 707 707 77 77</Text>
          </Link>
        </View>
      </View>
    </View>
  );
}

const supportStyles = StyleSheet.create({
  list: {
    width: "100%",
    height: "auto",
    marginTop: 20,
  },
  listHead: {
    fontSize: 20,
    fontWeight: "400",
    color: Colors.disabled,
  },
  listContent: {
    marginTop: 10,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  phone: {
    fontSize: 20,
    fontWeight: "400",
    color: Colors.blue,
    textDecorationLine: "underline",
  },
});
