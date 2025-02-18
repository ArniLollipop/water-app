import HomeRecent from "@/components/home/recent";
import Colors from "@/constants/Colors";
import { RootState } from "@/store/store";
import sharedStyles from "@/styles/style";
import useHttp from "@/utils/axios";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import { Linking, Platform, Image } from "react-native";

export default function Support() {
  const { user } = useSelector((state: RootState) => state.user);

  const [lastOrder, setLastOrder] = useState<IOrder | null>(null);

  async function getLastOrder() {
    await useHttp
      .post<{ order: IOrder }>("/getLastOrderMobile", { clientId: user?._id })
      .then((res) => {
        setLastOrder(res.data.order);
      })
      .catch(() => {
        console.log("error");
      });
  }

  useEffect(() => {
    if (user?._id) getLastOrder();
  }, [user?.mail]);

  const onCallMobilePhone = async (phoneNumber: string) => {
    if (Platform.OS === "android") {
      Linking.openURL(`tel:${phoneNumber}`);
      return;
    }

    if (Platform.OS === "ios") {
      Linking.openURL(`telprompt:${phoneNumber}`);
      return;
    }
  };

  const onMailOpen = async (mail: string) => {
    Linking.openURL(`mailto:${mail}`);
  };

  return (
    <View style={sharedStyles.container}>
      <ScrollView>
      {/* {lastOrder && <HomeRecent lastOrder={lastOrder} />} */}
      {/* <View style={{
          alignItems: "center", // Центрирует по горизонтали
      }}>
          <Image 
              source={require("../../assets/images/logo.png")}
              style={{
                  width: "50%",
                  resizeMode: "contain"
              }}
          />
      </View> */}
      <View style={supportStyles.list}>
        <Text style={supportStyles.listHead}>Поддержка клиентов:</Text>
        <View style={supportStyles.listContent}>
          <TouchableOpacity onPress={() => onCallMobilePhone("+77272378047")}>
            <Text style={supportStyles.phone}>+7 727 237 80 47</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onCallMobilePhone("+77475315558")}>
            <Text style={supportStyles.phone}>+7 747 531 55 58</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onMailOpen("info@tibetskaya.kz")}>
            <Text style={supportStyles.phone}>info@tibetskaya.kz</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={supportStyles.subtitle}>
        <Text style={supportStyles.listHead}>О нас</Text>
      </View>
      <View>
        <Text style={supportStyles.text}>
        «Тибетская» - один из первых брендов воды в Казахстане, который завоевал сердца многих потребителей благодаря своему безукоризненному качеству и уникальности. История этой воды начинается с 1996 года, и за это время она зарекомендовала себя, как одна из самых уникальных и качественных водных брендов на рынке.
        </Text>
        <Text style={supportStyles.text2}>
        Правообладателем торговой марки «Тибетская» является ТОО "Partner's Mountain Water Co", которое продолжает традиции качества и надежности, обеспечивая потребителей чистой и полезной водой.
        </Text>
        <Text style={supportStyles.text2}>
          г. Алматы, ул. Шевченко, д. 7/75, оф. 59а
        </Text>
      </View>
      <View style={{height: 20}}></View>
      </ScrollView>
    </View>
  );
}

const supportStyles = StyleSheet.create({
  list: {
    width: "100%",
    height: "auto",
    marginTop: 5,
  },
  listHead: {
    fontSize: 20,
    fontWeight: "400",
    color: Colors.disabled,
  },
  listContent: {
    marginTop: 10,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  phone: {
    fontSize: 18,
    fontWeight: "400",
    color: Colors.blue,
    textDecorationLine: "underline",
  },
  subtitle: {
    marginTop: 15
  },
  text: {
    fontSize: 16,
    color: "#000",
    marginTop: 10
  },
  text2: {
    fontSize: 16,
    color: "#000",
    marginTop: 20
  },
});
