import React, { useEffect } from "react";
import { Tabs, usePathname, useRouter, useSegments } from "expo-router";

import Colors from "@/constants/Colors";
import UIIcon from "@/components/UI/Icon";
import { Pressable } from "react-native";

import { useDispatch, useSelector } from "react-redux";
import { setUser } from "@/store/slices/userSlice";
import { RootState } from "@/store/store";
import * as SecureStore from "expo-secure-store";
import parseJwt from "@/utils/parseJwt";
import useHttp from "@/utils/axios";

export default function TabLayout() {
  const segments = useSegments();
  const router = useRouter();
  const dispatch = useDispatch();

  const { user } = useSelector((state: RootState) => state.user);

  const getMe = async () => {
    const token = await SecureStore.getItemAsync("token");
    if (token) {
      const user = parseJwt(token);
      dispatch(setUser(user));
    } else if (!segments.includes("(registration)")) {
      dispatch(setUser(null));
      router.push("(registration)/login");
    }
  };

  useEffect(() => {
    if (!user) getMe();
  }, [segments]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.tint,
        tabBarStyle: {
          height: 70,
        },
        tabBarItemStyle: {
          height: 65,
        },
        tabBarHideOnKeyboard: true,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          headerTitleAlign: "center",
          headerTitleStyle: {
            color: Colors.tint,
          },
          ...tabBarProps,
          title: "Главная",
          tabBarIcon: () => <UIIcon name="home" />,
        }}
      />
      <Tabs.Screen
        name="story"
        options={{
          headerTitleAlign: "center",
          ...tabBarProps,
          title: "История",
          tabBarIcon: () => <UIIcon name="story" />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          headerTitleAlign: "center",
          headerRight: () => (
            <Pressable
              style={{ marginRight: 10 }}
              onPress={() => router.push("(modals)/settings")}>
              <UIIcon name="settings" />
            </Pressable>
          ),
          ...tabBarProps,
          title: "Профиль",
          tabBarIcon: () => <UIIcon name="profile" />,
        }}
      />
      <Tabs.Screen
        name="support"
        options={{
          headerTitleAlign: "center",
          ...tabBarProps,
          title: "Поддержка",
          tabBarIcon: () => <UIIcon name="support" />,
        }}
      />
    </Tabs>
  );
}

const tabBarProps = {
  tabBarLabelStyle: {
    fontSize: 14,
  },
  headerShadowVisible: false,
};
