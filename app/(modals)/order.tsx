import Products from "@/components/home/products";
import UIRadio from "@/components/UI/Radio";
import Colors from "@/constants/Colors";
import { RootState } from "@/store/store";
import sharedStyles from "@/styles/style";
import useHttp from "@/utils/axios";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useSelector } from "react-redux";

const Order = () => {
  const { user } = useSelector((state: RootState) => state.user);

  const [addresses, setAddresses] = useState([] as IAddress[]);

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
            <ScrollView bounces={false} horizontal={true}>
              <View style={{ flexDirection: "row", gap: 10 }}>
                {/* days today, tommorow, after tomorrow for choose date in Russian locales*/}
                {/* hours from 10:00 to 20:00 */}

                {["Сегодня", "Завтра", "Послезавтра"].map((i) => (
                  <TouchableOpacity
                    key={i}
                    style={{
                      backgroundColor: Colors.background,
                      borderRadius: 10,
                      padding: 10,
                    }}>
                    <Text style={{ fontSize: 14, color: Colors.text }}>
                      {i}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            <ScrollView
              bounces={false}
              horizontal={true}
              style={{ marginTop: 10 }}>
              <View style={{ flexDirection: "row", gap: 10 }}>
                {/* days today, tommorow, after tomorrow for choose date in Russian locales*/}
                {/* hours from 10:00 to 20:00 */}

                {[...Array(10).keys()].map((i) => (
                  <TouchableOpacity
                    key={i}
                    style={{
                      backgroundColor: Colors.background,
                      borderRadius: 10,
                      padding: 10,
                    }}>
                    <Text style={{ fontSize: 14, color: Colors.text }}>
                      {i + 10}:00
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
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
