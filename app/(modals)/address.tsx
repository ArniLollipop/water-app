import UIButton from "@/components/UI/Button";
import UIInput from "@/components/UI/Input";
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
  const [isUpdate, setIsUpdate] = useState(false);
  const [addresses, setAddresses] = useState([] as IAddress[]);
  const [newAddress, setNewAddress] = useState({
    mail: user?.mail,
    name: "",
    city: "Алматы",
    street: "",
    house: "",
    link: "",
    phone: "",
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

  const addOrUpdateAddress = async () => {
    setIsLoading(true);
    const url = isUpdate ? "/updateClientAddress" : "/addClientAddress";
    await useHttp
      .post(url, newAddress)
      .then(() => {
        getAddresses();
        setIsAdding(false);
        setIsUpdate(false);
        setNewAddress({
          mail: user?.mail,
          name: "",
          city: "Алматы",
          street: "",
          house: "",
          link: "",
          phone: "",
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

  const routeByLink = () => {
    Keyboard.dismiss();
    if (newAddress.link && newAddress.link.length > 0) {
      Linking.openURL(newAddress.link);
    }
  };

  const handleSelectAddress = (id: string) => {
    const selectedAddress = addresses.find((addr) => addr._id === id);
    if (selectedAddress) {
      setNewAddress({ mail: user?.mail, ...selectedAddress }); // Устанавливаем выбранный адрес для редактирования
      
      setIsUpdate(true); // Переходим в режим редактирования
    }
  };

  useEffect(() => {
    getAddresses();
  }, []);

  useEffect(() => {
    if (isAdding) {
      setNewAddress({
        mail: user?.mail,
        name: "",
        city: "Алматы",
        street: "",
        house: "",
        link: "",
        phone: ""
      });
      setIsUpdate(false)
    }
  }, [isAdding])

  return (
    <View style={sharedStyles.container}>
      <ScrollView
        bounces={false}
        keyboardShouldPersistTaps="never"
        style={{
          width: "100%",
          paddingBottom: 15,
          backgroundColor: Colors.background,
        }}>
        <UIRadio
          withoutDot={true}
          items={getFormattedAddresses(addresses)}
          setNew={setIsAdding}
          setSelect={handleSelectAddress} // Передаем обработчик выбора адреса
          addText="Добавить адрес"
        />
        {(isAdding || isUpdate) && (
          <View style={{ width: "100%", marginVertical: 20, gap: 10 }}>
            <Text
              style={{ fontSize: 20, color: Colors.text, fontWeight: "500" }}>
              {isUpdate ? "Изменение адреса" : "Новый адрес"}
            </Text>
            <UIInput
              type="filled"
              placeholder="Город"
              value={"Алматы"}
              onChangeText={()=>{}}
            />
            <UIInput
              type="filled"
              placeholder="Название"
              value={newAddress.name}
              onChangeText={(text) =>
                setNewAddress({ ...newAddress, name: text })
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
            <UIInput
              type="filled"
              placeholder="Номер"
              value={newAddress.phone}
              onChangeText={(text) =>
                setNewAddress({ ...newAddress, phone: text })
              }
            />
            <UIInput
              focusable={false}
              isLink={true}
              onPress={routeByLink}
              type="filled"
              placeholder="Cсылка"
              value={newAddress.link ? "Ссылка адреса" : ""}
            />
            <Text style={{ fontSize: 13, color: Colors.disabled }}>
              Проверьте адрес перейдя по сгенерированной ссылке
            </Text>

            <UIButton
              isLoading={isLoading}
              onPress={addOrUpdateAddress} // Универсальная функция добавления/редактирования
              type="default"
              text={isUpdate ? "Сохранить изменения" : "Добавить"}
              styles={{ marginTop: 10 }}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default Address;
