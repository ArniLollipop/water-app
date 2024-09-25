import Colors from "@/constants/Colors";
import { Pressable, Text } from "react-native";
import UIIcon from "./Icon";

export default function UIButton(props: {
  isLoading?: boolean;
  type: "default" | "outlined";
  text?: string;
  icon?: string;
  styles?: any;
  onPress?: () => void;
}) {
  return (
    <Pressable
      disabled={props.isLoading}
      onPress={props.onPress}
      style={{
        // backgroundColor: Colors.tint,
        padding: 10,
        width: "100%",
        borderRadius: 8,
        shadowColor: "#4C4E64",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.42,
        shadowRadius: 4,
        elevation: 4,
        alignItems: "center",
        justifyContent: "center",
        opacity: props.isLoading ? 0.5 : 1,
        ...props.styles,
        ...styles[props.type as "default" | "outlined"],
      }}>
      {props.icon ? (
        <UIIcon name={props.icon} />
      ) : (
        <Text
          style={{
            fontSize: 15,
            fontWeight: "500",
            fontFamily: "Roboto",
            textAlign: "center",
            textTransform: "uppercase",
            ...styles[`${props.type}Text` as "defaultText" | "outlinedText"],
          }}>
          {props.text}
        </Text>
      )}
    </Pressable>
  );
}

const styles = {
  default: {
    backgroundColor: Colors.tint,
  },
  defaultText: {
    color: Colors.textSecondary,
  },

  outlined: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },

  outlinedText: {
    color: Colors.border,
  },
};
