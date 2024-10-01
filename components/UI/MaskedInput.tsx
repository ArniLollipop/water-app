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
import { MaskedTextInput, MaskedTextInputProps } from "react-native-mask-text";

interface UIInputProps extends MaskedTextInputProps {
  isLink?: boolean;
  label?: string;
  type?: "filled" | "outlined";
  rightElement?: React.ReactNode;
  rightElementClick?: () => void;
}

export default function MaskedUIInput(props: UIInputProps) {
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
        <MaskedTextInput
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
            color: props.isLink
              ? Colors.blue
              : props.type == "filled"
              ? inputStyles[props.type].color
              : Colors.text,
            textDecorationLine: props.isLink ? "underline" : "none",
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
