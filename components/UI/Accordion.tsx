import Colors from "@/constants/Colors";
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  UIManager,
  Platform,
} from "react-native";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const UIAccordion = ({ title, children }: { title: string; children: any }) => {
  const [expanded, setExpanded] = useState(false);
  const animatedOpacity = useRef(new Animated.Value(0)).current;

  const toggleExpand = () => {
    setExpanded(!expanded);
    if (expanded) {
      Animated.timing(animatedOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(animatedOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleExpand} style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
      </TouchableOpacity>
      {expanded && (
        <Animated.View
          style={{ opacity: animatedOpacity, gap: 10, marginBottom: 5 }}>
          {children}
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
    width: "100%",
  },
  titleContainer: {
    backgroundColor: Colors.darkWhite,
    padding: 15,
    borderRadius: 16,
    marginBottom: 10,
  },
  title: {
    color: Colors.text,
    fontSize: 20,
    overflow: "hidden",
  },
});

export default UIAccordion;
