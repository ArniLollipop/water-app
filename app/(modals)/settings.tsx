import UIIcon from "@/components/UI/Icon";
import UIInput from "@/components/UI/Input";
import UIRadio from "@/components/UI/Radio";
import Colors from "@/constants/Colors";
import sharedStyles from "@/styles/style";
import { useState } from "react";
import { Switch, Text, View } from "react-native";

const Settings = () => {
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);
  const [standardWaterCount, setStandardWaterCount] = useState("");
  const [editable, setEditable] = useState("");

  return (
    <View style={sharedStyles.container}>
      <View
        style={{
          gap: 15,
          width: "100%",
        }}>
        <UIInput
          onChangeText={() => {}}
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
        <UIInput
          editable={editable == "waterCount"}
          value={standardWaterCount.toString()}
          onChangeText={(count) => setStandardWaterCount(count)}
          type="filled"
          textContentType="telephoneNumber"
          keyboardType="numeric"
          label="Дневная норма воды"
          placeholder="2"
          rightElementClick={() =>
            editable == "waterCount"
              ? setEditable("")
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
