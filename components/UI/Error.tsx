import React, { useEffect, useRef, useState } from "react";
import { Text, View, Animated } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store"; // Adjust the import path based on your file structure
import Colors from "@/constants/Colors";
import { setError } from "@/store/slices/errorSlice";

const UIError = () => {
  const dispatch = useDispatch();

  const { error, errorMessage } = useSelector(
    (state: RootState) => state.error
  );
  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial value for opacity
  const [countDown, setCountDown] = useState(0);

  useEffect(() => {
    if (error) {
      setCountDown(3);

      // Fade in the error message
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true, // Use native driver for better performance
      }).start();
    } else {
      // Fade out the error message
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [error]);

  useEffect(() => {
    setTimeout(() => {
      if (countDown > 0) {
        setCountDown(countDown - 1);
      } else {
        dispatch(
          setError({
            error: false,
            errorMessage: "",
          })
        );
      }
    }, 1000);
  }, [countDown]);

  if (!error) {
    // Only return null when fadeAnim has completed fading out
    setTimeout(() => {
      return null;
    }, 300);
  }

  return (
    <>
      {error && (
        <Animated.View
          style={{
            position: "absolute",
            bottom: 20,
            right: 0,
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
            opacity: fadeAnim,
            zIndex: 10000,
          }}>
          <View
            style={{
              width: "80%",
              backgroundColor: Colors.tint,
              padding: 10,
              borderRadius: 10,
              shadowColor: Colors.gray,
              shadowOffset: {
                width: 10,
                height: 15,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}>
            <Text
              style={{
                color: Colors.darkWhite,
                textAlign: "center",
              }}>
              {errorMessage}
            </Text>
          </View>
        </Animated.View>
      )}
    </>
  );
};

export default UIError;
