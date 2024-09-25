import UIAccordion from "@/components/UI/Accordion";
import Colors from "@/constants/Colors";
import sharedStyles from "@/styles/style";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function Story() {
  return (
    <ScrollView contentContainerStyle={{ minHeight: "100%" }}>
      <View style={sharedStyles.container}>
        {Array.from({ length: 5 }).map((_, i) => (
          <UIAccordion key={i} title="Апрель 2024">
            <View style={storyStyles.item}>
              <View style={storyStyles.itemLeft}>
                <Text
                  style={{
                    color: Colors.text,
                    fontSize: 16,
                    fontWeight: "400",
                  }}>
                  12/12/2024
                </Text>
                <Text
                  style={{
                    color: Colors.text,
                    fontSize: 16,
                    fontWeight: "400",
                  }}>
                  пр. Аль Фараби, 129, кв. 24
                </Text>
                <View style={storyStyles.innerBottom}>
                  <Text style={storyStyles.innerBottomRight}>12,9 л.</Text>
                  <Text style={storyStyles.innerBottomRight}>4 шт</Text>
                </View>
              </View>
              <View style={storyStyles.itemRight}>
                <Text
                  style={{
                    color: Colors.text,
                    fontSize: 16,
                    fontWeight: "500",
                  }}>
                  8 000 ₸
                </Text>
                <Text>Оформлен</Text>
              </View>
            </View>
            <View style={storyStyles.item}>
              <View style={storyStyles.itemLeft}>
                <Text
                  style={{
                    color: Colors.text,
                    fontSize: 16,
                    fontWeight: "400",
                  }}>
                  12/12/2024
                </Text>
                <Text
                  style={{
                    color: Colors.text,
                    fontSize: 16,
                    fontWeight: "400",
                  }}>
                  пр. Аль Фараби, 129, кв. 24
                </Text>
                <View style={storyStyles.innerBottom}>
                  <Text style={storyStyles.innerBottomRight}>12,9 л.</Text>
                  <Text style={storyStyles.innerBottomRight}>4 шт</Text>
                </View>
              </View>
              <View style={storyStyles.itemRight}>
                <Text
                  style={{
                    color: Colors.text,
                    fontSize: 16,
                    fontWeight: "500",
                  }}>
                  8 000 ₸
                </Text>
                <Text>Оформлен</Text>
              </View>
            </View>
          </UIAccordion>
        ))}
      </View>
    </ScrollView>
  );
}

const storyStyles = StyleSheet.create({
  item: {
    borderRadius: 15,
    backgroundColor: Colors.darkWhite,
    padding: 15,
    width: "100%",
    display: "flex",
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "space-between",
  },
  itemLeft: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    height: "100%",
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
  itemRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
});
