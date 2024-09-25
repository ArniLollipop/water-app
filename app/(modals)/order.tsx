import Products from "@/components/home/products";
import UIRadio from "@/components/UI/Radio";
import UITimePickerModal from "@/components/UI/TimePicker";
import Colors from "@/constants/Colors";
import { RootState } from "@/store/store";
import sharedStyles from "@/styles/style";
import useHttp from "@/utils/axios";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import { useSelector } from "react-redux";

const Order = () => {
  const { user } = useSelector((state: RootState) => state.user);

  const [addresses, setAddresses] = useState([] as IAddress[]);
  const [prices, setPrices] = useState({});

  const getUser = async () => {
    await useHttp
      .post<{ clientData: { _doc: IUser }; success: true }>(
        "/getClientDataMobile",
        {
          mail: user?.mail,
        }
      )
      .then((res) => {
        console.log(res.data.clientData);
      });
  };

  const getAddresses = async () => {
    await useHttp
      .post<{ addresses: IAddress[] }>("/getClientAddresses", {
        mail: user?.mail,
      })
      .then((res) => {
        setAddresses(res.data.addresses);
      });
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
            withoutDot={true}
            items={getFormattedAddresses(addresses)}
            // setNew={setIsAdding}
            // addText="Добавить адрес"
          />
        </View>
        <View
          style={{
            width: "100%",
            marginTop: 20,
          }}>
          <UIRadio
            title="Способ оплаты"
            items={[
              {
                id: "1",
                text: "Картой",
              },
              {
                id: "2",
                text: "Наличными",
              },
            ]}
            // addText="Привязать карту"
          />
        </View>

        {!user?.chooseTime && (
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
});

export default Order;
