import UIIcon from "@/components/UI/Icon";
import UIInput from "@/components/UI/Input";
import MaskedUIInput from "@/components/UI/MaskedInput";
import UIRadio from "@/components/UI/Radio";
import Colors from "@/constants/Colors";
import { setError } from "@/store/slices/errorSlice";
import { setUser } from "@/store/slices/userSlice";
import { RootState } from "@/store/store";
import sharedStyles from "@/styles/style";
import useHttp from "@/utils/axios";
import { useEffect, useState } from "react";
import { Switch, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";

const Settings = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.user);

  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);
  const [standardWaterCount, setStandardWaterCount] = useState("2");
  const [editable, setEditable] = useState("");

  const handleSaveSetting = async () => {
    if (user)
      await useHttp
        .post("/updateClientDataMobile", {
          mail: user.mail,
          field: "dailyWater",
          value: parseInt(standardWaterCount),
        })
        .then((res) => {
          if (res.data.success) {
            setEditable("");
            dispatch(
              setUser({
                ...user,
                dailyWater: parseInt(standardWaterCount),
              })
            );
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
  };

  return (
    <View style={sharedStyles.container}>
      <View
        style={{
          gap: 15,
          width: "100%",
        }}>
        <UIInput
          editable={false}
          value="Уведомления"
          type="filled"
          placeholder="Уведомления"
          rightElement={
            <Switch
              trackColor={{ false: "#767577", true: Colors.green }}
              thumbColor={isNotificationsEnabled ? "#fff" : "#f4f3f4"}
              style={{
                height: 30,
                backgroundColor: "transparent",
                paddingVertical: 0,
                paddingHorizontal: 0,
                maxWidth: 50,
                width: 20,
              }}
              ios_backgroundColor="#767577"
              value={isNotificationsEnabled}
              onValueChange={() =>
                setIsNotificationsEnabled(!isNotificationsEnabled)
              }
            />
          }
        />
        <MaskedUIInput
          mask="9|99"
          editable={editable == "waterCount"}
          value={standardWaterCount}
          onChangeText={(count) => setStandardWaterCount(count)}
          type="filled"
          textContentType="telephoneNumber"
          keyboardType="numeric"
          label="Дневная норма воды"
          placeholder="2"
          rightElementClick={() =>
            editable == "waterCount"
              ? handleSaveSetting()
              : setEditable("waterCount")
          }
          rightElement={
            editable == "waterCount" ? (
              <UIIcon name="check" />
            ) : (
              <UIIcon name="edit" />
            )
          }
        />

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
          addText="Привязать карту"
        />
      </View>
    </View>
  );
};

export default Settings;
