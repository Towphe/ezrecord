import SettingsHome from "@/components/ui/settings/settings-home";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

export type SettingsStackParamList = {
  SettingsHome: undefined;
};

const SettingsScreenStack =
  createNativeStackNavigator<SettingsStackParamList>();

export default function SettingsScreen() {
  return (
    <SettingsScreenStack.Navigator screenOptions={{ headerShown: false }}>
      <SettingsScreenStack.Screen
        name="SettingsHome"
        component={SettingsHome}
      />
    </SettingsScreenStack.Navigator>
  );
}
