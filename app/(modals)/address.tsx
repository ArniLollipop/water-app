import UIButton from "@/components/UI/Button";
import UIInput from "@/components/UI/Input";
import MaskedUIInput from "@/components/UI/MaskedInput";
import UIRadio from "@/components/UI/Radio";
import Colors from "@/constants/Colors";
import { setError } from "@/store/slices/errorSlice";
import { RootState } from "@/store/store";
import sharedStyles from "@/styles/style";
import useHttp from "@/utils/axios";
import { useEffect, useState } from "react";
import { Keyboard, Linking, ScrollView, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";

const Address = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.user);

  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [addresses, setAddresses] = useState([] as IAddress[]);
  const [newAddress, setNewAddress] = useState({
    mail: user?.mail,
    city: "",
    street: "",
    house: "",
    link: "",
  } as IAddress);

  const getAddresses = async () => {
    await useHttp
      .post<{ addresses: IAddress[] }>("/getClientAddresses", {
        mail: user?.mail,
      })
      .then((res) => {
        setAddresses(res.data.addresses);
      });
  };

  const addClientAddress = async () => {
    setIsLoading(true);
    await useHttp
      .post("/addClientAddress", newAddress)
      .then(() => {
        getAddresses();
        setIsAdding(false);
        setNewAddress({
          mail: user?.mail,
          city: "",
          street: "",
          house: "",
          link: "",
        });
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
  };

  const generate2GISLink = (text: string) => {
    if (!text) return "";
    const encodedAddress = encodeURIComponent(text);
    return `https://2gis.kz/almaty/search/${encodedAddress}`;
  };

  const getFormattedAddresses = (addresses: IAddress[]) => {
    if (addresses?.length === 0) return [];
    else
      return addresses?.map((address) => ({
        id: address._id,
        text: `${address.street} ${address.house}`,
      }));
  };

  const routeByLink = (e: any) => {
    Keyboard.dismiss();
    if (newAddress.link && newAddress.link.length > 0) {
      Linking.openURL(newAddress.link);
    }
  };

  useEffect(() => {
    getAddresses();
  }, []);

  return (
    <View style={sharedStyles.container}>
      <ScrollView
        bounces={false}
        style={{
          width: "100%",
          paddingBottom: 15,
          backgroundColor: Colors.background,
        }}>
        <UIRadio
          withoutDot={true}
          items={getFormattedAddresses(addresses)}
          setNew={setIsAdding}
          addText="Добавить адрес"
        />
        {isAdding && (
          <View style={{ width: "100%", marginVertical: 20, gap: 10 }}>
            <Text
              style={{ fontSize: 20, color: Colors.text, fontWeight: "500" }}>
              Новый адрес
            </Text>
            <UIInput
              type="filled"
              placeholder="Город"
              value={newAddress.city}
              onChangeText={(text) =>
                setNewAddress({
                  ...newAddress,
                  city: text,
                })
              }
            />
            <UIInput
              type="filled"
              placeholder="Улица и номер дома"
              value={newAddress.street}
              onChangeText={(text) =>
                setNewAddress({
                  ...newAddress,
                  street: text,
                  link: generate2GISLink(text),
                })
              }
            />
            <UIInput
              type="filled"
              placeholder="Квартира/офис"
              value={newAddress.house}
              onChangeText={(text) =>
                setNewAddress({ ...newAddress, house: text })
              }
            />
            <MaskedUIInput
              onChangeText={(text) => {}}
              focusable={false}
              isLink={true}
              onPress={routeByLink}
              type="filled"
              placeholder="Cсылка"
              value={newAddress.link}
            />
            <Text style={{ fontSize: 13, color: Colors.disabled }}>
              Сгенерируйте ссылку по карте 2ГИС и проверьте правильно ли написан
              адрес.
            </Text>

            <UIButton
              isLoading={isLoading}
              onPress={addClientAddress}
              type="default"
              text="Добавить"
              styles={{ marginTop: 10 }}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default Address;
