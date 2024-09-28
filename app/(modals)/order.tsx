import Products from "@/components/home/products";
import UIButton from "@/components/UI/Button";
import UIRadio from "@/components/UI/Radio";
import UITimePickerModal from "@/components/UI/TimePicker";
import Colors from "@/constants/Colors";
import { setError } from "@/store/slices/errorSlice";
import { setCart, setUser } from "@/store/slices/userSlice";
import { RootState } from "@/store/store";
import sharedStyles from "@/styles/style";
import useHttp from "@/utils/axios";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import { useDispatch, useSelector } from "react-redux";

const Order = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.user);

  const [addresses, setAddresses] = useState([] as IAddress[]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("cash");
  const [prices, setPrices] = useState({ price12: 900, price19: 1300 });
  const [sum, setSum] = useState(0);

  const getUser = async () => {
    await useHttp
      .post<{ clientData: { _doc: IUser }; success: true }>(
        "/getClientDataMobile",
        {
          mail: user?.mail,
        }
      )
      .then((res) => {
        dispatch(setUser(res.data.clientData._doc));
        if (
          res.data.clientData._doc.price12 &&
          res.data.clientData._doc.price19
        ) {
          const { price12, price19 } = res.data.clientData._doc;
          setSum(
            user?.cart
              ? price12 * user?.cart?.b12 + price19 * user?.cart?.b19
              : 0
          );
          setPrices({ price12, price19 });
        } else {
          setSum(
            user?.cart
              ? prices.price12 * user?.cart?.b12 +
                  prices.price19 * user?.cart?.b19
              : 0
          );
        }
      });
  };

  const getAddresses = async () => {
    await useHttp
      .post<{ addresses: IAddress[] }>("/getClientAddresses", {
        mail: user?.mail,
      })
      .then((res) => {
        setAddresses(res.data.addresses);
        if (res.data.addresses[0]?._id)
          setSelectedAddressId(res.data.addresses[0]?._id);
      });
  };

  const handleOrder = async () => {
    // clientId, address, products, clientNotes, date, opForm
    if (!selectedAddressId) {
      dispatch(
        setError({
          error: true,
          errorMessage: "Выберите адрес доставки",
        })
      );
    } else if (user?.cart?.b12 == 0 && user.cart.b19) {
      dispatch(
        setError({
          error: true,
          errorMessage: "Выберите товары для заказа",
        })
      );
    } else {
      await useHttp
        .post<{ success: boolean }>("/addOrderClientMobile", {
          clientId: user?._id,
          address: selectedAddressId,
          products: user?.cart,
          // clientNotes: "",
          // date: new Date(),
          opForm: selectedPayment,
        })
        .then((res) => {
          if (res.data.success) {
            dispatch(setCart({ cart: { b12: 0, b19: 0 } }));
            dispatch(
              setError({
                error: false,
                errorMessage: "Заказ успешно создан",
              })
            );

            router.push("/");
          }
        })
        .catch((err) => {
          dispatch(
            setError({
              error: true,
              errorMessage: err?.response?.data?.message,
            })
          );
        });
    }
  };

  const getFormattedAddresses = (addresses: IAddress[]) => {
    if (addresses?.length === 0) return [];
    else
      return addresses?.map((address) => ({
        id: address._id,
        text: `${address.street} ${address.house}`,
      }));
  };

  useEffect(() => {
    getAddresses();
    getUser();
  }, []);

  useEffect(() => {
    if (user?.cart) {
      setSum(
        prices.price12 * user?.cart?.b12 + prices.price19 * user?.cart?.b19
      );
    }
  }, [user?.cart]);

  return (
    <View style={sharedStyles.container}>
      <ScrollView
        bounces={false}
        contentContainerStyle={{
          backgroundColor: Colors.background,
          paddingBottom: 15,
        }}>
        <Products isOrderPage={true} />
        <View
          style={{
            width: "100%",
            marginTop: 20,
          }}>
          <UIRadio
            title="Адрес доставки"
            items={getFormattedAddresses(addresses)}
            select={selectedAddressId}
            setSelect={setSelectedAddressId}
            // setNew={setIsAdding}
            // addText="Добавить адрес"
          />
        </View>
        <View
          style={{
            width: "100%",
            marginTop: 20,
          }}>
          {/* cash coupon card transfer postpay */}
          <UIRadio
            title="Способ оплаты"
            items={[
              { id: "cash", text: "Наличными" },
              { id: "coupon", text: "Купоном" },
              { id: "card", text: "Картой" },
              { id: "transfer", text: "Переводом" },
              { id: "postpay", text: "Постоплата" },
            ]}
            select={selectedPayment}
            setSelect={setSelectedPayment}
            // addText="Привязать карту"
          />
        </View>

        {/* {!user?.chooseTime && (
          <View style={orderPageStyles.timeBlock}>
            <Text
              style={{
                color: Colors.text,
                fontSize: 20,
                fontWeight: "500",
                marginBottom: 10,
              }}>
              Время доставки
            </Text>
            <UITimePickerModal minDate={new Date()} />
          </View>
        )} */}

        <View
          style={{
            marginTop: 20,
            marginBottom: 10,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
          <Text style={orderPageStyles.text}>Итого:</Text>
          <Text style={orderPageStyles.text}>{sum} ₸ </Text>
        </View>
        <UIButton text="Оформить заказ" type="default" onPress={handleOrder} />
      </ScrollView>
    </View>
  );
};

const orderPageStyles = StyleSheet.create({
  timeBlock: {
    width: "100%",
    marginTop: 20,
    backgroundColor: Colors.darkWhite,
    padding: 15,
    borderRadius: 16,
  },
  text: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: "500",
    marginBottom: 10,
  },
});

export default Order;
