import { Alert, Linking, Platform } from "react-native";
import { requestTrackingPermissionsAsync } from "expo-tracking-transparency";

const checkAndRequestTrackingPermission = async () => {
  const { status } = await requestTrackingPermissionsAsync();

  if (status === "denied") {
    // Сообщение пользователю
    Alert.alert(
      "Разрешение на отслеживание",
      "Чтобы получать персонализированные уведомления и улучшенный опыт работы с приложением, пожалуйста, включите отслеживание в настройках.",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Открыть настройки",
          onPress: () => {
            if (Platform.OS === "ios") {
              Linking.openSettings();
            }
          },
        },
      ]
    );
  } else if (status === "granted") {
    console.log("Разрешение на отслеживание уже предоставлено.");
  } else {
    console.log("Текущий статус отслеживания:", status);
  }
};

export default checkAndRequestTrackingPermission;