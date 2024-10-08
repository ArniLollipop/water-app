import Colors from "@/constants/Colors";
import { Text, TouchableOpacity, View } from "react-native";
import UIIcon from "./Icon";
import { useState } from "react";

const UIRadio = (props: {
  withoutDot?: boolean;
  title?: string;
  items?: { id?: string; text: string }[];
  addText?: string;
  setNew?: (value: boolean) => void;
  select?: string;
  setSelect?: (value: string) => void;
}) => {
  const [isAllVisible, setAllVisible] = useState(false);

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
        {props.select && (
          <TouchableOpacity
            onPress={() =>
              props.select && props.setSelect && props.setSelect(props.select)
            }
            key={props.select}
            style={{
              backgroundColor: Colors.background,
              borderRadius: 10,
              padding: 10,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
            <Text style={{ fontSize: 14, color: Colors.text }}>
              {props.items?.find((item) => item.id == props.select)?.text || ""}
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
        )}
        {props.items &&
          props.items.length > 0 &&
          props?.items
            ?.filter((item) => item.id != props.select)
            ?.filter((item, index) => isAllVisible || index < 2)
            .map((item) => (
              <TouchableOpacity
                onPress={() =>
                  item.id && props.setSelect && props.setSelect(item.id)
                }
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
              </TouchableOpacity>
            ))}

        {props.addText && (
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
        )}

        {props.items && props.items?.length > 2 && (
          <TouchableOpacity
            onPress={() => setAllVisible(!isAllVisible)}
            style={{
              width: "auto",
              justifyContent: "center",
              flexDirection: "row",
              alignItems: "center",
            }}>
            <Text
              style={{ color: Colors.text, fontSize: 14, textAlign: "center" }}>
              {isAllVisible ? "Скрыть" : "Показать все"}
            </Text>
            <View
              style={{
                transform: [{ rotate: isAllVisible ? "270deg" : "90deg" }],
                marginTop: 3,
              }}>
              <UIIcon name={"gray-chevron"} />
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default UIRadio;
