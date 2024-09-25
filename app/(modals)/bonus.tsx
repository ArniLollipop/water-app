import React, { useRef, useState } from "react";
import { View, Animated, StyleSheet, Text, Pressable } from "react-native";
import UIIcon from "@/components/UI/Icon";
import Colors from "@/constants/Colors";
import sharedStyles from "@/styles/style";

const Bonus = ({ totalPresses = 5 }) => {
  const [pressCount, setPressCount] = useState(0);

  const waterLevels = Array.from(
    { length: totalPresses },
    () => useRef(new Animated.Value(0)).current
  );

  const rotationX = useRef(new Animated.Value(0)).current;
  const rotationY = useRef(new Animated.Value(0)).current;

  const getRandomDirection = () => {
    const directions = [
      { rotateX: 15, rotateY: 0 },
      { rotateX: -15, rotateY: 0 },
      { rotateX: 0, rotateY: 15 },
      { rotateX: 0, rotateY: -15 },
    ];
    return directions[Math.floor(Math.random() * directions.length)];
  };

  const handlePress = () => {
    if (pressCount < totalPresses) {
      setPressCount((prev) => prev + 1);

      const levelIndex = totalPresses - pressCount - 1;

      Animated.timing(waterLevels[levelIndex], {
        toValue: 100,
        duration: 500,
        useNativeDriver: false,
      }).start();

      const { rotateX, rotateY } = getRandomDirection();

      Animated.parallel([
        Animated.timing(rotationX, {
          toValue: rotateX,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(rotationY, {
          toValue: rotateY,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        Animated.parallel([
          Animated.timing(rotationX, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(rotationY, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
  };

  const interpolateRotationX = rotationX.interpolate({
    inputRange: [-15, 15],
    outputRange: ["-15deg", "15deg"],
  });

  const interpolateRotationY = rotationY.interpolate({
    inputRange: [-15, 15],
    outputRange: ["-15deg", "15deg"],
  });

  return (
    <View style={sharedStyles.container}>
      <View
        style={{
          height: "50%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "center",
          position: "relative",
        }}>
        <View style={styles.leftItems}>
          {waterLevels.map((waterLevel, index) => (
            <View
              key={index}
              style={[
                styles.leftItem,
                index === 0 && styles.firstItem,
                index === waterLevels.length - 1 && styles.lastItem,
              ]}>
              <Animated.View
                style={[
                  styles.waterFill,
                  {
                    height: waterLevel.interpolate({
                      inputRange: [0, 100],
                      outputRange: ["0%", "100%"],
                    }),
                  },
                ]}
              />
            </View>
          ))}
        </View>

        <Pressable onPress={handlePress} style={styles.imageContainer}>
          <Animated.Image
            source={require("@/assets/images/bonusImg.jpg")}
            style={[
              styles.image,
              {
                transform: [
                  { perspective: 1000 },
                  { rotateX: interpolateRotationX },
                  { rotateY: interpolateRotationY },
                ],
              },
            ]}
          />
        </Pressable>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          width: "100%",
        }}>
        <View style={styles.infoBlock}>
          <UIIcon name="waterButton" />
          <Text style={styles.infoBlockText}>233</Text>
        </View>
        <View style={styles.infoBlock}>
          <UIIcon name="alarmClock" />
          <Text style={styles.infoBlockText}>233</Text>
        </View>
        <View style={styles.infoBlock}>
          <UIIcon name="water" />
          <Text style={styles.infoBlockText}>233</Text>
        </View>
      </View>

      <View style={styles.rules}>
        <View>
          <Text style={styles.rulesHead}>Правила начисления</Text>
          <Text style={styles.rulesText}>
            1. За каждый 1 выпитый стакан начисляется 2 бонуса
          </Text>
          <Text style={styles.rulesText}>
            2. За 1000 бонусов можно купить 1 л воды{" "}
          </Text>
          <Text style={styles.rulesText}>
            3. Каждые 40 минут можно выпить 1 стакан
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    width: 200,
    height: 200,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  infoBlock: {
    backgroundColor: Colors.darkWhite,
    padding: 10,
    borderRadius: 16,
    overflow: "hidden",
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  infoBlockText: {
    color: Colors.text,
    fontSize: 20,
  },
  rules: {
    backgroundColor: Colors.darkWhite,
    padding: 10,
    borderRadius: 16,
    width: "100%",
    marginVertical: 20,
  },
  rulesHead: {
    color: Colors.disabled,
    fontSize: 20,
  },
  rulesText: {
    marginVertical: 5,
    color: Colors.text,
    fontSize: 20,
  },
  leftItems: {
    flexDirection: "column",
    justifyContent: "space-between",
    padding: 10,
    position: "absolute",
    left: 0,
    top: "50%",
    gap: 2,
    transform: [{ translateY: -120 }],
  },
  leftItem: {
    width: 15,
    height: 45,
    borderWidth: 1,
    borderColor: Colors.tint,
    borderStyle: "solid",
    position: "relative",
    overflow: "hidden",
  },
  lastItem: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  firstItem: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  waterFill: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 123, 255, 0.3)",
  },
});

export default Bonus;
