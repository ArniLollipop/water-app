import Colors from "@/constants/Colors";
import sharedStyles from "@/styles/style";
import { Text, View } from "react-native";

const News = () => {
  return (
    <View style={sharedStyles.container}>
      <Text
        style={{
          color: Colors.text,
          fontSize: 20,
          textAlign: "center",
          marginTop: 20,
        }}>
        Пока нет новостей
      </Text>
    </View>
  );
};

export default News;
