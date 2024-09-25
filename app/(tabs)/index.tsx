import HomeCategories from "@/components/home/categories";
import Products from "@/components/home/products";
import HomeRecent from "@/components/home/recent";
import UIButton from "@/components/UI/Button";
import Colors from "@/constants/Colors";
import { setError } from "@/store/slices/errorSlice";
import { setCart } from "@/store/slices/userSlice";
import { RootState } from "@/store/store";
import sharedStyles from "@/styles/style";
import useHttp from "@/utils/axios";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ScrollView, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";

export default function Home() {
  const router = useRouter();

  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.user);

  async function getCart() {
    await useHttp
      .post<ICart>("/getCart", { mail: user?.mail })
      .then((res) => {
        dispatch(setCart(res.data));
      })
      .catch((err) => {
        dispatch(
          setError({
            error: true,
            errorMessage: err.response.data.message,
          })
        );
      });
  }

  useEffect(() => {
    if (user?.mail) getCart();
  }, [user?.mail]);

  return (
    <View style={sharedStyles.container}>
      <ScrollView
        bounces={false}
        contentContainerStyle={{
          backgroundColor: Colors.background,
          paddingBottom: 15,
        }}>
        <HomeRecent />
        <HomeCategories />
        <Products />
      </ScrollView>
      {user?.cart && user.cart.b12 > 0 && user.cart.b19 > 0 && (
        <UIButton
          onPress={() => router.push("(modals)/order")}
          type="default"
          text="Заказать"
          styles={{
            position: "fixed",
            bottom: 0,
            zIndex: 10,
          }}
        />
      )}
    </View>
  );
}
