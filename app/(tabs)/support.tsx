import HomeRecent from "@/components/home/recent";
import Colors from "@/constants/Colors";
import sharedStyles from "@/styles/style";
import { StyleSheet, Text, View } from "react-native";

export default function Support() {
  return (
    <View style={sharedStyles.container}>
      <HomeRecent />
      <View style={supportStyles.list}>
        <Text style={supportStyles.listHead}>Поддержка клиентов:</Text>
        <View style={supportStyles.listContent}>
          <Text style={supportStyles.phone}>+7 707 707 77 77</Text>
          <Text style={supportStyles.phone}>+7 707 707 77 77</Text>
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
