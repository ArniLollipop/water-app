import Colors from "@/constants/Colors";
import { Text, TouchableOpacity, View } from "react-native";
import UIIcon from "./Icon";

const UIRadio = (props: {
  withoutDot?: boolean;
  title?: string;
  items?: { id?: string; text: string }[];
  addText: string;
  setNew?: (value: boolean) => void;
}) => {
  return (
    <View
      style={{
        backgroundColor: Colors.darkWhite,
        width: "100%",
        borderRadius: 16,
        paddingVertical: 20,
        paddingHorizontal: 10,
      }}>
      {props?.title && (
        <Text
          style={{
            color: Colors.text,
            fontSize: 20,
            fontWeight: "500",
            marginBottom: 10,
          }}>
          {props.title}
        </Text>
      )}
      <View style={{ width: "100%", flexDirection: "column", gap: 15 }}>
        {props.items &&
          props.items.length > 0 &&
          props?.items?.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={{
                backgroundColor: Colors.background,
                borderRadius: 10,
                padding: 10,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}>
              <Text style={{ fontSize: 14, color: Colors.text }}>
                {item.text}
              </Text>
              {!props.withoutDot && (
                <View
                  style={{
                    width: 20,
                    height: 20,
                    padding: 5,
                    borderWidth: 1,
                    borderRadius: 100,
                    borderColor: Colors.tint,
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                  <View
                    style={{
                      width: 13,
                      height: 13,
                      backgroundColor: Colors.tint,
                      borderRadius: 100,
                    }}
                  />
                </View>
              )}
            </TouchableOpacity>
          ))}
        <TouchableOpacity
          onPress={() => props.setNew && props.setNew(true)}
          style={{
            backgroundColor: Colors.background,
            borderRadius: 10,
            padding: 10,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
          <Text style={{ fontSize: 14, color: Colors.text }}>
            {props.addText}
          </Text>
          <View
            style={{
              paddingHorizontal: 5,
            }}>
            <UIIcon name="smallPlus" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default UIRadio;
