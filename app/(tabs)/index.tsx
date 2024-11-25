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
import { usePathname, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";

export default function Home() {
  const router = useRouter();
  const pathname = usePathname();

  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.user);
  const { lastOrderStatus } = useSelector((state: RootState) => state.lastOrderStatus);
  const [lastOrder, setLastOrder] = useState<IOrder | null>(null);
  const [bonus, setBonus] = useState(0);
  const [haveCompletedOrder, setHaveCompletedOrder] = useState(false)

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
            errorMessage: err.response.data,
          })
        );
      });
  }

  async function getBonuses() {
    await useHttp
      .post<IUser>("/getClientDataForId", { id: user?._id })
      .then((res) => {
        setBonus(res.data.bonus || 0);
        setHaveCompletedOrder(res.data.haveCompletedOrder || false)
      })
      .catch((err) => {
        dispatch(
          setError({
            error: true,
            errorMessage: err.response.data,
          })
        );
      });
  }

  async function getLastOrder() {
    await useHttp
      .post<{ order: IOrder }>("/getLastOrderMobile", { clientId: user?._id })
      .then((res) => {
        setLastOrder(res.data.order);
      })
      .catch(() => {
        console.log("no last order");
      });
  }

  useEffect(() => {
    if (pathname == "/") {
      if (user?.mail) {
        getCart();
      }
      if (user?._id) {
        getLastOrder();
        getBonuses();
      }
    }
  }, [user?.mail, pathname]);

  useEffect(() => {
    if (lastOrderStatus !== lastOrder?.status) {
      if (lastOrder && lastOrder?._id) {
        setLastOrder({...lastOrder, status: lastOrderStatus})
      }
    }
  }, [lastOrderStatus]);

  const isButtonVisible = () => {
    return user?.cart && (user.cart.b12 > 0 || user.cart.b19 > 0);
  };

  return (
    <View style={sharedStyles.container}>
      <ScrollView
        bounces={false}
        contentContainerStyle={{
          backgroundColor: Colors.background,
          paddingBottom: 15,
        }}>
        {lastOrder && <HomeRecent lastOrder={lastOrder} />}
        <HomeCategories
          bonus={bonus}
          hasLastOrder={haveCompletedOrder}
        />
        <Products />
      </ScrollView>
      {isButtonVisible() && (
        <UIButton
          onPress={() => router.push("/(modals)/order")}
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
