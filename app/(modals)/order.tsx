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
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import { useDispatch, useSelector } from "react-redux";

const Order = () => {
  const { repeat } = useLocalSearchParams<{ repeat: string }>();

  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.user);

  const [addresses, setAddresses] = useState([] as IAddress[]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("fakt");
  const [prices, setPrices] = useState({ price12: 900, price19: 1300 });
  const [sum, setSum] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [lastOrder, setLastOrder] = useState<IOrder | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [startTime, setStartTime] = useState<number>(14);
  const [endTime, setEndTime] = useState<number>(15);


  async function getLastOrder() {
    await useHttp
      .post<{ order: IOrder }>("/getLastOrderMobile", { clientId: user?._id })
      .then((res) => {
        setSum(res.data.order.sum)
        setLastOrder(res.data.order);
        const tempSelectedAddressId = addresses.find(
          (a) => `${a.street} ${a.house}` === res.data.order.address.actual
        )?._id;
        if (tempSelectedAddressId) setSelectedAddressId(tempSelectedAddressId);
        dispatch(setCart({ cart: res.data.order.products }));
        setSelectedPayment(res.data.order.opForm as string);
        
      })
      .catch((error) => {
        dispatch(
          setError({
            error: true,
            errorMessage:
              "Не удалось получить последний заказ" + error?.response?.status,
          })
        );
      });
  }

  const getMinDate = () => {

    if (lastOrder?.status === "awaitingOrder" || lastOrder?.status === "onTheWay") {
      const date = new Date(lastOrder?.date?.d)
      return date
    }

    const now = new Date(); // Текущая дата и время
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1); // Завтрашний день

    if (now.getDay() === 0) {
      return tomorrow
    }

    if (tomorrow.getDay() === 0) {
      tomorrow.setDate(tomorrow.getDate() + 1);
    }
  
    // Если user?.type === false, возвращаем завтрашний день
    if (user?.type === false) {
      return tomorrow;
    }
  
    // Если user?.type === true и текущее время больше 12:00, возвращаем завтрашний день
    if (user?.type === true && now.getHours() >= 12) {
      return tomorrow;
    }
  
    // В остальных случаях возвращаем сегодняшнюю дату
    return now;
  };
  

  const getCart = async () => {
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
    
    if (selectedDate) {
      selectedDate.setHours(12, 0, 0, 0); // Устанавливаем время на 12:00
    }

    const selectedMonth = selectedDate?.getMonth() || 0

    const fullSelectedDate = 
      selectedDate?.getFullYear() + "-" + 
      String(selectedMonth + 1).padStart(2, "0") + "-" + 
      String(selectedDate?.getDate()).padStart(2, "0");

    if (!selectedAddressId) {
      dispatch(
        setError({
          error: true,
          errorMessage: "Выберите адрес доставки",
        })
      );
    } else if (selectedPayment === "" || selectedPayment == null) {
      dispatch(
        setError({
          error: true,
          errorMessage: "Выберите способ оплаты",
        })
      );
    } else if (user?.cart?.b12 == 0 && user?.cart?.b19 == 0) {
      dispatch(
        setError({
          error: true,
          errorMessage: "Выберите товары для заказа",
        })
      );
    } else if (!selectedDate) {
      dispatch(
        setError({
          error: true,
          errorMessage: "Выберите дату доставки",
        })
      );
    } else if (user?.cart && user.cart.b12 + user.cart.b19 < 2) {
      dispatch(
        setError({
          error: true,
          errorMessage: "Минимальное количество заказа - 2 бутылки",
        })
      );
    } else if (
      startTime < 10 ||
      endTime > 19 ||
      (selectedDate.getDate() == new Date().getDate() &&
        new Date().getHours() > 18)
    ) {
      dispatch(
        setError({
          error: true,
          errorMessage:
            "Доставка доступна с 10:00 до 19:00 и не позднее 18:00 на текущий день",
        })
      );
    } else {
      const address = addresses.find((a) => a._id === selectedAddressId);

      if (!address) {
        dispatch(
          setError({
            error: true,
            errorMessage: "Выберите адрес доставки",
          })
        );
        return;
      }

      setIsLoading(true);

      const clientTime = user?.chooseTime ? `${startTime}:00-${endTime}:00` : ""

      const clientDate = {d: fullSelectedDate, time: clientTime}

      let form = {
        clientId: user?._id,
        address: {
          name: address?.name,
          actual: address?.street + " " + address?.house,
          link: address?.link,
        },
        products: user?.cart,
        // clientNotes: "",
        date: clientDate,
        opForm: selectedPayment,
      };

      await useHttp
        .post<{ success: boolean }>("/addOrderClientMobile", form)
        .then(async (res) => {
          if (res.data.success) {
            if (!repeat) await cleanCart();
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
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  async function cleanCart() {
    await useHttp.post("/cleanCart", { mail: user?.mail });
  }

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
    if (!user?.type) {
      setSelectedDate(new Date(new Date().setDate(new Date().getDate() + 1)));
    } else {
      setSelectedDate(getMinDate());
    }
  }, []);

  useEffect(() => {
    if (repeat) {
      getLastOrder();
    } else {
      getCart();
    }
  }, [addresses]);

  useEffect(() => {
    if (user?.cart) {
      setSum(
        prices.price12 * user?.cart?.b12 + prices.price19 * user?.cart?.b19
      );
    }
  }, [user?.cart]);

  useEffect(() => {
    if (user) {
      setPrices({price12: user.price12 || 0, price19: user.price19 || 0})
    }
  }, [user])

  useEffect(() => {
    setSelectedDate(getMinDate())
    if (lastOrder?.status === "awaitingOrder" && lastOrder?.date?.time !== "") {
      const sT = lastOrder?.date?.time[0] + lastOrder?.date?.time[1]
      const eT = lastOrder?.date?.time[6] + lastOrder?.date?.time[7]
      setStartTime(parseInt(sT))
      setEndTime(parseInt(eT))
    }
  }, [lastOrder])

  const isChange = () => {
    if (!repeat) {
      return false
    }

    const selectedMonth = selectedDate?.getMonth() || 0

    const fullSelectedDate = 
      selectedDate?.getFullYear() + "-" + 
      String(selectedMonth + 1).padStart(2, "0") + "-" + 
      String(selectedDate?.getDate()).padStart(2, "0");

    if (lastOrder?.date?.d !== fullSelectedDate) {
      return true
    }

    if (user?.cart?.b12 !== lastOrder?.products?.b12 || user?.cart?.b19 !== lastOrder?.products?.b19) {
      return true
    }
  }

  const updateOrder = async () => {

    let change, changeData

    const selectedMonth = selectedDate?.getMonth() || 0

    const fullSelectedDate = 
      selectedDate?.getFullYear() + "-" + 
      String(selectedMonth + 1).padStart(2, "0") + "-" + 
      String(selectedDate?.getDate()).padStart(2, "0");

    // if (lastOrder?.status === "awaitingOrder" && lastOrder?.date?.time !== "") {
    //   const sT = lastOrder?.date?.time[0] + lastOrder?.date?.time[1]
    //   const eT = lastOrder?.date?.time[6] + lastOrder?.date?.time[7]
    // }

    if (lastOrder?.date?.d !== fullSelectedDate) {
      change = "date"
      changeData = {d: fullSelectedDate, time: ""}
    }

    await useHttp
        .post<{ success: boolean }>("/updateOrder", {orderId: lastOrder?._id, change, changeData})
        .then(async (res) => {
          if (res.data.success) {
            getLastOrder()
            dispatch(
              setError({
                error: false,
                errorMessage: "Заказ успешно изменен",
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
        })
        .finally(() => {
          setIsLoading(false);
        });

    if (user?.cart?.b12 !== lastOrder?.products?.b12 || user?.cart?.b19 !== lastOrder?.products?.b19) {
      change = "products"
      changeData = {b12: user?.cart?.b12, b19: user?.cart?.b19}
    }

    await useHttp
        .post<{ success: boolean }>("/updateOrder", {orderId: lastOrder?._id, change, changeData})
        .then(async (res) => {
          if (res.data.success) {
            getLastOrder()
            dispatch(
              setError({
                error: false,
                errorMessage: "Заказ успешно изменен",
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
        })
        .finally(() => {
          setIsLoading(false);
        });
  }

  return (
    <View style={sharedStyles.container}>
      {lastOrder && (
        <Text
          style={{
            color: Colors.tint,
            fontSize: 18,
            fontWeight: "500",
          }}>
          {lastOrder?.status == "awaitingOrder"
            ? "В очереди"
            : lastOrder?.status == "onTheWay"
            ? "В пути"
            : lastOrder?.status == "delivered"
            ? "Доставлен"
            : "Отменен"}
        </Text>
      )}

      <ScrollView
        bounces={false}
        contentContainerStyle={{
          backgroundColor: Colors.background,
          paddingBottom: 15,
        }}>
        <Products isOrderPage={true} type="local" />
        <View
          style={{
            width: "100%",
            marginTop: 20,
          }}>
          <UIRadio
            title="Адрес доставки"
            items={getFormattedAddresses(addresses)}
            select={selectedAddressId}
            setSelect={repeat ? () => {} : setSelectedAddressId}
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
              { id: "fakt", text: "Нал/Карта/QR" },
              { id: "postpay", text: "Постоплата" },
              { id: "credit", text: "В долг" },
              { id: "coupon", text: "Талоны" },
              { id: "mixed", text: "Смешанная" },
            ]}
            select={selectedPayment}
            setSelect={repeat ? () => {} : setSelectedPayment}
            // addText="Привязать карту"
          />
        </View>

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
          <UITimePickerModal
            disabled={lastOrder?.status === "onTheWay"}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            minDate={getMinDate()}
            userType={user?.type || false}
            startTime={startTime}
            setStartTime={setStartTime}
            endTime={endTime}
            setEndTime={setEndTime}
            qwe={lastOrder?.status === "awaitingOrder" ? false : true}
          />
        </View>

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
        {lastOrder?.status != "awaitingOrder" &&
          lastOrder?.status != "onTheWay" && (
            <UIButton
              text="Оформить заказ"
              type="default"
              onPress={handleOrder}
              isLoading={isLoading}
            />
          )}

        {lastOrder?.status === "awaitingOrder" && isChange() && (
            <UIButton
              text="Сохранить изменения"
              type="default"
              onPress={updateOrder}
              isLoading={isLoading}
            />
          )}
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
