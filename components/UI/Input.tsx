import Colors from "@/constants/Colors";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";
import { useRef } from "react";

interface UIInputProps extends TextInputProps {
  label?: string;
  type?: "filled" | "outlined";
  rightElement?: React.ReactNode;
  rightElementClick?: () => void;
}

export default function UIInput(props: UIInputProps) {
  const inputRef = useRef<TextInput>(null);

  const onRightElementClick = () => {
    inputRef.current &&
      !inputRef.current.isFocused() &&
      inputRef.current.focus();
    if (typeof props.rightElementClick == "function")
      props?.rightElementClick();
  };

  return (
    <View style={{ width: "100%" }}>
      {props.label && (
        <Text style={{ color: Colors.disabled, fontSize: 13, marginBottom: 5 }}>
          {props.label}
        </Text>
      )}
      <View style={{ width: "100%", position: "relative" }}>
        <TextInput
          onPressOut={onRightElementClick}
          onSubmitEditing={onRightElementClick}
          key={props.editable ? "editable" : "not-editable"}
          autoFocus={props.editable}
          ref={inputRef}
          placeholderTextColor={Colors.disabled}
          style={{
            ...inputStyles[props.type || "outlined"],
            padding: 12,
            width: "100%",
            fontFamily: "Roboto",
            borderRadius: 8,
            fontSize: 16,
          }}
          {...props}
        />

        {props.rightElement && (
          <TouchableOpacity
            onPress={onRightElementClick}
            style={{
              position: "absolute",
              right: 12,
              top: 0,
              transform: [{ translateY: 12 }],
            }}>
            {props.rightElement}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const inputStyles = StyleSheet.create({
  outlined: {
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filled: {
    backgroundColor: Colors.darkWhite,
    color: Colors.gray,
    fontSize: 20,
  },
});
